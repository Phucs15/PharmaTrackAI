# PharmaTrack AI

PharmaTrack AI is a pharmacy/warehouse inventory management system with AI-powered
forecasting and insights. It consists of a React frontend and a Node.js/Express/MongoDB
backend with JWT authentication, role-based access control, and Gemini AI integration.

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
  - [Docker](https://www.docker.com/): `docker run -d --name pharmatrack-mongo -p 27017:27017 -v pharmatrack-mongo-data:/data/db mongo:7`
  - [MongoDB Community Server](https://www.mongodb.com/try/download/community) installed locally
  - A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) connection string

## Run with Docker Compose (recommended)

This starts MongoDB, the backend API, and the frontend together — no local Node.js install needed.

```bash
cp .env.example .env   # optional: customize JWT_SECRET, GEMINI_API_KEY, etc.
docker compose up -d --build
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api
- MongoDB: localhost:27017 (data persisted in the `pharmatrack-mongo-data` volume)

Seed the database with sample medicines, batches, and users (one-time, or whenever you want to reset the data):

```bash
docker compose exec backend npm run seed
```

To stop everything: `docker compose down` (add `-v` to also delete the MongoDB volume).

> If you previously started MongoDB with a standalone `docker run --name pharmatrack-mongo ...` command,
> stop and remove that container first (`docker rm -f pharmatrack-mongo`) so Compose can manage it —
> the same `pharmatrack-mongo-data` volume will be reused, so seeded data is preserved.

## Manual Setup (without Docker)

### 1. Backend

```bash
cd pharmatrack-ai-backend
cp .env.example .env
```

Edit `.env`:
- `MONGO_URI` — point to your local, Docker, or Atlas MongoDB instance
- `JWT_SECRET` — set to any long random string
- `GEMINI_API_KEY` — optional; AI features fall back to deterministic responses if left blank

```bash
npm install
npm run seed   # populates sample medicines, batches, transactions, and users
npm run dev    # starts the API on http://localhost:5000
```

### 2. Frontend

```bash
cd pharmatrack-ai-frontend
cp .env.example .env
```

`VITE_API_BASE_URL` defaults to `http://localhost:5000/api`, matching the backend above.

```bash
npm install
npm run dev
```

Open the URL printed in the terminal (default `http://localhost:5173`).

## Default Seeded Accounts

After running `npm run seed` in the backend, you can log in with:

| Role | Email | Password |
| --- | --- | --- |
| Administrator | admin@pharmatrack.com | admin123 |
| Warehouse Manager | manager@pharmatrack.com | manager123 |
| Warehouse Staff | staff@pharmatrack.com | staff123 |

Additional seeded users (`s.jenkins@`, `m.chen@`, `e.diaz@`, `j.wilson@pharmatrack.com`)
use the default temporary password `changeme123`.

## Features

- **Dashboard** — key inventory and expiry metrics at a glance
- **Medicine & Batch Management** — CRUD for medicines and their batches
- **Inventory In/Out** — track stock movements
- **Expiry Monitoring** — surface medicines nearing or past expiry
- **Reports** — inventory summary, expiry, and stock movement reports with export
- **AI Forecasting & Insights** — Gemini-powered demand forecasts, insights, and chat
  (works with deterministic fallbacks if no `GEMINI_API_KEY` is configured)
- **User Management** — admin-only user CRUD with role-based access control
- **Authentication** — JWT-based login with role-based permissions (Administrator,
  Warehouse Manager, Warehouse Staff)

## Tech Stack

**Frontend:** React 19, Vite, Tailwind CSS, React Router, Recharts, Axios

**Backend:** Node.js, Express, MongoDB/Mongoose, JWT, bcryptjs, Google Generative AI (Gemini)

**Infrastructure:** Docker, Docker Compose, Nginx (serves the built frontend)

## API Overview

Base URL: `http://localhost:5000/api`

| Route | Description |
| --- | --- |
| `/auth` | Login, current user |
| `/medicines` | Medicine catalog CRUD |
| `/batches` | Batch CRUD |
| `/inventory` | Stock in/out transactions |
| `/users` | User management (admin only) |
| `/reports` | Inventory, expiry, and stock movement reports |
| `/ai` | AI forecasting, insights, and chat |

## Scripts Reference

**Frontend** (`pharmatrack-ai-frontend/`):
- `npm run dev` — start the Vite dev server
- `npm run build` — production build
- `npm run lint` — run ESLint
- `npm run preview` — preview the production build

**Backend** (`pharmatrack-ai-backend/`):
- `npm run dev` — start the API with nodemon (auto-restart)
- `npm start` — start the API
- `npm run seed` — seed MongoDB with sample data and users

## Docker Compose Reference

Run from the project root:

- `docker compose up -d --build` — build images and start `mongo`, `backend`, `frontend`
- `docker compose ps` — list running containers and their ports
- `docker compose logs -f [service]` — tail logs (`mongo`, `backend`, or `frontend`)
- `docker compose exec backend npm run seed` — seed/reset the database
- `docker compose restart backend` — restart a service (e.g. after editing `.env`)
- `docker compose down` — stop and remove containers (add `-v` to also delete the MongoDB volume)
