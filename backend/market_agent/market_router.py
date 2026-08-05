from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
import asyncio

from databases.postgres import get_db
from models import (
    MarketQuote,
    MarketQuoteResponse,
    CorporateAnnouncement,
    CorporateAnnouncementResponse,
    QuarterlyFinancial,
    QuarterlyFinancialResponse,
)
from market_agent import nsetools_client

marketrouter = APIRouter()


@marketrouter.get("/overview")
async def get_market_overview():
    """Live index-level snapshot for the dashboard header cards.
    Fetched live (2 cheap calls) rather than cached — no need to persist
    index-level numbers separately from the per-symbol quotes table.
    """
    return await asyncio.to_thread(nsetools_client.get_market_overview)


@marketrouter.get("/companies", response_model=list[MarketQuoteResponse])
async def get_companies(db: AsyncSession = Depends(get_db)):
    """All Nifty 50 quotes as last refreshed by the scheduler."""
    result = await db.execute(select(MarketQuote).order_by(MarketQuote.symbol))
    return result.scalars().all()


@marketrouter.get("/companies/{symbol}", response_model=MarketQuoteResponse)
async def get_company(symbol: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(MarketQuote).where(MarketQuote.symbol == symbol.upper()))
    return result.scalar_one_or_none()


@marketrouter.get("/companies/{symbol}/announcements", response_model=list[CorporateAnnouncementResponse])
async def get_company_announcements(
    symbol: str,
    limit: int = Query(20, le=100),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(CorporateAnnouncement)
        .where(CorporateAnnouncement.symbol == symbol.upper())
        .order_by(CorporateAnnouncement.fetched_at.desc())
        .limit(limit)
    )
    result = await db.execute(stmt)
    return result.scalars().all()


@marketrouter.get("/companies/{symbol}/quarterly", response_model=list[QuarterlyFinancialResponse])
async def get_company_quarterly_financials(symbol: str, db: AsyncSession = Depends(get_db)):
    """Last 8 quarters, newest first — revenue/net income/EPS + YoY growth."""
    stmt = (
        select(QuarterlyFinancial)
        .where(QuarterlyFinancial.symbol == symbol.upper())
        .order_by(QuarterlyFinancial.quarter_end.desc())
    )
    result = await db.execute(stmt)
    return result.scalars().all()