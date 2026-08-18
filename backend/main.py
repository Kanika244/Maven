from contextlib import asynccontextmanager
from datetime import datetime

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from databases.postgres import engine, Base
from databases.mongodb import mongodb
from router.auth import authrouter
from router.kyc import kycrouter
from investor_onboarding.router import onboarding_router
from news_agent.news_router import newsrouter
from news_agent.news_service import fetch_and_store_news
from market_agent.market_router import marketrouter
from market_agent.market_service import (
    fetch_and_store_market_quotes,
    fetch_and_store_announcements,
    fetch_and_store_quarterly_financials,
    generate_and_store_analyses,
)
from router.portfolio import portfoliorouter
import models  # noqa: F401 — import registers all ORM models on Base.metadata before create_all runs


scheduler = AsyncIOScheduler()


async def run_market_cycle():
    # sequential on purpose: analysis needs that cycle's fresh quotes + announcements
    await fetch_and_store_market_quotes()
    await fetch_and_store_announcements()
    await generate_and_store_analyses()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create any tables that don't exist yet (safe — skips existing ones).
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # next_run_time=now fires each job almost immediately once the
    # scheduler starts, but as a background job — NOT awaited here. That's
    # the difference that matters: the old `await fetch_and_store_news()` /
    # `await run_market_cycle()` calls blocked the ENTIRE app (every route,
    # not just news/market) from accepting any connections until both
    # finished, which could take minutes. Now uvicorn reports "ready" and
    # starts serving immediately; the first data population happens
    # concurrently in the background instead of gatekeeping the whole app.
    scheduler.add_job(fetch_and_store_news, "interval", minutes=15, id="news_fetch", next_run_time=datetime.now())
    scheduler.add_job(run_market_cycle, "interval", minutes=15, id="market_fetch", next_run_time=datetime.now())
    # Quarterly financials barely change day to day — a separate, much
    # slower schedule than the 15-min quote/announcement cycle. Runs once
    # on startup, then every 6 hours.
    scheduler.add_job(
        fetch_and_store_quarterly_financials, "interval", hours=6, id="quarterly_fetch", next_run_time=datetime.now()
    )
    scheduler.start()
    yield
    scheduler.shutdown()


app = FastAPI(
    title="MAVEN API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # add your deployed frontend URL(s) here too
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(authrouter, prefix="/api/auth", tags=["auth"])
app.include_router(kycrouter, prefix="/api/kyc", tags=["kyc"])
app.include_router(onboarding_router, prefix="/api/onboarding", tags=["onboarding"])
app.include_router(newsrouter, prefix="/api/news", tags=["news"])
app.include_router(marketrouter, prefix="/api/market", tags=["market"])
app.include_router(portfoliorouter, prefix="/api/portfolio", tags=["portfolio"])


@app.get("/")
async def home():
    return {"message": "MAVEN Backend Running "}

from recommendation_agent.router import recommendationrouter
app.include_router(recommendationrouter, prefix="/api/recommendations", tags=["recommendations"])
