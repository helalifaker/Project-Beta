/**
 * Curriculum template detail API routes
 * GET: Get template
 * PUT: Update template
 * DELETE: Delete template
 */

import { NextRequest } from 'next/server';
import { applyApiMiddleware, withErrorHandling } from '@/lib/api/middleware';
import { successResponse } from '@/lib/api/response';
import { idParamSchema } from '@/lib/api/schemas';
import { curriculumTemplateRepository } from '@/lib/db/repositories/curriculum-template-repository';
import { NotFoundError } from '@/lib/api/errors';
import { z } from 'zod';

const updateCurriculumTemplateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  capacity: z.number().int().positive().optional(),
  tuitionBase: z.number().positive().optional(),
  cpiRate: z.number().min(0).max(1).optional(),
  cpiFrequency: z.enum(['ANNUAL', 'EVERY_2_YEARS', 'EVERY_3_YEARS']).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    const { session } = await applyApiMiddleware(request, {
      requireAuth: true,
    });

    const { id } = await params;
    const validated = idParamSchema.parse({ id });

    const template = await curriculumTemplateRepository.findUnique({
      id: validated.id,
    });

    if (!template) {
      throw new NotFoundError('Curriculum template', validated.id);
    }

    return successResponse(template);
  })();
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    const { session, body } = await applyApiMiddleware(request, {
      requireAuth: true,
      requireRole: 'ADMIN',
      validateBody: updateCurriculumTemplateSchema,
    });

    const { id } = await params;
    const validated = idParamSchema.parse({ id });

    const template = await curriculumTemplateRepository.update(
      { id: validated.id },
      body as z.infer<typeof updateCurriculumTemplateSchema>
    );

    return successResponse(template);
  })();
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    const { session } = await applyApiMiddleware(request, {
      requireAuth: true,
      requireRole: 'ADMIN',
    });

    const { id } = await params;
    const validated = idParamSchema.parse({ id });

    await curriculumTemplateRepository.delete({ id: validated.id });

    return successResponse({ success: true });
  })();
}

