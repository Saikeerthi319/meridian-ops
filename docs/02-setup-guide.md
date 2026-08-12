# 2. Setup Guide

This guide helps a fresher run the project on Windows (same idea on Mac/Linux).

## Prerequisites

Install these first:

1. **Node.js** 18+ (20+ is better) — https://nodejs.org
2. **npm** (comes with Node)
3. **Docker Desktop** (easy way to run PostgreSQL) — or any Postgres install
4. A code editor like **Cursor / VS Code**

Check versions in terminal:

```bash
node -v
npm -v
docker -v
```

## Step 1 — Start PostgreSQL

With Docker:

```bash
docker run -d --name mini-erp-pg ^
  -e POSTGRES_PASSWORD=postgres ^
  -e POSTGRES_DB=mini_erp ^
  -p 5432:5432 ^
  postgres:16-alpine
```

On Mac/Linux use `\` instead of `^` for line breaks, or put it on one line.

If the container already exists:

```bash
docker start mini-erp-pg
```

## Step 2 — Backend setup

```bash
cd backend
copy .env.example .env
npm install
npx prisma migrate dev
npm run db:seed
npm run dev
```

On Mac/Linux: `cp .env.example .env`

You should see something like:

```text
API listening on http://localhost:4000
```

### What those commands do

| Command | Meaning |
|---|---|
| `npm install` | Download backend libraries |
| `prisma migrate dev` | Create/update database tables |
| `npm run db:seed` | Insert demo users + sample data |
| `npm run dev` | Start API in watch mode |

### Important `.env` values

File: `backend/.env`

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mini_erp?schema=public"
JWT_SECRET="mini-erp-dev-secret-change-in-production"
JWT_EXPIRES_IN="24h"
PORT=4000
CORS_ORIGIN="http://localhost:5173"
NODE_ENV="development"
```

- `DATABASE_URL` → where Postgres lives
- `JWT_SECRET` → used to sign login tokens
- `CORS_ORIGIN` → which frontend URL is allowed

## Step 3 — Frontend setup

Open a **second** terminal:

```bash
cd frontend
copy .env.example .env
npm install
npm run dev
```

Open: http://localhost:5173

Frontend env:

```env
VITE_API_URL=http://localhost:4000/api
```

## Step 4 — Login and explore

Use:

- Email: `admin@demo.com`
- Password: `Password@123`

Try the other roles too. Permissions change by role.

## Common problems

### `EADDRINUSE: address already in use :::4000`

Something is already using port 4000 (often an old API process).

PowerShell:

```powershell
Get-NetTCPConnection -LocalPort 4000 -State Listen |
  ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

Then run `npm run dev` again.

### Database connection errors

- Is Docker Desktop running?
- Is container `mini-erp-pg` up? (`docker ps`)
- Does `DATABASE_URL` match your Postgres username/password/db name?

### Frontend cannot call API

- Is backend running on port 4000?
- Is `VITE_API_URL` correct?
- Did you restart frontend after changing `.env`? (Vite reads env at start)

### Prisma client out of date

```bash
cd backend
npx prisma generate
```

## Useful scripts

### Backend

```bash
npm run dev          # start API
npm test             # run API tests
npm run db:seed      # re-seed demo data
npm run build        # compile TypeScript
```

### Frontend

```bash
npm run dev          # start UI
npm run build        # production build
```

## Optional — try APIs in Postman

1. Open Postman
2. Import `postman/Mini-ERP-CRM.postman_collection.json`
3. Run **Login Admin** first (it saves the token)
4. Call other requests

Next: [Architecture](./03-architecture.md)
