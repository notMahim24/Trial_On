from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from core.pipeline.pipeline import run_pipeline

router = APIRouter()

class ChatRequest(BaseModel):
    user_message: str
    chat_history: list = []

class ChatResponse(BaseModel):
    reply: str
    action: str
    recommendations: list

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        result = run_pipeline(request.user_message, request.chat_history)
        return ChatResponse(
            reply=result.get("assistant_reply", ""),
            action=result.get("action", ""),
            recommendations=result.get("recommendations", [])
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
