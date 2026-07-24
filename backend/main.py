from contextlib import asynccontextmanager

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from fastapi import FastAPI
from sqlalchemy import text

from databases.postgres import engine
from databases.mongodb import mongodb
from router.auth import authrouter
from fastapi.middleware.cors import CORSMiddleware
from router.kyc import kycrouter
from news_agent.news_router import newsrouter
from news_agent.news_service import fetch_and_store_news


scheduler = AsyncIOScheduler()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Run once immediately on startup, then keep refreshing every 15 minutes.
    await fetch_and_store_news()
    scheduler.add_job(fetch_and_store_news, "interval", minutes=15, id="news_fetch")
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
app.include_router(newsrouter, prefix="/api/news", tags=["news"])


@app.get("/")
async def home():
    return {"message": "MAVEN Backend Running "}