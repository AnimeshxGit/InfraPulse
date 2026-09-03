import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_health_live(client: AsyncClient):
    resp = await client.get("/health/live")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"

@pytest.mark.asyncio
async def test_health_ready(client: AsyncClient):
    resp = await client.get("/health/ready")
    assert resp.status_code == 200
    data = resp.json()
    assert data["database"] == "ok"
    assert "status" in data

@pytest.mark.asyncio
async def test_stats_summary(client: AsyncClient, user_auth_headers: dict):
    resp = await client.get("/api/v1/stats/summary", headers=user_auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "total_complaints" in data
    assert "categories" in data
    assert len(data["categories"]) == 3
