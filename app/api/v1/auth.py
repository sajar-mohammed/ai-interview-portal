from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse, UserResponse, AuthResponse
from app.core.security import get_password_hash, verify_password, create_access_token, decode_access_token
from app.core.config import get_settings
from app.services import db_service

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
    user = db_service.create_user(request.email, hashed_password)
    

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
    