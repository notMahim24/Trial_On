from core.runnable.flow import process_input
from core.router.router import route_decision
from services.recommendation.recommender import recommend_outfit
from services.assistant.response_generator import generate_response
from services.llm.model import ask_llm
from services.user_memory.memory import get_user_memory, update_user_memory

def run_pipeline(user_input: str, chat_history=None):
    """
    Stateful Orchestrator: This is the central hub of your Personal Fashion Assistant.
    It combines past knowledge (Memory) with the current user message.
    """
    # 1. ANALYZE CURRENT MESSAGE
    # We extract intent (color, category, etc.) from the latest input
    processed = process_input(user_input, chat_history)
    current_intent = processed.get("context", {}) or {}
    user_info = processed.get("user_info", {}) or {}
    
    # 2. UPDATE PERSONAL MEMORY
    # We save newly discovered info into the session-based memory
    update_user_memory(current_intent)
    
    # 3. GET FULL ACCUMULATED CONTEXT
    # This retrieves everything we know about the user across the whole conversation
    full_context = get_user_memory()
    full_context["raw_input"] = user_input # Keep original text for CLIP similarity

    # 4. DECIDE HIGH-LEVEL ACTION
    # Does the user want a recommendation, general advice, or are they refining a previous pick?
    action = route_decision(user_input)
    if action == "unknown":
        action = current_intent.get("action") or "advice"
    
    if action not in ("recommend", "advice"):
        action = "advice"

    # ------------------------------
    # 5. SMART CLARIFICATION LOOP
    # ------------------------------
    recommendations = []
    
    if action == "recommend":
        # Run the recommendation engine using CLIP embeddings immediately
        # We no longer force the user to answer occasion/style questions
        recommendations = recommend_outfit(user_info, full_context)
        
        if not recommendations:
            assistant_reply = "I couldn't find any perfect matches for that right now. Could you tell me more about what you're looking for?"
        else:
            assistant_reply = generate_response(full_context, recommendations)
    
    elif action == "advice":
        # General fashion guidance without product listings
        prompt = f"""
        You are Tooly, an expert stylist. Give professional fashion advice for: "{user_input}".
        Context: {full_context}
        Keep it short, helpful, and ask if they want to see specific product recommendations.
        """
        assistant_reply = ask_llm(prompt, chat_history)
    else:
        # Fallback if the intent is unclear
        assistant_reply = "I'm here to help you look your best! Are you dressing up for a specific event today?"

    # ------------------------------
    # 6. RETURN RESULTS
    # ------------------------------
    return {
        "input": user_input,
        "context": full_context,
        "action": action,
        "recommendations": recommendations,
        "assistant_reply": assistant_reply
    }