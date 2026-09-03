from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    PROJECT_NAME: str = "InfraPulse Backend"
    API_V1_STR: str = "/api/v1"
    
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/infrapulse"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_AI_EVENT_CHANNEL: str = "infrapulse.ai.events.v1"
    REDIS_WS_CHANNEL: str = "infrapulse.ws.events.v1"
    
    # Celery & AI Worker Integration
    CELERY_BROKER_URL: Optional[str] = None  # Falls back to REDIS_URL if None
    CELERY_AI_QUEUE: str = "inference"
    CELERY_TASK_NAME: str = "app.tasks.process_complaint"
    AI_PIPELINE_VERSION: str = "v1"
    
    # JWT Security
    JWT_SECRET: str = "infrapulse-super-secret-production-key-change-in-env-2026"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Storage
    STORAGE_BACKEND: str = "local"  # "local" or "s3"
    STORAGE_ROOT: str = "./uploads"
    MAX_UPLOAD_SIZE_BYTES: int = 10 * 1024 * 1024  # 10 MB
    ALLOWED_IMAGE_MIME_TYPES: List[str] = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/jpg",
    ]
    
    # CORS
    FRONTEND_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "*"
    ]

settings = Settings()
