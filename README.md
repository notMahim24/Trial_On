# Virton: AI Fashion Assistant & E-Commerce Store

This repository is a monorepo containing the **Web Frontend (React/Vite/Express)** and the **AI Fashion Assistant Backend (FastAPI)**. Follow the steps below to set up and run the project from a fresh computer.

---

## 📋 Prerequisites

Before starting, ensure you have the following installed on your machine:
* **Node.js** (v18 or higher recommended)
* **Python** (v3.10 or higher recommended)
* **Git**

---

## 🛠️ Step-by-Step Setup

### 1. Clone the Repository
Clone the repository to your local machine:
```bash
git clone https://github.com/notMahim24/Trial_On.git
cd Trial_On
```

---

### 2. Configure Environment Variables (`.env`)

You need to create two separate `.env` files (which are gitignored to keep credentials secure):

#### A. Frontend Configuration
Create a file named `.env` in `Trial_On/Trial_On/.env` and add your Supabase credentials:
```env
# Path: Trial_On/Trial_On/.env
VITE_SUPABASE_URL="https://your-project-url.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-api-key"
```

#### B. AI Assistant Configuration
Create a file named `.env` in `AI_FASHION_ASSISSTANT-NEW/.env` and add your Mistral API key:
```env
# Path: AI_FASHION_ASSISSTANT-NEW/.env
MISTRAL_API_KEY="your-mistral-api-key"
```

---

### 3. Install Dependencies

#### A. Node.js (Frontend & Monorepo Tools)
Run these commands from the root directory:
```bash
# Install monorepo tools in the root
npm install

# Install Web Frontend dependencies
npm run install:all
```

#### B. Python (AI Assistant Backend)
Create a virtual environment and install the required machine learning packages:
```bash
# Navigate to the AI directory
cd AI_FASHION_ASSISSTANT-NEW

# Create virtual environment
python -m venv .venv

# Activate and install dependencies (Windows)
.venv\Scripts\pip install -r requirements.txt

# Or on macOS/Linux:
# source .venv/bin/activate
# pip install -r requirements.txt

# Return to root
cd ..
```

---

## 🚀 Running the Project

You can start both the Web Frontend and the AI Backend concurrently, or run them separately from the root directory:

### Option A: Start Both Services (Recommended)
```bash
npm run start
```
* The **Web Frontend** will be available at `http://localhost:3000`
* The **AI Assistant** will be available at `http://localhost:8000` (FastAPI Proxy handles requests automatically)

### Option B: Start Separately
* **Web Frontend Only**:
  ```bash
  npm run start:web
  ```
* **AI Backend Only**:
  ```bash
  npm run start:ai
  ```
