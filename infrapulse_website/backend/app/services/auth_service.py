from typing import Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from fastapi import HTTPException, status

from app.models.user import User
from app.models.staff import Staff
from app.schemas.auth import UserRegisterRequest, UserLoginRequest, StaffLoginRequest, TokenResponse
from app.schemas.user import UserPublic
from app.schemas.staff import StaffPublic, StaffCreate
from app.core.security import get_password_hash, verify_password, create_access_token

class AuthService:
    async def register_user(self, db: AsyncSession, req: UserRegisterRequest) -> TokenResponse:
        result = await db.execute(select(User).where(User.email == req.email.lower()))
        existing = result.scalar_one_or_none()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists"
            )

        hashed = get_password_hash(req.password)
        user = User(
            name=req.name.strip(),
            email=req.email.lower().strip(),
            password_hash=hashed,
            role="USER"
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

        token = create_access_token(
            subject=user.id,
            role="USER",
            extra_claims={"email": user.email, "name": user.name}
        )

        return TokenResponse(
            access_token=token,
            token_type="bearer",
            user=UserPublic.model_validate(user)
        )

    async def authenticate_user(self, db: AsyncSession, req: UserLoginRequest) -> TokenResponse:
        result = await db.execute(select(User).where(User.email == req.email.lower().strip()))
        user = result.scalar_one_or_none()
        if not user or not verify_password(req.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        token = create_access_token(
            subject=user.id,
            role="USER",
            extra_claims={"email": user.email, "name": user.name}
        )

        return TokenResponse(
            access_token=token,
            token_type="bearer",
            user=UserPublic.model_validate(user)
        )

    async def authenticate_staff(self, db: AsyncSession, req: StaffLoginRequest) -> TokenResponse:
        login_id = req.username.strip()
        result = await db.execute(
            select(Staff).where(
                or_(Staff.username == login_id, Staff.email == login_id.lower())
            )
        )
        staff = result.scalar_one_or_none()
        if not staff or not verify_password(req.password, staff.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid staff credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

        token = create_access_token(
            subject=staff.id,
            role="STAFF",
            extra_claims={
                "username": staff.username,
                "category": staff.category,
                "name": staff.name
            }
        )

        return TokenResponse(
            access_token=token,
            token_type="bearer",
            staff=StaffPublic.model_validate(staff)
        )

    async def create_staff(self, db: AsyncSession, staff_create: StaffCreate) -> Staff:
        result = await db.execute(select(Staff).where(Staff.username == staff_create.username))
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Staff with this username already exists"
            )

        staff = Staff(
            name=staff_create.name.strip(),
            username=staff_create.username.strip(),
            email=staff_create.email.lower().strip() if staff_create.email else None,
            password_hash=get_password_hash(staff_create.password),
            role="STAFF",
            category=staff_create.category.strip().capitalize()
        )
        db.add(staff)
        await db.commit()
        await db.refresh(staff)
        return staff

auth_service = AuthService()
