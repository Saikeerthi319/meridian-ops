# PRD: Mini ERP + CRM Operations Portal

## Problem Statement

A wholesale/distribution company needs a small internal operations portal so sales, warehouse, and accounts staff can manage customers, products/stock, and sales challans with role-based access. The goal is a credible full-stack system (APIs, database design, UI, deployment) that demonstrates real business flow—especially stock-safe challan confirmation—not a sprawling ERP.

## Solution

A monorepo Mini ERP/CRM with JWT role-based login, customer CRM (including follow-up history), product/inventory with stock movement logs, and sales challans that reduce or restore stock transactionally. Internal employees use a responsive admin UI; the API is REST over Express + PostgreSQL; the app deploys on free-tier hosting (Vercel + Render + Neon) with seeded demo users for every role.

## User Stories

1. As an employee, I want to log in with email and password, so that only authorized staff can use the system.
2. As an employee, I want my session to use a JWT, so that I stay authenticated across page navigations without re-entering credentials every time.
3. As an employee, I want to log out, so that others cannot use my session on a shared machine.
4. As an Admin, I want full access to all modules, so that I can operate and oversee the whole portal.
5. As a Sales user, I want to manage customers and challans, so that I can run the sales workflow end to end.
6. As a Warehouse user, I want to manage products and stock movements, so that inventory stays accurate.
7. As an Accounts user, I want read access across modules and the ability to cancel confirmed challans, so that I can correct issued documents and keep stock consistent.
8. As a Sales user, I want to be blocked from adjusting stock manually, so that warehouse controls inventory integrity.
9. As a Warehouse user, I want customers and challans read-only, so that I can see demand context without changing CRM or sales documents.
10. As any authenticated user, I want routes and API actions enforced by role, so that the UI and backend agree on permissions.
11. As a Sales user, I want to add a customer with name, mobile, email, business name, optional GST, type, address, status, follow-up date, and notes, so that leads and accounts are captured completely.
12. As a Sales user, I want to edit customer details, so that CRM data stays current.
13. As a Sales user, I want to search and filter customers, so that I can find the right account quickly.
14. As a Sales user, I want a customer detail page, so that I can see the full profile and history in one place.
15. As a Sales user, I want to add follow-up notes with optional next follow-up date, so that CRM activity is tracked over time.
16. As a Sales user, I want the customer’s current follow-up date updated when I add a follow-up, so that “due” views stay accurate.
17. As a Sales or Accounts user, I want to see follow-up history on the customer detail page, so that I understand prior conversations.
18. As a Sales user, I want customer type values Retail, Wholesale, and Distributor, so that pricing/segmentation context is clear.
19. As a Sales user, I want customer status values Lead, Active, and Inactive, so that pipeline state is visible without deleting records.
20. As an Admin, I want the same customer capabilities as Sales, so that I can support the CRM when needed.
21. As a Warehouse user, I want to view customers, so that I can verify delivery/account context.
22. As an Accounts user, I want to view customers, so that I can support document and account checks.
23. As a Warehouse user, I want to add a product with name, SKU, category, unit price, current stock, minimum stock alert quantity, and location string, so that catalog and stock baselines exist.
24. As a Warehouse user, I want to edit product details, so that catalog data stays correct.
25. As a Warehouse user, I want to mark a product inactive instead of deleting it, so that historical challans remain coherent.
26. As any authorized viewer, I want to search products and filter low-stock items, so that replenishment needs are obvious.
27. As a Warehouse user, I want to record a stock movement IN or OUT with reason, so that manual adjustments are audited.
28. As a Warehouse user, I want stock movements to update current stock and refuse negative stock, so that inventory cannot go below zero.
29. As any authorized viewer, I want a stock movement log showing product, quantity changed, type, reason, created by, and timestamp, so that stock changes are traceable.
30. As a Sales user, I want to view products and stock levels, so that I only sell what is available.
31. As an Accounts user, I want to view products and movements, so that I can audit inventory-related documents.
32. As a Sales user, I want to create a sales challan for a customer with multiple product lines and quantities, so that I can prepare a delivery document.
33. As a Sales user, I want a challan number generated automatically as `CH-YYYYMMDD-XXXX`, so that documents are uniquely identifiable.
34. As a Sales user, I want to save a challan as Draft, so that I can finish it later without affecting stock.
35. As a Sales user, I want to edit Draft challans (customer and lines), so that I can correct mistakes before confirmation.
36. As a Sales user, I want to confirm a challan, so that stock is reserved/issued for that sale.
37. As a Sales user, I want confirmation to fail with a clear error when stock is insufficient, so that I know which lines cannot be fulfilled.
38. As the system, I want confirmation to run in a single database transaction (stock checks, reductions, movement logs, status update), so that partial updates cannot corrupt inventory.
39. As the system, I want each challan line to store product snapshot fields (product id, name, SKU, unit price, quantity), so that historical documents remain accurate after catalog changes.
40. As a Sales user, I want confirmed challan lines to be immutable, so that issued documents stay stable.
41. As an Accounts (or Admin) user, I want to cancel a Confirmed challan, so that mistaken issues can be reversed.
42. As the system, I want cancelling a Confirmed challan to restore stock and write IN movements, so that inventory returns to the correct level.
43. As a Sales user, I want to cancel a Draft challan without stock changes, so that abandoned drafts do not affect inventory.
44. As any authorized viewer, I want challan list/detail views with status Draft, Confirmed, or Cancelled, so that document state is clear.
45. As any authorized viewer, I want to see who created a challan and when, so that ownership is auditable.
46. As an employee, I want a light dashboard with role-aware counts, low-stock items, and follow-ups due, so that I can prioritize daily work.
47. As an employee, I want a sidebar/topbar admin layout with my role shown, so that navigation is clear and consistent.
48. As an employee, I want unauthorized menu items and routes blocked, so that I am not confused by actions I cannot perform.
49. As an API consumer, I want consistent success/error envelopes with pagination metadata, so that clients handle responses uniformly.
50. As an API consumer, I want input validation errors with field-level messages, so that forms can show precise feedback.
51. As an evaluator, I want seeded users for Admin, Sales, Warehouse, and Accounts with known passwords, so that I can test every role quickly.
52. As an evaluator, I want sample customers, products, movements, and challans seeded, so that the demo is not an empty shell.
53. As a developer, I want environment variables for database, JWT secret, and CORS/frontend URL, so that secrets are not hard-coded.
54. As a developer, I want a README covering local setup, env vars, deploy steps, architecture, assumptions, and limitations, so that the project is reproducible.
55. As an evaluator, I want a Postman collection (or equivalent API docs), so that I can exercise the REST API without the UI.
56. As an evaluator, I want a live frontend and backend on free-tier hosting, so that I can review without local setup.
57. As a developer, I want Prisma migrations and a seed script, so that schema and demo data are repeatable.
58. As any user, I want list endpoints to support pagination and search/filter where relevant, so that large datasets remain usable.

## Implementation Decisions

### Architecture
- Monorepo with `backend/` and `frontend/` deployed separately.
- Backend: Node.js, TypeScript, Express.
- Database: PostgreSQL via Prisma (schema, migrations, seed).
- Frontend: Vite, React, TypeScript, Tailwind CSS, React Router, TanStack Query, axios.
- Auth: JWT access token in memory + `localStorage`, sent as `Authorization: Bearer`; role and userId in payload; bcrypt password hashes; no refresh tokens in v1.
- Deploy: Frontend on Vercel, API on Render, database on Neon.

### Domain modules
- Auth & roles: Admin, Sales, Warehouse, Accounts.
- Customers CRM: required fields from the case study; status Lead/Active/Inactive; type Retail/Wholesale/Distributor.
- Follow-ups: append-only follow-up history plus current `followUpDate` / notes fields on customer.
- Products & inventory: single `currentStock` per product; `location` as plain string; `isActive` (or equivalent) instead of delete; minimum stock alert quantity for low-stock filters/dashboard.
- Stock movements: IN/OUT with reason, actor, timestamp; created by warehouse adjustments and by challan confirm/cancel.
- Sales challans: header + lines; statuses Draft, Confirmed, Cancelled; automatic challan numbers `CH-YYYYMMDD-XXXX`.

### Role matrix
- Admin: full access.
- Sales: full customers/CRM; challans create/edit draft/confirm; products read-only; no manual stock adjustments.
- Warehouse: products full; stock movements create + view; customers/challans read-only.
- Accounts: read-mostly across customers/products/challans/movements; can cancel confirmed challans (restocks).

### Challan / stock rules
- Draft: editable; no stock impact; can be cancelled without stock impact.
- Confirm: transactional stock check and reduction; refuse negative stock with clear API error; write OUT movements (reason tied to challan confirm); status → Confirmed.
- Cancel confirmed: restore stock; write IN movements (reason tied to challan cancel); status → Cancelled; lines remain immutable snapshots.
- Confirmed/Cancelled: lines not editable.
- Line snapshot at minimum: productId, productName, sku, unitPrice, quantity.

### Persistence / delete policy
- No hard deletes for customers or products in v1.
- Customers use status; products use active/inactive.
- Challans use status transitions, not row deletion.

### API conventions
- REST resources roughly: auth login; customers; customer follow-ups; products; stock movements; challans (including confirm/cancel actions).
- Zod validation for bodies and query params.
- Response envelope:
  - Success: `{ success: true, data, meta? }` where `meta` holds pagination (`page`, `limit`, `total`).
  - Error: `{ success: false, message, errors? }` with optional field errors.
- Proper HTTP status codes (401/403/400/404/409 as appropriate).
- Pagination and search/filter on list endpoints that need them.

### Frontend IA
- Screens: Login; light role-aware dashboard; Customers list/detail; Products list/create-edit + stock adjust for Warehouse/Admin; Stock movements log; Challans list/create-edit/detail with confirm/cancel.
- Layout: sidebar + topbar (user, role, logout).
- Route guards by role; axios interceptor attaches JWT; TanStack Query invalidates related queries after mutations.
- No Users admin screen in v1 (seeded users suffice).

### Seed data
- Users: `admin@demo.com`, `sales@demo.com`, `warehouse@demo.com`, `accounts@demo.com` — password `Password@123` for all.
- Sample customers (mixed type/status), products (some below min stock), stock movements, one Draft challan, one Confirmed challan.

### Documentation / submission artifacts
- README: architecture, local run, env vars, deploy, assumptions, known limitations.
- Postman collection (or API documentation).
- Test credentials for all roles.
- Live frontend and backend URLs when deployed.

## Testing Decisions

### What makes a good test
- Test external behavior through stable seams (HTTP API and critical domain outcomes), not Prisma internals or React implementation details.
- Prefer assertions on status codes, response envelopes, DB-visible outcomes (stock quantity, movement rows, challan status), and authorization failures.
- Keep tests deterministic via seed/fixtures and isolated database transactions or a dedicated test database when available.

### Proposed seams (greenfield — no existing test seams)
1. **HTTP API seam (primary):** Supertest (or equivalent) against the Express app for auth, RBAC, customers, products, stock movements, and challans.
2. **Domain transaction seam:** Challan confirm/cancel service behavior asserted via API (or thin service tests) for stock math, movement creation, and insufficient-stock errors.
3. **Optional UI smoke:** Manual checklist / short recording of login → create customer → adjust stock → confirm challan → cancel challan; automated E2E is not required for v1 unless time allows.

Please confirm these seams are acceptable before heavy test implementation; default assumption is API-first automated tests plus manual UI demo path.

### Modules to test (priority)
- Auth login and protected-route rejection.
- Role authorization on representative mutating endpoints.
- Customer create/search and follow-up append + followUpDate update.
- Product create and stock movement IN/OUT (including negative-stock rejection).
- Challan draft create/edit; confirm happy path; confirm insufficient stock; cancel confirmed restock; draft cancel without stock change.
- Challan number uniqueness/format for a given day.

### Prior art
- None yet (greenfield repository). Establish a small backend test harness early and reuse it across modules.

## Out of Scope

- Purchase order module.
- Full invoicing, payments, or accounting ledgers.
- Multi-warehouse stock quantities (location remains a string on product).
- Refresh-token / httpOnly-cookie auth.
- Hard deletes of customers/products.
- Admin user-management UI.
- AWS deployment, S3 product image upload.
- GitHub Actions deployment pipeline.
- Invoice/challan PDF export (nice-if-time only, not committed in this PRD).
- Docker (nice-if-time only for local Postgres/API).
- Mobile-native apps.
- Real-time notifications / websocket updates.

## Further Notes

- Source of requirements: Full Stack Developer Case Study — Mini ERP + CRM Operations Portal; design locked via grill session.
- AWS is optional bonus per the case study; free-tier deploy satisfies submission expectations.
- If deploy is blocked, fallback allowed by the case study: working local setup, screen recording, Postman collection, clear README — but the intended path remains Vercel + Render + Neon.
- Assumptions to document in README: single stock pool per product; Accounts may cancel confirmed challans with automatic restock; no self-registration; GST optional; product inactivation preferred over deletion.
- Known limitation to call out if incomplete: any unfinished bonus ideas (Docker, PDF, CI) should be listed explicitly in the submission README rather than left ambiguous.
