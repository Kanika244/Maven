from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from langchain_core.messages import HumanMessage, AIMessage

from databases.postgres import get_db
from models import User, InvestorPersona
from router.auth import get_current_user

from investor_onboarding.graph import onboarding_graph
from investor_onboarding.persistence import save_conversation_message, save_investor_persona

onboarding_router = APIRouter()

class ChatRequest(BaseModel):
    message: str

@onboarding_router.post("/chat")
async def chat(request: ChatRequest, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    config = {"configurable": {"thread_id": str(current_user.id)}}
    
    # Save user message to DB
    await save_conversation_message(db, current_user.id, str(current_user.id), "user", request.message)
    
    inputs = {"messages": [HumanMessage(content=request.message)]}
    
    # Stream the graph execution or just invoke
    # To keep it simple for now, we invoke
    try:
        result = onboarding_graph.invoke(inputs, config=config)
    except Exception as e:
        message = str(e).lower()
        if "401" in message or "api key" in message or "authentication" in message or "unauthorized" in message:
            raise HTTPException(
                status_code=503,
                detail="LLM provider authentication failed. Check GROQ_API_KEY in the backend environment.",
            )
        raise HTTPException(status_code=500, detail=str(e))
        
    messages = result.get("messages", [])
    if messages:
        last_msg = messages[-1].content
    else:
        last_msg = "Could not process."
        
    await save_conversation_message(db, current_user.id, str(current_user.id), "assistant", last_msg, state=result)
    
    # Return response and the current generated persona if any
    persona = result.get("generated_persona")
    return {
        "reply": last_msg,
        "persona": persona.model_dump() if persona else None,
        "missing_fields": result.get("missing_fields", [])
    }

@onboarding_router.post("/confirm")
async def confirm(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    config = {"configurable": {"thread_id": str(current_user.id)}}
    
    # Get current state from LangGraph memory
    state = onboarding_graph.get_state(config)
    if not state or not state.values:
        raise HTTPException(status_code=400, detail="No active onboarding session found")
        
    values = state.values
    
    if not values.get("generated_persona"):
        raise HTTPException(status_code=400, detail="Persona not yet generated")
        
    # Mark as confirmed in state
    onboarding_graph.update_state(config, {"confirmation_status": "confirmed", "onboarding_completed": True})
    
    # Save to DB
    await save_investor_persona(
        db,
        current_user.id,
        values["generated_persona"],
        values.get("financial_metrics", {}),
        values.get("risk_score", 50.0),
        values.get("risk_category", "Moderate"),
        values.get("extracted_profile"),
    )
    
    return {"message": "Onboarding completed successfully"}
    
@onboarding_router.get("/status")
async def status(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    from sqlalchemy import select
    result = await db.execute(select(InvestorPersona).where(InvestorPersona.user_id == current_user.id))
    persona = result.scalar_one_or_none()
    
    if persona and persona.onboarding_completed:
        financial_data = persona.financial_metrics_json or {}
        return {
            "onboarding_completed": True,
            "persona": persona.profile_json,
            "extracted_profile": financial_data.get("extracted_profile", {}),
        }
        
    # Otherwise return graph state if it exists
    config = {"configurable": {"thread_id": str(current_user.id)}}
    state = onboarding_graph.get_state(config)
    if state and state.values:
        history = [{"role": "user" if isinstance(m, HumanMessage) else "assistant", "content": m.content} for m in state.values.get("messages", [])]
        return {
            "onboarding_completed": False, 
            "history": history,
            "persona": state.values.get("generated_persona", {}),
            "missing": state.values.get("missing_fields", [])
        }
        
    return {"onboarding_completed": False, "history": []}
