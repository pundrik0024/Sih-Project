from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class LoginRequest(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    user_id: int
    full_name: str
    email: str
    department_id: Optional[int] = None
    department_name: Optional[str] = None
    employee_id: Optional[int] = None

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    department_id: Optional[int] = None
    department_name: Optional[str] = None
    employee_id: Optional[int] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
