/**
 * Common API validation schemas
 * Reusable Zod schemas for API validation
 */

import { z } from 'zod';

/**
 * Pagination schema
 */
export const paginationSchema = z.object({
  page: z
    .string()
    .optional()
    .default('1')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive()),
  limit: z
    .string()
    .optional()
    .default('20')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive().max(100)),
});

/**
 * Sort schema
 */
export const sortSchema = z.object({
  sort: z.string().optional().default('createdAt'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
});

/**
 * ID parameter schema
 */
export const idParamSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});

/**
 * User role schema
 */
export const userRoleSchema = z.enum(['ADMIN', 'ANALYST', 'VIEWER']);

/**
 * Email schema
 */
export const emailSchema = z.string().email('Invalid email address');

/**
 * Password schema
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password must be less than 100 characters');

/**
 * Date range schema
 */
export const dateRangeSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

/**
 * Filter schema (generic)
 */
export const filterSchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  role: userRoleSchema.optional(),
});

