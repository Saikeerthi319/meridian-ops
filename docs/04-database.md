# 4. Database Guide

## Why PostgreSQL?

This app has related data:

- a customer has many follow-ups
- a challan has many line items
- products have many stock movements

Relational SQL (Postgres) fits this well. We also need **transactions** for stock-safe challans.

## Prisma in one minute

Prisma is an **ORM** (Object-Relational Mapper).

Instead of writing raw SQL everywhere, you:

1. Define models in `backend/prisma/schema.prisma`
2. Run migrations to create tables
3. Use `prisma.customer.findMany()` in TypeScript

Key files:

| File | Purpose |
|---|---|
| `prisma/schema.prisma` | Tables + enums + relations |
| `prisma/migrations/` | History of schema changes |
| `prisma/seed.ts` | Demo data script |

## Main tables

### User

Stores employees who can log in.

Important fields:

- `email` (unique)
- `passwordHash` (never store plain password)
- `role` (`ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS`)

### Customer

CRM record for a buyer/lead.

Important fields:

- name, mobile, email, business name
- optional GST
- type: Retail / Wholesale / Distributor
- status: Lead / Active / Inactive
- `followUpDate`, `notes`

No hard delete — change status instead.

### FollowUp

History of CRM notes for a customer.

- belongs to one customer
- created by one user
- can include next follow-up date

### Product

Sellable item + current stock.

- unique `sku`
- `unitPrice`
- `currentStock`
- `minStockAlert`
- `location` (simple string, not a warehouse module)
- `isActive` (deactivate instead of delete)

### StockMovement

Audit log for stock changes.

- `type`: `IN` or `OUT`
- `quantity`, `reason`
- who created it
- optional link to a challan

### Challan

Sales delivery document header.

- unique `challanNumber` like `CH-20260812-0003`
- status: `DRAFT` / `CONFIRMED` / `CANCELLED`
- customer + createdBy
- `totalQuantity`

### ChallanItem

Line items with **snapshots**:

- product id
- product name / sku / unit price at that time
- quantity

Why snapshot? If product price/name changes later, old challans stay historically correct.

### DocumentSequence

Helps generate daily challan numbers (`CH-YYYYMMDD-XXXX`) without duplicates.

## Simple relationship map

```text
User ──< FollowUp >── Customer
User ──< StockMovement >── Product
User ──< Challan >── Customer
Challan ──< ChallanItem >── Product
Challan ──< StockMovement
```

`<` means “one-to-many”.

## Migrations vs seed

| Command | What it does |
|---|---|
| `npx prisma migrate dev` | Apply schema changes to DB |
| `npm run db:seed` | Insert demo users/data |
| `npx prisma studio` | Optional GUI to browse tables |

If you re-seed, existing demo data is wiped and recreated (seed script clears tables first).

## Fresher tips

1. Change schema in `schema.prisma`, then migrate — don’t edit production DB by hand.
2. Never commit real secrets from `.env`.
3. Prefer `isActive` / status fields over deleting important business rows.
4. Always think: “What happens to related rows?” before deleting anything.

Next: [Backend Guide](./05-backend.md)
