/**
 * Capex categories API routes
 * GET: List capex categories
 * POST: Create capex category
 */

import { NextRequest } from 'next/server';
import { applyApiMiddleware, withErrorHandling } from '@/lib/api/middleware';
import { successResponse } from '@/lib/api/response';
import { capexCategoryRepository } from '@/lib/db/repositories/capex-category-repository';
import { z } from 'zod';

const createCapexCategorySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

export const GET = withErrorHandling(async (request: NextRequest) => {
  const { session } = await applyApiMiddleware(request, {
    requireAuth: true,
  });

  const categories = await capexCategoryRepository.findAllOrdered();

  return successResponse(categories);
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  const { session, body } = await applyApiMiddleware(request, {
    requireAuth: true,
    requireRole: 'ADMIN',
    validateBody: createCapexCategorySchema,
  });

  const category = await capexCategoryRepository.create(
    body as z.infer<typeof createCapexCategorySchema>
  );

  return successResponse(category, 201);
});

