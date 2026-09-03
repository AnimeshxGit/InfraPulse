from datetime import datetime
from pydantic import BaseModel, EmailStr, ConfigDict

class UserBase(BaseModel):
    name: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserPublic(UserBase):
    id: str
    role: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
