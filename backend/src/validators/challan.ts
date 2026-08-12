import { ChallanStatus } from '@prisma/client';
import { z } from 'zod';
import { paginationQuerySchema } from './common';

const itemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().int().positive(),
});

export const challanBodySchema = z.object({
  customerId: z.string().min(1),
  items: z.array(itemSchema).min(1),
});

export const challanUpdateSchema = challanBodySchema.partial().extend({
  items: z.array(itemSchema).min(1).optional(),
});

export const challanQuerySchema = paginationQuerySchema.extend({
  status: z.nativeEnum(ChallanStatus).optional(),
  customerId: z.string().optional(),
});
