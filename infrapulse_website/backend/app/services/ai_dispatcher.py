import uuid
import logging
from datetime import datetime, timezone
from typing import Optional
from app.core.config import settings
from app.integrations.celery import celery_client

logger = logging.getLogger(__name__)

class AIDispatcher:
    def dispatch_inference_job(
        self,
        complaint_id: str,
        image_uri: str,
        submitted_at: Optional[datetime] = None,
        job_id: Optional[str] = None
    ) -> str:
        if not job_id:
            job_id = str(uuid.uuid4())
        if not submitted_at:
            submitted_at = datetime.now(timezone.utc)
            
        payload = {
            "job_id": job_id,
            "complaint_id": str(complaint_id),
            "image_uri": str(image_uri),
            "submitted_at": submitted_at.isoformat(),
            "pipeline_version": settings.AI_PIPELINE_VERSION
        }
        
        try:
            celery_client.send_task(
                settings.CELERY_TASK_NAME,
                args=[payload],
                queue=settings.CELERY_AI_QUEUE,
                task_id=job_id
            )
            logger.info(f"Dispatched AI inference job {job_id} for complaint {complaint_id}")
        except Exception as e:
            logger.exception(f"Failed to dispatch Celery AI inference job {job_id}: {e}")
            
        return job_id

ai_dispatcher = AIDispatcher()
