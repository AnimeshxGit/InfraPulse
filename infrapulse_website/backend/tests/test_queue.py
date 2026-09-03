import pytest
from datetime import datetime, timezone, timedelta
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.complaint import Complaint
from app.models.user import User

@pytest.mark.asyncio
async def test_queue_multi_criteria_sorting_and_position(
    client: AsyncClient,
    db_session: AsyncSession,
    registered_user: User,
    staff_structural_headers: dict,
    user_auth_headers: dict
):
    base_time = datetime.now(timezone.utc)

    c1 = Complaint(
        user_id=registered_user.id,
        name_snapshot="User 1",
        address="Site 1",
        description="Pothole high",
        image_uri="p1.jpg",
        ai_status="COMPLETED",
        category="Structural",
        priority_score=90.0,
        severity_score=80.0,
        confidence=0.90,
        created_at=base_time + timedelta(minutes=1),
        status="SUBMITTED"
    )
    c2 = Complaint(
        user_id=registered_user.id,
        name_snapshot="User 2",
        address="Site 2",
        description="Crack medium",
        image_uri="p2.jpg",
        ai_status="COMPLETED",
        category="Structural",
        priority_score=80.0,
        severity_score=85.0,
        confidence=0.85,
        created_at=base_time + timedelta(minutes=2),
        status="SUBMITTED"
    )
    c3 = Complaint(
        user_id=registered_user.id,
        name_snapshot="User 3",
        address="Site 3",
        description="Crack tie-break",
        image_uri="p3.jpg",
        ai_status="COMPLETED",
        category="Structural",
        priority_score=80.0,
        severity_score=80.0,
        confidence=0.95,
        created_at=base_time + timedelta(minutes=3),
        status="SUBMITTED"
    )
    c4 = Complaint(
        user_id=registered_user.id,
        name_snapshot="User 4",
        address="Site 4",
        description="Crack tie-break earlier",
        image_uri="p4.jpg",
        ai_status="COMPLETED",
        category="Structural",
        priority_score=80.0,
        severity_score=80.0,
        confidence=0.95,
        created_at=base_time,
        status="SUBMITTED"
    )

    db_session.add_all([c1, c2, c3, c4])
    await db_session.commit()
    for c in [c1, c2, c3, c4]:
        await db_session.refresh(c)

    q_resp = await client.get("/api/v1/staff/queue", headers=staff_structural_headers)
    assert q_resp.status_code == 200
    items = q_resp.json()["items"]
    assert len(items) == 4

    assert items[0]["id"] == c1.id
    assert items[0]["rank"] == 1

    assert items[1]["id"] == c2.id
    assert items[1]["rank"] == 2

    assert items[2]["id"] == c4.id
    assert items[2]["rank"] == 3

    assert items[3]["id"] == c3.id
    assert items[3]["rank"] == 4

    pos4 = await client.get(f"/api/v1/complaints/{c4.id}/position", headers=user_auth_headers)
    assert pos4.status_code == 200
    pos4_data = pos4.json()
    assert pos4_data["in_queue"] is True
    assert pos4_data["rank"] == 3
    assert pos4_data["queue_size"] == 4

    pos1 = await client.get(f"/api/v1/complaints/{c1.id}/position", headers=user_auth_headers)
    assert pos1.status_code == 200
    pos1_data = pos1.json()
    assert pos1_data["in_queue"] is True
    assert pos1_data["rank"] == 1
    assert pos1_data["queue_size"] == 4
