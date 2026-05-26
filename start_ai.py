#!/usr/bin/env python3
"""
Startup script: activates the venv and launches Uvicorn.
Run from the Virton root: python start_ai.py
"""
import os
import subprocess
import sys

AI_DIR = os.path.join(os.path.dirname(__file__), "AI_FASHION_ASSISSTANT-NEW")
VENV_PYTHON = os.path.join(AI_DIR, ".venv", "Scripts", "python.exe")

if not os.path.exists(VENV_PYTHON):
    print(f"ERROR: Virtual environment not found at {VENV_PYTHON}")
    print("Please run: cd AI_FASHION_ASSISSTANT-NEW && python -m venv .venv && .venv\\Scripts\\pip install -r requirements.txt")
    sys.exit(1)

print(f"[AI] Starting Uvicorn with {VENV_PYTHON}")
subprocess.run(
    [VENV_PYTHON, "-m", "uvicorn", "main:app", "--reload", "--host", "127.0.0.1", "--port", "8000"],
    cwd=AI_DIR
)
