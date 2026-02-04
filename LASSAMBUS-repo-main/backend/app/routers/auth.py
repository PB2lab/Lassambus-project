"""Authentication routes"""
from fastapi import APIRouter, HTTPException, Depends, Request
from typing import Optional
from datetime import datetime
import logging

from app.models.user import User, UserCreate, LoginRequest, LoginResponse
from app.utils.jwt import verify_token_optional, create_access_token
from app.utils.password import hash_password, verify_password
from app.utils.rate_limit import limiter
from app.database import db

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["authentication"])

@router.post("/register", response_model=User)
@limiter.limit("5/minute")  # 5 registrations per minute per IP
async def register(request: Request, user_data: UserCreate, payload: Optional[dict] = Depends(verify_token_optional)):
    """
    Register a new user.
    - Personnel accounts can be created by anyone
    - Admin accounts can only be created by existing admins
    """
    # Check if trying to create admin account
    if user_data.role == "admin":
        if not payload:
            raise HTTPException(
                status_code=403,
                detail="Admin accounts can only be created by existing administrators"
            )
        
        # Verify the requester is an admin
        requester = await db.users.find_one({"id": payload["sub"]}, {"_id": 0})
        if not requester or requester.get("role") != "admin":
            raise HTTPException(
                status_code=403,
                detail="Only administrators can create admin accounts"
            )
    
    # Check if email already exists
    existing = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password
    hashed_password = hash_password(user_data.password)
    
    # Create user object
    user_obj = User(
        email=user_data.email,
        full_name=user_data.full_name,
        role=user_data.role
    )
    
    # Prepare document for database
    doc = user_obj.model_dump()
    doc['password'] = hashed_password
    doc['created_at'] = doc['created_at'].isoformat()
    
    # Insert into database
    await db.users.insert_one(doc)
    
    logger.info(f"New {user_data.role} account created: {user_data.email}")
    return user_obj

@router.post("/login", response_model=LoginResponse)
@limiter.limit("10/minute")  # 10 login attempts per minute per IP
async def login(request: Request, login_data: LoginRequest):
    user_doc = await db.users.find_one({"email": login_data.email}, {"_id": 0})
    if not user_doc or not verify_password(login_data.password, user_doc['password']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if isinstance(user_doc['created_at'], str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    
    user_obj = User(**{k: v for k, v in user_doc.items() if k != 'password'})
    
    token = create_access_token({
        "sub": user_obj.id,
        "email": user_obj.email,
        "role": user_obj.role
    })
    
    return LoginResponse(token=token, user=user_obj)
