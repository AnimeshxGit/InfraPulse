from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.db.session import get_db
from app.schemas.health import LiveResponse, ReadyResponse
from app.integrations.redis import get_redis_client

router = APIRouter(tags=["Health & Diagnostics"])

@router.get("/health/live", response_model=LiveResponse)
async def health_live():
    return LiveResponse(status="ok")

@router.get("/health/ready", response_model=ReadyResponse)
async def health_ready(db: AsyncSession = Depends(get_db)):
    db_status = "error"
    redis_status = "error"
    details = {}

    try:
        await db.execute(text("SELECT 1"))
        db_status = "ok"
    except Exception as e:
        db_status = "error"
        details["database_error"] = str(e)

    try:
        redis_client = get_redis_client()
        pong = await redis_client.ping()
        if pong:
            redis_status = "ok"
        else:
            redis_status = "unresponsive"
    except Exception as e:
        redis_status = "error"
        details["redis_error"] = str(e)

    overall_status = "ready" if (db_status == "ok" and redis_status == "ok") else "degraded"

    return ReadyResponse(
        status=overall_status,
        database=db_status,
        redis=redis_status,
        details=details if details else None
    )
