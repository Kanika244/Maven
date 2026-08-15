import operator
from typing import TypedDict, Annotated, Optional
from langchain_core.messages import AnyMessage

from investor_onboarding.schemas import ExtractedProfile, GeneratedPersona

class InvestorState(TypedDict):
    # The conversational messages so far
    messages: Annotated[list[AnyMessage], operator.add]
    
    # Information extracted from the user's responses
    extracted_profile: ExtractedProfile
    
    # Missing fields calculated by the validator
    missing_fields: list[str]
    
    # Financial metrics calculated natively
    financial_metrics: dict
    
    # Risk scoring calculated natively
    risk_score: Optional[float]
    risk_category: Optional[str]
    
    # Final AI-generated Persona
    generated_persona: Optional[GeneratedPersona]
    
    # Workflow status
    confirmation_status: str # "pending", "confirmed", "corrected"
    onboarding_completed: bool
