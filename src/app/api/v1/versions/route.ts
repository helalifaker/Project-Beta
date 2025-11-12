/**
 * Version API routes
 * GET: List versions
 * POST: Create version
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';

import { applyApiMiddleware, withErrorHandling } from '@/lib/api/middleware';
import { successResponse, paginatedResponse } from '@/lib/api/response';
import { paginationSchema, filterSchema } from '@/lib/api/schemas';
import { canPerformAction } from '@/lib/auth/rbac';
import { getOrSetCached, invalidateCacheByPrefix } from '@/lib/cache/kv';
import { versionRepository } from '@/lib/db/repositories/version-repository';

// Note: Cannot use edge runtime with Prisma (requires Node.js)
// Using caching instead for performance
export const revalidate = 60; // Cache for 60 seconds

const createVersionSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  baseVersionId: z.string().uuid().optional(),
});

export const GET = withErrorHandling(async (request: NextRequest) => {
  const { query } = await applyApiMiddleware(request, {
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

  // Generate cache key
  const cacheKey = `versions:${status || 'all'}:${search || ''}:${page}:${limit}`;

  // Get versions with caching and database pagination
  const result = await getOrSetCached(
    cacheKey,
    () => versionRepository.findWithFilters(filters, { page, limit }),
    { ttl: 60 } // Cache for 60 seconds
  );

  // Handle both array (old cache) and object (new format) responses
  // Type guard to ensure we have the correct format
  const paginatedVersions = Array.isArray(result) ? result : (result?.data ?? []);
  const total = Array.isArray(result) ? result.length : (result?.total ?? 0);

  // Ensure paginatedVersions is an array
  if (!Array.isArray(paginatedVersions)) {
    throw new Error('Invalid cache format: expected array or object with data array');
  }

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + paginatedVersions.length;

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
    request.headers.get('x-request-id')
      ? { requestId: request.headers.get('x-request-id')! }
      : undefined,
    { revalidate: 60 } // Cache for 60 seconds
  );
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  const { session, body } = await applyApiMiddleware(request, {
    requireAuth: true,
    validateBody: createVersionSchema,
  });

  if (!session?.user) {
    throw new Error('Session not found');
  }

  // Check if user can create versions (ADMIN or ANALYST)
  const canCreate = canPerformAction(session.user.role, 'versions:create');
  if (!canCreate.allowed) {
    throw new Error('FORBIDDEN');
  }

  const { name, description, baseVersionId } = body as z.infer<typeof createVersionSchema>;

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
  // Filter out undefined values to satisfy exactOptionalPropertyTypes
  const createData: {
    name: string;
    description?: string;
    ownerId: string;
    baseVersionId?: string;
  } = {
    name,
    ownerId: session.user.id,
  };

  if (description !== undefined) {
    createData.description = description;
  }
  if (baseVersionId !== undefined) {
    createData.baseVersionId = baseVersionId;
  }

  const version = await versionRepository.create(createData);

  // Invalidate versions cache
  await invalidateCacheByPrefix('versions:').catch(() => {
    // Ignore errors - cache invalidation is best effort
  });

  return successResponse(version, 201);
});
