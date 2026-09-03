# InfraPulse — Autonomous Defect Detection & Dynamic Priority Queue Platform

InfraPulse is an AI-powered civil infrastructure defect reporting and resolution platform. It combines a **React 19 SPA**, a **FastAPI backend with real-time WebSockets**, a **PyTorch MobileNetV3 Grad-CAM inference worker**, and an **authoritative PostgreSQL & Redis system of record**.

---

## Architecture Overview

```
                        Browser Client (http://<VM_IP>)
                                      │
                                      ▼
                        ┌───────────────────────────┐
                        │   Nginx Frontend (Port 80)│
                        └─────────────┬─────────────┘
                                      │
                ┌─────────────────────┴─────────────────────┐
                │                                           │
         / (Static React SPA)                       /api & /ws (Reverse Proxy)
                │                                           │
                ▼                                           ▼
         Frontend UI                         ┌─────────────────────────────┐
    (Citizen & Staff Portal)                 │  FastAPI Backend (Port 8000)│
                                             └──────┬───────────────┬──────┘
                                                    │               │
                                    DB & PubSub     │               │  Enqueue Celery Job
                                                    ▼               ▼
                                            ┌───────────────┐ ┌───────────────┐
                                            │ Postgres 15 & │ │ Celery AI     │
                                            │ Redis 7       │ │ Worker        │
                                            └───────────────┘ └───────┬───────┘
                                                                      │
                                                           Shared Uploads & Model
                                                                      │
                                                                      ▼
                                                              [MobileNetV3 + CAM]
```

---

## 🚀 Quick Start on Ubuntu 24 VM

### Prerequisites
- Ubuntu 24.04 LTS (or any standard Linux distribution)
- Docker & Docker Compose installed

### 1. Clone the Repository
```bash
git clone <YOUR_REPO_URL> infrapulse
cd infrapulse
```

### 2. Configure Environment
```bash
cp .env.example .env
```
*(Optionally change database passwords or JWT secret in `.env`)*

### 3. Launch All Services
```bash
docker compose up -d --build
# Or using the Makefile:
make up
```

All 5 services will build and start automatically:
1. **`postgres`**: Initializes database and health check.
2. **`redis`**: Starts message broker for Celery and WebSocket event sync.
3. **`backend`**: Runs Alembic migrations, seeds staff accounts, starts FastAPI.
4. **`ai-service`**: Loads MobileNetV3 weights and listens on Celery inference queue.
5. **`frontend`**: Compiles React UI and starts Nginx on Port 80.

---

## 🌐 Accessing the Platform

| Service | URL | Notes |
|---|---|---|
| **Web Application** | `http://<YOUR_VM_IP>` | Full Citizen & Staff UI |
| **Interactive API Docs** | `http://<YOUR_VM_IP>/docs` | OpenAPI / Swagger UI |
| **Liveness Probe** | `http://<YOUR_VM_IP>/health/live` | Process health check |
| **Readiness Probe** | `http://<YOUR_VM_IP>/health/ready` | DB & Redis connectivity |

---

## 👥 Seeded Staff Credentials

Staff users are automatically seeded on first launch. Password for all seeded accounts is: **`password123`**

| Name | Username | Department / Category | Capabilities |
|---|---|---|---|
| **Alice Vance** | `structural_lead` | **Structural** | Spalling, cracks, concrete/beam defects |
| **Marcus Stone** | `structural_eng` | **Structural** | Inspector for structural defects |
| **Sarah Connor** | `functional_lead` | **Functional** | Water stagnation, drainage, leaks |
| **Brian O'Conner** | `functional_eng` | **Functional** | Drainage engineer |
| **Raymond Holt** | `performance_lead` | **Performance** | Cracked tiles, peeling paint, wear & tear |
| **Maya Lin** | `performance_eng` | **Performance** | Surface analyst |

*Citizens can register new accounts directly at `http://<YOUR_VM_IP>/register`.*

---

## 🛠️ Management Commands

Using the included `Makefile`:

```bash
make up        # Build and start all services in the background
make down      # Stop all services
make logs      # Stream live logs from all containers
make ps        # Check status and health of all containers
make restart   # Restart all services
make seed      # Re-run staff database seeding
make clean     # Stop and wipe database volumes (DANGER)
```

---

## 📁 Repository Structure

```
InfraPulse/
├── ai-service/             # Celery AI Worker (MobileNetV3 + Grad-CAM)
│   ├── app/                # Inference pipeline, priority scoring, event publisher
│   ├── model_weights/      # mobilenet_v3_small_best.pth checkpoint
│   └── Dockerfile          # Python 3.10 slim worker container
│
├── backend/                # FastAPI Core Backend
│   ├── app/                # Models, API routes, queue sorting, WebSocket broadcast
│   ├── migrations/         # Alembic database migration scripts
│   ├── scripts/            # Database seed scripts
│   └── Dockerfile          # Python 3.11 slim API container
│
├── frontend/               # React 19 + TypeScript + Vite SPA
│   ├── src/                # Pages, components, realtime hooks, theme
│   ├── nginx.conf          # Nginx reverse proxy configuration
│   └── Dockerfile          # Multi-stage build + Nginx container
│
├── docs/                   # Specifications, architecture docs & notebooks
├── docker-compose.yml      # Master multi-container orchestration
├── Makefile                # Quick CLI helper commands
└── .env.example            # Environment variables template
```
