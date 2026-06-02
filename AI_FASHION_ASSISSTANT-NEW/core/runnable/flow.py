# ==============================
# NLP EXTRACTION FLOW
# ==============================
import json
import re
from services.llm.model import ask_llm

def clean_json(text):
    """Robust JSON extraction from LLM chatter."""
    if not text:
        return "{}"
    # Find anything between curly braces to ignore conversational fluff
    match = re.search(r'\{.*\}', text.replace('\n', ' '), re.DOTALL)
    if match:
        return match.group(0)
    # Fallback strip markdown backticks
    text = re.sub(r'```json', '', text, flags=re.IGNORECASE)
    text = re.sub(r'```', '', text)
    return text.strip()

def extract_intent(user_input, chat_history=None):
    """Extracts context and intent from user input, using chat history for short replies."""
    
    # Pass the last 2 messages so Mistral knows what it just asked!
    history_text = ""
    if chat_history:
        history_text = "PREVIOUS CHAT CONTEXT:\n"
        for msg in chat_history[-2:]:
            role = "AI" if msg["role"] == "assistant" else "User"
            history_text += f"{role}: {msg['content']}\n"

    prompt = f"""
    {history_text}
    
    Analyze the user's latest input: "{user_input}"
    
    Extract the following into a valid JSON object. Use null if not found.
    - "occasion": (e.g., "wedding", "office", "casual", "party")
    - "style": (e.g., "traditional", "modern", "formal", "linen")
    - "color_preference": (any color name or null)
    - "category": (e.g., "shirt", "panjabi", "tshirt", "suit")
    - "quantity": (number, e.g., if user says "one" put 1. default null)
    - "specificity_score": (Rate 1 to 5. 1=very vague "I want clothes", 5=highly specific)
    - "action": (e.g., "recommend", "advice", "refine")
    
    CRITICAL INSTRUCTION: If the user's input is very short (like "1", "yes", or "formal"), look at the PREVIOUS CHAT CONTEXT to figure out what they are answering!
    """
    
    response = ask_llm(prompt)
    try:
        cleaned_response = clean_json(response)
        return json.loads(cleaned_response)
    except Exception as e:
        print(f"⚠️ Intent Parsing Error: {e}")
        return {}

def extract_user_info(user_input):
    """Extracts personal user attributes."""
    prompt = f"""
    Extract user attributes from this input: "{user_input}"
    Return ONLY a valid JSON object with these keys:
    - "height": (e.g., "5.8" or null)
    - "weight": (e.g., "70" or null)
    - "preferred_style": (e.g., "minimalist" or null)
    - "favorite_color": (e.g., "blue" or null)
    """
    response = ask_llm(prompt)
    try:
        cleaned_response = clean_json(response)
        return json.loads(cleaned_response)
    except Exception as e:
        print(f"⚠️ User Info Parsing Error: {e}")
        return {}

def process_input(user_input, chat_history=None):
    """Main entry point for processing text."""
    return {
        # Pass the history down so the AI can read the room
        "context": extract_intent(user_input, chat_history),
        "user_info": extract_user_info(user_input)
    }