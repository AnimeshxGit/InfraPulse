from typing import List, Optional
from pydantic import BaseModel

class CategoryStats(BaseModel):
    category: str
    total: int
    submitted: int
    assigned: int
    in_progress: int
    resolved: int
    avg_priority_score: Optional[float] = None

class SystemStatsResponse(BaseModel):
    total_complaints: int
    categories: List[CategoryStats]
