from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.interviews import router as interviews_router
from app.api.v1.sessions import router as sessions_router
from app.api.v1.auth import router as auth_router

from app.db.session import SUPABASE_URL
# from app.core.security import get_password_hash, verify_password, create_access_token, decode_access_token

# # Test password hashing
# hashed = get_password_hash("test123")
# print(hashed)                               # prints bcrypt hash
# print(verify_password("test123", hashed))   # prints True

# # Test JWT
# token = create_access_token({"sub": "user-123", "role": "recruiter"})
# print(token)                                # prints JWT string
# print(decode_access_token(token))           # prints {'sub': 'user-123', 'role': 'recruiter', 'exp': ...}



from app.core.config import get_settings

settings = get_settings()
# print(settings)
# print(settings.SUPABASE_URL)
# print(settings.SUPABASE_ANON_KEY)
# print(settings.GROQ_API_KEY)
# print(settings.GOOGLE_API_KEY)
# # print(settings.RESEND_API_KEY)
# print(settings.SECRET_KEY)
# print(settings.ALGORITHM)
# print(settings.ACCESS_TOKEN_EXPIRE_MINUTES)

app = FastAPI(title="AI Interviewer API")
print(f"🚀 Backend starting up... Connecting to Supabase: {settings.SUPABASE_URL}")

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
app.include_router(auth_router, prefix="/api/v1/auth", tags=["auth"])

@app.get("/")
async def root():
    return {"message": "Welcome to the AI Interviewer API"}
