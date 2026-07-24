from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from databases.postgres import get_db
from models import NewsArticle, NewsArticleResponse

newsrouter = APIRouter()


@newsrouter.get("/feed", response_model=list[NewsArticleResponse])
async def get_news_feed(
    sentiment: Optional[str] = Query(None, description="Filter: Positive | Neutral | Negative"),
    limit: int = Query(50, le=200),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(NewsArticle).order_by(NewsArticle.published_at.desc().nullslast()).limit(limit)
    if sentiment:
        stmt = stmt.where(NewsArticle.sentiment == sentiment)

    result = await db.execute(stmt)
    articles = result.scalars().all()
    return [
        NewsArticleResponse(
            id=str(a.id),
            title=a.title,
            source=a.source,
            link=a.link,
            summary=a.summary,
            sentiment=a.sentiment,
            score=a.score,
            related=a.related or [],
            published_at=a.published_at,
        )
        for a in articles
    ]