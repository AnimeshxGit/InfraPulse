import os
from typing import List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.db.session import get_db
from app.models.user import User
from app.models.complaint import Complaint
from app.schemas.complaint import ComplaintResponse, ComplaintDetailResponse, StatusHistoryResponse
from app.schemas.queue import QueuePositionResponse
from app.core.dependencies import get_current_user, get_current_principal, AuthenticatedPrincipal
from app.services.complaint_service import complaint_service
from app.services.queue_service import queue_service
from app.services.storage_service import storage_service

router = APIRouter(prefix="/complaints", tags=["Complaints"])

@router.post("", response_model=ComplaintResponse, status_code=status.HTTP_201_CREATED)
async def create_complaint(
    name: str = Form(..., description="Reporter name snapshot"),
    address: str = Form(..., description="Defect location/address"),
    description: str = Form(..., description="Problem description"),
    photo: UploadFile = File(..., description="Defect photograph"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await complaint_service.create_complaint(
        db=db,
        user=current_user,
        name=name,
        address=address,
        description=description,
        photo=photo
    )

@router.get("", response_model=List[ComplaintResponse])
async def list_complaints(
    status: Optional[str] = None,
    ai_status: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await complaint_service.get_user_complaints(
        db=db,
        user_id=current_user.id,
        status_filter=status,
        ai_status_filter=ai_status
    )

@router.get("/{complaint_id}", response_model=ComplaintDetailResponse)
async def get_complaint(
    complaint_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await complaint_service.get_user_complaint_detail(
        db=db,
        complaint_id=complaint_id,
        user_id=current_user.id
    )

@router.get("/{complaint_id}/position", response_model=QueuePositionResponse)
async def get_complaint_position(
    complaint_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Complaint).where(
            Complaint.id == complaint_id,
            Complaint.user_id == current_user.id
        )
    )
    complaint = result.scalar_one_or_none()
    if not complaint:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Complaint not found")
        
    return await queue_service.compute_queue_position(db, complaint)

@router.get("/{complaint_id}/events", response_model=List[StatusHistoryResponse])
async def get_complaint_events(
    complaint_id: str,
    principal: AuthenticatedPrincipal = Depends(get_current_principal),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Complaint)
        .options(selectinload(Complaint.status_history))
        .where(Complaint.id == complaint_id)
    )
    complaint = result.scalar_one_or_none()
    if not complaint:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Complaint not found")

    if principal.role == "USER" and complaint.user_id != principal.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access forbidden")
    if principal.role == "STAFF":
        staff_cat = (principal.category or "").capitalize()
        comp_cat = (complaint.category or "").capitalize()
        if comp_cat and comp_cat != staff_cat:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access forbidden")

    return [StatusHistoryResponse.model_validate(h) for h in complaint.status_history]

@router.get("/{complaint_id}/image")
async def get_complaint_image(
    complaint_id: str,
    principal: AuthenticatedPrincipal = Depends(get_current_principal),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Complaint).where(Complaint.id == complaint_id))
    complaint = result.scalar_one_or_none()
    if not complaint:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Complaint not found")

    if principal.role == "USER" and complaint.user_id != principal.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access forbidden")
    if principal.role == "STAFF":
        staff_cat = (principal.category or "").capitalize()
        comp_cat = (complaint.category or "").capitalize()
        if comp_cat and comp_cat != staff_cat:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access forbidden")

    file_path = storage_service.get_absolute_path(complaint.image_uri)
    if not file_path.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image file not found on server")

    media_type = "image/jpeg"
    if str(file_path).endswith(".png"):
        media_type = "image/png"
    elif str(file_path).endswith(".webp"):
        media_type = "image/webp"

    return FileResponse(file_path, media_type=media_type)

@router.post("/{complaint_id}/reprocess", response_model=ComplaintResponse)
async def reprocess_complaint(
    complaint_id: str,
    principal: AuthenticatedPrincipal = Depends(get_current_principal),
    db: AsyncSession = Depends(get_db)
):
    return await complaint_service.reprocess_complaint(db, complaint_id)
