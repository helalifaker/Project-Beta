/**
 * Rent template detail API routes
 * GET: Get template
 * PUT: Update template
 * DELETE: Delete template
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';

import { NotFoundError } from '@/lib/api/errors';
import { applyApiMiddleware, withErrorHandling } from '@/lib/api/middleware';
import { successResponse } from '@/lib/api/response';
import { idParamSchema } from '@/lib/api/schemas';
import { rentTemplateRepository } from '@/lib/db/repositories/rent-template-repository';

const updateRentTemplateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  params: z.record(z.unknown()).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  return withErrorHandling(async () => {
    await applyApiMiddleware(request, {
      requireAuth: true,
    });

    const { id } = await params;
    const validated = idParamSchema.parse({ id });

    const template = await rentTemplateRepository.findUnique({
      id: validated.id,
    });

    if (!template) {
      throw new NotFoundError('Rent template', validated.id);
    }

    return successResponse(template);
  })();
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  return withErrorHandling(async () => {
    const { body } = await applyApiMiddleware(request, {
      requireAuth: true,
      requireRole: 'ADMIN',
      validateBody: updateRentTemplateSchema,
    });

    const { id } = await params;
    const validated = idParamSchema.parse({ id });
    const updateData = body as z.infer<typeof updateRentTemplateSchema>;

    // Filter out undefined values for exactOptionalPropertyTypes
    const updateInput: {
      name?: string;
      params?: Record<string, unknown>;
    } = {};
    if (updateData.name !== undefined) {
      updateInput.name = updateData.name;
    }
    if (updateData.params !== undefined) {
      updateInput.params = updateData.params;
    }

    const template = await rentTemplateRepository.update(
      { id: validated.id },
      updateInput
    );

    return successResponse(template);
  })();
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  return withErrorHandling(async () => {
    await applyApiMiddleware(request, {
      requireAuth: true,
      requireRole: 'ADMIN',
    });

    const { id } = await params;
    const validated = idParamSchema.parse({ id });

    await rentTemplateRepository.delete({ id: validated.id });

    return successResponse({ success: true });
  })();
}

