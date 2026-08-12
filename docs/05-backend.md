# 5. Backend Guide

Folder: `backend/`

## What the backend does

The backend is the **brain**:

- checks login
- enforces roles
- validates input
- applies business rules
- reads/writes the database
- returns JSON responses

## Folder map

```text
backend/
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── src/
│   ├── server.ts          → starts the HTTP server
│   ├── app.ts             → creates Express app (middleware + routes)
│   ├── config/env.ts      → loads and validates env vars
│   ├── lib/prisma.ts      → shared Prisma client
│   ├── middleware/        → auth, validate, error handler
│   ├── routes/            → URL definitions
│   ├── controllers/       → request/response glue
│   ├── services/          → business logic
│   ├── validators/        → Zod schemas
│   ├── utils/             → helpers (response shape, challan number)
│   └── tests/             → API tests (Vitest + Supertest)
├── .env.example
└── package.json
```

## Startup flow

1. `npm run dev` runs `tsx watch src/server.ts`
2. `server.ts` loads env + creates app + listens on `PORT`
3. `app.ts` mounts:
   - CORS
   - JSON body parser
   - `/health`
   - `/api/*` routes
   - error handler

## One request example

`POST /api/customers` with Sales JWT:

1. `routes/customerRoutes.ts` matches the path
2. `requireAuth` verifies JWT
3. `requireRoles(ADMIN, SALES)` checks permission
4. `validate({ body: customerBodySchema })` runs Zod
5. `customerController.create` calls service
6. `customerService.createCustomer` uses Prisma
7. Controller returns success JSON
8. If anything throws, `errorHandler` formats the error

## Important middleware

### `requireAuth`

- Reads `Authorization: Bearer ...`
- Verifies JWT
- Sets `req.user = { userId, role, email }`

### `requireRoles(...)`

- Allows only listed roles
- Returns `403` if role is wrong

### `validate(...)`

- Parses/validates `body`, `query`, or `params`
- Bad input → `400` with field errors

### `errorHandler`

Converts errors into:

```json
{
  "success": false,
  "message": "Something readable",
  "errors": [{ "field": "email", "message": "Invalid email" }]
}
```

## Services you should know

| Service | Job |
|---|---|
| `authService` | Login + password check + JWT |
| `customerService` | Customer CRUD + follow-ups |
| `productService` | Product CRUD + filters |
| `stockService` | Manual stock IN/OUT |
| `challanService` | Draft/confirm/cancel + stock transactions |
| `dashboardService` | Counts, low stock, follow-ups due |

## Response shape (always)

Success:

```json
{
  "success": true,
  "data": {},
  "meta": { "page": 1, "limit": 10, "total": 42 }
}
```

`meta` is used for paginated lists.

## Testing mindset

Tests live in `src/tests/api.test.ts`.

They hit the real Express app with Supertest and check:

- login works
- wrong role is blocked
- stock cannot go negative
- challan confirm/cancel updates stock correctly

Run:

```bash
cd backend
npm test
```

## Fresher tips

1. Start reading from `app.ts` → `routes` → one service.
2. Don’t put SQL/business rules inside routes.
3. When adding a feature: validator → service → controller → route → test.
4. Keep error messages useful for UI and Postman.

Next: [Frontend Guide](./06-frontend.md)
