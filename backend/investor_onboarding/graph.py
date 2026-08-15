from langgraph.graph import StateGraph, END, START
from langgraph.checkpoint.memory import MemorySaver

from investor_onboarding.state import InvestorState
from investor_onboarding.nodes import extract_node, follow_up_node, calculate_node, persona_node

def route_validation(state: InvestorState):
    if state.get("confirmation_status") == "confirmed":
        return END
        
    if state.get("missing_fields") and len(state["missing_fields"]) > 0:
        return "follow_up"
        
    if not state.get("generated_persona"):
        return "calculate"
        
    return END

def build_onboarding_graph():
    builder = StateGraph(InvestorState)
    
    builder.add_node("extract", extract_node)
    builder.add_node("follow_up", follow_up_node)
    builder.add_node("calculate", calculate_node)
    builder.add_node("persona", persona_node)
    
    builder.add_edge(START, "extract")
    
    builder.add_conditional_edges("extract", route_validation, {
        "follow_up": "follow_up",
        "calculate": "calculate",
        END: END
    })
    
    builder.add_edge("follow_up", END)
    
    builder.add_edge("calculate", "persona")
    builder.add_edge("persona", END)
    
    memory = MemorySaver()
    graph = builder.compile(checkpointer=memory)
    return graph

# Global graph instance
onboarding_graph = build_onboarding_graph()
