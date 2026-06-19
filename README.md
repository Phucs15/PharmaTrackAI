# PharmaTrack AI

A pharmacy/warehouse inventory management system with AI-powered forecasting and insights. Built with React + Vite on the frontend and Node.js/Express/MongoDB on the backend, with JWT authentication, refresh-token rotation, role-based access control, audit logging, and Gemini AI integration.

## Project Structure

```
PharmaTrackAI/
├── pharmatrack-ai-frontend/   # React 19 + Vite + Tailwind CSS (+ Dockerfile, nginx.conf)
├── pharmatrack-ai-backend/    # Node.js + Express + MongoDB + JWT + Gemini AI (+ Dockerfile)
├── stitch_pharmatrack_ai_warehouse_manager/  # UI design mockups (HTML/screenshots)
└── docker-compose.yml         # Runs mongo + backend + frontend together
```

## Prerequisites

- [Node.js](https://nodejs.org/) 18+ and npm
- A MongoDB instance — any of:
  - **Docker (easiest):** `docker run -d --name pharmatrack-mongo -p 27017:27017 -v pharmatrack-mongo-data:/data/db mongo:7`
  - [MongoDB Community Server](https://www.mongodb.com/try/download/community) installed locally
  - A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) free-tier cluster

---

## Run with Docker Compose (recommended)

Starts MongoDB, the backend API, and the Nginx-served frontend together — no local Node.js install needed.

```bash
cp .env.example .env        # fill in JWT_SECRET, optionally GEMINI_API_KEY
docker compose up -d --build
```

> The backend runs with `NODE_ENV=production` in Compose and **refuses to start** if `JWT_SECRET` is still set to the `change_this_secret` placeholder. Set a real secret in `.env` before starting.

| Service  | URL |
|----------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5000/api |
| MongoDB  | localhost:27017 (data in volume `pharmatrack-mongo-data`) |

**Seed the database** with sample data (run once, or any time you want to reset):

```bash
docker compose exec backend npm run seed
```

**Fetch real drug names** from OpenFDA (optional — adds up to 80 medicines per run):

```bash
docker compose exec backend npm run seed:medicines
docker compose exec backend npm run seed:medicines -- --limit 5   # 5 per category
docker compose exec backend npm run seed:medicines -- --clear     # clear first, then fetch
```

To stop everything: `docker compose down` (add `-v` to also delete the MongoDB volume).

---

## Manual Setup (without Docker)

### 1. Backend

```bash
cd pharmatrack-ai-backend
cp .env.example .env
npm install
npm run seed      # seed sample medicines, batches, transactions, and users
npm run dev       # starts the API on http://localhost:5000
```

**Environment variables** (edit `pharmatrack-ai-backend/.env`):

| Variable | Required | Description |
|---|---|---|
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret for signing access tokens (any long random string) |
| `JWT_REFRESH_SECRET` | No | Separate secret for refresh tokens — falls back to `JWT_SECRET` if unset |
| `JWT_EXPIRES_IN` | No | Access token lifetime (default `15m`) |
| `CLIENT_URL` | Yes | Comma-separated allowed frontend origins for CORS (e.g. `http://localhost:5173`) — requests from other origins are rejected |
| `GEMINI_API_KEY` | No | Google Gemini API key — AI features use deterministic fallbacks if unset |

> **Production note:** The server warns at startup if `JWT_SECRET` is the placeholder, and refuses to start entirely in `NODE_ENV=production`.

### 2. Frontend

```bash
cd pharmatrack-ai-frontend
cp .env.example .env     # VITE_API_BASE_URL defaults to http://localhost:5000/api
npm install
npm run dev
```

Open the URL printed in the terminal (default `http://localhost:5173`).

---

## Default Seeded Accounts

| Role | Email | Password |
|---|---|---|
| Administrator | admin@pharmatrack.com | admin123 |
| Warehouse Manager | manager@pharmatrack.com | manager123 |
| Warehouse Staff | staff@pharmatrack.com | staff123 |

Additional seeded users (`s.jenkins@`, `m.chen@`, `e.diaz@`, `j.wilson@pharmatrack.com`) use the default temporary password `changeme123`.

---

## Features

- **Dashboard** — key inventory and expiry metrics at a glance
- **Medicine & Batch Management** — full CRUD for medicines and batches with per-facility stock tracking
- **Inventory In/Out** — record stock movements; updates batch quantity and per-facility medicine stock atomically
- **Expiry Monitoring** — surfaces medicines nearing or past expiry
- **Reports** — inventory summary, expiry, and stock movement reports with export
- **AI Forecasting & Insights** — Gemini-powered demand forecasts, insights, and chat; graceful deterministic fallbacks when no API key is configured; per-user chat history with a 50-message cap
- **User Management** — admin-only user CRUD with role-based access control (Administrator, Warehouse Manager, Warehouse Staff)
- **Authentication** — short-lived JWT access tokens (15 min, stored in JS memory) + long-lived refresh tokens (30 days, HttpOnly cookie); silent token rotation on expiry; concurrent-request deduplication via a shared refresh promise
- **Password Reset** — forgot-password flow: generates a one-time SHA-256-hashed token stored in the database; reset URL logged to the console in development (plug in nodemailer for production email delivery)
- **Profile & Password Settings** — users can update their profile and change their password from the Settings page; changing password does not trigger a global logout
- **Audit Log** — immutable record of `LOGIN`, `CREATE`, `UPDATE`, `DELETE`, `PASSWORD_CHANGE`, and `PASSWORD_RESET` actions; queryable by admins with entity/action/user filters and pagination

---

## Tech Stack

**Frontend:** React 19, Vite, Tailwind CSS, React Router, Recharts, Axios (with silent-refresh interceptor)

**Backend:** Node.js, Express, MongoDB/Mongoose, JSON Web Tokens, bcryptjs, cookie-parser, Helmet, express-rate-limit, Google Generative AI (Gemini)

**Infrastructure:** Docker, Docker Compose, Nginx (SPA-mode frontend serving with asset caching)

---

## API Overview

Base URL: `http://localhost:5000/api`

### Authentication (`/auth`)

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/login` | — | Authenticate; sets refresh-token cookie, returns access token |
| POST | `/auth/register` | — | Self-register (role fixed to Warehouse Staff) |
| POST | `/auth/refresh` | cookie | Rotate refresh token, return new access token |
| POST | `/auth/logout` | — | Clear refresh-token cookie |
| POST | `/auth/forgot-password` | — | Generate password-reset token (rate-limited) |
| POST | `/auth/reset-password` | — | Consume token, set new password (rate-limited) |
| GET | `/auth/me` | JWT | Return current user profile |
| PUT | `/auth/me` | JWT | Update profile (name, email, title, bio, facility, avatarUrl) |
| PUT | `/auth/password` | JWT | Change password (requires current password) |

### Resources

| Route | Roles | Description |
|---|---|---|
| `/medicines` | All (write: Manager+) | Medicine catalog CRUD |
| `/batches` | All (write: Manager+) | Batch CRUD |
| `/inventory` | All (write: Staff+) | Stock in/out transactions |
| `/users` | Admin only | User management CRUD |
| `/reports` | All | Inventory, expiry, and stock movement reports |
| `/ai` | All | AI forecasting, insights, and chat (rate-limited) |
| `/audit` | Admin only | Immutable audit log (filterable, paginated) |

### Pagination

`GET /medicines`, `/batches`, `/inventory/transactions`, and `/users` support optional server-side pagination — they return a plain array by default. Pass both `page` and `limit` (positive integers) to get a paginated response:

```json
{
  "data": [ /* items */ ],
  "pagination": { "page": 1, "limit": 20, "total": 57, "totalPages": 3 }
}
```

Example: `GET /api/medicines?page=2&limit=20`

### Audit Log

`GET /audit` (admin only). Supported query parameters:

| Param | Example | Description |
|---|---|---|
| `entity` | `Medicine` | Filter by entity type |
| `action` | `DELETE` | Filter by action (`CREATE`, `UPDATE`, `DELETE`, `LOGIN`, `PASSWORD_CHANGE`, `PASSWORD_RESET`) |
| `userId` | `<ObjectId>` | Filter by user |
| `page` / `limit` | `1` / `50` | Pagination (max 500 per page) |

---

## Testing & CI

Both projects have automated test suites that run in CI (`.github/workflows/ci.yml`) on every push and pull request to `main`/`master`.

**Backend** — Vitest + Supertest + `mongodb-memory-server` (no Docker or real MongoDB needed). Covers auth (login, register, refresh, forgot/reset password), RBAC, mass-assignment protection, audit log, pagination, AI chat history capping, and security headers/rate limiting. **56 tests.**

**Frontend** — Vitest + React Testing Library + jsdom. Covers `decodeToken`, formatting utilities, `AuthContext` (async init, login/logout/session-restore/role checks), `LoginPage`, and `ForgotPasswordPage`. **39 tests.**

```bash
cd pharmatrack-ai-backend && npm test
cd pharmatrack-ai-frontend && npm test
```

The CI workflow also runs `npm run lint` and `npm run build` for the frontend.

---

## Scripts Reference

### Frontend (`pharmatrack-ai-frontend/`)

| Script | Description |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview the production build locally |
| `npm test` | Run the Vitest suite once |
| `npm run test:watch` | Run tests in watch mode |

### Backend (`pharmatrack-ai-backend/`)

| Script | Description |
|---|---|
| `npm run dev` | Start the API with nodemon (auto-restart on changes) |
| `npm start` | Start the API |
| `npm run seed` | Seed MongoDB with sample medicines, batches, transactions, and users |
| `npm run seed:medicines` | Fetch real drug names from OpenFDA NDC API and insert into MongoDB |
| `npm test` | Run the Vitest suite once (in-memory MongoDB, no setup needed) |
| `npm run test:watch` | Run tests in watch mode |

`seed:medicines` options (pass after `--`):

```bash
npm run seed:medicines -- --limit 5    # fetch 5 drugs per category (default 10)
npm run seed:medicines -- --clear      # clear existing medicines first, then fetch
```

---

## Docker Compose Reference

Run from the project root:

| Command | Description |
|---|---|
| `docker compose up -d --build` | Build images and start `mongo`, `backend`, `frontend` |
| `docker compose ps` | List running containers and ports |
| `docker compose logs -f [service]` | Tail logs for `mongo`, `backend`, or `frontend` |
| `docker compose exec backend npm run seed` | Seed/reset the database |
| `docker compose exec backend npm run seed:medicines` | Fetch real drug names from OpenFDA |
| `docker compose restart backend` | Restart a service (e.g. after editing `.env`) |
| `docker compose down` | Stop and remove containers (add `-v` to also delete the MongoDB volume) |
