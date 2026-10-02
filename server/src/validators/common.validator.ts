import mongoose from 'mongoose';
import { z } from 'zod';

/** A string that must be a valid Mongo ObjectId. */
export const objectId = z
  .string()
  .refine((v) => mongoose.Types.ObjectId.isValid(v), 'Invalid id');

export const idParamSchema = z.object({ id: objectId });

/** Shared list/query params: pagination, search, date range, sort direction. */
export const baseListQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  sort: z.enum(['newest', 'oldest', 'name_asc', 'name_desc']).default('newest'),
});

export type BaseListQuery = z.infer<typeof baseListQuery>;
