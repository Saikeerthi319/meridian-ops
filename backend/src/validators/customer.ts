import { CustomerStatus, CustomerType } from '@prisma/client';
import { z } from 'zod';
import { paginationQuerySchema } from './common';

export const customerBodySchema = z.object({
  name: z.string().min(1),
  mobile: z.string().min(5),
  email: z.string().email(),
  businessName: z.string().min(1),
  gstNumber: z.string().optional().nullable(),
  type: z.nativeEnum(CustomerType),
  address: z.string().min(1),
  status: z.nativeEnum(CustomerStatus).optional(),
  followUpDate: z.coerce.date().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const customerUpdateSchema = customerBodySchema.partial();

export const customerQuerySchema = paginationQuerySchema.extend({
  status: z.nativeEnum(CustomerStatus).optional(),
  type: z.nativeEnum(CustomerType).optional(),
});

export const followUpBodySchema = z.object({
  note: z.string().min(1),
  followUpDate: z.coerce.date().optional().nullable(),
});
