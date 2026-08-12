import { CustomerStatus, CustomerType, Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { AppError } from '../utils/AppError';

type ListParams = {
  page: number;
  limit: number;
  search?: string;
  status?: CustomerStatus;
  type?: CustomerType;
};

export async function listCustomers(params: ListParams) {
  const where: Prisma.CustomerWhereInput = {};
  if (params.status) where.status = params.status;
  if (params.type) where.type = params.type;
  if (params.search) {
    where.OR = [
      { name: { contains: params.search, mode: 'insensitive' } },
      { mobile: { contains: params.search, mode: 'insensitive' } },
      { email: { contains: params.search, mode: 'insensitive' } },
      { businessName: { contains: params.search, mode: 'insensitive' } },
    ];
  }

  const [total, data] = await Promise.all([
    prisma.customer.count({ where }),
    prisma.customer.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      skip: (params.page - 1) * params.limit,
      take: params.limit,
    }),
  ]);

  return { data, meta: { page: params.page, limit: params.limit, total } };
}

export async function getCustomer(id: string) {
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      followUps: {
        orderBy: { createdAt: 'desc' },
        include: { createdBy: { select: { id: true, name: true, email: true } } },
      },
    },
  });
  if (!customer) throw new AppError(404, 'Customer not found');
  return customer;
}

export async function createCustomer(input: Prisma.CustomerCreateInput) {
  return prisma.customer.create({ data: input });
}

export async function updateCustomer(id: string, input: Prisma.CustomerUpdateInput) {
  await getCustomer(id);
  return prisma.customer.update({ where: { id }, data: input });
}

export async function addFollowUp(
  customerId: string,
  createdById: string,
  note: string,
  followUpDate?: Date | null,
) {
  await getCustomer(customerId);

  return prisma.$transaction(async (tx) => {
    const followUp = await tx.followUp.create({
      data: {
        customerId,
        createdById,
        note,
        followUpDate: followUpDate ?? null,
      },
      include: { createdBy: { select: { id: true, name: true, email: true } } },
    });

    await tx.customer.update({
      where: { id: customerId },
      data: {
        notes: note,
        ...(followUpDate !== undefined ? { followUpDate: followUpDate } : {}),
      },
    });

    return followUp;
  });
}

export async function listFollowUps(customerId: string) {
  await getCustomer(customerId);
  return prisma.followUp.findMany({
    where: { customerId },
    orderBy: { createdAt: 'desc' },
    include: { createdBy: { select: { id: true, name: true, email: true } } },
  });
}
