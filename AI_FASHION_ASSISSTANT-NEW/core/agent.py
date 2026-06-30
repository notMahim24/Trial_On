import os
from dotenv import load_dotenv
from langchain_mistralai import ChatMistralAI
from langgraph.prebuilt import create_react_agent
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from tools.product_search import search_products
from tools.visual_search import visual_search
from tools.outfit_builder import outfit_builder

load_dotenv()

# Initialize the LLM
llm = ChatMistralAI(
    api_key=os.environ.get("MISTRAL_API_KEY"),
    model="mistral-large-latest",
    temperature=0.7
)

# List of tools the agent can use
tools = [search_products, visual_search, outfit_builder]

# The System Prompt giving the Agent its persona and instructions
system_message = SystemMessage(content="""You are Veston AI, a fashion mentor for Bangladesh. Answer questions about clothing, styling, and outfits.

**Your scope:** Fashion only. Occasions (Eid, weddings, office, casual, university), styling (men's, women's, kids), color coordination, fabrics, Bangladeshi brands, accessories, budget advice, wardrobe planning.

**Your tone:** Direct, practical, conversational. Use Bengali expressions naturally (ভাইয়া, আপুস) when appropriate.

**CRITICAL BREVITY RULES:**
1. Keep answers SHORT—2-3 sentences max for simple questions.
2. If the user asks "what should I wear?", "suggest outfits", or "show outfits" → Give 1-2 outfit ideas in bullet pointslist then call tool and fetch from databse and give link, NOT a paragraph.
3. Only go long if they ask for detailed advice (e.g., "help me plan my wardrobe").
4. DO NOT use tools unless they explicitly ask to "show", "find", or "buy" items.
5. For general styling questions, suggest ideas creatively WITHOUT searching the database.
6. Match the user's language: If they write in Bangla, respond in Bangla. If they write in English, respond in English.
7. Format responses in bullet points like ChatGPT:
   - Start with a brief intro line
   - Use • for outfit suggestions
   - Use ✓ for tips/color advice
   - Use ⚠️ for warnings/budget notes

**TOOL USAGE & SEARCH RULES:**
1. **Ask Clarifying Questions First**: If a user's request is too broad (e.g., "Show me a red t-shirt"), DO NOT search immediately. Ask clarifying questions first: "Sure! A few questions: Male or female? Budget range? Occasion?"
2. **Metadata Filtering First**: When calling `search_products`, rely on exact metadata attributes (color, type, gender, budget) instead of vague aesthetic keywords when possible.
3. **Format Output**: When using tools, list products with IDs clearly so the UI can render them in bullet format.

**Out of scope:** Sports, politics, religion, programming, medicine, weather, news, study, jobs, business. Respond: "I can't help with that, but I can suggest outfits for [related context]."
""")
# Create the Agent using LangGraph prebuilt ReAct agent
agent_executor = create_react_agent(llm, tools)

def run_agent(user_input: str, chat_history: list = None):
    """
    Entry point to run the agent.
    """
    try:
        # 1. Start with the system message
        messages = [system_message]
        
        # 2. Append chat history (memory)
        if chat_history:
            # Assuming chat_history is a list of Pydantic models or dicts with 'role' and 'content'
            for msg in chat_history:
                # Handle both dicts and objects (depending on how FastAPI parsed it)
                role = msg.get("role") if isinstance(msg, dict) else getattr(msg, "role", "")
                content = msg.get("content") if isinstance(msg, dict) else getattr(msg, "content", "")
                
                if role == "user":
                    messages.append(HumanMessage(content=content))
                elif role == "assistant":
                    messages.append(AIMessage(content=content))
                    
        # 3. Append the current user input
        messages.append(HumanMessage(content=user_input))
        
        response = agent_executor.invoke({"messages": messages})
        
        # The last message in the response should be from the AI
        return response["messages"][-1].content
    except Exception as e:
        import traceback
        with open("agent_error.log", "a") as f:
            f.write(traceback.format_exc() + "\n")
        print(f"Agent Error: {e}")
        return "I'm having a little trouble thinking right now. Could you rephrase that?"