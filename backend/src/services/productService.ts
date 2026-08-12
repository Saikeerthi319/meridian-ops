import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { AppError } from '../utils/AppError';

type ListParams = {
  page: number;
  limit: number;
  search?: string;
  lowStock?: boolean;
  isActive?: boolean;
  category?: string;
};

export async function listProducts(params: ListParams) {
  const where: Prisma.ProductWhereInput = {};
  if (params.category) where.category = params.category;
  if (params.isActive !== undefined) where.isActive = params.isActive;
  if (params.search) {
    where.OR = [
      { name: { contains: params.search, mode: 'insensitive' } },
      { sku: { contains: params.search, mode: 'insensitive' } },
      { category: { contains: params.search, mode: 'insensitive' } },
    ];
  }
  if (params.lowStock) {
    where.AND = [
      ...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []),
      { isActive: true },
    ];
  }

  let data;
  let total;

  if (params.lowStock) {
    const all = await prisma.product.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
    });
    const filtered = all.filter((p) => p.currentStock <= p.minStockAlert);
    total = filtered.length;
    data = filtered.slice(
      (params.page - 1) * params.limit,
      params.page * params.limit,
    );
  } else {
    [total, data] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
      }),
    ]);
  }

  return { data, meta: { page: params.page, limit: params.limit, total } };
}

export async function getProduct(id: string) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw new AppError(404, 'Product not found');
  return product;
}

export async function createProduct(input: {
  name: string;
  sku: string;
  category: string;
  unitPrice: number;
  currentStock?: number;
  minStockAlert: number;
  location: string;
  isActive?: boolean;
}) {
  const existing = await prisma.product.findUnique({ where: { sku: input.sku } });
  if (existing) throw new AppError(409, 'SKU already exists');

  return prisma.product.create({
    data: {
      name: input.name,
      sku: input.sku,
      category: input.category,
      unitPrice: input.unitPrice,
      currentStock: input.currentStock ?? 0,
      minStockAlert: input.minStockAlert,
      location: input.location,
      isActive: input.isActive ?? true,
    },
  });
}

export async function updateProduct(
  id: string,
  input: Partial<{
    name: string;
    sku: string;
    category: string;
    unitPrice: number;
    minStockAlert: number;
    location: string;
    isActive: boolean;
  }>,
) {
  await getProduct(id);
  if (input.sku) {
    const existing = await prisma.product.findFirst({
      where: { sku: input.sku, NOT: { id } },
    });
    if (existing) throw new AppError(409, 'SKU already exists');
  }

  return prisma.product.update({
    where: { id },
    data: {
      ...input,
      unitPrice: input.unitPrice !== undefined ? input.unitPrice : undefined,
    },
  });
}
