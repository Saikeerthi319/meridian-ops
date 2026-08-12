# Meridian Ops — Mini ERP + CRM Operations Portal

Full-stack case study app for a wholesale/distribution company: JWT role-based auth, customer CRM, products/inventory with stock movement audit, and stock-safe sales challans.

## Architecture

```
frontend/   Vite + React + TypeScript + Tailwind + TanStack Query
backend/    Express + TypeScript + Prisma + PostgreSQL
postman/    API collection
docs/       Fresher-friendly project guides
PRD.md      Product requirements (design lock)
```

**New to this repo?** Start with [`docs/README.md`](docs/README.md).

- Frontend talks to REST API with `Authorization: Bearer <JWT>`
- Backend validates with Zod and returns a consistent envelope: `{ success, data, meta? }` / `{ success: false, message, errors? }`
- Challan confirm/cancel runs inside Prisma transactions and writes stock movements

### Roles

| Role | Capabilities |
|---|---|
| Admin | Full access |
| Sales | Customers + challans (draft/confirm); products read-only |
| Warehouse | Products + stock movements; customers/challans read-only |
| Accounts | Read-mostly; can cancel **confirmed** challans (restocks) |

## Tech stack

- **Backend:** Node.js, Express, TypeScript, Prisma 5, PostgreSQL, Zod, JWT, bcryptjs
- **Frontend:** React 18, Vite 5, TypeScript, Tailwind CSS, React Router 6, TanStack Query, axios
- **Deploy targets:** Vercel (frontend) + Render (API) + Neon (Postgres)

## Local setup

### Prerequisites

- Node.js 18+ (20+ recommended)
- PostgreSQL (local Docker example below)
- npm 9+

### 1. Database

```bash
docker run -d --name mini-erp-pg \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=mini_erp \
  -p 5432:5432 \
  postgres:16-alpine
```

Or point `DATABASE_URL` at any Postgres instance (Neon works for local too).

### 2. Backend

```bash
cd backend
cp .env.example .env
# edit DATABASE_URL / JWT_SECRET / CORS_ORIGIN if needed
npm install
npx prisma migrate dev
npm run db:seed
npm run dev
```

API: `http://localhost:4000`  
Health: `GET /health`  
Routes: `/api/...`

### 3. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

App: `http://localhost:5173`

### Environment variables

**Backend (`backend/.env`)**

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Postgres connection string |
| `JWT_SECRET` | JWT signing secret |
| `JWT_EXPIRES_IN` | Token lifetime (default `24h`) |
| `PORT` | API port (default `4000`) |
| `CORS_ORIGIN` | Allowed frontend origin(s), comma-separated |
| `NODE_ENV` | `development` / `test` / `production` |

**Frontend (`frontend/.env`)**

| Variable | Purpose |
|---|---|
| `VITE_API_URL` | API base URL including `/api` |

## Demo credentials

Password for all users: `Password@123`

| Email | Role |
|---|---|
| `admin@demo.com` | Admin |
| `sales@demo.com` | Sales |
| `warehouse@demo.com` | Warehouse |
| `accounts@demo.com` | Accounts |

Seed also creates sample customers, products (some low-stock), stock movements, one draft challan, and one confirmed challan.

## API overview

| Method | Path | Notes |
|---|---|---|
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | Authed |
| GET/POST | `/api/customers` | Write: Admin, Sales |
| GET/PATCH | `/api/customers/:id` | Write: Admin, Sales |
| GET/POST | `/api/customers/:id/follow-ups` | Write: Admin, Sales |
| GET/POST | `/api/products` | Write: Admin, Warehouse |
| GET/PATCH | `/api/products/:id` | Write: Admin, Warehouse |
| GET/POST | `/api/stock-movements` | Write: Admin, Warehouse |
| GET/POST | `/api/challans` | Create: Admin, Sales |
| GET/PATCH | `/api/challans/:id` | Draft edit: Admin, Sales |
| POST | `/api/challans/:id/confirm` | Admin, Sales |
| POST | `/api/challans/:id/cancel` | Draft: Admin/Sales; Confirmed: Admin/Accounts |
| GET | `/api/dashboard` | Authed aggregates |

Postman collection: [`postman/Mini-ERP-CRM.postman_collection.json`](postman/Mini-ERP-CRM.postman_collection.json)

## Tests

```bash
cd backend
npm test
```

Covers login, RBAC denial, insufficient stock, challan confirm + cancel restock.

## Deployment

### Neon (database)

1. Create a free Neon project
2. Copy the connection string into Render as `DATABASE_URL`
3. From `backend/`: `npx prisma migrate deploy` and `npm run db:seed` (against Neon)

### Render (API)

1. New Web Service from this repo
2. Root directory: `backend`
3. Build: `npm install && npx prisma generate && npm run build`
4. Start: `npx prisma migrate deploy && npm start`
5. Set env: `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN` (your Vercel URL), `NODE_ENV=production`

### Vercel (frontend)

1. Import repo, root directory `frontend`
2. Framework preset: Vite
3. Env: `VITE_API_URL=https://<your-render-service>.onrender.com/api`
4. Deploy

### Server setup notes

- Free Render services may cold-start; first request can be slow
- Never commit real `.env` secrets
- After deploy, re-seed only if you want demo data on the hosted DB

## Business rules (key)

- Draft challans do not change stock
- Confirm reduces stock in one transaction; refuses negatives with a clear error
- Confirmed cancel restores stock and writes IN movements
- Challan lines store product snapshots (name, SKU, unit price, qty)
- Challan numbers: `CH-YYYYMMDD-XXXX`
- No hard deletes — customers use status; products use `isActive`

## Assumptions

- Single stock pool per product; location is a string field
- No self-registration; users are seeded / managed outside the UI
- GST is optional
- Accounts (and Admin) may cancel confirmed challans

## Known limitations

- No purchase orders or full invoicing module
- No PDF export / S3 image upload / GitHub Actions / Docker Compose (optional bonuses not required for core)
- No admin user-management screen
- No refresh tokens / httpOnly cookie auth
- Free-tier hosting cold starts

## Project docs

- Case study brief: `Full Stack Developer Case Study (1).pdf`
- Product requirements: [`PRD.md`](PRD.md)
