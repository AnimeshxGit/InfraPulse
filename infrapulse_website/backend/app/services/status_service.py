import logging
from datetime import datetime, timezone
from typing import Optional, Dict, Set
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.models.complaint import Complaint
from app.models.status_history import StatusHistory
from app.models.staff import Staff
from app.websocket.manager import ws_manager

logger = logging.getLogger(__name__)

ALLOWED_TRANSITIONS: Dict[str, Set[str]] = {
    "SUBMITTED": {"ASSIGNED"},
    "ASSIGNED": {"IN_PROGRESS"},
    "IN_PROGRESS": {"RESOLVED"},
    "RESOLVED": set(),
}

class StatusService:
    async def transition_status(
        self,
        db: AsyncSession,
        complaint: Complaint,
        new_status: str,
        actor_staff: Staff,
        notes: Optional[str] = None
    ) -> Complaint:
        current_status = complaint.status.upper()
        target_status = new_status.upper()

        complaint_category = (complaint.category or "").strip().capitalize()
        staff_category = (actor_staff.category or "").strip().capitalize()
        if complaint_category != staff_category:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Staff category '{staff_category}' does not match complaint category '{complaint_category}'"
            )

        valid_next_states = ALLOWED_TRANSITIONS.get(current_status, set())
        if target_status not in valid_next_states:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status transition from '{current_status}' to '{target_status}'. Allowed transitions: {list(valid_next_states)}"
            )

        old_status = complaint.status
        complaint.status = target_status
        complaint.updated_at = datetime.now(timezone.utc)
        
        if target_status == "ASSIGNED":
            complaint.assigned_staff_id = actor_staff.id
        elif target_status == "RESOLVED":
            complaint.resolved_at = datetime.now(timezone.utc)

        history_entry = StatusHistory(
            complaint_id=complaint.id,
            from_status=old_status,
            to_status=target_status,
            changed_by_id=actor_staff.id,
            changed_by_role="STAFF",
            changed_at=datetime.now(timezone.utc),
            notes=notes
        )
        db.add(history_entry)
        
        await db.commit()
        await db.refresh(complaint)

        if target_status == "RESOLVED":
            await ws_manager.publish_event(
                event_type="complaint.resolved",
                data={
                    "complaint_id": complaint.id,
                    "category": complaint.category,
                    "status": "RESOLVED",
                    "resolved_at": complaint.resolved_at.isoformat() if complaint.resolved_at else None
                },
                target_user_id=complaint.user_id,
                target_category=complaint.category
            )
        else:
            await ws_manager.publish_event(
                event_type="complaint.status_changed",
                data={
                    "complaint_id": complaint.id,
                    "old_status": old_status,
                    "new_status": target_status,
                    "category": complaint.category
                },
                target_user_id=complaint.user_id,
                target_category=complaint.category
            )

        await ws_manager.publish_event(
            event_type="queue.updated",
            data={
                "category": complaint.category,
                "reason": f"status_changed_to_{target_status.lower()}",
                "changed_complaint_id": complaint.id
            },
            target_category=complaint.category
        )

        return complaint

status_service = StatusService()
