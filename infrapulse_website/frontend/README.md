# InfraPulse Frontend — React + Paper Theme Operational Interface

Production-ready React + TypeScript web application for **InfraPulse** — the AI-Powered Infrastructure Defect Reporting & Priority Maintenance System.

Built according to the specification defined in `04_Frontend_React_Paper_UI_Spec.docx` and integrated directly with the authoritative FastAPI backend created by Agent 2.

---

## Visual Aesthetics: The Paper Operations Language

The user interface implements a refined **"Paper Operations"** design system:
- **Canvas / Background**: Warm off-white paper base (`#F9F8F5` / `#F4F0E8`).
- **Surfaces**: Pure paper card sheets with thin neutral rules (`#E5E0D8`) and low-elevation shadows.
- **Typography**: Near-black graphite typography with strict `font-variant-numeric: tabular-nums` for rankings, priority scores, and latency metrics.
- **Restrained Accent**: Single operational burnt terracotta accent (`#B85D19`) reserved for primary interactions and focus rings.
- **Categorical Integrity**: Clear, low-saturation badges for **Structural** (Slate Ink), **Functional** (Forest Teal), and **Performance** (Amber Bronze) divisions.
- **Accessibility**: Status and priority are communicated through explicit text labels paired with high-contrast neutral borders.

---

## Route Map

| Route | Audience | Purpose | Role Protection |
|---|---|---|---|
| `/login` | Public | Shared sign-in shell with toggle between Citizen Reporter & Operations Staff | Redirect if authenticated |
| `/register` | Public | Citizen account registration | Redirect if authenticated |
| `/app` | Citizen (User) | Citizen dashboard: active complaints counter, quick report action, and recent history | `RequireRole("USER")` |
| `/app/new` | Citizen (User) | New defect complaint submission: photo upload with live preview and client validation | `RequireRole("USER")` |
| `/app/complaints/:id` | Citizen (User) | Comprehensive complaint detail: AI inference metrics, queue position, and lifecycle timeline | `RequireRole("USER")` |
| `/staff` | Staff | **Dominant operational priority queue** for the staff member's assigned category | `RequireRole("STAFF")` |
| `/staff/complaints/:id` | Staff | Defect inspection & lifecycle transition controls (`Submitted` &rarr; `Assigned` &rarr; `In Progress` &rarr; `Resolved`) | `RequireRole("STAFF")` |
| `/staff/history` | Staff | Permanent archive of resolved category complaints | `RequireRole("STAFF")` |
| `*` | Any | Paper-styled 404 resource not found page | Public |

---

## Backend Endpoints Consumed

The frontend consumes the FastAPI backend contract without duplicating ML models or priority formulas:

### 1. Authentication (`/api/v1/auth`)
- `POST /api/v1/auth/register` — Citizen registration (`name`, `email`, `password`)
- `POST /api/v1/auth/login` — Citizen login (`email`, `password`)
- `POST /api/v1/auth/staff/login` — Staff login (`username`, `password`)
- `GET /api/v1/auth/me` — Current principal profile (`id`, `name`, `role`, `category`)
- `POST /api/v1/auth/logout` — Invalidate session

### 2. Complaints (`/api/v1/complaints`)
- `POST /api/v1/complaints` — Multipart upload (`name`, `address`, `description`, `photo`)
- `GET /api/v1/complaints` — User's complaints list
- `GET /api/v1/complaints/{id}` — Full complaint detail + dynamic queue position
- `GET /api/v1/complaints/{id}/position` — Authoritative queue rank and standing
- `GET /api/v1/complaints/{id}/events` — Audit trail & status transition logs
- `GET /api/v1/complaints/{id}/image` — Authenticated photo retrieval via `<AuthenticatedImage />`
- `POST /api/v1/complaints/{id}/reprocess` — Re-enqueue AI inference job

### 3. Staff Operations (`/api/v1/staff`)
- `GET /api/v1/staff/me` — Staff profile and assigned category
- `GET /api/v1/staff/queue` — Ranked priority queue for staff member's category
- `GET /api/v1/staff/complaints/{id}` — Staff complaint review
- `PATCH /api/v1/staff/complaints/{id}/status` — Status transition (`Submitted` &rarr; `Assigned` &rarr; `In Progress` &rarr; `Resolved`)
- `GET /api/v1/staff/history` — Historical resolved complaints for category

---

## Real-Time WebSockets & Polling Strategy

- **WebSocket Endpoint**: `ws://localhost:8000/ws?token=<JWT>` or `/api/v1/ws?token=<JWT>`.
- **Heartbeat**: Automated ping/pong heartbeat interval every 25 seconds with exponential backoff auto-reconnection.
- **Cache Invalidation Architecture**:
  - `complaint.ai_completed`: Invalidates `['complaints']`, complaint detail, queue position, and staff category queue.
  - `complaint.ai_failed`: Invalidates complaint detail and alerts user.
  - `queue.updated`: Invalidates staff queue and active complaint queue positions.
  - `complaint.status_changed`: Invalidates complaint detail, user complaint list, and staff queue/history.
  - `complaint.resolved`: Removes complaint from live queue and refreshes historical ledger.
- **Polling Fallback**: If WebSocket connection drops or while AI status is `PENDING` / `PROCESSING`, `useComplaintDetail` activates a 2.5-second polling interval on `GET /api/v1/complaints/{id}`, automatically halting when `ai_status` reaches `COMPLETED` or `FAILED`.

---

## Environment Variables

Configured via `.env` or environment injection:

```ini
# Base URL for the FastAPI Backend REST and WebSocket server
VITE_API_URL=http://localhost:8000
```

---

## Getting Started

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```
The application will launch on `http://localhost:5173`.

### 3. Run Automated Tests
```bash
npm test
```
Runs 16 Vitest component, hook, and guard test suites.

### 4. Build Production Bundle
```bash
npm run build
```
Generates optimized assets in `frontend/dist/`.

---

## Evaluator Quick Start Credentials

### Citizen Reporter
- Register a new citizen account at `/register`, or use any test credentials.

### Operational Staff Accounts
- **Structural Division**: Username: `alice_structural` | Password: `staffpass123`
- **Functional Division**: Username: `bob_functional` | Password: `staffpass123`
