import { MovementType, Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { AppError } from '../utils/AppError';

type ListParams = {
  page: number;
  limit: number;
  productId?: string;
  type?: MovementType;
  search?: string;
};

export async function listMovements(params: ListParams) {
  const where: Prisma.StockMovementWhereInput = {};
  if (params.productId) where.productId = params.productId;
  if (params.type) where.type = params.type;
  if (params.search) {
    where.OR = [
      { reason: { contains: params.search, mode: 'insensitive' } },
      { product: { name: { contains: params.search, mode: 'insensitive' } } },
      { product: { sku: { contains: params.search, mode: 'insensitive' } } },
    ];
  }

  const [total, data] = await Promise.all([
    prisma.stockMovement.count({ where }),
    prisma.stockMovement.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (params.page - 1) * params.limit,
      take: params.limit,
      include: {
        product: { select: { id: true, name: true, sku: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    }),
  ]);

  return { data, meta: { page: params.page, limit: params.limit, total } };
}

export async function createManualMovement(input: {
  productId: string;
  quantity: number;
  type: MovementType;
  reason: string;
  createdById: string;
}) {
  return prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({ where: { id: input.productId } });
    if (!product) throw new AppError(404, 'Product not found');
    if (!product.isActive) throw new AppError(400, 'Cannot adjust stock for inactive product');

    const nextStock =
      input.type === MovementType.IN
        ? product.currentStock + input.quantity
        : product.currentStock - input.quantity;

    if (nextStock < 0) {
      throw new AppError(
        400,
        `Insufficient stock for SKU ${product.sku}. Available: ${product.currentStock}`,
      );
    }

    await tx.product.update({
      where: { id: product.id },
      data: { currentStock: nextStock },
    });

    return tx.stockMovement.create({
      data: {
        productId: product.id,
        quantity: input.quantity,
        type: input.type,
        reason: input.reason,
        createdById: input.createdById,
      },
      include: {
        product: { select: { id: true, name: true, sku: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });
  });
}
