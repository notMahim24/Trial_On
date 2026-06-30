import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import json
import re
import requests
from io import BytesIO
from PIL import Image
from dotenv import load_dotenv
from core.agent import run_agent
from tools.product_search import supabase
from services.recommendation.recommender import get_image_embedding

# Load environment variables from .env file
load_dotenv()

# Initialize FastAPI App
app = FastAPI(title="Virton AI Fashion API", version="1.0.0")

# Allow CORS for the Node.js proxy to communicate securely
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# PYDANTIC MODELS
# ==========================================

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    user_message: str = Field(..., description="The user's query, e.g., 'show a red dress'")
    chat_history: Optional[List[ChatMessage]] = Field(default=[], description="Previous conversation history")

class ChatResponse(BaseModel):
    reply: str
    action: str = Field(default="recommend")
    recommendations: List[Dict[str, Any]] = Field(default=[])

class EmbedRequest(BaseModel):
    product_id: int = Field(..., description="The ID of the product in Supabase")
    image_url: str = Field(..., description="The URL of the uploaded image to generate embedding for")



# ==========================================
# API ENDPOINTS
# ==========================================

@app.get("/")
def root():
    return {"message": "Virton AI Fashion API is running! Go to /docs for the API documentation."}

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "Virton AI Fashion Assistant"}

@app.post("/api/v1/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """
    Main endpoint that the Node.js proxy talks to.
    Includes robust error handling to guarantee a clean JSON response.
    """
    try:
        # Convert chat history Pydantic objects to dictionaries for the pipeline
        history_dicts = [{"role": msg.role, "content": msg.content} for msg in request.chat_history]
        
        # Call the Agentic RAG pipeline
        agent_reply = run_agent(request.user_message, request.chat_history)
        
        # Extract product IDs from the agent's text reply using regex
        # This matches "ID: 10", "ID:** 10", "ID: 10", etc.
        product_ids = list(set(re.findall(r"ID:\s*\**(\d+)\**", agent_reply, re.IGNORECASE)))
        recommendations = []
        
        if product_ids:
            try:
                # Fetch the full product details from Supabase for the visual cards
                res = supabase.table("products").select("id, name, price, image").in_("id", product_ids).execute()
                recommendations = res.data
            except Exception as ex:
                print(f"Failed to fetch recommended products: {ex}")
                
        return ChatResponse(
            reply=agent_reply,
            action="recommend",
            recommendations=recommendations
        )
        
    except Exception as e:
        # Log the actual error to your terminal for debugging
        print(f"[ERROR] RAG Pipeline failed: {str(e)}")
        
        # Return a structured error response to the proxy instead of crashing
        raise HTTPException(
            status_code=500, 
            detail="The AI Stylist encountered an internal error while processing your request."
        )

@app.post("/api/v1/embed-product")
async def embed_product_endpoint(req: EmbedRequest):
    """
    Called by the Node.js Admin Panel automatically whenever a new product is uploaded.
    Downloads the image, runs the AI CLIP model, and updates Supabase.
    """
    try:
        print(f"[EMBEDDING] Starting embedding generation for Product {req.product_id}")
        
        # 1. Download image
        response = requests.get(req.image_url)
        response.raise_for_status()
        img = Image.open(BytesIO(response.content)).convert("RGB")
        
        # 2. Get AI Vector Embedding (512 dimensions)
        embedding = get_image_embedding(img)
        
        # 3. Update Supabase
        res = supabase.table("products").update({"embedding": embedding}).eq("id", req.product_id).execute()
        
        print(f"[EMBEDDING] Successfully saved embedding for Product {req.product_id}")
        return {"success": True, "message": "Vector embedding saved!"}
        
    except Exception as e:
        print(f"[ERROR] Embedding Generation failed: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to generate embedding: {str(e)}"
        )
