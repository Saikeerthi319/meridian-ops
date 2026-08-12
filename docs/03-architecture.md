# 3. Architecture

## Big picture

```text
Browser (React app)
        |
        |  HTTPS / HTTP + JWT
        v
Express API (/api/...)
        |
        |  Prisma
        v
PostgreSQL database
```

- The **frontend never talks to the database directly**
- All business rules live in the **backend**
- The frontend is a client that calls REST APIs

## Why separate frontend and backend?

| Benefit | Why it matters |
|---|---|
| Clear jobs | UI team vs API/data team thinking |
| Independent deploy | Vercel for UI, Render for API |
| Security | DB credentials stay on server |
| Reuse | Same API can serve Postman, mobile later, etc. |

## Request journey (example: create customer)

1. User fills form in React
2. Frontend sends `POST /api/customers` with JWT header
3. Express middleware checks JWT and role
4. Zod validates body fields
5. Service saves row with Prisma
6. API returns `{ success: true, data: {...} }`
7. React Query refreshes the customer list

## Backend layers

Think of the backend as a pipeline:

```text
Route  →  Middleware  →  Controller  →  Service  →  Prisma/DB
```

| Layer | Responsibility |
|---|---|
| **Route** | URL + HTTP method mapping |
| **Middleware** | Auth, role checks, validation |
| **Controller** | Read request, call service, send response |
| **Service** | Business logic (stock rules, challan confirm, etc.) |
| **Prisma** | SQL via typed client |

Fresher tip: keep controllers thin. Put rules in services.

## Frontend structure idea

```text
Page (screen)
  → uses React Query / forms
  → calls api/client.ts (axios)
  → AuthContext holds user + token
  → AppLayout shows sidebar for logged-in users
```

## Auth at a glance

1. Login API returns a **JWT**
2. Frontend stores token in `localStorage` (+ memory via React state)
3. Every later request sends:

```http
Authorization: Bearer <token>
```

4. Backend verifies token and attaches `req.user`
5. Role middleware allows/denies the action

Details: [Auth & Roles](./07-auth-and-roles.md)

## Data consistency (important)

When a challan is **confirmed**:

- stock must decrease
- stock movement rows must be written
- challan status must become `CONFIRMED`

All of that happens in **one database transaction**.  
If any step fails, nothing is half-saved.

## Deployment shape

```text
Vercel  →  React static files
Render  →  Express API
Neon    →  PostgreSQL
```

Locally you use Docker Postgres + `localhost` servers instead.

Next: [Database Guide](./04-database.md)
