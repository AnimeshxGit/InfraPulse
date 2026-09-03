from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class StaffBase(BaseModel):
    name: str
    username: str
    email: Optional[str] = None
    category: str

class StaffCreate(StaffBase):
    password: str

class StaffPublic(StaffBase):
    id: str
    role: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
