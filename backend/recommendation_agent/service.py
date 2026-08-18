"""Ties data_gatherer + generator together, with simple time-based caching
so we're not calling Groq (and MegaBull, and re-scanning market_quotes)
on every single page load.
"""

import asyncio
import logging
from datetime import datetime, timedelta, timezone

from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from models import Recommendation, User
from recommendation_agent import data_gatherer
from recommendation_agent.generator import generate_recommendations

logger = logging.getLogger(__name__)

STALE_AFTER = timedelta(hours=1)


async def get_or_generate_recommendations(db: AsyncSession, user: User, force_refresh: bool = False) -> list[Recommendation]:
    existing = (
        await db.execute(
            select(Recommendation)
            .where(Recommendation.user_id == user.id)
            .order_by(Recommendation.generated_at.desc())
        )
    ).scalars().all()

    is_stale = not existing or (
        existing[0].generated_at
        and (datetime.now(timezone.utc) - existing[0].generated_at.replace(tzinfo=timezone.utc)) > STALE_AFTER
    )

    if existing and not is_stale and not force_refresh:
        return list(existing)

    return await _generate_and_store(db, user)


async def _generate_and_store(db: AsyncSession, user: User) -> list[Recommendation]:
    persona = await data_gatherer.get_persona_context(db, user.id)
    portfolio = await data_gatherer.get_portfolio_context(user.email)

    held_symbols = []
    if portfolio and portfolio.get("holdings"):
        # NOTE: MegaBull holdings key off instrument_token/instrument_name,
        # not NSE symbol directly — this naive match works if
        # instrument_name happens to equal the NSE symbol, which won't
        # always be true. Flagging this as a known gap: proper symbol
        # mapping between MegaBull's instrument identifiers and NSE
        # tickers isn't built yet. Held-position recommendations may be
        # incomplete until that mapping exists — BUY recommendations for
        # new opportunities aren't affected.
        held_symbols = [h.get("instrument_name") for h in portfolio["holdings"] if h.get("instrument_name")]

    candidates = await data_gatherer.get_candidate_quotes(db, held_symbols)
    if not candidates:
        logger.warning("No market candidates available yet — market_agent may not have run its first cycle")
        return []

    try:
        result_set = await asyncio.to_thread(generate_recommendations, persona, portfolio, candidates)
    except Exception:
        logger.exception("Recommendation generation failed for user %s", user.id)
        return []

    # Replace this user's old set with the fresh one.
    await db.execute(delete(Recommendation).where(Recommendation.user_id == user.id))

    candidate_names = {c["symbol"]: c["name"] for c in candidates}
    rows = []
    for item in result_set.recommendations:
        row = Recommendation(
            user_id=user.id,
            symbol=item.symbol,
            name=candidate_names.get(item.symbol, item.symbol),
            action=item.action,
            thesis=item.thesis,
            confidence=item.confidence,
            expected_return_pct=item.expected_return_pct,
        )
        db.add(row)
        rows.append(row)

    await db.commit()
    for row in rows:
        await db.refresh(row)

    logger.info("Generated %d recommendations for user %s", len(rows), user.id)
    return rows
