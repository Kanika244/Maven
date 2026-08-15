from typing import Optional
from pydantic import BaseModel, Field

class ExtractedProfile(BaseModel):
    age: Optional[int] = Field(None, description="Age of the investor")
    annual_income: Optional[float] = Field(None, description="Annual income in INR")
    monthly_expenses: Optional[float] = Field(None, description="Monthly living expenses in INR")
    existing_investments: Optional[dict] = Field(default_factory=dict, description="Key-value pairs of asset classes to boolean/amounts")
    goals: Optional[list[str]] = Field(default_factory=list, description="List of financial goals")
    investment_horizon: Optional[str] = Field(None, description="Expected time horizon (e.g. '5 years', 'Long term')")
    emergency_fund: Optional[float] = Field(None, description="Current emergency fund savings in INR")
    debt: Optional[float] = Field(None, description="Total outstanding debt in INR")
    investment_behaviour: Optional[str] = Field(None, description="Reaction to market crashes (e.g. 'buy more', 'panic sell')")
    experience: Optional[str] = Field(None, description="Previous investment experience (None, Beginner, Intermediate, Advanced)")

class GeneratedPersona(BaseModel):
    persona_name: str = Field(description="Catchy name for this investor persona (e.g., 'Aggressive Growth Seeker')")
    investment_style: str = Field(description="Description of their style (e.g., 'Value', 'Growth', 'Balanced')")
    behaviour_summary: str = Field(description="Short summary of their market behaviour")
    strengths: list[str] = Field(description="Key financial strengths")
    weaknesses: list[str] = Field(description="Key financial weaknesses")
    recommended_allocation: dict[str, float] = Field(description="Asset allocation percentages mapping asset class to percentage (0-100)")
    human_readable_explanation: str = Field(description="A friendly explanation of why this persona fits them")
