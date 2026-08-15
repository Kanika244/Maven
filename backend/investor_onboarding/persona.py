from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage
from investor_onboarding.schemas import GeneratedPersona
from investor_onboarding.prompts import PERSONA_SYSTEM_PROMPT
from investor_onboarding.groq_utils import get_groq_api_key

llm = ChatGroq(api_key=get_groq_api_key(), model="llama-3.1-8b-instant", temperature=0.5)

def generate_persona(profile, metrics, score, category) -> GeneratedPersona:
    generator = llm.with_structured_output(GeneratedPersona)
    
    context = f"""
    Extracted Profile:
    {profile.model_dump_json(indent=2)}
    
    Calculated Metrics:
    {metrics}
    
    Risk Score: {score}/100
    Risk Category: {category}
    """
    
    docs = [
        SystemMessage(content=PERSONA_SYSTEM_PROMPT),
        HumanMessage(content=context)
    ]
    
    result = generator.invoke(docs)
    return result
