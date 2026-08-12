import { MovementType } from '@prisma/client';
import { z } from 'zod';
import { paginationQuerySchema } from './common';

export const stockMovementBodySchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().int().positive(),
  type: z.nativeEnum(MovementType),
  reason: z.string().min(1),
});

export const stockMovementQuerySchema = paginationQuerySchema.extend({
  productId: z.string().optional(),
  type: z.nativeEnum(MovementType).optional(),
});
