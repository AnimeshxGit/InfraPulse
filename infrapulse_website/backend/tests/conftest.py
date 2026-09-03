import sys
import os
from pathlib import Path
from unittest.mock import patch, MagicMock

backend_dir = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(backend_dir))

import pytest
import pytest_asyncio
from typing import AsyncGenerator
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.pool import StaticPool

from app.db.base import Base
from app.db.session import get_db
from app.main import app
from app.models.user import User
from app.models.staff import Staff
from app.core.security import get_password_hash, create_access_token
from app.services.storage_service import storage_service
from app.services.ai_dispatcher import ai_dispatcher

TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

test_engine = create_async_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestingSessionLocal = async_sessionmaker(
    bind=test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

@pytest_asyncio.fixture(autouse=True)
def mock_celery_and_redis():
    with patch("app.integrations.celery.celery_client.send_task") as mock_send:
        mock_send.return_value = MagicMock(id="mock-task-id")
        yield mock_send

@pytest_asyncio.fixture(scope="function")
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with TestingSessionLocal() as session:
        yield session

    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

@pytest_asyncio.fixture(scope="function")
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    temp_storage = backend_dir / "tests" / "temp_uploads"
    temp_storage.mkdir(parents=True, exist_ok=True)
    storage_service.storage_root = temp_storage

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()
    
    import shutil
    if temp_storage.exists():
        shutil.rmtree(temp_storage, ignore_errors=True)

@pytest_asyncio.fixture(scope="function")
async def registered_user(db_session: AsyncSession) -> User:
    user = User(
        name="John Doe",
        email="john@example.com",
        password_hash=get_password_hash("password123"),
        role="USER"
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user

@pytest_asyncio.fixture(scope="function")
async def user_auth_headers(registered_user: User) -> dict:
    token = create_access_token(
        subject=registered_user.id,
        role="USER",
        extra_claims={"email": registered_user.email, "name": registered_user.name}
    )
    return {"Authorization": f"Bearer {token}"}

@pytest_asyncio.fixture(scope="function")
async def staff_structural(db_session: AsyncSession) -> Staff:
    staff = Staff(
        name="Alice Structural",
        username="alice_structural",
        email="alice@infra.gov",
        password_hash=get_password_hash("staffpass123"),
        role="STAFF",
        category="Structural"
    )
    db_session.add(staff)
    await db_session.commit()
    await db_session.refresh(staff)
    return staff

@pytest_asyncio.fixture(scope="function")
async def staff_structural_headers(staff_structural: Staff) -> dict:
    token = create_access_token(
        subject=staff_structural.id,
        role="STAFF",
        extra_claims={"username": staff_structural.username, "category": staff_structural.category, "name": staff_structural.name}
    )
    return {"Authorization": f"Bearer {token}"}

@pytest_asyncio.fixture(scope="function")
async def staff_functional(db_session: AsyncSession) -> Staff:
    staff = Staff(
        name="Bob Functional",
        username="bob_functional",
        email="bob@infra.gov",
        password_hash=get_password_hash("staffpass123"),
        role="STAFF",
        category="Functional"
    )
    db_session.add(staff)
    await db_session.commit()
    await db_session.refresh(staff)
    return staff

@pytest_asyncio.fixture(scope="function")
async def staff_functional_headers(staff_functional: Staff) -> dict:
    token = create_access_token(
        subject=staff_functional.id,
        role="STAFF",
        extra_claims={"username": staff_functional.username, "category": staff_functional.category, "name": staff_functional.name}
    )
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def dummy_image_bytes() -> bytes:
    return (
        b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06"
        b"\x00\x00\x00\x1f\x15c4\x00\x00\x00\rIDATx\x9cc\xf8\xff\xff?\x00\x05\xfe\x02\xfe"
        b"\xdc\xccY\xe7\x00\x00\x00\x00IEND\xaeB`\x82"
    )
