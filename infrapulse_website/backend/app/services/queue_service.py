import logging
from typing import List, Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_, desc, asc

from app.models.complaint import Complaint
from app.schemas.queue import QueueItemResponse, QueueListResponse, QueuePositionResponse

logger = logging.getLogger(__name__)

class QueueService:
    def normalize_category(self, category: str) -> str:
        c = category.strip().capitalize()
        if c.lower() == "structural":
            return "Structural"
        if c.lower() == "functional":
            return "Functional"
        if c.lower() == "performance":
            return "Performance"
        return category

    async def get_category_queue(self, db: AsyncSession, category: str) -> QueueListResponse:
        norm_cat = self.normalize_category(category)
        
        query = (
            select(Complaint)
            .where(
                and_(
                    Complaint.category.ilike(norm_cat),
                    Complaint.ai_status == "COMPLETED",
                    Complaint.status != "RESOLVED"
                )
            )
            .order_by(
                desc(Complaint.priority_score),
                desc(Complaint.severity_score),
                desc(Complaint.confidence),
                asc(Complaint.created_at)
            )
        )
        
        result = await db.execute(query)
        complaints = result.scalars().all()
        
        items: List[QueueItemResponse] = []
        for index, comp in enumerate(complaints, start=1):
            items.append(
                QueueItemResponse(
                    rank=index,
                    id=comp.id,
                    complaint_id=comp.id,
                    user_id=comp.user_id,
                    name_snapshot=comp.name_snapshot,
                    address=comp.address,
                    description=comp.description,
                    image_url=f"/api/v1/complaints/{comp.id}/image",
                    detected_defect=comp.detected_defect,
                    category=comp.category or norm_cat,
                    confidence=comp.confidence,
                    visible_extent_percentage=comp.visible_extent_percentage,
                    extent_label=comp.extent_label,
                    severity_score=comp.severity_score,
                    severity=comp.severity,
                    priority_score=comp.priority_score,
                    priority_level=comp.priority_level,
                    status=comp.status,
                    created_at=comp.created_at
                )
            )
            
        return QueueListResponse(
            category=norm_cat,
            total_items=len(items),
            items=items
        )

    async def compute_queue_position(
        self,
        db: AsyncSession,
        complaint: Complaint
    ) -> QueuePositionResponse:
        if complaint.ai_status != "COMPLETED" or complaint.status == "RESOLVED" or not complaint.category:
            return QueuePositionResponse(
                complaint_id=complaint.id,
                category=complaint.category,
                in_queue=False,
                rank=None,
                queue_size=None,
                status=complaint.status,
                ai_status=complaint.ai_status
            )
            
        norm_cat = self.normalize_category(complaint.category)
        
        base_filter = and_(
            Complaint.category.ilike(norm_cat),
            Complaint.ai_status == "COMPLETED",
            Complaint.status != "RESOLVED"
        )
        
        size_query = select(func.count(Complaint.id)).where(base_filter)
        size_result = await db.execute(size_query)
        queue_size = size_result.scalar_one()
        
        p = complaint.priority_score or 0.0
        s = complaint.severity_score or 0.0
        c = complaint.confidence or 0.0
        t = complaint.created_at
        
        ahead_filter = and_(
            base_filter,
            or_(
                Complaint.priority_score > p,
                and_(
                    Complaint.priority_score == p,
                    Complaint.severity_score > s
                ),
                and_(
                    Complaint.priority_score == p,
                    Complaint.severity_score == s,
                    Complaint.confidence > c
                ),
                and_(
                    Complaint.priority_score == p,
                    Complaint.severity_score == s,
                    Complaint.confidence == c,
                    Complaint.created_at < t
                )
            )
        )
        
        rank_query = select(func.count(Complaint.id)).where(ahead_filter)
        rank_result = await db.execute(rank_query)
        ahead_count = rank_result.scalar_one()
        rank = 1 + ahead_count
        
        return QueuePositionResponse(
            complaint_id=complaint.id,
            category=norm_cat,
            in_queue=True,
            rank=rank,
            queue_size=queue_size,
            status=complaint.status,
            ai_status=complaint.ai_status
        )

queue_service = QueueService()
