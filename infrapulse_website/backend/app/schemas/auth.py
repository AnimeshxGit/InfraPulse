from typing import Optional
from pydantic import BaseModel, EmailStr
from app.schemas.user import UserPublic
from app.schemas.staff import StaffPublic

class UserRegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str

class StaffLoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Optional[UserPublic] = None
    staff: Optional[StaffPublic] = None
