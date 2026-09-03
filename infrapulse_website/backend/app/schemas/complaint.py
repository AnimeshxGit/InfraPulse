from typing import List, Optional, Literal
from datetime import datetime
from pydantic import BaseModel, ConfigDict

ComplaintStatusType = Literal["SUBMITTED", "ASSIGNED", "IN_PROGRESS", "RESOLVED"]
AIStatusType = Literal["PENDING", "PROCESSING", "COMPLETED", "FAILED"]
CategoryType = Literal["Structural", "Functional", "Performance"]
DefectType = Literal["Cracked_Tiles", "Peeling", "Spalling", "Stagnant_Water"]
SeverityType = Literal["LOW", "MEDIUM", "HIGH"]
PriorityLevelType = Literal["LOW", "MEDIUM", "HIGH", "CRITICAL"]

class StatusHistoryResponse(BaseModel):
    id: str
    complaint_id: str
    from_status: str
    to_status: str
    changed_by_id: str
    changed_by_role: str
    changed_at: datetime
    notes: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class StatusUpdateRequest(BaseModel):
    status: ComplaintStatusType
    notes: Optional[str] = None

class ComplaintBase(BaseModel):
    name_snapshot: str
    address: str
    description: str

class ComplaintResponse(BaseModel):
    id: str
    user_id: str
    name_snapshot: str
    address: str
    description: str
    image_url: str
    
    # AI Results
    ai_status: str
    detected_defect: Optional[str] = None
    category: Optional[str] = None
    confidence: Optional[float] = None
    
    visible_extent_ratio: Optional[float] = None
    visible_extent_percentage: Optional[float] = None
    extent_label: Optional[str] = None
    extent_score: Optional[int] = None
    
    severity_score: Optional[float] = None
    severity: Optional[str] = None
    
    priority_score: Optional[float] = None
    priority_level: Optional[str] = None
    
    classifier_inference_ms: Optional[float] = None
    pipeline_time_ms: Optional[float] = None
    
    # Status & Timestamps
    status: str
    assigned_staff_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime] = None
    
    error_code: Optional[str] = None
    error_message: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class ComplaintDetailResponse(ComplaintResponse):
    queue_position: Optional[int] = None
    queue_size: Optional[int] = None
    status_history: List[StatusHistoryResponse] = []
