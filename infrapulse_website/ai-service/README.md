# Private AI Inference Service (Celery)

This is the private backend worker for the InfraPulse AI Inference module. It processes jobs asynchronously using a process-isolated Grad-CAM PyTorch pipeline and publishes results back to a Redis Pub/Sub channel.

## Prerequisites
- Redis running on localhost (or configured via `REDIS_BROKER_URL`).
- `mobilenet_v3_small_best.pth` checkpoint stored locally or mounted.

## Integration Contract (For Agent 2)

### 1. Celery Task Routing
The backend should send tasks to Celery using the following signature:
- **Task Name**: `app.tasks.process_complaint`
- **Queue**: `inference` (Optional, defaults to this based on `celery_app.py` routing)
- **Signature**: Enqueue a JSON-serializable dictionary matching the `InferenceJob` schema.

### 2. Job JSON Schema (`InferenceJob`)
The payload you must pass to the Celery task:
```json
{
  "job_id": "string (UUID)",
  "complaint_id": "string (UUID)",
  "image_uri": "string (Absolute path readable by worker)",
  "submitted_at": "ISO-8601 datetime string",
  "pipeline_version": "v1"
}
```

### 3. Event Pub/Sub Channel
The backend must subscribe to the Redis Pub/Sub channel:
**Channel**: `infrapulse.ai.events.v1`

### 4. Result JSON Schema (`InferenceResult`)
Events published to the channel will match this schema:
```json
{
  "event_type": "ai.inference.completed", 
  "pipeline_version": "v1",
  "job_id": "string",
  "complaint_id": "string",
  "detected_defect": "Cracked_Tiles",
  "category": "Performance",
  "confidence": 0.95,
  "visible_extent_ratio": 0.42,
  "visible_extent_percentage": 42.0,
  "extent_label": "LARGE",
  "extent_score": 70,
  "severity_score": 83.0,
  "severity": "HIGH",
  "priority_score": 84.4,
  "priority_level": "CRITICAL",
  "classifier_inference_ms": 25.4,
  "pipeline_time_ms": 120.3,
  "processed_at": "ISO-8601 datetime string"
}
```
*Note: If `event_type` is `ai.inference.failed`, the inference data will be null and `error_code`/`error_message` will be populated.*

## Running the Worker
For local development:
```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
./scripts/worker.sh
```
