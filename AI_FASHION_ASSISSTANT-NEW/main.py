import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import json
from dotenv import load_dotenv
from core.pipeline.pipeline import run_pipeline

# Load environment variables from .env file
load_dotenv()

# Initialize FastAPI App
app = FastAPI(title="Virton AI Fashion API", version="1.0.0")

# Allow CORS for the Node.js proxy to communicate securely
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to your frontend/proxy domain
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
        
        # Call the RAG pipeline
        result = run_pipeline(request.user_message, history_dicts)
        
        return ChatResponse(
            reply=result.get("assistant_reply") or "I'm having trouble thinking right now.",
            action=result.get("action") or "unknown",
            recommendations=result.get("recommendations") or []
        )
        
    except Exception as e:
        # Log the actual error to your terminal for debugging
        print(f"[ERROR] RAG Pipeline failed: {str(e)}")
        
        # Return a structured error response to the proxy instead of crashing
        raise HTTPException(
            status_code=500, 
            detail="The AI Stylist encountered an internal error while processing your request."
        )
