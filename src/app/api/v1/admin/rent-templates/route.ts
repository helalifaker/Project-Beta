/**
 * Rent templates API routes
 * GET: List rent templates
 * POST: Create rent template
 */

import { NextRequest } from 'next/server';
import { applyApiMiddleware, withErrorHandling } from '@/lib/api/middleware';
import { successResponse } from '@/lib/api/response';
import { rentTemplateRepository } from '@/lib/db/repositories/rent-template-repository';
import { z } from 'zod';

const createRentTemplateSchema = z.object({
  name: z.string().min(1).max(200),
  type: z.enum(['FIXED_ESC', 'REV_SHARE', 'PARTNER']),
  params: z.record(z.unknown()),
});

export const GET = withErrorHandling(async (request: NextRequest) => {
  const { session } = await applyApiMiddleware(request, {
    requireAuth: true,
  });

  const templates = await rentTemplateRepository.findAll();

  return successResponse(templates);
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  const { session, body } = await applyApiMiddleware(request, {
    requireAuth: true,
    requireRole: 'ADMIN',
    validateBody: createRentTemplateSchema,
  });

  const template = await rentTemplateRepository.create(
    body as z.infer<typeof createRentTemplateSchema>
  );

  return successResponse(template, 201);
});

