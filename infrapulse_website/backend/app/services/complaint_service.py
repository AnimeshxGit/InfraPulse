import logging
from typing import List, Optional, Tuple
from datetime import datetime, timezone
from fastapi import UploadFile, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, desc
from sqlalchemy.orm import selectinload

from app.models.complaint import Complaint
from app.models.user import User
from app.models.staff import Staff
from app.models.status_history import StatusHistory
from app.schemas.complaint import ComplaintResponse, ComplaintDetailResponse, StatusHistoryResponse
from app.services.storage_service import storage_service
from app.services.ai_dispatcher import ai_dispatcher
from app.services.queue_service import queue_service

logger = logging.getLogger(__name__)

class ComplaintService:
    def _to_complaint_response(self, c: Complaint) -> ComplaintResponse:
        return ComplaintResponse(
            id=c.id,
            user_id=c.user_id,
            name_snapshot=c.name_snapshot,
            address=c.address,
            description=c.description,
            image_url=f"/api/v1/complaints/{c.id}/image",
            ai_status=c.ai_status,
            detected_defect=c.detected_defect,
            category=c.category,
            confidence=c.confidence,
            visible_extent_ratio=c.visible_extent_ratio,
            visible_extent_percentage=c.visible_extent_percentage,
            extent_label=c.extent_label,
            extent_score=c.extent_score,
            severity_score=c.severity_score,
            severity=c.severity,
            priority_score=c.priority_score,
            priority_level=c.priority_level,
            classifier_inference_ms=c.classifier_inference_ms,
            pipeline_time_ms=c.pipeline_time_ms,
            status=c.status,
            assigned_staff_id=c.assigned_staff_id,
            created_at=c.created_at,
            updated_at=c.updated_at,
            resolved_at=c.resolved_at,
            error_code=c.error_code,
            error_message=c.error_message
        )

    async def create_complaint(
        self,
        db: AsyncSession,
        user: User,
        name: str,
        address: str,
        description: str,
        photo: UploadFile
    ) -> ComplaintResponse:
        if not name or not name.strip():
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Name is required")
        if not address or not address.strip():
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Address is required")
        if not description or not description.strip():
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Description is required")

        storage_key, absolute_path = await storage_service.save_image(photo)

        now = datetime.now(timezone.utc)
        complaint = Complaint(
            user_id=user.id,
            name_snapshot=name.strip(),
            address=address.strip(),
            description=description.strip(),
            image_uri=storage_key,
            ai_status="PENDING",
            status="SUBMITTED",
            created_at=now,
            updated_at=now
        )
        db.add(complaint)
        await db.flush()

        history_entry = StatusHistory(
            complaint_id=complaint.id,
            from_status="NONE",
            to_status="SUBMITTED",
            changed_by_id=user.id,
            changed_by_role="USER",
            changed_at=now,
            notes="Initial complaint registration"
        )
        db.add(history_entry)
        await db.commit()
        await db.refresh(complaint)

        ai_dispatcher.dispatch_inference_job(
            complaint_id=complaint.id,
            image_uri=absolute_path,
            submitted_at=now
        )

        return self._to_complaint_response(complaint)

    async def get_user_complaints(
        self,
        db: AsyncSession,
        user_id: str,
        status_filter: Optional[str] = None,
        ai_status_filter: Optional[str] = None
    ) -> List[ComplaintResponse]:
        query = select(Complaint).where(Complaint.user_id == user_id)
        if status_filter:
            query = query.where(Complaint.status == status_filter.upper())
        if ai_status_filter:
            query = query.where(Complaint.ai_status == ai_status_filter.upper())
            
        query = query.order_by(desc(Complaint.created_at))
        result = await db.execute(query)
        complaints = result.scalars().all()
        return [self._to_complaint_response(c) for c in complaints]

    async def get_user_complaint_detail(
        self,
        db: AsyncSession,
        complaint_id: str,
        user_id: str
    ) -> ComplaintDetailResponse:
        query = (
            select(Complaint)
            .options(selectinload(Complaint.status_history))
            .where(and_(Complaint.id == complaint_id, Complaint.user_id == user_id))
        )
        result = await db.execute(query)
        complaint = result.scalar_one_or_none()
        if not complaint:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Complaint not found"
            )

        pos_resp = await queue_service.compute_queue_position(db, complaint)
        base_resp = self._to_complaint_response(complaint)

        return ComplaintDetailResponse(
            **base_resp.model_dump(),
            queue_position=pos_resp.rank,
            queue_size=pos_resp.queue_size,
            status_history=[StatusHistoryResponse.model_validate(h) for h in complaint.status_history]
        )

    async def get_staff_complaint_detail(
        self,
        db: AsyncSession,
        complaint_id: str,
        staff: Staff
    ) -> ComplaintDetailResponse:
        query = (
            select(Complaint)
            .options(selectinload(Complaint.status_history))
            .where(Complaint.id == complaint_id)
        )
        result = await db.execute(query)
        complaint = result.scalar_one_or_none()
        if not complaint:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Complaint not found"
            )

        staff_cat = staff.category.strip().capitalize()
        complaint_cat = (complaint.category or "").strip().capitalize()
        if complaint_cat and complaint_cat != staff_cat:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Staff category '{staff_cat}' does not match complaint category '{complaint_cat}'"
            )

        pos_resp = await queue_service.compute_queue_position(db, complaint)
        base_resp = self._to_complaint_response(complaint)

        return ComplaintDetailResponse(
            **base_resp.model_dump(),
            queue_position=pos_resp.rank,
            queue_size=pos_resp.queue_size,
            status_history=[StatusHistoryResponse.model_validate(h) for h in complaint.status_history]
        )

    async def get_staff_history(
        self,
        db: AsyncSession,
        category: str
    ) -> List[ComplaintResponse]:
        norm_cat = queue_service.normalize_category(category)
        query = (
            select(Complaint)
            .where(
                and_(
                    Complaint.category.ilike(norm_cat),
                    Complaint.status == "RESOLVED"
                )
            )
            .order_by(desc(Complaint.resolved_at), desc(Complaint.updated_at))
        )
        result = await db.execute(query)
        complaints = result.scalars().all()
        return [self._to_complaint_response(c) for c in complaints]

    async def reprocess_complaint(
        self,
        db: AsyncSession,
        complaint_id: str
    ) -> ComplaintResponse:
        query = select(Complaint).where(Complaint.id == complaint_id)
        result = await db.execute(query)
        complaint = result.scalar_one_or_none()
        if not complaint:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Complaint not found")

        complaint.ai_status = "PENDING"
        complaint.error_code = None
        complaint.error_message = None
        complaint.updated_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(complaint)

        abs_path = storage_service.get_absolute_path(complaint.image_uri)
        ai_dispatcher.dispatch_inference_job(
            complaint_id=complaint.id,
            image_uri=str(abs_path),
            submitted_at=complaint.created_at
        )
        return self._to_complaint_response(complaint)

complaint_service = ComplaintService()
