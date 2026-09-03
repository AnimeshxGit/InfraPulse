from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_db
from app.models.staff import Staff
from app.models.complaint import Complaint
from app.schemas.staff import StaffPublic
from app.schemas.complaint import ComplaintResponse, ComplaintDetailResponse, StatusUpdateRequest
from app.schemas.queue import QueueListResponse
from app.core.dependencies import get_current_staff
from app.services.queue_service import queue_service
from app.services.complaint_service import complaint_service
from app.services.status_service import status_service

router = APIRouter(prefix="/staff", tags=["Staff Operations"])

@router.get("/me", response_model=StaffPublic)
async def get_staff_me(
    current_staff: Staff = Depends(get_current_staff)
):
    return StaffPublic.model_validate(current_staff)

@router.get("/queue", response_model=QueueListResponse)
async def get_my_category_queue(
    current_staff: Staff = Depends(get_current_staff),
    db: AsyncSession = Depends(get_db)
):
    return await queue_service.get_category_queue(db, category=current_staff.category)

@router.get("/queue/{category}", response_model=QueueListResponse)
async def get_category_queue_by_param(
    category: str,
    current_staff: Staff = Depends(get_current_staff),
    db: AsyncSession = Depends(get_db)
):
    staff_cat = current_staff.category.strip().capitalize()
    req_cat = category.strip().capitalize()
    if staff_cat != req_cat:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Staff assigned to '{staff_cat}' category cannot view '{req_cat}' queue"
        )
    return await queue_service.get_category_queue(db, category=req_cat)

@router.get("/complaints/{complaint_id}", response_model=ComplaintDetailResponse)
async def get_staff_complaint(
    complaint_id: str,
    current_staff: Staff = Depends(get_current_staff),
    db: AsyncSession = Depends(get_db)
):
    return await complaint_service.get_staff_complaint_detail(
        db=db,
        complaint_id=complaint_id,
        staff=current_staff
    )

@router.patch("/complaints/{complaint_id}/status", response_model=ComplaintResponse)
async def update_complaint_status(
    complaint_id: str,
    req: StatusUpdateRequest,
    current_staff: Staff = Depends(get_current_staff),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Complaint).where(Complaint.id == complaint_id))
    complaint = result.scalar_one_or_none()
    if not complaint:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Complaint not found")

    return await status_service.transition_status(
        db=db,
        complaint=complaint,
        new_status=req.status,
        actor_staff=current_staff,
        notes=req.notes
    )

@router.get("/history", response_model=List[ComplaintResponse])
async def get_staff_history(
    current_staff: Staff = Depends(get_current_staff),
    db: AsyncSession = Depends(get_db)
):
    return await complaint_service.get_staff_history(
        db=db,
        category=current_staff.category
    )
