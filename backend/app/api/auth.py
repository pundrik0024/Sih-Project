from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.database.models import User
from app.core.security import verify_password, create_access_token
from app.auth.dependencies import get_current_user
from app.schemas.auth import LoginRequest, Token, UserResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=Token)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email.lower().strip()).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive. Contact Security Administrator."
        )
        
    access_token = create_access_token(
        subject=user.id,
        role=user.role.value,
        department_id=user.department_id
    )
    
    dept_name = user.department.name if user.department else None
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        role=user.role.value,
        user_id=user.id,
        full_name=user.full_name,
        email=user.email,
        department_id=user.department_id,
        department_name=dept_name,
        employee_id=user.employee_id
    )

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        role=current_user.role.value,
        department_id=current_user.department_id,
        department_name=current_user.department.name if current_user.department else None,
        employee_id=current_user.employee_id,
        is_active=current_user.is_active,
        created_at=current_user.created_at
    )
