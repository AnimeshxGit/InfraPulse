# InfraPulse FastAPI Backend (Agent 2)

Production-ready FastAPI backend for **InfraPulse** — the AI-Powered Infrastructure Defect Reporting and Priority Resolution Platform.

The backend serves as the authoritative system of record for users, staff, complaints, dynamic priority queues, image storage metadata, status lifecycle auditing, and real-time WebSocket invalidations.

---

## Key Architecture & Features

1. **System of Record**:
   - PostgreSQL persistence using SQLAlchemy 2.0 async engine and Alembic migrations.
   - Authoritative data store for users, category-assigned staff, complaint records, and status transition logs.

2. **AI Inference Integration (Agent 1 Contract)**:
   - On complaint submission (`POST /api/v1/complaints`), images are stored under opaque UUID filenames and an inference job is enqueued to Celery queue `inference` (`app.tasks.process_complaint`).
   - The backend never blocks on ML model inference and returns `201 Created` with `ai_status: PENDING` immediately.
   - Subscribes asynchronously to Redis Pub/Sub channel `infrapulse.ai.events.v1` to ingest `ai.inference.completed` and `ai.inference.failed` events.
   - Automatically stores detected defect, category, confidence, visual extent percentage, severity, and priority score.

3. **Dynamic Priority Queues (40% Core Evaluation Component)**:
   - Three distinct category queues: `Structural`, `Functional`, `Performance`.
   - Only complaints with `ai_status == COMPLETED` and `status != RESOLVED` belong to live queues.
   - Deterministic multi-criteria sorting:
     1. `priority_score DESC`
     2. `severity_score DESC`
     3. `confidence DESC`
     4. `created_at ASC` (deterministic tie-breaker)
   - Dynamic 1-based rank computation (never persists stale rank numbers).

4. **Security & Role-Based Access Control**:
   - Secure password hashing with `bcrypt` and signed JWT authentication (`pyjwt`).
   - Normal users can only view their own submitted complaints and queue standings.
   - Operational staff can only access and update complaints within their assigned category (`Structural`, `Functional`, or `Performance`).
   - Browser-supplied categories are never trusted.

5. **Predefined Status Lifecycle & Auditing**:
   - Enforces valid state transitions: `SUBMITTED` &rarr; `ASSIGNED` &rarr; `IN_PROGRESS` &rarr; `RESOLVED`.
   - Every transition writes an immutable record to `StatusHistory`.
   - Resolved complaints leave active queues while remaining accessible in history and user detail views.

6. **Real-time WebSockets**:
   - Lightweight invalidation / update event broadcast over `/ws` or `/api/v1/ws`.
   - Supported events:
     - `complaint.ai_completed`: dispatched to complaint owner and category staff.
     - `complaint.ai_failed`: dispatched to complaint owner.
     - `queue.updated`: dispatched to category staff and users with active complaints in category.
     - `complaint.status_changed`: dispatched to complaint owner and category staff.
     - `complaint.resolved`: dispatched to complaint owner and category staff.
   - Multi-worker cross-instance event synchronization using Redis Pub/Sub.

---

## API Endpoints Summary

### Authentication (`/api/v1/auth`)
| Method | Path | Auth | Purpose |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | Public | Register new user account |
| `POST` | `/api/v1/auth/login` | Public | User login (returns JWT + profile) |
| `POST` | `/api/v1/auth/staff/login` | Public | Staff login (returns JWT + category) |
| `GET` | `/api/v1/auth/me` | Bearer | Get current user/staff principal profile |
| `POST` | `/api/v1/auth/logout` | Bearer | Logout / invalidate session |

### Complaints — User (`/api/v1/complaints`)
| Method | Path | Auth | Purpose |
|---|---|---|---|
| `POST` | `/api/v1/complaints` | USER | Register complaint with multipart image upload |
| `GET` | `/api/v1/complaints` | USER | List user's submitted complaints |
| `GET` | `/api/v1/complaints/{id}` | USER | Full complaint detail + dynamic queue position |
| `GET` | `/api/v1/complaints/{id}/position` | USER | Real-time queue standing (rank & queue size) |
| `GET` | `/api/v1/complaints/{id}/events` | USER / STAFF | Status audit trail / lifecycle history |
| `GET` | `/api/v1/complaints/{id}/image` | USER / STAFF | Authenticated image delivery |
| `POST` | `/api/v1/complaints/{id}/reprocess` | USER / STAFF | Re-enqueue AI inference job |

### Staff Operations (`/api/v1/staff`)
| Method | Path | Auth | Purpose |
|---|---|---|---|
| `GET` | `/api/v1/staff/me` | STAFF | Current staff profile & category |
| `GET` | `/api/v1/staff/queue` | STAFF | Ranked priority queue for staff's category |
| `GET` | `/api/v1/staff/queue/{category}` | STAFF | Category priority queue (validates permission) |
| `GET` | `/api/v1/staff/complaints/{id}` | STAFF | Staff complaint detail with category check |
| `PATCH` | `/api/v1/staff/complaints/{id}/status` | STAFF | Transition status (`SUBMITTED` &rarr; `ASSIGNED` &rarr; `IN_PROGRESS` &rarr; `RESOLVED`) |
| `GET` | `/api/v1/staff/history` | STAFF | Historical resolved complaints for category |

### Health & Diagnostics
| Method | Path | Purpose |
|---|---|---|
| `GET` | `/health/live` | Process liveness probe |
| `GET` | `/health/ready` | PostgreSQL and Redis connectivity probe |
| `GET` | `/api/v1/stats/summary` | Global and category summary statistics |

---

## WebSocket Interface

- **Endpoint**: `/ws` or `/api/v1/ws`
- **Authentication**: `ws://localhost:8000/ws?token=<JWT>` or initial message `{"token": "<JWT>"}`
- **Event Payload Structure**:
  ```json
  {
    "event_type": "complaint.ai_completed",
    "timestamp": "2026-09-03T01:45:00Z",
    "data": {
      "complaint_id": "c1f7a080-...",
      "category": "Structural",
      "detected_defect": "Spalling",
      "priority_score": 82.5,
      "ai_status": "COMPLETED",
      "status": "SUBMITTED"
    }
  }
  ```

---

## Local Development & Setup

### 1. Requirements
- Python 3.10+
- PostgreSQL (or SQLite for local dev/testing)
- Redis

### 2. Environment Setup
```bash
cp .env.example .env
```

### 3. Run Database Migrations
```bash
alembic upgrade head
```

### 4. Run Development Server
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 5. Run Automated Test Suite
```bash
pytest tests/ -v
```
