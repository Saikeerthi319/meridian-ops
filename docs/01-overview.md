# 1. Project Overview

## What is this project?

**Meridian Ops** is a small internal web app for a wholesale / distribution company.

Employees use it to:

1. **Log in** with different roles (Admin, Sales, Warehouse, Accounts)
2. Manage **customers** (CRM — notes and follow-ups)
3. Manage **products** and **stock**
4. Create **sales challans** (delivery documents) that update stock safely

It is a **case study / portfolio project**, not a full SAP-style ERP. The goal is to show real full-stack skills: APIs, database design, UI, auth, and business rules.

## Who uses it?

| Role | Typical job in this app |
|---|---|
| **Admin** | Can do everything |
| **Sales** | Customers + create/confirm challans |
| **Warehouse** | Products + stock in/out |
| **Accounts** | Mostly view data; can cancel confirmed challans |

There is **no public signup**. Demo users are created by a seed script.

## What is in the repo?

```text
Case Study/
├── backend/     → API server (Node + Express + Prisma)
├── frontend/    → Web UI (React + Vite + Tailwind)
├── postman/     → Ready-made API requests
├── docs/        → These fresher guides
├── PRD.md       → Product decisions
└── README.md    → Quick start + deploy notes
```

This is a **monorepo**: one Git repository that contains both frontend and backend.

## Tech stack (simple meaning)

| Piece | Tech | Simple meaning |
|---|---|---|
| Frontend | React + TypeScript | The screens users see |
| Styling | Tailwind CSS | Utility classes for layout/colors |
| Data fetching | TanStack Query + axios | Load/save data from API |
| Backend | Express + TypeScript | Receives HTTP requests, runs business logic |
| Validation | Zod | Checks request data is valid |
| Database | PostgreSQL | Stores users, customers, products, challans |
| ORM | Prisma | TypeScript-friendly way to talk to SQL |
| Auth | JWT + bcrypt | Login tokens + hashed passwords |

## What we deliberately did NOT build

To stay focused for a case study:

- Purchase orders
- Full invoicing / payments
- Multi-warehouse stock engines
- User admin screen
- PDF export / S3 uploads

Those are fine as later bonuses, but not required for the core story.

## Success look like?

A fresher should be able to:

1. Run frontend + backend locally
2. Log in as each role
3. Add a customer and a follow-up
4. Adjust stock
5. Create a draft challan → confirm it → see stock drop
6. Cancel a confirmed challan as Accounts → see stock return

Next: [Setup Guide](./02-setup-guide.md)
