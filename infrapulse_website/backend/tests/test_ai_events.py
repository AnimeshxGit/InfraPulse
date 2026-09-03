import json
import pytest
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.complaint import Complaint
from app.models.user import User
from app.integrations.ai_events import process_ai_event

@pytest.mark.asyncio
async def test_ai_completion_and_failure_ingestion(
    db_session: AsyncSession,
    registered_user: User
):
    complaint = Complaint(
        user_id=registered_user.id,
        name_snapshot="John Doe",
        address="123 Highway St",
        description="Pothole visible",
        image_uri="uploads/sample.jpg",
        ai_status="PENDING",
        status="SUBMITTED"
    )
    db_session.add(complaint)
    await db_session.commit()
    await db_session.refresh(complaint)
    complaint_id = complaint.id

    completion_payload = {
        "event_type": "ai.inference.completed",
        "pipeline_version": "v1",
        "job_id": "test-job-uuid-1",
        "complaint_id": complaint_id,
        "detected_defect": "Spalling",
        "category": "Structural",
        "confidence": 0.942,
        "visible_extent_ratio": 0.38,
        "visible_extent_percentage": 38.0,
        "extent_label": "MODERATE",
        "extent_score": 45,
        "severity_score": 75.5,
        "severity": "HIGH",
        "priority_score": 82.3,
        "priority_level": "HIGH",
        "classifier_inference_ms": 42.1,
        "pipeline_time_ms": 115.0,
        "processed_at": datetime.now(timezone.utc).isoformat()
    }

    await process_ai_event(json.dumps(completion_payload), db=db_session)

    await db_session.refresh(complaint)
    assert complaint.ai_status == "COMPLETED"
    assert complaint.detected_defect == "Spalling"
    assert complaint.category == "Structural"
    assert complaint.confidence == 0.942
    assert complaint.extent_label == "MODERATE"
    assert complaint.severity == "HIGH"
    assert complaint.priority_score == 82.3
    assert complaint.priority_level == "HIGH"

    comp2 = Complaint(
        user_id=registered_user.id,
        name_snapshot="John Doe 2",
        address="456 Oak St",
        description="Blurry image",
        image_uri="uploads/sample2.jpg",
        ai_status="PENDING",
        status="SUBMITTED"
    )
    db_session.add(comp2)
    await db_session.commit()
    await db_session.refresh(comp2)
    comp2_id = comp2.id

    fail_payload = {
        "event_type": "ai.inference.failed",
        "pipeline_version": "v1",
        "job_id": "test-job-uuid-2",
        "complaint_id": comp2_id,
        "processed_at": datetime.now(timezone.utc).isoformat(),
        "error_code": "IMAGE_CORRUPT",
        "error_message": "Cannot decode image bytes"
    }

    await process_ai_event(json.dumps(fail_payload), db=db_session)

    await db_session.refresh(comp2)
    assert comp2.ai_status == "FAILED"
    assert comp2.error_code == "IMAGE_CORRUPT"
    assert comp2.error_message == "Cannot decode image bytes"
