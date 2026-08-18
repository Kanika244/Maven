from typing import Literal

from pydantic import BaseModel, Field


class RecommendationItem(BaseModel):
    symbol: str = Field(description="NSE ticker symbol, must be one of the candidates provided")
    action: Literal["BUY", "HOLD", "SELL", "TRIM"] = Field(
        description="BUY/SELL for new positions or full exits, HOLD/TRIM for adjusting an existing position"
    )
    thesis: str = Field(description="1-2 sentence justification grounded in the specific numbers provided — no speculation")
    confidence: int = Field(ge=0, le=100, description="0-100 confidence in this call")
    expected_return_pct: float = Field(description="Expected return over the user's stated horizon, as a percentage. Negative for SELL/TRIM.")


class RecommendationSet(BaseModel):
    recommendations: list[RecommendationItem] = Field(
        description="5-8 recommendations, prioritizing the user's existing holdings first, then new opportunities"
    )
