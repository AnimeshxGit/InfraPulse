import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.db.session import engine
from app.db.base import Base
import app.models
from app.api import api_router, health_router
from app.websocket.routes import router as websocket_router
from app.integrations.redis import close_redis
from app.integrations.ai_events import start_ai_event_subscriber
from app.services.storage_service import storage_service

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("infrapulse")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing InfraPulse Backend application...")
    storage_service.storage_root.mkdir(parents=True, exist_ok=True)
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
    subscriber_task = asyncio.create_task(start_ai_event_subscriber())
    logger.info("InfraPulse background AI event subscriber started.")
    
    yield
    
    logger.info("Shutting down InfraPulse Backend application...")
    subscriber_task.cancel()
    try:
        await subscriber_task
    except asyncio.CancelledError:
        pass
        
    await close_redis()
    await engine.dispose()
    logger.info("InfraPulse Backend shutdown complete.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="InfraPulse Production Backend — High-performance FastAPI API, Priority Queue, AI-Dispatcher & WebSocket Server",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.FRONTEND_ORIGINS if "*" not in settings.FRONTEND_ORIGINS else [],
    allow_origin_regex=r"^https?://.*" if "*" in settings.FRONTEND_ORIGINS else None,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.exception(f"Unhandled server exception on {request.method} {request.url.path}: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error"}
    )

app.include_router(health_router)
app.include_router(api_router, prefix=settings.API_V1_STR)
app.include_router(websocket_router)

@app.get("/")
async def root():
    return {
        "name": settings.PROJECT_NAME,
        "status": "online",
        "docs": "/docs",
        "health": "/health/ready",
        "version": "1.0.0"
    }
