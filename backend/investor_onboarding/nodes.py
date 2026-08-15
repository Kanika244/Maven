from langchain_core.messages import AIMessage
from langchain_groq import ChatGroq

from investor_onboarding.state import InvestorState
from investor_onboarding.extractor import extract_profile
from investor_onboarding.validator import validate_profile
from investor_onboarding.calculator import calculate_metrics
from investor_onboarding.scorer import calculate_risk_score
from investor_onboarding.persona import generate_persona
from investor_onboarding.groq_utils import get_groq_api_key

chat_llm = ChatGroq(api_key=get_groq_api_key(), model="llama-3.1-8b-instant", temperature=0.5)


def _build_follow_up_question(missing_fields: list[str]) -> str:
    questions = {
        "age": "How old are you?",
        "annual_income": "What is your rough annual income?",
        "monthly_expenses": "About how much do you spend each month on living expenses?",
        "goals": "What are your main financial goals or reasons for investing?",
        "investment_horizon": "How long do you plan to keep this money invested?",
        "emergency_fund": "About how much do you currently have set aside as an emergency fund?",
        "investment_behaviour": "If the market fell sharply, how do you usually react?",
        "experience": "What is your investing experience level?",
    }

    asked = []
    for field in missing_fields:
        question = questions.get(field)
        if question and question not in asked:
            asked.append(question)
        if len(asked) == 1:
            break

    if asked:
        return asked[0]

    return "Could you share a bit more about your financial situation so I can personalize your plan?"

def extract_node(state: InvestorState):
    profile = extract_profile(state["messages"])
    missing = validate_profile(profile)
    return {"extracted_profile": profile, "missing_fields": missing}

def follow_up_node(state: InvestorState):
    # Use a deterministic question so the assistant stays focused and does not
    # echo the prompt or generate multiple overlapping questions.
    question = _build_follow_up_question(state["missing_fields"])
    return {"messages": [AIMessage(content=question)]}

def calculate_node(state: InvestorState):
    metrics = calculate_metrics(state["extracted_profile"])
    score, category = calculate_risk_score(state["extracted_profile"], metrics)
    return {
        "financial_metrics": metrics,
        "risk_score": score,
        "risk_category": category
    }

def persona_node(state: InvestorState):
    persona = generate_persona(
        state["extracted_profile"],
        state["financial_metrics"],
        state["risk_score"],
        state["risk_category"]
    )
    
    # After generating persona, we wait for confirmation
    confirm_msg = AIMessage(content="I have generated your investor persona. Please review and confirm it.")
    return {
        "generated_persona": persona,
        "confirmation_status": "pending",
        "messages": [confirm_msg]
    }
