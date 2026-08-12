# 10. Glossary

Simple meanings of words used in this project.

| Term | Meaning |
|---|---|
| **API** | Backend endpoints the frontend calls (usually JSON over HTTP) |
| **REST** | Style of API using URLs + HTTP methods (`GET`, `POST`, `PATCH`…) |
| **Endpoint** | One API URL + method, e.g. `POST /api/customers` |
| **Frontend** | UI running in the browser |
| **Backend** | Server that handles business logic and database |
| **Monorepo** | One repository containing frontend + backend |
| **PostgreSQL** | Relational database used here |
| **ORM** | Tool that maps DB tables to code objects (Prisma) |
| **Prisma** | Our ORM + migration tool |
| **Migration** | Versioned change to database structure |
| **Seed** | Script that inserts demo/starter data |
| **CRUD** | Create, Read, Update, Delete |
| **JWT** | JSON Web Token used after login |
| **Bearer token** | JWT sent in `Authorization` header |
| **bcrypt** | Algorithm to hash passwords |
| **RBAC** | Role-Based Access Control |
| **Middleware** | Code that runs before the route handler (auth/validation) |
| **Validation** | Checking request data is correct (Zod) |
| **Zod** | Schema validation library |
| **Transaction** | Group of DB writes that all succeed or all fail together |
| **SKU** | Stock Keeping Unit — unique product code |
| **Stock movement** | Record of stock going IN or OUT |
| **CRM** | Customer Relationship Management |
| **Lead** | Potential customer not fully active yet |
| **Challan** | Delivery/dispatch document for products sold/sent |
| **Draft** | Editable challan that has not affected stock |
| **Confirmed** | Finalized challan; stock already reduced |
| **Snapshot** | Copy of product details saved on challan lines |
| **CORS** | Browser security rule for cross-origin API calls |
| **Env variable** | Config value outside code (`.env`) |
| **TanStack Query** | React library for server data fetching/caching |
| **axios** | HTTP client used by frontend |
| **Supertest** | Test helper that calls Express APIs in tests |
| **Vitest** | Test runner used in backend |
| **Vercel / Render / Neon** | Free-tier hosting for frontend / API / database |

## If you get stuck

1. Re-read [Setup Guide](./02-setup-guide.md)
2. Check backend terminal errors
3. Check browser Network tab
4. Try the same call in Postman
5. Read the matching guide in this `docs/` folder

Back to index: [Docs Home](./README.md)
