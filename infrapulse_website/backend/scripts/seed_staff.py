import asyncio
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(backend_dir))

from app.db.session import async_session_factory
from app.models.staff import Staff
from app.core.security import get_password_hash
from sqlalchemy import select

STAFF_ACCOUNTS = [
    # Structural Department (Spalling, structural concrete/beam defects)
    {
        "name": "Alice Vance (Lead)",
        "username": "structural_lead",
        "email": "alice.structural@infrapulse.gov",
        "password": "password123",
        "category": "Structural"
    },
    {
        "name": "Marcus Stone (Inspector)",
        "username": "structural_eng",
        "email": "marcus.structural@infrapulse.gov",
        "password": "password123",
        "category": "Structural"
    },
    {
        "name": "David Miller (Field Tech)",
        "username": "structural_tech",
        "email": "david.structural@infrapulse.gov",
        "password": "password123",
        "category": "Structural"
    },
    
    # Functional Department (Stagnant Water, drainage, pipeline defects)
    {
        "name": "Sarah Connor (Lead)",
        "username": "functional_lead",
        "email": "sarah.functional@infrapulse.gov",
        "password": "password123",
        "category": "Functional"
    },
    {
        "name": "Brian O'Conner (Drainage Eng)",
        "username": "functional_eng",
        "email": "brian.functional@infrapulse.gov",
        "password": "password123",
        "category": "Functional"
    },
    {
        "name": "Elena Rostova (Field Inspector)",
        "username": "functional_tech",
        "email": "elena.functional@infrapulse.gov",
        "password": "password123",
        "category": "Functional"
    },
    
    # Performance Department (Cracked Tiles, Peeling paint, wear & tear)
    {
        "name": "Raymond Holt (Lead)",
        "username": "performance_lead",
        "email": "raymond.performance@infrapulse.gov",
        "password": "password123",
        "category": "Performance"
    },
    {
        "name": "Maya Lin (Surface Analyst)",
        "username": "performance_eng",
        "email": "maya.performance@infrapulse.gov",
        "password": "password123",
        "category": "Performance"
    }
]

async def seed_staff():
    async with async_session_factory() as session:
        created = 0
        skipped = 0
        for data in STAFF_ACCOUNTS:
            stmt = select(Staff).where(Staff.username == data["username"])
            existing = (await session.execute(stmt)).scalar_one_or_none()
            if existing:
                print(f"[-] Staff '{data['username']}' already exists. Skipping.")
                skipped += 1
                continue
                
            staff = Staff(
                id=str(uuid.uuid4()),
                name=data["name"],
                username=data["username"],
                email=data["email"],
                password_hash=get_password_hash(data["password"]),
                role="STAFF",
                category=data["category"],
                created_at=datetime.now(timezone.utc)
            )
            session.add(staff)
            created += 1
            print(f"[+] Created Staff: {data['name']:30} | @{data['username']:18} | Cat: {data['category']:12} | Email: {data['email']}")
            
        await session.commit()
        print(f"\nSeeding complete: {created} created, {skipped} skipped.")

if __name__ == "__main__":
    asyncio.run(seed_staff())
