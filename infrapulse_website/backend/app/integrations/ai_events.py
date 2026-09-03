import json
import logging
import asyncio
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.config import settings
from app.integrations.redis import get_redis_client
from app.db.session import get_db_context
from app.models.complaint import Complaint
from app.websocket.manager import ws_manager

logger = logging.getLogger(__name__)

async def _handle_ai_event_db(data: dict, db: AsyncSession):
    event_type = data.get("event_type")
    complaint_id = data.get("complaint_id")
    
    if not complaint_id:
        logger.warning(f"AI event missing complaint_id: {data}")
        return

    result = await db.execute(select(Complaint).where(Complaint.id == str(complaint_id)))
    complaint = result.scalar_one_or_none()
    
    if not complaint:
        logger.error(f"Complaint {complaint_id} not found for AI event {event_type}")
        return
        
    if event_type == "ai.inference.completed":
        complaint.detected_defect = data.get("detected_defect")
        complaint.category = data.get("category")
        complaint.confidence = data.get("confidence")
        
        complaint.visible_extent_ratio = data.get("visible_extent_ratio")
        complaint.visible_extent_percentage = data.get("visible_extent_percentage")
        complaint.extent_label = data.get("extent_label")
        complaint.extent_score = data.get("extent_score")
        
        complaint.severity_score = data.get("severity_score")
        complaint.severity = data.get("severity")
        
        complaint.priority_score = data.get("priority_score")
        complaint.priority_level = data.get("priority_level")
        
        complaint.classifier_inference_ms = data.get("classifier_inference_ms")
        complaint.pipeline_time_ms = data.get("pipeline_time_ms")
        
        complaint.ai_status = "COMPLETED"
        complaint.updated_at = datetime.now(timezone.utc)
        
        await db.commit()
        await db.refresh(complaint)
        logger.info(f"AI completed for complaint {complaint_id}: defect={complaint.detected_defect}, category={complaint.category}, priority={complaint.priority_score}")
        
        # Emit WebSocket events
        await ws_manager.publish_event(
            event_type="complaint.ai_completed",
            data={
                "complaint_id": complaint.id,
                "category": complaint.category,
                "detected_defect": complaint.detected_defect,
                "priority_score": complaint.priority_score,
                "severity_score": complaint.severity_score,
                "ai_status": "COMPLETED",
                "status": complaint.status
            },
            target_user_id=complaint.user_id,
            target_category=complaint.category
        )
        
        await ws_manager.publish_event(
            event_type="queue.updated",
            data={
                "category": complaint.category,
                "reason": "complaint_analyzed",
                "changed_complaint_id": complaint.id
            },
            target_category=complaint.category
        )
        
    elif event_type == "ai.inference.failed":
        complaint.ai_status = "FAILED"
        complaint.error_code = data.get("error_code", "INFERENCE_FAILED")
        complaint.error_message = data.get("error_message", "Unknown error during AI inference")
        complaint.updated_at = datetime.now(timezone.utc)
        
        await db.commit()
        logger.warning(f"AI inference failed for complaint {complaint_id}: {complaint.error_message}")
        
        await ws_manager.publish_event(
            event_type="complaint.ai_failed",
            data={
                "complaint_id": complaint.id,
                "ai_status": "FAILED",
                "error_code": complaint.error_code,
                "error_message": complaint.error_message
            },
            target_user_id=complaint.user_id
        )

async def process_ai_event(payload_str: str, db: Optional[AsyncSession] = None):
    try:
        data = json.loads(payload_str)
        if db is not None:
            await _handle_ai_event_db(data, db)
        else:
            async with get_db_context() as session:
                await _handle_ai_event_db(data, session)
    except Exception as e:
        logger.exception(f"Error processing AI event message: {e}")

async def start_ai_event_subscriber():
    """
    Background subscriber task for AI events from Redis Pub/Sub.
    Auto-reconnects on failure.
    """
    while True:
        try:
            redis_client = get_redis_client()
            pubsub = redis_client.pubsub()
            await pubsub.subscribe(settings.REDIS_AI_EVENT_CHANNEL, settings.REDIS_WS_CHANNEL)
            logger.info(f"Subscribed to Redis channels: {settings.REDIS_AI_EVENT_CHANNEL}, {settings.REDIS_WS_CHANNEL}")
            
            async for message in pubsub.listen():
                if message["type"] == "message":
                    channel = message["channel"]
                    payload_data = message["data"]
                    
                    channel_str = channel.decode("utf-8") if isinstance(channel, bytes) else str(channel)
                    payload_str = payload_data.decode("utf-8") if isinstance(payload_data, bytes) else str(payload_data)
                    
                    if channel_str == settings.REDIS_AI_EVENT_CHANNEL:
                        await process_ai_event(payload_str)
                    elif channel_str == settings.REDIS_WS_CHANNEL:
                        try:
                            ws_msg = json.loads(payload_str)
                            event_dict = ws_msg.get("event")
                            target_user_id = ws_msg.get("target_user_id")
                            target_category = ws_msg.get("target_category")
                            
                            from app.schemas.websocket import WebSocketEvent
                            event = WebSocketEvent(**event_dict)
                            
                            if target_user_id:
                                await ws_manager.send_to_user_local(target_user_id, event)
                            if target_category:
                                await ws_manager.send_to_category_local(target_category, event)
                            if not target_user_id and not target_category:
                                await ws_manager.broadcast_local(event)
                        except Exception as ex:
                            logger.debug(f"Error handling WS message from redis channel: {ex}")
                            
        except asyncio.CancelledError:
            logger.info("AI event subscriber cancelled.")
            break
        except Exception as e:
            logger.warning(f"Redis Pub/Sub connection error in background listener: {e}. Retrying in 5 seconds...")
            await asyncio.sleep(5)
