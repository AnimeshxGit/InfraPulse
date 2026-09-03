import logging
from celery import Celery
from app.core.config import settings

logger = logging.getLogger(__name__)

broker_url = settings.CELERY_BROKER_URL or settings.REDIS_URL

celery_client = Celery(
    "infrapulse_backend_client",
    broker=broker_url,
    backend=broker_url,
)

celery_client.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_routes={
        settings.CELERY_TASK_NAME: {"queue": settings.CELERY_AI_QUEUE}
    }
)
