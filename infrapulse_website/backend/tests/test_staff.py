import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.complaint import Complaint
from app.models.user import User

@pytest.mark.asyncio
async def test_staff_category_permissions_and_lifecycle(
    client: AsyncClient,
    db_session: AsyncSession,
    registered_user: User,
    staff_structural_headers: dict,
    staff_functional_headers: dict
):
    comp_struct = Complaint(
        user_id=registered_user.id,
        name_snapshot="John Reporter",
        address="100 Highway Ave",
        description="Cracked bridge pillar",
        image_uri="fake_path.jpg",
        ai_status="COMPLETED",
        detected_defect="Spalling",
        category="Structural",
        confidence=0.95,
        priority_score=85.0,
        severity_score=78.0,
        status="SUBMITTED"
    )
    db_session.add(comp_struct)
    await db_session.commit()
    await db_session.refresh(comp_struct)
    comp_id = comp_struct.id

    struct_q = await client.get("/api/v1/staff/queue", headers=staff_structural_headers)
    assert struct_q.status_code == 200
    q_data = struct_q.json()
    assert q_data["category"] == "Structural"
    assert q_data["total_items"] == 1
    assert q_data["items"][0]["id"] == comp_id

    struct_q_explicit = await client.get("/api/v1/staff/queue/Structural", headers=staff_structural_headers)
    assert struct_q_explicit.status_code == 200

    mismatched_q = await client.get("/api/v1/staff/queue/Performance", headers=staff_structural_headers)
    assert mismatched_q.status_code == 403

    func_q = await client.get("/api/v1/staff/queue", headers=staff_functional_headers)
    assert func_q.status_code == 200
    assert func_q.json()["total_items"] == 0

    func_detail = await client.get(f"/api/v1/staff/complaints/{comp_id}", headers=staff_functional_headers)
    assert func_detail.status_code == 403

    func_patch = await client.patch(
        f"/api/v1/staff/complaints/{comp_id}/status",
        json={"status": "ASSIGNED"},
        headers=staff_functional_headers
    )
    assert func_patch.status_code == 403

    assign_resp = await client.patch(
        f"/api/v1/staff/complaints/{comp_id}/status",
        json={"status": "ASSIGNED", "notes": "Assigned to structural engineer"},
        headers=staff_structural_headers
    )
    assert assign_resp.status_code == 200
    assert assign_resp.json()["status"] == "ASSIGNED"

    bad_trans = await client.patch(
        f"/api/v1/staff/complaints/{comp_id}/status",
        json={"status": "SUBMITTED"},
        headers=staff_structural_headers
    )
    assert bad_trans.status_code == 400

    prog_resp = await client.patch(
        f"/api/v1/staff/complaints/{comp_id}/status",
        json={"status": "IN_PROGRESS"},
        headers=staff_structural_headers
    )
    assert prog_resp.status_code == 200
    assert prog_resp.json()["status"] == "IN_PROGRESS"

    res_resp = await client.patch(
        f"/api/v1/staff/complaints/{comp_id}/status",
        json={"status": "RESOLVED", "notes": "Concrete repaired and sealed"},
        headers=staff_structural_headers
    )
    assert res_resp.status_code == 200
    assert res_resp.json()["status"] == "RESOLVED"
    assert res_resp.json()["resolved_at"] is not None

    q_after = await client.get("/api/v1/staff/queue", headers=staff_structural_headers)
    assert q_after.json()["total_items"] == 0

    hist_resp = await client.get("/api/v1/staff/history", headers=staff_structural_headers)
    assert hist_resp.status_code == 200
    hist_items = hist_resp.json()
    assert len(hist_items) == 1
    assert hist_items[0]["id"] == comp_id
