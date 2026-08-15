from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage
from investor_onboarding.schemas import ExtractedProfile
from investor_onboarding.prompts import EXTRACTOR_SYSTEM_PROMPT
from investor_onboarding.groq_utils import get_groq_api_key

llm = ChatGroq(api_key=get_groq_api_key(), model="llama-3.1-8b-instant", temperature=0.1)

def extract_profile(messages) -> ExtractedProfile:
    # Use structured output for extraction
    extractor = llm.with_structured_output(ExtractedProfile)
    
    # We pass the conversation history to the extractor, along with the system prompt
    docs = [SystemMessage(content=EXTRACTOR_SYSTEM_PROMPT)] + messages
    
    # Run the extractor
    result = extractor.invoke(docs)
    return result
