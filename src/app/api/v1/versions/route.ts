/**
 * Version API routes
 * GET: List versions
 * POST: Create version
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';

import { NotFoundError } from '@/lib/api/errors';
import { applyApiMiddleware, withErrorHandling } from '@/lib/api/middleware';
import { successResponse, paginatedResponse } from '@/lib/api/response';
import { paginationSchema, filterSchema } from '@/lib/api/schemas';
import { versionRepository } from '@/lib/db/repositories/version-repository';

const createVersionSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  baseVersionId: z.string().uuid().optional(),
});

export const GET = withErrorHandling(async (request: NextRequest) => {
  const { session, query } = await applyApiMiddleware(request, {
    requireAuth: true,
    validateQuery: paginationSchema.merge(filterSchema),
  });

  const { page, limit, status, search } = query as {
    page: number;
    limit: number;
    status?: string;
    search?: string;
  };

  // Build filters
  const filters: Parameters<typeof versionRepository.findWithFilters>[0] = {};
  if (status) {
    filters.status = status as 'DRAFT' | 'READY' | 'LOCKED' | 'ARCHIVED';
  }
  if (search) {
    filters.search = search;
  }

  // Get versions
  const allVersions = await versionRepository.findWithFilters(filters);
  const total = allVersions.length;

  // Paginate
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedVersions = allVersions.slice(startIndex, endIndex);

  return paginatedResponse(
    paginatedVersions,
    {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: endIndex < total,
      hasPrev: page > 1,
    },
    {
      requestId: request.headers.get('x-request-id') || undefined,
    }
  );
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  const { session, body } = await applyApiMiddleware(request, {
    requireAuth: true,
    requireRole: 'ADMIN', // Only ADMIN and ANALYST can create versions
    validateBody: createVersionSchema,
  });

  if (!session?.user) {
    throw new Error('Session not found');
  }

  const { name, description, baseVersionId } = body as z.infer<
    typeof createVersionSchema
  >;

  // If baseVersionId provided, duplicate that version
  if (baseVersionId) {
    const duplicated = await versionRepository.duplicateVersion(
      baseVersionId,
      name,
      session.user.id
    );
    return successResponse(duplicated, 201);
  }

  // Create new version
  const version = await versionRepository.create({
    name,
    description,
    ownerId: session.user.id,
  });

  return successResponse(version, 201);
});

