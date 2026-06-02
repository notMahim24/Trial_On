import json
import math
import random
import os
import torch
import clip
from functools import lru_cache
from services.user_memory.memory import get_user_memory

# ── CLIP model (loaded once, cached) ───────────────────────────────────────
@lru_cache(maxsize=1)
def load_clip_model():
    device = "cpu"
    model, _ = clip.load("ViT-B/32", device=device)
    return model, device


def get_text_embedding(text: str):
    clip_model, device = load_clip_model()
    tokens = clip.tokenize([text]).to(device)
    with torch.no_grad():
        emb = clip_model.encode_text(tokens)
    emb = emb / emb.norm(dim=-1, keepdim=True)
    return emb.cpu().numpy()[0].tolist()


# ── Product loader (cached at module level) ────────────────────────────────
_products_cache = None

def load_products():
    global _products_cache
    if _products_cache is not None:
        return _products_cache

    base = os.path.dirname(os.path.abspath(__file__))
    root = os.path.join(base, "..", "..", "data")

    for fname in ("products_with_embeddings.json", "products.json"):
        fpath = os.path.join(root, fname)
        if os.path.exists(fpath):
            with open(fpath, "r") as f:
                _products_cache = json.load(f)
            return _products_cache

    # Fallback: return empty list so API doesn't crash
    _products_cache = []
    return _products_cache


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