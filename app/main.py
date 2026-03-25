from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.interviews import router as interviews_router
from app.api.v1.sessions import router as sessions_router

from app.core.supabase import SUPABASE_URL
app = FastAPI(title="AI Interviewer API")
print(f"🚀 Backend starting up... Connecting to Supabase: {SUPABASE_URL}")

# Add CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(interviews_router, prefix="/api/v1/interviews", tags=["interviews"])
app.include_router(sessions_router, prefix="/api/v1/sessions", tags=["sessions"])

@app.get("/")
async def root():
    return {"message": "Welcome to the AI Interviewer API"}
