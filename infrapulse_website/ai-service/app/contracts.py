from typing import Optional, Literal
from pydantic import BaseModel, Field
from datetime import datetime

class InferenceJob(BaseModel):
    job_id: str
    complaint_id: str
    image_uri: str
    submitted_at: datetime
    pipeline_version: str

class InferenceResult(BaseModel):
    event_type: Literal["ai.inference.completed", "ai.inference.failed"]
    pipeline_version: str
    job_id: str
    complaint_id: str
    
    # Inference Data (optional for failures)
    detected_defect: Optional[Literal["Cracked_Tiles", "Peeling", "Spalling", "Stagnant_Water"]] = None
    category: Optional[Literal["Performance", "Structural", "Functional"]] = None
    confidence: Optional[float] = None
    
    visible_extent_ratio: Optional[float] = None
    visible_extent_percentage: Optional[float] = None
    extent_label: Optional[Literal["SMALL", "MODERATE", "LARGE", "VERY LARGE"]] = None
    extent_score: Optional[int] = None
    
    severity_score: Optional[float] = None
    severity: Optional[Literal["LOW", "MEDIUM", "HIGH"]] = None
    
    priority_score: Optional[float] = None
    priority_level: Optional[Literal["LOW", "MEDIUM", "HIGH", "CRITICAL"]] = None
    
    classifier_inference_ms: Optional[float] = None
    pipeline_time_ms: Optional[float] = None
    processed_at: datetime
    
    # Error fields (optional)
    error_code: Optional[str] = None
    error_message: Optional[str] = None
