from fastapi import APIRouter, Depends, HTTPException, status
from app.models.auth import RegisterRequest, LoginRequest, TokenResponse, UserResponse, AuthResponse
from app.core.security import get_password_hash, verify_password, create_access_token, decode_access_token
from app.core.config import get_settings
from app.db import repository as db_service

settings = get_settings()
router = APIRouter()

@router.post("/register", response_model=AuthResponse)
async def register(request: RegisterRequest):
    existing_user = db_service.existing_user(request.email)
    if existing_user.data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already exists",
        )
    
    hashed_password = get_password_hash(request.password)
    try:
        user_res = db_service.create_user(request.email, hashed_password)
        if not user_res.data:
            print(f"DEBUG: Registration failed for {request.email}. Supabase returned: {user_res}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create user in database",
            )
        
        user = user_res.data[0]
        access_token = create_access_token({"user_id": user["id"], "role": user.get("role", "recruiter")})
        
        return AuthResponse(
            access_token=access_token,
            token_type="bearer",
            user=UserResponse(
                id=user["id"],
                email=user["email"],
                role=user.get("role", "recruiter"),
                created_at=user.get("created_at")
            ),
        )
    except Exception as e:
        print(f"ERROR during registration: {e}")
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )

@router.post("/login", response_model=AuthResponse)
async def login(request: LoginRequest):
    existing_user = db_service.existing_user(request.email)
    if not existing_user.data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User not found",
        )
    
    user = existing_user.data[0]
    if not verify_password(request.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid credentials",
        )
    
    access_token = create_access_token({"user_id": user["id"], "role": user["role"]})
    return AuthResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(
            id=user["id"],
            email=user["email"],
            role=user["role"],
        ),
    )
    