import { z } from 'zod';
import { paginationQuerySchema } from './common';

export const productBodySchema = z.object({
  name: z.string().min(1),
  sku: z.string().min(1),
  category: z.string().min(1),
  unitPrice: z.coerce.number().nonnegative(),
  currentStock: z.coerce.number().int().nonnegative().optional(),
  minStockAlert: z.coerce.number().int().nonnegative().default(0),
  location: z.string().min(1),
  isActive: z.boolean().optional(),
});

export const productUpdateSchema = productBodySchema.partial();

export const productQuerySchema = paginationQuerySchema.extend({
  lowStock: z
    .union([z.literal('true'), z.literal('false'), z.boolean()])
    .optional()
    .transform((v) => v === true || v === 'true'),
  isActive: z
    .union([z.literal('true'), z.literal('false'), z.boolean()])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === true || v === 'true')),
  category: z.string().optional(),
});
