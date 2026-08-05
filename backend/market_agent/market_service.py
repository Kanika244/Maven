import asyncio
import logging
from collections import defaultdict

from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert as pg_insert

from databases.postgres import SessionLocal
from models import MarketQuote, CorporateAnnouncement, QuarterlyFinancial
from market_agent.nse_client import nse_client
from market_agent import yfinance_client
from market_agent import fundamentals_client
from market_agent import filing_reader
from market_agent.nifty50_symbols import NIFTY_50_SYMBOLS
from market_agent.technicals import calculate_rsi
from market_agent.analysis import analyze_company

logger = logging.getLogger(__name__)

_SYMBOL_SET = set(NIFTY_50_SYMBOLS)

# Pause between per-symbol yfinance calls so we don't hammer it across all
# 50 symbols back-to-back.
REQUEST_DELAY_SECONDS = 0.4


async def fetch_and_store_market_quotes() -> None:
    """Refresh LTP/change/P-E/sector/RSI for all Nifty 50 names via
    yfinance (see yfinance_client.py for why NSE-direct and nsetools both
    turned out to be dead ends for per-symbol data).

    Two phases: first collect every symbol's snapshot + RSI, then compute
    each sector's average P/E from what we just collected before writing
    to the DB — sector_pe isn't something any single-symbol call gives us.
    """
    snapshots = []
    for symbol in NIFTY_50_SYMBOLS:
        snap = await asyncio.to_thread(yfinance_client.get_symbol_snapshot, symbol)
        snap["rsi14"] = calculate_rsi(snap.pop("closes"))
        snapshots.append(snap)
        await asyncio.sleep(REQUEST_DELAY_SECONDS)

    valid = [s for s in snapshots if s["ltp"] is not None]
    if not valid:
        logger.warning("yfinance snapshot fetch returned nothing usable — skipping this cycle")
        return

    sector_pes = defaultdict(list)
    for s in valid:
        if s["sector"] and s["pe"]:
            sector_pes[s["sector"]].append(s["pe"])
    sector_avg_pe = {sector: sum(pes) / len(pes) for sector, pes in sector_pes.items()}

    async with SessionLocal() as db:
        for s in valid:
            values = dict(
                symbol=s["symbol"],
                name=s["name"],
                sector=s["sector"],
                ltp=s["ltp"],
                prev_close=s["prev_close"],
                change=s["change"],
                pct_change=s["pct_change"],
                day_high=s["day_high"],
                day_low=s["day_low"],
                year_high=s["year_high"],
                year_low=s["year_low"],
                volume=s["volume"],
                pe=s["pe"],
                sector_pe=sector_avg_pe.get(s["sector"]),
                rsi14=s["rsi14"],
            )

            # Upsert on symbol — one row per company, refreshed every cycle.
            stmt = pg_insert(MarketQuote).values(**values)
            stmt = stmt.on_conflict_do_update(
                index_elements=["symbol"],
                set_={k: v for k, v in values.items() if k != "symbol"},
            )
            await db.execute(stmt)

        await db.commit()

    logger.info("Market quotes refreshed for %d/%d symbols", len(valid), len(NIFTY_50_SYMBOLS))


async def fetch_and_store_announcements() -> None:
    """Pull market-wide corporate announcements once, keep only Nifty 50
    names, and store new ones (dedup on symbol + broadcast date + text).

    For announcements tagged as an actual results filing (see
    filing_reader.is_financial_result), also download and extract the
    attached PDF's text — this is the raw material the analysis step uses
    for fundamentals-aware reasoning, not just the one-line description.
    """
    announcements = await asyncio.to_thread(nse_client.get_corporate_announcements)
    if not announcements:
        return

    async with SessionLocal() as db:
        stored = 0
        for item in announcements:
            symbol = item.get("symbol")
            if symbol not in _SYMBOL_SET:
                continue

            desc = item.get("desc") or item.get("attchmntText") or ""
            broadcast_date = item.get("an_dt")
            attachment_url = item.get("attchmntFile")

            existing = await db.execute(
                select(CorporateAnnouncement).where(
                    CorporateAnnouncement.symbol == symbol,
                    CorporateAnnouncement.broadcast_date == broadcast_date,
                    CorporateAnnouncement.subject == desc,
                )
            )
            if existing.scalar_one_or_none():
                continue

            is_result = filing_reader.is_financial_result(desc)
            filing_excerpt = None
            if is_result and attachment_url:
                # Blocking (network + PDF parsing) — off the event loop.
                filing_excerpt = await asyncio.to_thread(filing_reader.extract_filing_text, attachment_url)

            db.add(
                CorporateAnnouncement(
                    symbol=symbol,
                    subject=desc,
                    attachment_text=item.get("attchmntText"),
                    attachment_url=attachment_url,
                    broadcast_date=broadcast_date,
                    is_financial_result=is_result,
                    filing_excerpt=filing_excerpt,
                )
            )
            stored += 1

        await db.commit()

    logger.info("Stored %d new corporate announcements", stored)


async def fetch_and_store_quarterly_financials() -> None:
    """Refresh 8 quarters of revenue/net income/EPS per symbol via
    yfinance. Financials only change ~quarterly in reality, so this could
    reasonably run far less often than every 15 min — left on the same
    cycle for now since it's simple, worth decoupling onto its own slower
    schedule (e.g. daily) if the extra yfinance load ever becomes a
    problem.
    """
    async with SessionLocal() as db:
        total_rows = 0
        for symbol in NIFTY_50_SYMBOLS:
            quarters = await asyncio.to_thread(fundamentals_client.get_quarterly_financials, symbol)
            for q in quarters:
                values = dict(symbol=symbol, **q)
                stmt = pg_insert(QuarterlyFinancial).values(**values)
                stmt = stmt.on_conflict_do_update(
                    index_elements=["symbol", "quarter_end"],
                    set_={k: v for k, v in values.items() if k not in ("symbol", "quarter_end")},
                )
                await db.execute(stmt)
                total_rows += 1
            await asyncio.sleep(REQUEST_DELAY_SECONDS)

        await db.commit()

    logger.info("Quarterly financials refreshed: %d rows across %d symbols", total_rows, len(NIFTY_50_SYMBOLS))


async def generate_and_store_analyses() -> None:
    """Run last, after quotes/announcements/quarterly financials are all
    fresh: for each symbol, feed technicals + recent announcements +
    quarterly trend + latest results filing excerpt to the LLM and store
    the resulting sentiment + narrative summary.

    One LLM call per symbol (50/cycle) — same cost pattern as scoring news
    articles one at a time in news_agent/sentiment.py.
    """
    async with SessionLocal() as db:
        for symbol in NIFTY_50_SYMBOLS:
            quote_row = (
                await db.execute(select(MarketQuote).where(MarketQuote.symbol == symbol))
            ).scalar_one_or_none()
            if not quote_row or quote_row.ltp is None:
                continue  # no fresh quote yet this cycle, skip rather than analyze stale/empty data

            announcement_rows = (
                await db.execute(
                    select(CorporateAnnouncement)
                    .where(CorporateAnnouncement.symbol == symbol)
                    .order_by(CorporateAnnouncement.broadcast_date.desc())
                    .limit(3)
                )
            ).scalars().all()

            quarterly_rows = (
                await db.execute(
                    select(QuarterlyFinancial)
                    .where(QuarterlyFinancial.symbol == symbol)
                    .order_by(QuarterlyFinancial.quarter_end.desc())
                    .limit(3)
                )
            ).scalars().all()

            latest_filing_row = (
                await db.execute(
                    select(CorporateAnnouncement)
                    .where(
                        CorporateAnnouncement.symbol == symbol,
                        CorporateAnnouncement.is_financial_result.is_(True),
                        CorporateAnnouncement.filing_excerpt.is_not(None),
                    )
                    .order_by(CorporateAnnouncement.broadcast_date.desc())
                    .limit(1)
                )
            ).scalar_one_or_none()

            quote_dict = dict(
                symbol=quote_row.symbol,
                name=quote_row.name,
                sector=quote_row.sector,
                ltp=quote_row.ltp,
                pct_change=quote_row.pct_change,
                pe=quote_row.pe,
                sector_pe=quote_row.sector_pe,
                rsi14=quote_row.rsi14,
            )
            announcement_dicts = [
                {"subject": a.subject, "broadcast_date": a.broadcast_date} for a in announcement_rows
            ]
            quarterly_dicts = [
                {
                    "quarter_end": q.quarter_end,
                    "revenue": q.revenue,
                    "net_income": q.net_income,
                    "eps": q.eps,
                    "yoy_revenue_growth": q.yoy_revenue_growth,
                    "yoy_profit_growth": q.yoy_profit_growth,
                }
                for q in quarterly_rows
            ]

            result = await asyncio.to_thread(
                analyze_company,
                quote_dict,
                announcement_dicts,
                quarterly_dicts,
                latest_filing_row.filing_excerpt if latest_filing_row else None,
            )
            quote_row.sentiment = result["sentiment"]
            quote_row.analysis_summary = result["summary"]

        await db.commit()

    logger.info("Analysis generated for %d symbols", len(NIFTY_50_SYMBOLS))