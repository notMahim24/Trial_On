import os
from langchain.tools import tool
from supabase import create_client, Client
from dotenv import load_dotenv

env_path = os.path.join(os.path.dirname(__file__), "..", "..", "Trial_On", ".env")
load_dotenv(env_path)

SUPABASE_URL = os.environ.get("VITE_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

@tool
def outfit_builder(style: str, budget: float = None) -> str:
    """
    Builds a complete outfit (Top + Bottom + Shoes/Accessories) matching a specific style and optional budget.
    Use this when the user asks for a full outfit, a look, or multiple complementary items.
    """
    # Simple logic: Fetch 1 shirt, 1 pant, 1 shoe matching the style
    # In a real enterprise app, this would use a more complex vector matching or styling algorithm
    
    categories = ["shirt", "pant", "shoe"]
    outfit = []
    total_price = 0
    
    # If budget is provided, roughly divide it across 3 items
    item_budget = (budget / 3) if budget else None
    
    try:
        for cat in categories:
            query = supabase.table("products").select("id, name, price, category, image")\
                .ilike("category", f"%{cat}%")\
                .ilike("description", f"%{style}%")
                
            if item_budget:
                query = query.lte("price", item_budget)
                
            res = query.limit(1).execute()
            if res.data:
                item = res.data[0]
                outfit.append(item)
                total_price += float(item['price'])
                
        if not outfit:
            return f"Could not assemble a full {style} outfit within the budget."
            
        result = f"Here is a complete {style} outfit I built for you (Total: ${total_price:.2f}):\n"
        for item in outfit:
            result += f"- {item['name']} (${item['price']}) - ID: {item['id']}\n"
            
        return result
    except Exception as e:
        return f"Failed to build outfit: {str(e)}"
