import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../app';
import { prisma } from '../lib/prisma';

const app = createApp();

async function login(email: string) {
  const res = await request(app).post('/api/auth/login').send({
    email,
    password: 'Password@123',
  });
  expect(res.status).toBe(200);
  return res.body.data.token as string;
}

describe('Mini ERP API', () => {
  beforeAll(async () => {
    const users = await prisma.user.count();
    if (users === 0) {
      throw new Error('Database not seeded. Run npm run db:seed first.');
    }
  });

  it('logs in and returns JWT user', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'admin@demo.com',
      password: 'Password@123',
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeTruthy();
    expect(res.body.data.user.role).toBe('ADMIN');
  });

  it('rejects invalid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'admin@demo.com',
      password: 'wrong',
    });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('blocks sales from creating products', async () => {
    const token = await login('sales@demo.com');
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Blocked',
        sku: 'BLK-1',
        category: 'Test',
        unitPrice: 10,
        minStockAlert: 1,
        location: 'Test',
      });
    expect(res.status).toBe(403);
  });

  it('rejects negative stock on manual OUT', async () => {
    const token = await login('warehouse@demo.com');
    const product = await prisma.product.findFirst({ where: { sku: 'TEA-1' } });
    expect(product).toBeTruthy();

    const res = await request(app)
      .post('/api/stock-movements')
      .set('Authorization', `Bearer ${token}`)
      .send({
        productId: product!.id,
        type: 'OUT',
        quantity: product!.currentStock + 1000,
        reason: 'Overdraw test',
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Insufficient stock/i);
  });

  it('confirms challan, reduces stock, and cancels with restock', async () => {
    const salesToken = await login('sales@demo.com');
    const accountsToken = await login('accounts@demo.com');

    const customer = await prisma.customer.findFirst({ where: { status: 'ACTIVE' } });
    const product = await prisma.product.findFirst({ where: { sku: 'SALT-25' } });
    expect(customer && product).toBeTruthy();

    const before = product!.currentStock;
    const qty = Math.min(2, before);

    const createRes = await request(app)
      .post('/api/challans')
      .set('Authorization', `Bearer ${salesToken}`)
      .send({
        customerId: customer!.id,
        items: [{ productId: product!.id, quantity: qty }],
      });
    expect(createRes.status).toBe(201);
    const challanId = createRes.body.data.id as string;
    expect(createRes.body.data.challanNumber).toMatch(/^CH-\d{8}-\d{4}$/);

    const confirmRes = await request(app)
      .post(`/api/challans/${challanId}/confirm`)
      .set('Authorization', `Bearer ${salesToken}`);
    expect(confirmRes.status).toBe(200);
    expect(confirmRes.body.data.status).toBe('CONFIRMED');

    const afterConfirm = await prisma.product.findUnique({ where: { id: product!.id } });
    expect(afterConfirm!.currentStock).toBe(before - qty);

    const cancelRes = await request(app)
      .post(`/api/challans/${challanId}/cancel`)
      .set('Authorization', `Bearer ${accountsToken}`);
    expect(cancelRes.status).toBe(200);
    expect(cancelRes.body.data.status).toBe('CANCELLED');

    const afterCancel = await prisma.product.findUnique({ where: { id: product!.id } });
    expect(afterCancel!.currentStock).toBe(before);
  });

  it('rejects confirm when stock is insufficient', async () => {
    const salesToken = await login('sales@demo.com');
    const customer = await prisma.customer.findFirst();
    const product = await prisma.product.findFirst({ where: { sku: 'OIL-5' } });
    expect(customer && product).toBeTruthy();

    const createRes = await request(app)
      .post('/api/challans')
      .set('Authorization', `Bearer ${salesToken}`)
      .send({
        customerId: customer!.id,
        items: [{ productId: product!.id, quantity: product!.currentStock + 50 }],
      });
    expect(createRes.status).toBe(201);

    const confirmRes = await request(app)
      .post(`/api/challans/${createRes.body.data.id}/confirm`)
      .set('Authorization', `Bearer ${salesToken}`);
    expect(confirmRes.status).toBe(400);
    expect(confirmRes.body.message).toMatch(/Insufficient stock/i);
  });
});
