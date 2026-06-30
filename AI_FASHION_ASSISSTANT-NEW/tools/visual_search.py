import os
from langchain.tools import tool
from supabase import create_client, Client
from dotenv import load_dotenv

# We reuse the existing PyTorch/CLIP implementation from your recommender
from services.recommendation.recommender import get_text_embedding

env_path = os.path.join(os.path.dirname(__file__), "..", "..", "Trial_On", ".env")
load_dotenv(env_path)

SUPABASE_URL = os.environ.get("VITE_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

@tool
def visual_search(query: str, max_price: float = None, limit: int = 3) -> str:
    """
    Search for products using visual similarity (AI Embeddings).
    Use this tool when the user asks for "dresses that look like X", "vibes", or stylistic concepts that are hard to filter via exact text.
    You can optionally provide a max_price to filter the semantic results by budget.
    """
    try:
        # 1. Convert text to visual embedding vector using CLIP
        embedding = get_text_embedding(query)
        
        # 2. Convert to string format for pgvector
        embedding_str = f"[{','.join(map(str, embedding))}]"
        
        # 3. Use Supabase RPC to do vector similarity search.
        # We assume you'll create an RPC function named 'match_products', but for now we can 
        # just do a raw SQL query via postgrest if supported, or we can fetch and filter locally.
        # Since we enabled pgvector, the standard way in Supabase is via an RPC function.
        # Wait, if RPC isn't created yet, we can do a fallback or create the RPC.
        # Let's create the RPC function 'match_products' in the database!
        
        rpc_params = {
            "query_embedding": embedding_str,
            "match_threshold": 0.5,
            "match_count": limit
        }
        
        if max_price:
            rpc_params["max_price"] = max_price
            
        # Call the RPC function
        response = supabase.rpc('match_products', rpc_params).execute()
        products = response.data
        
        if not products:
            return "No visually similar products found."
            
        result_text = f"Found {len(products)} products matching the visual vibe of '{query}':\n"
        for p in products:
            result_text += f"- {p['name']} | Price: ${p['price']} | ID: {p['id']} | Similarity Score: {p.get('similarity', 0):.2f}\n"
            
        return result_text
    except Exception as e:
        return f"Error performing visual search: {str(e)}\nHint: Ensure the 'match_products' RPC function exists in Supabase."
