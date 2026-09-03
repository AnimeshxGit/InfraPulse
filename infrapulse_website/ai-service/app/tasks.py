import os
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"
os.environ["OPENBLAS_NUM_THREADS"] = "1"
os.environ["VECLIB_MAXIMUM_THREADS"] = "1"
os.environ["NUMEXPR_NUM_THREADS"] = "1"

import logging
from datetime import datetime, timezone
import torch
torch.set_num_threads(1)

from app.celery_app import celery_app
from app.contracts import InferenceJob, InferenceResult
from app.inference.pipeline import run_inference
from app.events.publisher import publish_result
from app.utils.image import validate_image
from app.inference.model import get_model
from app.config import settings

logger = logging.getLogger(__name__)

# Verify weights path is valid
if not os.path.exists(settings.MODEL_WEIGHTS_PATH):
    raise FileNotFoundError(f"Model checkpoint not found: {settings.MODEL_WEIGHTS_PATH}")

@celery_app.task(name="app.tasks.process_complaint", bind=True, max_retries=3)
def process_complaint(self, job_payload: dict):
    try:
        job = InferenceJob(**job_payload)
    except Exception as e:
        logger.error(f"Invalid job payload: {e}")
        return
        
    try:
        logger.info(f"Processing job {job.job_id} for complaint {job.complaint_id}")
        image = validate_image(job.image_uri)
        result = run_inference(job, image)
        
        publish_result(result)
        logger.info(f"Successfully processed job {job.job_id} for complaint {job.complaint_id} (Defect: {result.detected_defect}, Priority: {result.priority_score:.2f})")
        return result.model_dump()
        
    except Exception as e:
        logger.exception(f"Error processing job {job.job_id}: {str(e)}")
        
        # Publish failure event
        fail_event = InferenceResult(
            event_type="ai.inference.failed",
            pipeline_version=job.pipeline_version,
            job_id=job.job_id,
            complaint_id=job.complaint_id,
            processed_at=datetime.now(timezone.utc),
            error_code="INFERENCE_FAILED",
            error_message=str(e)
        )
        publish_result(fail_event)
        
        # Retry for transient failures but not ValueError (invalid image)
        if not isinstance(e, (ValueError, FileNotFoundError)):
            raise self.retry(exc=e, countdown=10)
