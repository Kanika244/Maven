import logging
from datetime import datetime, timezone
from time import mktime

import feedparser
from sqlalchemy import select

from databases.postgres import SessionLocal
from models import NewsArticle
from news_agent.rss_feeds import RSS_FEEDS
from news_agent.sentiment import score_article
from news_agent.tickers import match_tickers

logger = logging.getLogger(__name__)


async def fetch_and_store_news(articles_per_feed: int = 20) -> None:
    """Pull each RSS feed, skip articles already stored (by link), score
    sentiment + match tickers for new ones, and write them to the DB.

    Runs on its own DB session since it's called from a background
    scheduler, not from a request (no `Depends(get_db)` available there).
    """
    async with SessionLocal() as db:
        for feed in RSS_FEEDS:
            try:
                parsed = feedparser.parse(feed["url"])
            except Exception:
                logger.exception("Failed to fetch RSS feed: %s", feed["name"])
                continue

            if parsed.bozo:
                logger.warning("Feed %s returned malformed XML, skipping", feed["name"])
                continue

            for entry in parsed.entries[:articles_per_feed]:
                link = entry.get("link")
                if not link:
                    continue

                existing = await db.execute(select(NewsArticle).where(NewsArticle.link == link))
                if existing.scalar_one_or_none():
                    continue  # already stored, skip re-processing

                title = entry.get("title", "").strip()
                description = entry.get("summary", "") or entry.get("description", "")

                published_at = None
                if entry.get("published_parsed"):
                    published_at = datetime.fromtimestamp(
                        mktime(entry.published_parsed), tz=timezone.utc
                    )

                scored = score_article(title, description)
                related = match_tickers(f"{title} {description}")

                db.add(
                    NewsArticle(
                        title=title,
                        source=feed["name"],
                        link=link,
                        summary=scored["summary"],
                        sentiment=scored["sentiment"],
                        score=scored["score"],
                        related=related,
                        published_at=published_at,
                    )
                )

            await db.commit()