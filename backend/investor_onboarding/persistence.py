from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import json
from models import OnboardingConversation, InvestorPersona

async def save_conversation_message(db: AsyncSession, user_id, conversation_id, role, message, state: dict = None):
    # state contains extracted_json, graph_node
    conv = OnboardingConversation(
        user_id=user_id,
        conversation_id=conversation_id,
        role=role,
        message=message,
        extracted_json=state.get("extracted_profile", {}).model_dump() if state and state.get("extracted_profile") else None,
        graph_node=None # can be improved
    )
    db.add(conv)
    await db.commit()

async def save_investor_persona(db: AsyncSession, user_id, persona, metrics, score, category, extracted_profile=None):
    result = await db.execute(select(InvestorPersona).where(InvestorPersona.user_id == user_id))
    existing = result.scalar_one_or_none()
    
    if existing:
        existing.persona_name = persona.persona_name
        existing.investment_style = persona.investment_style
        existing.risk_score = score
        existing.risk_category = category
        existing.profile_json = persona.model_dump() # for simplicity, save whole generated persona here
        existing.financial_metrics_json = {
            **(metrics or {}),
            "extracted_profile": extracted_profile.model_dump() if extracted_profile else {},
        }
        existing.recommended_allocation_json = persona.recommended_allocation
        existing.llm_summary = persona.human_readable_explanation
        existing.onboarding_completed = True
    else:
        new_persona = InvestorPersona(
            user_id=user_id,
            persona_name=persona.persona_name,
            investment_style=persona.investment_style,
            risk_score=score,
            risk_category=category,
            profile_json=persona.model_dump(),
            financial_metrics_json={
                **(metrics or {}),
                "extracted_profile": extracted_profile.model_dump() if extracted_profile else {},
            },
            recommended_allocation_json=persona.recommended_allocation,
            llm_summary=persona.human_readable_explanation,
            onboarding_completed=True
        )
        db.add(new_persona)
        
    await db.commit()
