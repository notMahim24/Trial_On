import json
import math
import random
import os
import torch
import clip
from functools import lru_cache
from io import BytesIO
import base64
from PIL import Image
import requests
from services.user_memory.memory import get_user_memory

# ── CLIP model (loaded once, cached) ───────────────────────────────────────
@lru_cache(maxsize=1)
def load_clip_model():
    device = "cpu"
    model, preprocess = clip.load("ViT-B/32", device=device)
    return model, preprocess, device


def get_text_embedding(text: str):
    clip_model, _, device = load_clip_model()
    tokens = clip.tokenize([text]).to(device)
    with torch.no_grad():
        emb = clip_model.encode_text(tokens)
    emb = emb / emb.norm(dim=-1, keepdim=True)
    return emb.cpu().numpy()[0].tolist()


def get_image_embedding(image_str: str):
    clip_model, preprocess, device = load_clip_model()
    try:
        if image_str.startswith("data:image"):
            header, encoded = image_str.split(",", 1)
            img = Image.open(BytesIO(base64.b64decode(encoded)))
        elif image_str.startswith("http"):
            response = requests.get(image_str)
            img = Image.open(BytesIO(response.content))
        else:
            base = os.path.dirname(os.path.abspath(__file__))
            root = os.path.join(base, "..", "..", "data")
            img = Image.open(os.path.join(root, image_str))
            
        image_tensor = preprocess(img).unsqueeze(0).to(device)
        with torch.no_grad():
            emb = clip_model.encode_image(image_tensor)
        emb = emb / emb.norm(dim=-1, keepdim=True)
        return emb.cpu().numpy()[0].tolist()
    except Exception as e:
        print(f"Error computing embedding for image: {e}")
        return None

# ── Product loader (cached at module level) ────────────────────────────────
_products_cache = None

def load_products():
    global _products_cache
    
    try:
        res = requests.get("http://127.0.0.1:3000/api/products", timeout=5)
        if res.status_code == 200:
            live_products = res.json()
        else:
            live_products = []
    except Exception as e:
        print(f"Error connecting to backend: {e}")
        live_products = []

    if not live_products:
        base = os.path.dirname(os.path.abspath(__file__))
        fpath = os.path.join(base, "..", "..", "data", "products_with_embeddings.json")
        if os.path.exists(fpath):
            with open(fpath, "r") as f:
                return json.load(f)
        return []

    if _products_cache is None:
        _products_cache = {}
        base = os.path.dirname(os.path.abspath(__file__))
        fpath = os.path.join(base, "..", "..", "data", "products_with_embeddings.json")
        if os.path.exists(fpath):
            with open(fpath, "r") as f:
                cached = json.load(f)
                for p in cached:
                    _products_cache[p.get("id", p.get("name"))] = p.get("embedding")
    
    for p in live_products:
        pid = p.get("id", p.get("name"))
        if pid in _products_cache and _products_cache[pid] is not None:
            p["embedding"] = _products_cache[pid]
        elif p.get("image"):
            print(f"Computing new embedding for product: {p.get('name')}")
            emb = get_image_embedding(p["image"])
            if emb:
                p["embedding"] = emb
                _products_cache[pid] = emb
                
    return live_products


# ── Scoring helpers ────────────────────────────────────────────────────────
def cosine_similarity(vec1, vec2):
    dot = sum(a * b for a, b in zip(vec1, vec2))
    norm1 = math.sqrt(sum(a * a for a in vec1))
    norm2 = math.sqrt(sum(b * b for b in vec2))
    if norm1 == 0 or norm2 == 0:
        return 0
    return dot / (norm1 * norm2)


def score_product(product, context, memory):
    score = 0
    if context.get("occasion") == product.get("category"): score += 5
    if context.get("style") == product.get("style"):       score += 4
    if context.get("color_preference") == product.get("color"): score += 3
    if memory.get("preferred_style") == product.get("style"):   score += 2
    if memory.get("favorite_color") == product.get("color"):    score += 2
    return score


def diversify(products, limit):
    seen = set()
    result = []
    for p in products:
        key = (p.get("category"), p.get("style"))
        if key not in seen:
            result.append(p)
            seen.add(key)
        if len(result) >= limit:
            break
    return result


# ── Main recommendation function ───────────────────────────────────────────
def recommend_outfit(user_info, context):
    products = load_products()
    memory = get_user_memory()
    limit = context.get("limit", 3)

    query_text = context.get("raw_input", "").strip()
    if not query_text:
        query_text = f"{context.get('occasion', '')} {context.get('style', '')}".strip()

    if not query_text or not products:
        return diversify(products, limit)

    query_embedding = get_text_embedding(query_text)
    scored = []

    for p in products:
        score = score_product(p, context, memory)
        if "embedding" in p:
            sim = cosine_similarity(query_embedding, p["embedding"])
            score += sim * 3
        score += random.uniform(0, 0.1)
        scored.append((p, score))

    scored.sort(key=lambda x: x[1], reverse=True)
    ranked = [item[0] for item in scored]
    return diversify(ranked, limit)


def rerank_with_clip(products: list, aesthetic_keyword: str) -> list:
    """
    Re-rank a pre-filtered list of products based on an aesthetic/vibe keyword
    using CLIP semantic embeddings.
    """
    if not products or not aesthetic_keyword:
        return products
        
    query_embedding = get_text_embedding(aesthetic_keyword)
    scored = []
    
    # In case products don't have embeddings loaded yet, we load them from cache/live
    all_products = load_products()
    emb_map = {str(p.get("id")): p.get("embedding") for p in all_products if p.get("embedding")}
    
    for p in products:
        score = 0
        p_id = str(p.get("id"))
        p_emb = p.get("embedding") or emb_map.get(p_id)
        
        if p_emb:
            sim = cosine_similarity(query_embedding, p_emb)
            score += sim
            
        scored.append((p, score))
        
    scored.sort(key=lambda x: x[1], reverse=True)
    return [item[0] for item in scored]