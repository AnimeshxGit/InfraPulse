import uuid
from datetime import datetime, timezone
from typing import List, Optional, TYPE_CHECKING
from sqlalchemy import String, Float, Integer, DateTime, ForeignKey, Text, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.status_history import StatusHistory

def generate_uuid() -> str:
    return str(uuid.uuid4())

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

class Complaint(Base):
    __tablename__ = "complaints"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    name_snapshot: Mapped[str] = mapped_column(String(255), nullable=False)
    address: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    image_uri: Mapped[str] = mapped_column(String(500), nullable=False)
    
    # AI Inference lifecycle and results
    ai_status: Mapped[str] = mapped_column(String(50), default="PENDING", index=True, nullable=False)  # PENDING, PROCESSING, COMPLETED, FAILED
    detected_defect: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)  # Cracked_Tiles, Peeling, Spalling, Stagnant_Water
    category: Mapped[Optional[str]] = mapped_column(String(100), index=True, nullable=True)  # Structural, Functional, Performance
    confidence: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    
    visible_extent_ratio: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    visible_extent_percentage: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    extent_label: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)  # SMALL, MODERATE, LARGE, VERY LARGE
    extent_score: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    
    severity_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    severity: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)  # LOW, MEDIUM, HIGH
    
    priority_score: Mapped[Optional[float]] = mapped_column(Float, index=True, nullable=True)
    priority_level: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)  # LOW, MEDIUM, HIGH, CRITICAL
    
    classifier_inference_ms: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    pipeline_time_ms: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    
    # Operational workflow status
    status: Mapped[str] = mapped_column(String(50), default="SUBMITTED", index=True, nullable=False)  # SUBMITTED, ASSIGNED, IN_PROGRESS, RESOLVED
    assigned_staff_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("staff.id", ondelete="SET NULL"), nullable=True)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, index=True, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)
    resolved_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    
    # Error tracking if AI fails
    error_code: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="complaints")
    status_history: Mapped[List["StatusHistory"]] = relationship("StatusHistory", back_populates="complaint", cascade="all, delete-orphan", order_by="StatusHistory.changed_at.asc()")

    @property
    def image_url(self) -> str:
        return f"/api/v1/complaints/{self.id}/image"

    __table_args__ = (
        Index(
            "ix_complaints_queue_ordering",
            "category",
            "ai_status",
            "status",
            "priority_score",
            "severity_score",
            "confidence",
            "created_at"
        ),
    )
