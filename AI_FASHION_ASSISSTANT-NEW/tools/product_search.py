import os
from langchain.tools import tool
from supabase import create_client, Client
from dotenv import load_dotenv
from typing import Optional

# Load env variables for Supabase
env_path = os.path.join(os.path.dirname(__file__), "..", "..", "Trial_On", ".env")
load_dotenv(env_path)

SUPABASE_URL = os.environ.get("VITE_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

from services.recommendation.recommender import rerank_with_clip

@tool
def search_products(
    search_term: Optional[str] = None,
    category: Optional[str] = None,
    color: Optional[str] = None,
    gender: Optional[str] = None,
    brand: Optional[str] = None,
    occasion: Optional[str] = None,
    type: Optional[str] = None,
    max_price: Optional[float] = None,
    aesthetic_vibe: Optional[str] = None,
    limit: int = 15
) -> str:
    """
    Search the database for specific fashion products using structured metadata filters.
    Use this tool when the user asks for products matching exact criteria (gender, brand, occasion, color, budget).
    Provide 'aesthetic_vibe' for semantic re-ranking if the user asks for a specific feel/style (e.g., "sporty", "elegant").
    """
    # Base query
    query = supabase.table("products").select("id, name, price, category, color, gender, brand, occasion, type, image, description")
    
    if search_term:
        query = query.or_(f"name.ilike.%{search_term}%,description.ilike.%{search_term}%,category.ilike.%{search_term}%,color.ilike.%{search_term}%")
    
    # Apply strict metadata filters
    if category and not search_term:
        query = query.ilike("category", f"%{category}%")
    if color and not search_term:
        query = query.ilike("color", f"%{color}%")
    if gender:
        query = query.ilike("gender", f"%{gender}%")
    if brand:
        query = query.ilike("brand", f"%{brand}%")
    if occasion:
        query = query.ilike("occasion", f"%{occasion}%")
    if type:
        query = query.ilike("type", f"%{type}%")
    if max_price:
        query = query.lte("price", max_price)
        
    try:
        # Fetch more items initially if we are going to re-rank
        fetch_limit = limit * 2 if aesthetic_vibe else limit
        response = query.limit(fetch_limit).execute()
        products = response.data
        
        if not products:
            return "No products found matching these exact criteria."
            
        # Optional Semantic Re-ranking using CLIP
        if aesthetic_vibe:
            products = rerank_with_clip(products, aesthetic_vibe)
            
        # Enforce final limit
        products = products[:limit]
            
        result_text = "Found the following products:\n"
        for p in products:
            result_text += f"- {p['name']} ({p.get('category', 'unknown')}) - {p.get('color', 'unknown')} | Price: ${p['price']} | ID: {p['id']}\n"
            
        return result_text
    except Exception as e:
        return f"Error searching products: {str(e)}"
