from typing import Any, Dict, Optional, Literal
from datetime import datetime, timezone
from pydantic import BaseModel, Field

WSEventType = Literal[
    "complaint.ai_completed",
    "complaint.ai_failed",
    "queue.updated",
    "complaint.status_changed",
    "complaint.resolved",
    "connection.established",
    "error"
]

class WebSocketEvent(BaseModel):
    event_type: WSEventType
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    data: Dict[str, Any]
