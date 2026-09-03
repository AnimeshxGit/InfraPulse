import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_user_registration_and_login(client: AsyncClient):
    reg_resp = await client.post(
        "/api/v1/auth/register",
        json={
            "name": "Jane Resident",
            "email": "jane@example.com",
            "password": "securepassword123"
        }
    )
    assert reg_resp.status_code == 201
    data = reg_resp.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "jane@example.com"
    assert data["user"]["name"] == "Jane Resident"
    assert data["user"]["role"] == "USER"

    dup_resp = await client.post(
        "/api/v1/auth/register",
        json={
            "name": "Jane Resident",
            "email": "jane@example.com",
            "password": "anotherpassword"
        }
    )
    assert dup_resp.status_code == 400

    login_resp = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "jane@example.com",
            "password": "securepassword123"
        }
    )
    assert login_resp.status_code == 200
    login_data = login_resp.json()
    assert "access_token" in login_data
    token = login_data["access_token"]

    bad_login = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "jane@example.com",
            "password": "wrongpassword"
        }
    )
    assert bad_login.status_code == 401

    me_resp = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert me_resp.status_code == 200
    me_data = me_resp.json()
    assert me_data["email_or_username"] == "jane@example.com"
    assert me_data["role"] == "USER"

@pytest.mark.asyncio
async def test_staff_login_and_profile(client: AsyncClient, staff_structural):
    staff_resp = await client.post(
        "/api/v1/auth/staff/login",
        json={
            "username": "alice_structural",
            "password": "staffpass123"
        }
    )
    assert staff_resp.status_code == 200
    staff_data = staff_resp.json()
    assert "access_token" in staff_data
    assert staff_data["staff"]["category"] == "Structural"
    assert staff_data["staff"]["role"] == "STAFF"

    token = staff_data["access_token"]

    me_resp = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert me_resp.status_code == 200
    me_data = me_resp.json()
    assert me_data["role"] == "STAFF"
    assert me_data["category"] == "Structural"

    staff_me_resp = await client.get(
        "/api/v1/staff/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert staff_me_resp.status_code == 200
    assert staff_me_resp.json()["category"] == "Structural"

@pytest.mark.asyncio
async def test_unauthorized_access(client: AsyncClient):
    resp = await client.get("/api/v1/auth/me")
    assert resp.status_code == 401

    bad_token_resp = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": "Bearer invalid.jwt.token"}
    )
    assert bad_token_resp.status_code == 401
