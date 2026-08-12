import { ChallanStatus, CustomerStatus } from '@prisma/client';
import { prisma } from '../lib/prisma';

export async function getDashboard() {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [customerCount, productCount, draftChallans, confirmedChallans, products, followUpsDue] =
    await Promise.all([
      prisma.customer.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.challan.count({ where: { status: ChallanStatus.DRAFT } }),
      prisma.challan.count({ where: { status: ChallanStatus.CONFIRMED } }),
      prisma.product.findMany({
        where: { isActive: true },
        orderBy: { currentStock: 'asc' },
        take: 50,
      }),
      prisma.customer.findMany({
        where: {
          status: { in: [CustomerStatus.LEAD, CustomerStatus.ACTIVE] },
          followUpDate: { lte: new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000) },
        },
        orderBy: { followUpDate: 'asc' },
        take: 10,
      }),
    ]);

  const lowStock = products
    .filter((p) => p.currentStock <= p.minStockAlert)
    .slice(0, 10);

  return {
    counts: {
      customers: customerCount,
      activeProducts: productCount,
      draftChallans,
      confirmedChallans,
      lowStock: lowStock.length,
    },
    lowStock,
    followUpsDue,
  };
}
