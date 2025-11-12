/**
 * Curriculum templates API routes
 * GET: List curriculum templates
 * POST: Create curriculum template
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';

import { applyApiMiddleware, withErrorHandling } from '@/lib/api/middleware';
import { successResponse } from '@/lib/api/response';
import { curriculumTemplateRepository } from '@/lib/db/repositories/curriculum-template-repository';
import { workspaceRepository } from '@/lib/db/repositories/workspace-repository';

const createCurriculumTemplateSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  capacity: z.number().int().positive(),
  launchYear: z.number().int().min(2023).max(2052).optional(),
  tuitionBase: z.number().positive(),
  cpiRate: z.number().min(0).max(1),
  cpiFrequency: z.enum(['ANNUAL', 'EVERY_2_YEARS', 'EVERY_3_YEARS']),
});

export async function GET(request: NextRequest): Promise<Response> {
  return withErrorHandling(async () => {
    await applyApiMiddleware(request, {
      requireAuth: true,
    });

    const workspace = await workspaceRepository.getOrCreateDefault();
    const templates = await curriculumTemplateRepository.findByWorkspace(workspace.id);

    return successResponse(templates);
  })();
}

export async function POST(request: NextRequest): Promise<Response> {
  return withErrorHandling(async () => {
    const { body } = await applyApiMiddleware(request, {
      requireAuth: true,
      requireRole: 'ADMIN',
      validateBody: createCurriculumTemplateSchema,
    });

    const workspace = await workspaceRepository.getOrCreateDefault();
    const createData = body as z.infer<typeof createCurriculumTemplateSchema>;
    const template = await curriculumTemplateRepository.create({
      ...createData,
      workspaceId: workspace.id,
      launchYear: createData.launchYear || 2028,
    });

    return successResponse(template, 201);
  })();
}

