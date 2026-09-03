from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class QueueItemResponse(BaseModel):
    rank: int
    id: str
    complaint_id: str
    user_id: str
    name_snapshot: str
    address: str
    description: str
    image_url: str
    detected_defect: Optional[str] = None
    category: str
    confidence: Optional[float] = None
    visible_extent_percentage: Optional[float] = None
    extent_label: Optional[str] = None
    severity_score: Optional[float] = None
    severity: Optional[str] = None
    priority_score: Optional[float] = None
    priority_level: Optional[str] = None
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class QueueListResponse(BaseModel):
    category: str
    total_items: int
    items: List[QueueItemResponse]

class QueuePositionResponse(BaseModel):
    complaint_id: str
    category: Optional[str] = None
    in_queue: bool
    rank: Optional[int] = None
    queue_size: Optional[int] = None
    status: str
    ai_status: str
