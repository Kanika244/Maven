"""Pulls together everything the recommendation generator needs, from
three already-existing sources — this module doesn't compute anything new,
it just assembles what investor_onboarding, market_agent, and MegaBull
already produced.
"""

import logging

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models import MarketQuote, QuarterlyFinancial

logger = logging.getLogger(__name__)

MAX_UNHELD_CANDIDATES = 15


async def get_persona_context(db: AsyncSession, user_id) -> dict | None:
    """Pulls the user's InvestorPersona row.

    ASSUMPTION FLAGGED: I don't have investor_onboarding/persistence.py or
    the InvestorPersona model definition in front of me — this is inferred
    from how investor_onboarding/router.py reads the row (`profile_json`,
    `financial_metrics_json`, `risk_category`, `risk_score`). If your
    actual column names differ, this will need small adjustments — it'll
    fail loudly (AttributeError) rather than silently, so easy to spot.
    """
    from models import InvestorPersona  # local import: avoids a hard dependency if that table isn't present yet

    result = await db.execute(select(InvestorPersona).where(InvestorPersona.user_id == user_id))
    persona_row = result.scalar_one_or_none()
    if not persona_row or not persona_row.onboarding_completed:
        return None

    financial_metrics = persona_row.financial_metrics_json or {}
    return {
        "risk_category": persona_row.risk_category,
        "risk_score": persona_row.risk_score,
        "persona": persona_row.profile_json,  # the GeneratedPersona dict — includes recommended_allocation
        "extracted_profile": financial_metrics.get("extracted_profile", {}),  # goals, horizon, income, etc.
    }


async def get_portfolio_context(user_email: str) -> dict | None:
    """Pulls current MegaBull holdings. Returns None (not an error) if
    MegaBull isn't configured/reachable/mismatched — recommendations
    should still work with persona + market data alone in that case,
    just skewed toward BUY opportunities instead of HOLD/TRIM calls on
    real positions.
    """
    try:
        from portfolio.megabull import MegaBullClient, MegaBullError

        client = MegaBullClient()
        data = await client.portfolio()
        account_email = (data.get("account", {}).get("email") or "").lower()
        if account_email and account_email != user_email.lower():
            logger.warning("MegaBull account email doesn't match user — skipping portfolio context")
            return None
        return data
    except Exception:
        logger.exception("Could not fetch MegaBull portfolio for recommendations — proceeding without it")
        return None


async def get_candidate_quotes(db: AsyncSession, held_symbols: list[str]) -> list[dict]:
    """Held symbols (for HOLD/TRIM/SELL calls) + a shortlist of unheld
    symbols ranked by sentiment/RSI/quarterly growth (for BUY candidates).
    Deliberately NOT sending all 50 Nifty companies to the LLM every call
    — keeps the prompt focused and cheap.
    """
    all_quotes = (await db.execute(select(MarketQuote))).scalars().all()

    held = [q for q in all_quotes if q.symbol in held_symbols]
    unheld = [q for q in all_quotes if q.symbol not in held_symbols]

    def score(q: MarketQuote) -> float:
        s = 0.0
        if q.sentiment == "Positive":
            s += 2
        elif q.sentiment == "Negative":
            s -= 2
        if q.rsi14 is not None:
            if 40 <= q.rsi14 <= 65:  # room to run, not already overbought
                s += 1
            elif q.rsi14 > 75:
                s -= 1
        return s

    unheld_ranked = sorted(unheld, key=score, reverse=True)[:MAX_UNHELD_CANDIDATES]
    combined = held + unheld_ranked

    candidates = []
    for q in combined:
        quarterly = (
            await db.execute(
                select(QuarterlyFinancial)
                .where(QuarterlyFinancial.symbol == q.symbol)
                .order_by(QuarterlyFinancial.quarter_end.desc())
                .limit(1)
            )
        ).scalar_one_or_none()

        candidates.append({
            "symbol": q.symbol,
            "name": q.name,
            "sector": q.sector,
            "ltp": q.ltp,
            "pct_change": q.pct_change,
            "pe": q.pe,
            "rsi14": q.rsi14,
            "sentiment": q.sentiment,
            "analysis_summary": q.analysis_summary,
            "already_held": q.symbol in held_symbols,
            "latest_quarter_yoy_revenue_growth": quarterly.yoy_revenue_growth if quarterly else None,
            "latest_quarter_yoy_profit_growth": quarterly.yoy_profit_growth if quarterly else None,
        })
    return candidates
