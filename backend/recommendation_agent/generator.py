"""Turns gathered context (persona + portfolio + candidate stocks) into a
personalized recommendation list. Uses langchain_groq's structured output,
same pattern as investor_onboarding/persona.py — appropriate here since
we need a reliable LIST of structured objects back, not one JSON blob
(market_agent/analysis.py's raw-JSON approach is fine for its single
sentiment+summary shape, but more fragile for a variable-length list).
"""

import logging

from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage

from recommendation_agent.schemas import RecommendationSet
from investor_onboarding.groq_utils import get_groq_api_key

logger = logging.getLogger(__name__)

llm = ChatGroq(api_key=get_groq_api_key(), model="openai/gpt-oss-20b", temperature=0.3)  # llama-3.1-8b-instant was deprecated/shut down by Groq on Aug 16, 2026

_SYSTEM_PROMPT = """You are a personalized investment recommendation engine for an Indian
retail investing app. You will be given an investor's risk profile, their
current portfolio holdings (if any), and a candidate list of Nifty 50
stocks with real technicals, sentiment, and quarterly financial data
already computed for each.

Rules:
- Only recommend symbols that appear in the candidate list — never invent one.
- For symbols the investor already holds, recommend HOLD, TRIM, or SELL based on the data.
- For symbols not held, recommend BUY only if the data genuinely supports it for this investor's risk profile.
- Ground every thesis in the specific numbers given (sentiment, RSI, P/E, quarterly growth) — don't speculate beyond them.
- Match recommendations to the investor's stated risk category and goals — a Conservative investor
  shouldn't get high-RSI momentum picks, an Aggressive investor's list shouldn't be all low-volatility blue chips.
- Return 5-8 recommendations total, existing holdings first."""


def generate_recommendations(persona: dict | None, portfolio: dict | None, candidates: list[dict]) -> RecommendationSet:
    persona_text = "No persona on file — use moderate risk assumptions." if not persona else (
        f"Risk category: {persona.get('risk_category')} (score {persona.get('risk_score')}/100)\n"
        f"Generated persona: {persona.get('persona')}\n"
        f"Stated goals/profile: {persona.get('extracted_profile')}"
    )

    if portfolio and portfolio.get("holdings"):
        holdings_lines = "\n".join(
            f"- {h.get('instrument_name')}: qty {h.get('quantity')}, "
            f"invested {h.get('invested_value')}, current {h.get('current_value')}, P&L {h.get('pnl')}"
            for h in portfolio["holdings"]
        )
        portfolio_text = f"Current holdings:\n{holdings_lines}"
    else:
        portfolio_text = "No current holdings on file (or portfolio unavailable) — treat as a fresh portfolio."

    candidates_lines = "\n".join(
        f"- {c['symbol']} ({c['name']}, {c['sector']}){' [ALREADY HELD]' if c['already_held'] else ''}: "
        f"LTP {c['ltp']}, change {c['pct_change']}%, P/E {c['pe']}, RSI {c['rsi14']}, "
        f"sentiment {c['sentiment']}, latest QoQ revenue growth YoY {c['latest_quarter_yoy_revenue_growth']}%, "
        f"profit growth YoY {c['latest_quarter_yoy_profit_growth']}%. Analysis: {c['analysis_summary']}"
        for c in candidates
    )

    user_prompt = f"{persona_text}\n\n{portfolio_text}\n\nCandidate stocks:\n{candidates_lines}"

    generator = llm.with_structured_output(RecommendationSet)
    result = generator.invoke([SystemMessage(content=_SYSTEM_PROMPT), HumanMessage(content=user_prompt)])
    return result