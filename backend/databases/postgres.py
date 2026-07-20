from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.ext.asyncio import async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from dotenv import load_dotenv
import os

load_dotenv()

# Expect: postgresql+asyncpg://user:pass@HOST:6543/postgres?ssl=require
# (use Supabase's *pooler* host:port if on a serverless/multi-instance deploy)
DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_async_engine(
    DATABASE_URL,
    echo=os.getenv("SQL_ECHO", "false").lower() == "true",
    pool_pre_ping=True,
    connect_args={
        # required when connecting through Supabase's pgbouncer pooler
        # (transaction mode) — asyncpg's prepared-statement cache otherwise
        # causes intermittent "prepared statement already exists" errors
        "statement_cache_size": 0,
    },
)

SessionLocal = async_sessionmaker(
    bind=engine,
    expire_on_commit=False
)


class Base(DeclarativeBase):
    pass


async def get_db():
    async with SessionLocal() as session:
        yield session