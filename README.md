# 🎤 AI Interviewer: Professional Technical Portal

![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![Groq](https://img.shields.io/badge/Llama_3.3-70B-orange?style=for-the-badge)
![Gemini](https://img.shields.io/badge/Gemini_1.5_Flash-blue?style=for-the-badge)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)

> **The next generation of technical assessment.** A fully hands-free, voice-first AI interviewer that extracts skills from Job Descriptions and assesses candidates with a strict, professional persona.

---

## ✨ Key Features

### 🎙️ Hands-Free Voice Interview
Powered by the **Web Speech API**, the platform features an automated "Auto-Listen/Auto-Speak" flow. The AI asks a question, waits for the candidate to speak, and transitions seamlessly to the next challenge.

### ⏳ Smart Inactivity Timer
Never let an interview stall. If no response is detected within **60 seconds**, the AI intelligently checks in or moves to the next technical topic.

### 📊 Real-Time Skill Coverage
Visible feedback for the candidate. The sidebar features a dynamic **Progress Bar** that updates instantly as topics are covered, calculated by our LLM backend.

### 🤖 Expert LLM Orchestration
- **Groq (Llama 3.3 70B)**: Fast, low-latency orchestration for chat loops and skill extraction.
- **Google Gemini 1.5 Flash**: High-accuracy technical evaluation and final report generation.

---

## 🛠️ Architecture

```mermaid
graph TD
    A[Next.js Frontend] -->|REST API| B[FastAPI Backend]
    B -->|Skill Extraction| C[Groq Engine]
    B -->|Evaluation| D[Gemini API]
    B -->|State Management| E[Supabase DB]
    A -->|STT/TTS| F[Web Speech API]
```

---

## 🚀 Quick Start

### 1. Prerequisites
- Python 3.10+
- Node.js 18+
- [Groq API Key](https://console.groq.com)
- [Google AI Key](https://aistudio.google.com)
- [Supabase Project](https://supabase.com)

### 2. Backend Setup
```bash
# Clone the repository
git clone https://github.com/sajar-mohammed/ai-interview-portal.git
cd ai-interview-portal

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your keys

# Start server
python3 -m uvicorn main:app --reload
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 🔐 Environment Variables

| Variable | Description |
|---|---|
| `GROQ_API_KEY` | For Llama 3.3 Orchestration |
| `GOOGLE_API_KEY` | For Gemini 1.5 Evaluation |
| `SUPABASE_URL` | Your Supabase Project URL |
| `SUPABASE_ANON_KEY` | Your Supabase Public Key |

---

## 📄 License
MIT License - Developed by **Sajar Mohammed**.
