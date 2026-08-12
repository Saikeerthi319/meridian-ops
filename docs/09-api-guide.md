# 9. API Guide

Base URL (local):

```text
http://localhost:4000/api
```

Health check (no `/api` prefix):

```text
GET http://localhost:4000/health
```

## Response format

### Success

```json
{
  "success": true,
  "data": {},
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 25
  }
}
```

### Error

```json
{
  "success": false,
  "message": "Insufficient stock for SKU OIL-5",
  "errors": [
    { "field": "email", "message": "Invalid email" }
  ]
}
```

`errors` is optional (mostly validation failures).

## Auth header

For protected routes:

```http
Authorization: Bearer <your_jwt_token>
```

Get token from:

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@demo.com",
  "password": "Password@123"
}
```

## Endpoint map

### Auth

| Method | Path | Who |
|---|---|---|
| POST | `/auth/login` | Public |
| GET | `/auth/me` | Any logged-in user |

### Customers

| Method | Path | Who |
|---|---|---|
| GET | `/customers` | All roles |
| POST | `/customers` | Admin, Sales |
| GET | `/customers/:id` | All roles |
| PATCH | `/customers/:id` | Admin, Sales |
| GET | `/customers/:id/follow-ups` | All roles |
| POST | `/customers/:id/follow-ups` | Admin, Sales |

Useful query params on list: `page`, `limit`, `search`, `status`, `type`

### Products

| Method | Path | Who |
|---|---|---|
| GET | `/products` | All roles |
| POST | `/products` | Admin, Warehouse |
| GET | `/products/:id` | All roles |
| PATCH | `/products/:id` | Admin, Warehouse |

Useful query params: `page`, `limit`, `search`, `lowStock=true`, `isActive=true`

### Stock movements

| Method | Path | Who |
|---|---|---|
| GET | `/stock-movements` | All roles |
| POST | `/stock-movements` | Admin, Warehouse |

Create body example:

```json
{
  "productId": "...",
  "quantity": 5,
  "type": "IN",
  "reason": "Purchase receipt"
}
```

### Challans

| Method | Path | Who |
|---|---|---|
| GET | `/challans` | All roles |
| POST | `/challans` | Admin, Sales |
| GET | `/challans/:id` | All roles |
| PATCH | `/challans/:id` | Admin, Sales (draft only) |
| POST | `/challans/:id/confirm` | Admin, Sales |
| POST | `/challans/:id/cancel` | Draft: Admin/Sales; Confirmed: Admin/Accounts |

Create body example:

```json
{
  "customerId": "...",
  "items": [
    { "productId": "...", "quantity": 2 }
  ]
}
```

### Dashboard

| Method | Path | Who |
|---|---|---|
| GET | `/dashboard` | All roles |

Returns counts, low-stock products, follow-ups due.

## Common status codes

| Code | Meaning in this project |
|---|---|
| 200 | OK |
| 201 | Created |
| 400 | Bad input / business rule failed (e.g. insufficient stock) |
| 401 | Not logged in / bad token |
| 403 | Logged in but role not allowed |
| 404 | Record not found |
| 409 | Conflict (e.g. duplicate SKU) |
| 500 | Unexpected server error |

## Try with Postman

1. Import `postman/Mini-ERP-CRM.postman_collection.json`
2. Run **Login Admin** (token is saved to collection variable)
3. Call list/create endpoints
4. For challan flows, put real IDs into `customerId`, `productId`, `challanId`

## Fresher debugging tips

1. Always check response `message` first.
2. If UI fails, reproduce the same call in Postman.
3. `401` → token missing/expired → login again.
4. `403` → wrong role for that action.
5. `400` on confirm → usually not enough stock.

Next: [Glossary](./10-glossary.md)
