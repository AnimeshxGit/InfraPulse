from celery import Celery
from kombu import Queue
from app.config import settings

celery_app = Celery(
    "ai_service",
    broker=settings.REDIS_BROKER_URL,
    backend=settings.REDIS_BROKER_URL,
    include=["app.tasks"]
)

celery_app.conf.update(
    task_default_queue="inference",
    task_queues=(
        Queue("inference", routing_key="inference"),
        Queue("celery", routing_key="celery"),
    ),
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_routes={
        "app.tasks.process_complaint": {"queue": "inference"}
    }
)
