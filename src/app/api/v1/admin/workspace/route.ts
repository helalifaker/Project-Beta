/**
 * Workspace settings API routes
 * GET: Get workspace settings
 * PUT: Update workspace settings
 */

import { NextRequest } from 'next/server';
import { applyApiMiddleware, withErrorHandling } from '@/lib/api/middleware';
import { successResponse } from '@/lib/api/response';
import { workspaceRepository } from '@/lib/db/repositories/workspace-repository';
import { z } from 'zod';

const updateWorkspaceSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  baseCurrency: z.string().length(3).optional(),
  timezone: z.string().optional(),
  discountRate: z.number().min(0).max(1).optional(),
  cpiMin: z.number().min(0).max(1).optional(),
  cpiMax: z.number().min(0).max(1).optional(),
});

export const GET = withErrorHandling(async (request: NextRequest) => {
  const { session } = await applyApiMiddleware(request, {
    requireAuth: true,
    requireRole: 'ADMIN',
  });

  const workspace = await workspaceRepository.getOrCreateDefault();

  return successResponse(workspace);
});

export const PUT = withErrorHandling(async (request: NextRequest) => {
  const { session, body } = await applyApiMiddleware(request, {
    requireAuth: true,
    requireRole: 'ADMIN',
    validateBody: updateWorkspaceSchema,
  });

  const workspace = await workspaceRepository.getOrCreateDefault();
  const updated = await workspaceRepository.updateSettings(workspace.id, body as z.infer<typeof updateWorkspaceSchema>);

  return successResponse(updated);
});
