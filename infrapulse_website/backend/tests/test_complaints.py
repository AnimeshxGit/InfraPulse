import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User
from app.models.complaint import Complaint
from app.core.security import create_access_token

@pytest.mark.asyncio
async def test_create_and_read_complaint(
    client: AsyncClient,
    user_auth_headers: dict,
    registered_user: User,
    dummy_image_bytes: bytes
):
    files = {"photo": ("defect.png", dummy_image_bytes, "image/png")}
    data = {
        "name": "John Doe",
        "address": "42 Main Street, Building B",
        "description": "Large crack visible on the foundation beam."
    }

    create_resp = await client.post(
        "/api/v1/complaints",
        data=data,
        files=files,
        headers=user_auth_headers
    )
    assert create_resp.status_code == 201
    comp = create_resp.json()
    assert comp["ai_status"] == "PENDING"
    assert comp["status"] == "SUBMITTED"
    assert comp["name_snapshot"] == "John Doe"
    assert comp["address"] == "42 Main Street, Building B"
    complaint_id = comp["id"]

    list_resp = await client.get("/api/v1/complaints", headers=user_auth_headers)
    assert list_resp.status_code == 200
    items = list_resp.json()
    assert len(items) == 1
    assert items[0]["id"] == complaint_id

    filtered_resp = await client.get("/api/v1/complaints?status=SUBMITTED", headers=user_auth_headers)
    assert filtered_resp.status_code == 200
    assert len(filtered_resp.json()) == 1

    empty_filtered = await client.get("/api/v1/complaints?status=RESOLVED", headers=user_auth_headers)
    assert empty_filtered.status_code == 200
    assert len(empty_filtered.json()) == 0

    detail_resp = await client.get(f"/api/v1/complaints/{complaint_id}", headers=user_auth_headers)
    assert detail_resp.status_code == 200
    detail = detail_resp.json()
    assert detail["id"] == complaint_id
    assert len(detail["status_history"]) == 1
    assert detail["status_history"][0]["from_status"] == "NONE"
    assert detail["status_history"][0]["to_status"] == "SUBMITTED"

    events_resp = await client.get(f"/api/v1/complaints/{complaint_id}/events", headers=user_auth_headers)
    assert events_resp.status_code == 200
    events = events_resp.json()
    assert len(events) == 1

    img_resp = await client.get(f"/api/v1/complaints/{complaint_id}/image", headers=user_auth_headers)
    assert img_resp.status_code == 200
    assert len(img_resp.content) > 0

    pos_resp = await client.get(f"/api/v1/complaints/{complaint_id}/position", headers=user_auth_headers)
    assert pos_resp.status_code == 200
    pos_data = pos_resp.json()
    assert pos_data["in_queue"] is False
    assert pos_data["rank"] is None

    reproc_resp = await client.post(f"/api/v1/complaints/{complaint_id}/reprocess", headers=user_auth_headers)
    assert reproc_resp.status_code == 200
    assert reproc_resp.json()["ai_status"] == "PENDING"

@pytest.mark.asyncio
async def test_complaint_user_isolation(
    client: AsyncClient,
    user_auth_headers: dict,
    dummy_image_bytes: bytes
):
    files = {"photo": ("test.png", dummy_image_bytes, "image/png")}
    data = {
        "name": "User One",
        "address": "123 Elm St",
        "description": "Peeling paint"
    }
    create_resp = await client.post("/api/v1/complaints", data=data, files=files, headers=user_auth_headers)
    complaint_id = create_resp.json()["id"]

    user2_resp = await client.post(
        "/api/v1/auth/register",
        json={"name": "User Two", "email": "user2@example.com", "password": "pass"}
    )
    user2_token = user2_resp.json()["access_token"]
    user2_headers = {"Authorization": f"Bearer {user2_token}"}

    u2_list = await client.get("/api/v1/complaints", headers=user2_headers)
    assert len(u2_list.json()) == 0

    u2_detail = await client.get(f"/api/v1/complaints/{complaint_id}", headers=user2_headers)
    assert u2_detail.status_code == 404

    u2_img = await client.get(f"/api/v1/complaints/{complaint_id}/image", headers=user2_headers)
    assert u2_img.status_code == 403

@pytest.mark.asyncio
async def test_invalid_image_upload_rejected(
    client: AsyncClient,
    user_auth_headers: dict
):
    files = {"photo": ("malicious.txt", b"plain text data", "text/plain")}
    data = {
        "name": "Attacker",
        "address": "Nowhere",
        "description": "Invalid payload"
    }
    resp = await client.post("/api/v1/complaints", data=data, files=files, headers=user_auth_headers)
    assert resp.status_code == 400
