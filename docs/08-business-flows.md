# 8. Business Flows

This page explains the real company workflows the app supports.

## Flow A — Customer CRM

### Goal

Capture buyers/leads and track follow-ups.

### Steps

1. Sales/Admin opens **Customers**
2. Adds customer details (name, mobile, business, type, status…)
3. Opens customer detail page
4. Adds a follow-up note (+ optional next date)
5. Customer’s latest note / follow-up date updates
6. History list shows older follow-ups

### Why both notes field + history?

- `Customer.notes` / `followUpDate` = quick current state (good for filters/dashboard)
- `FollowUp` table = full timeline

### Status meaning

| Status | Meaning |
|---|---|
| LEAD | Potential customer |
| ACTIVE | Ongoing business |
| INACTIVE | Not currently dealing |

We do not hard-delete customers.

---

## Flow B — Product + stock adjustment

### Goal

Keep catalog and inventory accurate.

### Steps

1. Warehouse/Admin creates a product (SKU, price, location, min alert…)
2. Opening stock can be set at create time
3. Later, warehouse clicks **Adjust**
4. Chooses IN or OUT + quantity + reason
5. System updates `currentStock`
6. A `StockMovement` row is written

### Safety rule

Stock cannot go below zero.

If warehouse tries to take out more than available:

- API returns `400`
- message mentions SKU and available quantity
- DB is unchanged for that failed operation

### Low stock

If `currentStock <= minStockAlert`, product appears in:

- Products “low stock” filter
- Dashboard low-stock list

---

## Flow C — Sales challan (most important)

A **challan** is a delivery document: which customer gets which products and quantities.

### C1. Create draft

1. Sales selects customer
2. Adds one or more product lines + quantities
3. System generates challan number: `CH-YYYYMMDD-XXXX`
4. Status = `DRAFT`
5. **Stock does not change yet**

Draft can still be edited.

### C2. Confirm challan

1. Sales/Admin clicks **Confirm**
2. Backend starts a transaction
3. For each line, checks enough stock
4. If any line fails → whole confirm fails
5. If all ok:
   - reduce stock
   - write OUT movements (`CHALLAN_CONFIRM ...`)
   - set status `CONFIRMED`
6. Line items stay as snapshots (immutable history)

### C3. Cancel draft

- Allowed for Admin/Sales
- Status becomes `CANCELLED`
- No stock change

### C4. Cancel confirmed

- Allowed for Admin/Accounts
- Stock is restored (IN movements with `CHALLAN_CANCEL ...`)
- Status becomes `CANCELLED`

```text
DRAFT ──confirm──► CONFIRMED ──cancel──► CANCELLED
  │
  └──cancel───────────────────────────► CANCELLED
```

---

## Why transactions matter here

Imagine confirm does:

1. reduce stock for item A
2. crash before item B

Without a transaction, inventory becomes wrong.  
With `prisma.$transaction`, either **all steps succeed** or **all roll back**.

---

## End-to-end practice path

Use this as a fresher demo script:

1. Login as **Sales** → create customer + follow-up
2. Login as **Warehouse** → create product / adjust stock IN
3. Login as **Sales** → create draft challan → confirm
4. Check product stock dropped + stock movement OUT exists
5. Login as **Accounts** → cancel that challan
6. Check stock restored + stock movement IN exists

Next: [API Guide](./09-api-guide.md)
