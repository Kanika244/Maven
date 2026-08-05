"""Turns raw numbers + announcement text into an actual read on the
company, the same way news_agent/sentiment.py turns a headline into a
sentiment label. Same provider (Groq) and same fail-safe pattern so it's
consistent with the rest of the codebase.
"""

import json
import logging
import os

from groq import Groq

logger = logging.getLogger(__name__)

_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
_MODEL = "llama-3.1-8b-instant"

_SYSTEM_PROMPT = (
    "You are a market intelligence analyst for an Indian investing app. "
    "Given a stock's technicals, its recent corporate announcements, its "
    "quarterly revenue/profit trend, and (when available) an excerpt from "
    "its latest results filing, respond with ONLY a JSON object (no "
    'markdown, no preamble) in this exact shape: {"sentiment": '
    '"Positive"|"Neutral"|"Negative", "summary": "<2-3 sentence '
    "plain-English read on the stock, referencing specific numbers, "
    'trends, and any relevant announcement or filing detail>"}. '
    "Weigh fundamentals (revenue/profit trend, filing content) alongside "
    "price action — don't rate sentiment on technicals alone when "
    "quarterly data is available. Be specific and grounded in the data "
    "given — don't speculate beyond it."
)


def analyze_company(
    quote: dict,
    announcements: list[dict],
    quarterly: list[dict] | None = None,
    filing_excerpt: str | None = None,
) -> dict:
    """quote: dict with symbol, name, sector, ltp, pct_change, pe, sector_pe, rsi14.
    announcements: list of dicts with subject/broadcast_date, most recent first.
    quarterly: list of dicts (newest first) from fundamentals_client.get_quarterly_financials —
        only the most recent 3 are used here to keep the prompt tight; all 8 are still stored in the DB.
    filing_excerpt: extracted text from the latest "Financial Results" filing PDF, if one was
        successfully read (see filing_reader.py) — None if not available or extraction failed.
    """
    announcement_text = (
        "\n".join(f"- ({a.get('broadcast_date', '?')}) {a.get('subject', '')}" for a in announcements[:3])
        or "No recent announcements."
    )

    quarterly_text = "No quarterly financial data available."
    if quarterly:
        lines = []
        for q in quarterly[:3]:
            rev_growth = f"{q['yoy_revenue_growth']:+.1f}% YoY" if q.get("yoy_revenue_growth") is not None else "YoY n/a"
            profit_growth = f"{q['yoy_profit_growth']:+.1f}% YoY" if q.get("yoy_profit_growth") is not None else "YoY n/a"
            lines.append(
                f"- {q.get('quarter_end')}: revenue {q.get('revenue')} ({rev_growth}), "
                f"net income {q.get('net_income')} ({profit_growth}), EPS {q.get('eps')}"
            )
        quarterly_text = "\n".join(lines)

    filing_text = (
        f"Excerpt from latest results filing:\n{filing_excerpt[:3000]}"
        if filing_excerpt
        else "No results filing text available this cycle."
    )

    user_prompt = (
        f"Company: {quote.get('name')} ({quote.get('symbol')}), sector: {quote.get('sector')}\n"
        f"LTP: {quote.get('ltp')}, change: {quote.get('pct_change')}%\n"
        f"P/E: {quote.get('pe')} vs sector P/E: {quote.get('sector_pe')}\n"
        f"RSI(14): {quote.get('rsi14')}\n"
        f"Recent announcements:\n{announcement_text}\n"
        f"Quarterly trend (newest first):\n{quarterly_text}\n"
        f"{filing_text}"
    )

    try:
        response = _client.chat.completions.create(
            model=_MODEL,
            messages=[
                {"role": "system", "content": _SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.2,
            max_tokens=250,
            response_format={"type": "json_object"},
        )
        data = json.loads(response.choices[0].message.content.strip())
        return {
            "sentiment": data.get("sentiment", "Neutral"),
            "summary": data.get("summary"),
        }
    except Exception:
        logger.exception("Analysis generation failed for %s", quote.get("symbol"))
        return {"sentiment": None, "summary": None}