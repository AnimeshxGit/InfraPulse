from typing import Union
from fastapi import APIRouter, Depends, status, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.auth import UserRegisterRequest, UserLoginRequest, StaffLoginRequest, TokenResponse
from app.schemas.user import UserPublic
from app.schemas.staff import StaffPublic
from app.services.auth_service import auth_service
from app.core.dependencies import get_current_principal, AuthenticatedPrincipal

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(
    req: UserRegisterRequest,
    db: AsyncSession = Depends(get_db)
):
    return await auth_service.register_user(db, req)

@router.post("/login", response_model=TokenResponse)
async def login(
    req: UserLoginRequest,
    db: AsyncSession = Depends(get_db)
):
    return await auth_service.authenticate_user(db, req)

@router.post("/staff/login", response_model=TokenResponse)
async def staff_login(
    req: StaffLoginRequest,
    db: AsyncSession = Depends(get_db)
):
    return await auth_service.authenticate_staff(db, req)

@router.get("/me")
async def get_me(
    principal: AuthenticatedPrincipal = Depends(get_current_principal)
):
    return {
        "id": principal.id,
        "name": principal.name,
        "email_or_username": principal.email_or_username,
        "role": principal.role,
        "category": principal.category
    }

@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    principal: AuthenticatedPrincipal = Depends(get_current_principal)
):
    return Response(status_code=status.HTTP_204_NO_CONTENT)
