from fastapi import APIRouter
from app.api.auth import router as auth_router
from app.api.complaints import router as complaints_router
from app.api.staff import router as staff_router
from app.api.health import router as health_router
from app.api.stats import router as stats_router

api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(complaints_router)
api_router.include_router(staff_router)
api_router.include_router(stats_router)

__all__ = ["api_router", "health_router"]
