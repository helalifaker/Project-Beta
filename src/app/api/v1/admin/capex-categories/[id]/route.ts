/**
 * Capex category detail API routes
 * GET: Get category
 * PUT: Update category
 * DELETE: Delete category
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';

import { NotFoundError } from '@/lib/api/errors';
import { applyApiMiddleware, withErrorHandling } from '@/lib/api/middleware';
import { successResponse } from '@/lib/api/response';
import { idParamSchema } from '@/lib/api/schemas';
import { capexCategoryRepository } from '@/lib/db/repositories/capex-category-repository';

const updateCapexCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    await applyApiMiddleware(request, {
      requireAuth: true,
    });

    const { id } = await params;
    const validated = idParamSchema.parse({ id });

    const category = await capexCategoryRepository.findUnique({
      id: validated.id,
    });

    if (!category) {
      throw new NotFoundError('Capex category', validated.id);
    }

    return successResponse(category);
  })();
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    const { body } = await applyApiMiddleware(request, {
      requireAuth: true,
      requireRole: 'ADMIN',
      validateBody: updateCapexCategorySchema,
    });

    const { id } = await params;
    const validated = idParamSchema.parse({ id });

    const category = await capexCategoryRepository.update(
      { id: validated.id },
      body as z.infer<typeof updateCapexCategorySchema>
    );

    return successResponse(category);
  })();
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    await applyApiMiddleware(request, {
      requireAuth: true,
      requireRole: 'ADMIN',
    });

    const { id } = await params;
    const validated = idParamSchema.parse({ id });

    await capexCategoryRepository.delete({ id: validated.id });

    return successResponse({ success: true });
  })();
}

