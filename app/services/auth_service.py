import jwt
import os
from datetime import datetime, timedelta
from typing import Optional

JWT_SECRET = os.getenv("JWT_SECRET", "super-secret-key-change-me")
JWT_ALGORITHM = "HS256"

def generate_interview_token(session_id: str, role: str, expires_delta: Optional[timedelta] = None):
    payload = {
        "sub": session_id,
        "role": role,
        "iat": datetime.utcnow()
    }
    
    if expires_delta:
        payload["exp"] = datetime.utcnow() + expires_delta
    
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_interview_token(token: str):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None
