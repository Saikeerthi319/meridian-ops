# 6. Frontend Guide

Folder: `frontend/`

## What the frontend does

The frontend is the **face** of the app:

- login screen
- sidebar layout
- tables and forms
- calls backend APIs
- shows loading / error states
- hides actions the role cannot perform

## Folder map

```text
frontend/src/
├── main.tsx               → React entry + QueryClient
├── App.tsx                → routes
├── index.css              → Tailwind + shared UI classes
├── api/
│   ├── client.ts          → axios instance + auth header
│   └── types.ts           → shared TypeScript types
├── auth/
│   ├── AuthContext.tsx    → user/token/login/logout
│   └── RequireAuth.tsx    → route guard
├── layouts/
│   └── AppLayout.tsx      → sidebar + topbar
├── components/
│   └── ui.tsx             → badges, pagination, spinners
└── pages/
    ├── LoginPage.tsx
    ├── DashboardPage.tsx
    ├── CustomersPage.tsx
    ├── CustomerDetailPage.tsx
    ├── ProductsPage.tsx
    ├── StockMovementsPage.tsx
    ├── ChallansPage.tsx
    ├── ChallanFormPage.tsx
    └── ChallanDetailPage.tsx
```

## How routing works

`App.tsx` uses React Router:

- `/login` → public
- everything else → wrapped in `RequireAuth`
- logged-in pages share `AppLayout`
- `/challans/new` also requires Admin or Sales

If there is no token, user is redirected to login.

## Auth on the frontend

`AuthContext` stores:

- `user`
- `token`
- `login()`
- `logout()`
- `hasRole(...)`

On login:

1. Call `POST /auth/login`
2. Save token + user in `localStorage`
3. Keep them in React state

`api/client.ts` automatically attaches:

```http
Authorization: Bearer <token>
```

## Data fetching with TanStack Query

Instead of only `useEffect + useState`, pages use:

```ts
useQuery({ queryKey: ['customers', page], queryFn: ... })
useMutation({ mutationFn: ..., onSuccess: invalidateQueries })
```

Why this is beginner-friendly once you learn it:

- loading/error states are easier
- after create/update, you can refresh related lists
- less manual cache code

Example flow:

1. Create customer mutation succeeds
2. Invalidate `['customers']`
3. List refetches automatically

## UI approach

- Tailwind utility classes
- Shared helpers in `components/ui.tsx` (` mag`, `PageHeader`, `Pagination`)
- Branding name in UI: **Meridian Ops**
- Admin-style layout: sidebar + content

You do **not** need a heavy component library (MUI/Ant) for this project.

## Role-aware UI

Examples:

- Sales can see “Add customer”
- Warehouse can see “Adjust stock”
- Accounts can cancel confirmed challans on detail page
- Sales cannot create products (button hidden + API also blocks)

Important: UI hiding is **not enough**. Backend must enforce roles too. This project does both.

## Pages and purpose

| Page | Purpose |
|---|---|
| Login | Authenticate |
| Dashboard | Counts, low stock, follow-ups due |
| Customers | Search/list + create |
| Customer detail | Edit + follow-up history |
| Products | Catalog + stock adjust |
| Stock movements | Audit log |
| Challans | List documents |
| New challan | Create draft |
| Challan detail | Confirm / cancel actions |

## Fresher tips

1. Learn one page end-to-end (Customers is a good start).
2. Follow the chain: Page → `api` call → backend route.
3. If UI looks right but action fails, check Network tab + backend error message.
4. After changing `.env`, restart `npm run dev`.

Next: [Auth & Roles](./07-auth-and-roles.md)
