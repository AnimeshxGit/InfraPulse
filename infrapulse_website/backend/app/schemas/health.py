from typing import Optional, Dict
from pydantic import BaseModel

class LiveResponse(BaseModel):
    status: str = "ok"

class ReadyResponse(BaseModel):
    status: str
    database: str
    redis: str
    details: Optional[Dict[str, str]] = None
