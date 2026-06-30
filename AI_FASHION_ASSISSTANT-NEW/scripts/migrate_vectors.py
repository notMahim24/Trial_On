import json
import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Load env from Trial_On
env_path = os.path.join(os.path.dirname(__file__), "..", "..", "Trial_On", ".env")
load_dotenv(env_path)

url: str = os.environ.get("VITE_SUPABASE_URL")
key: str = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not url or not key:
    print("Missing Supabase credentials in Trial_On/.env")
    exit(1)

supabase: Client = create_client(url, key)

data_path = os.path.join(os.path.dirname(__file__), "..", "data", "products_with_embeddings.json")
with open(data_path, "r") as f:
    products = json.load(f)

print(f"Loaded {len(products)} products from local JSON.")

for p in products:
    pid = p.get("id") or p.get("name")
    emb = p.get("embedding")
    
    if emb:
        print(f"Updating embedding for {pid}...")
        try:
            # If id is numeric, update by id. Else if name, update by name.
            if isinstance(p.get("id"), (int, float)) or (isinstance(p.get("id"), str) and p.get("id").isdigit()):
                res = supabase.table("products").update({"embedding": emb}).eq("id", p.get("id")).execute()
            else:
                res = supabase.table("products").update({"embedding": emb}).eq("name", p.get("name")).execute()
        except Exception as e:
            print(f"Failed to update {pid}: {e}")

print("Migration complete!")
