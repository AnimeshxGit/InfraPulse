from typing import Optional, Union
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.config import settings
from app.core.security import decode_access_token
from app.db.session import get_db
from app.models.user import User
from app.models.staff import Staff

security_scheme = HTTPBearer(auto_error=False)

class AuthenticatedPrincipal:
    def __init__(self, id: str, name: str, email_or_username: str, role: str, category: Optional[str] = None):
        self.id = id
        self.name = name
        self.email_or_username = email_or_username
        self.role = role
        self.category = category

async def get_token_payload(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme)) -> dict:
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    payload = decode_access_token(credentials.credentials)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return payload

async def get_current_user(
    payload: dict = Depends(get_token_payload),
    db: AsyncSession = Depends(get_db)
) -> User:
    role = payload.get("role", "").upper()
    user_id = payload.get("sub")
    if role != "USER" or not user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: User account required",
        )
    
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    return user

async def get_current_staff(
    payload: dict = Depends(get_token_payload),
    db: AsyncSession = Depends(get_db)
) -> Staff:
    role = payload.get("role", "").upper()
    staff_id = payload.get("sub")
    if role != "STAFF" or not staff_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: Staff account required",
        )
    
    result = await db.execute(select(Staff).where(Staff.id == staff_id))
    staff = result.scalar_one_or_none()
    if not staff:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Staff member not found",
        )
    return staff

async def get_current_principal(
    payload: dict = Depends(get_token_payload),
    db: AsyncSession = Depends(get_db)
) -> AuthenticatedPrincipal:
    role = payload.get("role", "").upper()
    principal_id = payload.get("sub")
    if not principal_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )
    
    if role == "STAFF":
        result = await db.execute(select(Staff).where(Staff.id == principal_id))
        staff = result.scalar_one_or_none()
        if not staff:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Staff not found")
        return AuthenticatedPrincipal(
            id=staff.id,
            name=staff.name,
            email_or_username=staff.username,
            role="STAFF",
            category=staff.category
        )
    else:
        result = await db.execute(select(User).where(User.id == principal_id))
        user = result.scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
        return AuthenticatedPrincipal(
            id=user.id,
            name=user.name,
            email_or_username=user.email,
            role="USER"
        )
