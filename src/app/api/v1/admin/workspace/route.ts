/**
 * Workspace settings API routes
 * GET: Get workspace settings
 * PUT: Update workspace settings
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';

import { applyApiMiddleware, withErrorHandling } from '@/lib/api/middleware';
import { successResponse } from '@/lib/api/response';
import { workspaceRepository } from '@/lib/db/repositories/workspace-repository';

const updateWorkspaceSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  baseCurrency: z.string().length(3).optional(),
  timezone: z.string().optional(),
  discountRate: z.number().min(0).max(1).optional(),
  cpiMin: z.number().min(0).max(1).optional(),
  cpiMax: z.number().min(0).max(1).optional(),
});

export const GET = withErrorHandling(async (request: NextRequest) => {
  await applyApiMiddleware(request, {
    requireAuth: true,
    requireRole: 'ADMIN',
  });

  const workspace = await workspaceRepository.getOrCreateDefault();

  return successResponse(workspace);
});

export const PUT = withErrorHandling(async (request: NextRequest) => {
  const { body } = await applyApiMiddleware(request, {
    requireAuth: true,
    requireRole: 'ADMIN',
    validateBody: updateWorkspaceSchema,
  });

  const workspace = await workspaceRepository.getOrCreateDefault();
  const validatedBody = body as z.infer<typeof updateWorkspaceSchema>;
  const updateData: Parameters<typeof workspaceRepository.updateSettings>[1] = {};

  if (validatedBody.name !== undefined) updateData.name = validatedBody.name;
  if (validatedBody.baseCurrency !== undefined)
    updateData.baseCurrency = validatedBody.baseCurrency;
  if (validatedBody.timezone !== undefined) updateData.timezone = validatedBody.timezone;
  if (validatedBody.discountRate !== undefined)
    updateData.discountRate = validatedBody.discountRate;
  if (validatedBody.cpiMin !== undefined) updateData.cpiMin = validatedBody.cpiMin;
  if (validatedBody.cpiMax !== undefined) updateData.cpiMax = validatedBody.cpiMax;

  const updated = await workspaceRepository.updateSettings(workspace.id, updateData);

  return successResponse(updated);
});
