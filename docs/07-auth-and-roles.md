# 7. Auth & Roles

## Why auth exists

Without login, anyone could change stock or customer data.  
Auth answers two questions:

1. **Who are you?** (authentication)
2. **What are you allowed to do?** (authorization / roles)

## Login flow

```text
User enters email + password
        ↓
POST /api/auth/login
        ↓
Backend finds user, compares bcrypt hash
        ↓
Backend signs JWT with secret
        ↓
Frontend stores token
        ↓
Later requests send Bearer token
```

### Password storage

- Plain password is **never** saved
- We store a **bcrypt hash**
- Login uses `bcrypt.compare(password, passwordHash)`

### JWT payload

Token contains useful claims such as:

- `userId`
- `role`
- `email`
- expiry (`exp`)

Backend trusts the token only after verifying signature with `JWT_SECRET`.

## Where token lives

This project uses:

- `localStorage` for persistence across refresh
- React state/context while the app is open

Tradeoff (good for a case study):

- Simple to build and demo in Postman/UI
- Less strict than httpOnly cookies against XSS

For learning: understand the tradeoff; don’t pretend it is the most secure possible design.

## Role matrix

| Action | Admin | Sales | Warehouse | Accounts |
|---|---|---|---|---|
| Manage customers | Yes | Yes | View | View |
| Add follow-ups | Yes | Yes | No | No |
| Manage products | Yes | View | Yes | View |
| Manual stock IN/OUT | Yes | No | Yes | No |
| Create/edit draft challan | Yes | Yes | View | View |
| Confirm challan | Yes | Yes | No | No |
| Cancel draft challan | Yes | Yes | No | No |
| Cancel confirmed challan | Yes | No | No | Yes |

## How backend enforces this

Example from routes:

```ts
requireAuth
requireRoles(Role.ADMIN, Role.WAREHOUSE)
```

If token missing/invalid → `401`  
If role not allowed → `403`

Challan cancel has extra logic in the service:

- Draft cancel → Admin/Sales
- Confirmed cancel → Admin/Accounts (+ stock restore)

## How frontend enforces this

- `RequireAuth` blocks unauthenticated routes
- `hasRole('ADMIN', 'SALES')` shows/hides buttons
- Some routes (like `/challans/new`) are role-guarded

Always remember: frontend checks improve UX; backend checks are the real security.

## Demo users

Created by `prisma/seed.ts`:

| Email | Role |
|---|---|
| `admin@demo.com` | ADMIN |
| `sales@demo.com` | SALES |
| `warehouse@demo.com` | WAREHOUSE |
| `accounts@demo.com` | ACCOUNTS |

Password for all: `Password@123`

## Practice exercise for freshers

1. Login as Sales → try creating a product (should fail)
2. Login as Warehouse → try creating a challan (should fail)
3. Login as Accounts → cancel a confirmed challan (should work)
4. Watch Network tab status codes (`401` / `403` / `200`)

Next: [Business Flows](./08-business-flows.md)
