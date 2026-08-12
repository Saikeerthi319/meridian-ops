import { ChallanStatus, MovementType, Prisma, Role } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { AppError } from '../utils/AppError';
import { nextChallanNumber } from '../utils/challanNumber';

type ItemInput = { productId: string; quantity: number };

type ListParams = {
  page: number;
  limit: number;
  search?: string;
  status?: ChallanStatus;
  customerId?: string;
};

async function buildItems(tx: Prisma.TransactionClient, items: ItemInput[]) {
  const productIds = items.map((i) => i.productId);
  const products = await tx.product.findMany({ where: { id: { in: productIds } } });
  const map = new Map(products.map((p) => [p.id, p]));

  const built = items.map((item) => {
    const product = map.get(item.productId);
    if (!product) throw new AppError(400, `Product not found: ${item.productId}`);
    if (!product.isActive) {
      throw new AppError(400, `Product ${product.sku} is inactive`);
    }
    return {
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      unitPrice: product.unitPrice,
      quantity: item.quantity,
    };
  });

  const totalQuantity = built.reduce((sum, i) => sum + i.quantity, 0);
  return { built, totalQuantity };
}

export async function listChallans(params: ListParams) {
  const where: Prisma.ChallanWhereInput = {};
  if (params.status) where.status = params.status;
  if (params.customerId) where.customerId = params.customerId;
  if (params.search) {
    where.OR = [
      { challanNumber: { contains: params.search, mode: 'insensitive' } },
      { customer: { name: { contains: params.search, mode: 'insensitive' } } },
      { customer: { businessName: { contains: params.search, mode: 'insensitive' } } },
    ];
  }

  const [total, data] = await Promise.all([
    prisma.challan.count({ where }),
    prisma.challan.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (params.page - 1) * params.limit,
      take: params.limit,
      include: {
        customer: { select: { id: true, name: true, businessName: true } },
        createdBy: { select: { id: true, name: true, email: true } },
        items: true,
      },
    }),
  ]);

  return { data, meta: { page: params.page, limit: params.limit, total } };
}

export async function getChallan(id: string) {
  const challan = await prisma.challan.findUnique({
    where: { id },
    include: {
      customer: true,
      createdBy: { select: { id: true, name: true, email: true } },
      items: true,
    },
  });
  if (!challan) throw new AppError(404, 'Challan not found');
  return challan;
}

export async function createChallan(
  createdById: string,
  customerId: string,
  items: ItemInput[],
) {
  return prisma.$transaction(async (tx) => {
    const customer = await tx.customer.findUnique({ where: { id: customerId } });
    if (!customer) throw new AppError(404, 'Customer not found');

    const { built, totalQuantity } = await buildItems(tx, items);
    const challanNumber = await nextChallanNumber(tx);

    return tx.challan.create({
      data: {
        challanNumber,
        customerId,
        createdById,
        status: ChallanStatus.DRAFT,
        totalQuantity,
        items: { create: built },
      },
      include: {
        customer: true,
        createdBy: { select: { id: true, name: true, email: true } },
        items: true,
      },
    });
  });
}

export async function updateDraftChallan(
  id: string,
  input: { customerId?: string; items?: ItemInput[] },
) {
  return prisma.$transaction(async (tx) => {
    const challan = await tx.challan.findUnique({ where: { id }, include: { items: true } });
    if (!challan) throw new AppError(404, 'Challan not found');
    if (challan.status !== ChallanStatus.DRAFT) {
      throw new AppError(400, 'Only draft challans can be edited');
    }

    if (input.customerId) {
      const customer = await tx.customer.findUnique({ where: { id: input.customerId } });
      if (!customer) throw new AppError(404, 'Customer not found');
    }

    let totalQuantity = challan.totalQuantity;
    if (input.items) {
      const { built, totalQuantity: total } = await buildItems(tx, input.items);
      totalQuantity = total;
      await tx.challanItem.deleteMany({ where: { challanId: id } });
      await tx.challanItem.createMany({
        data: built.map((b) => ({ ...b, challanId: id })),
      });
    }

    return tx.challan.update({
      where: { id },
      data: {
        customerId: input.customerId,
        totalQuantity,
      },
      include: {
        customer: true,
        createdBy: { select: { id: true, name: true, email: true } },
        items: true,
      },
    });
  });
}

export async function confirmChallan(id: string, userId: string) {
  return prisma.$transaction(async (tx) => {
    const challan = await tx.challan.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!challan) throw new AppError(404, 'Challan not found');
    if (challan.status !== ChallanStatus.DRAFT) {
      throw new AppError(400, 'Only draft challans can be confirmed');
    }
    if (!challan.items.length) {
      throw new AppError(400, 'Challan has no items');
    }

    for (const item of challan.items) {
      const product = await tx.product.findUnique({ where: { id: item.productId } });
      if (!product) {
        throw new AppError(400, `Product missing for SKU ${item.sku}`);
      }
      if (product.currentStock < item.quantity) {
        throw new AppError(
          400,
          `Insufficient stock for SKU ${item.sku}. Available: ${product.currentStock}, requested: ${item.quantity}`,
        );
      }
    }

    for (const item of challan.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { currentStock: { decrement: item.quantity } },
      });
      await tx.stockMovement.create({
        data: {
          productId: item.productId,
          quantity: item.quantity,
          type: MovementType.OUT,
          reason: `CHALLAN_CONFIRM ${challan.challanNumber}`,
          createdById: userId,
          challanId: challan.id,
        },
      });
    }

    return tx.challan.update({
      where: { id },
      data: { status: ChallanStatus.CONFIRMED },
      include: {
        customer: true,
        createdBy: { select: { id: true, name: true, email: true } },
        items: true,
      },
    });
  });
}

export async function cancelChallan(id: string, userId: string, role: Role) {
  return prisma.$transaction(async (tx) => {
    const challan = await tx.challan.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!challan) throw new AppError(404, 'Challan not found');

    if (challan.status === ChallanStatus.CANCELLED) {
      throw new AppError(400, 'Challan is already cancelled');
    }

    if (challan.status === ChallanStatus.DRAFT) {
      if (role !== Role.ADMIN && role !== Role.SALES) {
        throw new AppError(403, 'You do not have permission to cancel draft challans');
      }
      return tx.challan.update({
        where: { id },
        data: { status: ChallanStatus.CANCELLED },
        include: {
          customer: true,
          createdBy: { select: { id: true, name: true, email: true } },
          items: true,
        },
      });
    }

    // CONFIRMED
    if (role !== Role.ADMIN && role !== Role.ACCOUNTS) {
      throw new AppError(403, 'You do not have permission to cancel confirmed challans');
    }

    for (const item of challan.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { currentStock: { increment: item.quantity } },
      });
      await tx.stockMovement.create({
        data: {
          productId: item.productId,
          quantity: item.quantity,
          type: MovementType.IN,
          reason: `CHALLAN_CANCEL ${challan.challanNumber}`,
          createdById: userId,
          challanId: challan.id,
        },
      });
    }

    return tx.challan.update({
      where: { id },
      data: { status: ChallanStatus.CANCELLED },
      include: {
        customer: true,
        createdBy: { select: { id: true, name: true, email: true } },
        items: true,
      },
    });
  });
}
