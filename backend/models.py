import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr
from sqlalchemy import String, DateTime, Float, Integer, JSON, Boolean, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from databases.postgres import Base


# ---------- ORM models ----------

class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    email: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    password: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    status: Mapped[str] = mapped_column(String, default="pending_registration")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), onupdate=func.now())


class InvestorProfile(Base):
    __tablename__ = "investor_profiles"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), unique=True, index=True, nullable=False)
    phone: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    city: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    risk: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    goal: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    horizon: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    experience: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), onupdate=func.now())


class OTP(Base):
    __tablename__ = "otp_codes"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String, index=True, nullable=False)
    otp: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    type: Mapped[str] = mapped_column(String, default="register")  # "register" | "password_reset"
    token: Mapped[Optional[str]] = mapped_column(String, nullable=True)  # used for password_reset
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class NewsArticle(Base):
    __tablename__ = "news_articles"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String, nullable=False)
    source: Mapped[str] = mapped_column(String, nullable=False)
    link: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    summary: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    sentiment: Mapped[Optional[str]] = mapped_column(String, nullable=True)  # Positive | Neutral | Negative
    score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    related: Mapped[Optional[list]] = mapped_column(JSON, default=list)  # e.g. ["RELIANCE", "TCS"]
    published_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    fetched_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class MarketQuote(Base):
    __tablename__ = "market_quotes"

    symbol: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    sector: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    ltp: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    prev_close: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    change: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    pct_change: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    day_high: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    day_low: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    year_high: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    year_low: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    volume: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    pe: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    sector_pe: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    rsi14: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    sentiment: Mapped[Optional[str]] = mapped_column(String, nullable=True)  # Positive | Neutral | Negative
    analysis_summary: Mapped[Optional[str]] = mapped_column(String, nullable=True)  # LLM-generated read, see market_agent/analysis.py
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class CorporateAnnouncement(Base):
    __tablename__ = "corporate_announcements"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    symbol: Mapped[str] = mapped_column(String, index=True, nullable=False)
    subject: Mapped[str] = mapped_column(String, nullable=False)
    attachment_text: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    attachment_url: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    broadcast_date: Mapped[Optional[str]] = mapped_column(String, nullable=True)  # raw NSE string, e.g. "27-Jul-2026 18:30:00"
    is_financial_result: Mapped[bool] = mapped_column(Boolean, default=False)
    filing_excerpt: Mapped[Optional[str]] = mapped_column(String, nullable=True)  # extracted PDF text, see market_agent/filing_reader.py
    fetched_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class QuarterlyFinancial(Base):
    __tablename__ = "quarterly_financials"
    __table_args__ = (UniqueConstraint("symbol", "quarter_end", name="uq_symbol_quarter"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    symbol: Mapped[str] = mapped_column(String, index=True, nullable=False)
    quarter_end: Mapped[str] = mapped_column(String, nullable=False)  # "YYYY-MM-DD"
    revenue: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    net_income: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    eps: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    yoy_revenue_growth: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    yoy_profit_growth: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    fetched_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class InvestorPersona(Base):
    __tablename__ = "investor_personas"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), unique=True, index=True, nullable=False)
    persona_name: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    investment_style: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    risk_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    risk_category: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    profile_json: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    financial_metrics_json: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    recommended_allocation_json: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    llm_summary: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    onboarding_completed: Mapped[bool] = mapped_column(default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), onupdate=func.now())


class OnboardingConversation(Base):
    __tablename__ = "onboarding_conversations"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), index=True, nullable=False)
    conversation_id: Mapped[str] = mapped_column(String, index=True, nullable=False)
    role: Mapped[str] = mapped_column(String, nullable=False)
    message: Mapped[str] = mapped_column(String, nullable=False)
    extracted_json: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    graph_node: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())



# ---------- Pydantic schemas ----------

class RegisterRequest(BaseModel):
    name: Optional[str] = None
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    name: Optional[str] = None
    status: str


class EmailRequest(BaseModel):
    email: EmailStr


class PasswordSetup(BaseModel):
    email: EmailStr
    password: str


class OTPVerify(BaseModel):
    email: EmailStr
    otp: str


class ChangePassword(BaseModel):
    current_password: str
    new_password: str


class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    city: Optional[str] = None
    risk: Optional[str] = None
    goal: Optional[str] = None
    horizon: Optional[str] = None
    experience: Optional[str] = None


class NewsArticleResponse(BaseModel):
    id: str
    title: str
    source: str
    link: str
    summary: Optional[str] = None
    sentiment: Optional[str] = None
    score: Optional[float] = None
    related: list[str] = []
    published_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class MarketQuoteResponse(BaseModel):
    symbol: str
    name: str
    sector: Optional[str] = None
    ltp: Optional[float] = None
    change: Optional[float] = None
    pct_change: Optional[float] = None
    day_high: Optional[float] = None
    day_low: Optional[float] = None
    pe: Optional[float] = None
    sector_pe: Optional[float] = None
    rsi14: Optional[float] = None
    sentiment: Optional[str] = None
    analysis_summary: Optional[str] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class CorporateAnnouncementResponse(BaseModel):
    id: str
    symbol: str
    subject: str
    attachment_text: Optional[str] = None
    attachment_url: Optional[str] = None
    broadcast_date: Optional[str] = None
    is_financial_result: bool = False
    filing_excerpt: Optional[str] = None

    class Config:
        from_attributes = True


class QuarterlyFinancialResponse(BaseModel):
    symbol: str
    quarter_end: str
    revenue: Optional[float] = None
    net_income: Optional[float] = None
    eps: Optional[float] = None
    yoy_revenue_growth: Optional[float] = None
    yoy_profit_growth: Optional[float] = None

    class Config:
        from_attributes = True

# New models.py additions for the recommendation agent.
#
# Add this ORM class (near your other tables):

class Recommendation(Base):
    __tablename__ = "recommendations"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), index=True, nullable=False)
    symbol: Mapped[str] = mapped_column(String, nullable=False)
    name: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    action: Mapped[str] = mapped_column(String, nullable=False)  # BUY | HOLD | SELL | TRIM
    thesis: Mapped[str] = mapped_column(String, nullable=False)
    confidence: Mapped[int] = mapped_column(Integer, nullable=False)
    expected_return_pct: Mapped[float] = mapped_column(Float, nullable=False)
    generated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

# Add this Pydantic response schema (near your other response schemas):

class RecommendationResponse(BaseModel):
    id: uuid.UUID  # was: id: str — UUID objects don't auto-coerce to str in Pydantic v2
    symbol: str
    name: Optional[str] = None
    action: str
    thesis: str
    confidence: int
    expected_return_pct: float
    generated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# No new imports needed — String, Float, Integer, DateTime, UUID, uuid,
# datetime, Optional, BaseModel, func, Mapped, mapped_column, Base are
# all already imported in your models.py from the market_agent additions.