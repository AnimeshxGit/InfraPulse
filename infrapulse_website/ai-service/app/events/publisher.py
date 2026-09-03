import json
import redis
from app.config import settings
from app.contracts import InferenceResult

redis_client = redis.from_url(settings.REDIS_EVENT_URL)

EVENT_CHANNEL = "infrapulse.ai.events.v1"

def publish_result(event: InferenceResult):
    """Publishes completion or failure event to Redis Pub/Sub."""
    payload = event.model_dump_json()
    redis_client.publish(EVENT_CHANNEL, payload)
