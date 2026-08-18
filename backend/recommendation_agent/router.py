from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from databases.postgres import get_db
from models import User, RecommendationResponse
from router.auth import get_current_user
from recommendation_agent.service import get_or_generate_recommendations

recommendationrouter = APIRouter()


@recommendationrouter.get("", response_model=list[RecommendationResponse])
async def get_recommendations(
    refresh: bool = Query(False, description="Force regeneration instead of using the cached set"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Cached for up to 1 hour per user — pass ?refresh=true to force a
    fresh Groq call (e.g. a manual 'Refresh' button on the frontend).
    """
    return await get_or_generate_recommendations(db, current_user, force_refresh=refresh)
