/**
 * Version detail API routes
 * GET: Get version
 * PUT: Update version
 * DELETE: Delete version (soft delete)
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';

import { NotFoundError, ForbiddenError } from '@/lib/api/errors';
import { applyApiMiddleware, withErrorHandling } from '@/lib/api/middleware';
import { successResponse } from '@/lib/api/response';
import { idParamSchema } from '@/lib/api/schemas';
import { getOrSetCached, invalidateCacheByPrefix, invalidateCacheKey } from '@/lib/cache/kv';
import { versionRepository } from '@/lib/db/repositories/version-repository';

// Note: Cannot use edge runtime with Prisma (requires Node.js)
// Using caching instead for performance
export const revalidate = 60; // Cache for 60 seconds

const updateVersionSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  status: z.enum(['DRAFT', 'READY', 'LOCKED', 'ARCHIVED']).optional(),
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

    // Cache key for version
    const cacheKey = `version:${validated.id}`;

    // Get version with caching
    const version = await getOrSetCached(
      cacheKey,
      () => versionRepository.findUnique({ id: validated.id }),
      { ttl: 60 } // Cache for 60 seconds
    );

    if (!version) {
      throw new NotFoundError('Version', validated.id);
    }

    return successResponse(version, 200, undefined, { revalidate: 60 });
  })();
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  return withErrorHandling(async () => {
    const { session, body } = await applyApiMiddleware(request, {
      requireAuth: true,
      validateBody: updateVersionSchema,
    });

    if (!session?.user) {
      throw new Error('Session not found');
    }

    const { id } = await params;
    const validated = idParamSchema.parse({ id });

    // Check if version exists
    const existing = await versionRepository.findUnique({ id: validated.id });
    if (!existing) {
      throw new NotFoundError('Version', validated.id);
    }

    // Check if locked
    if (existing.lockedAt) {
      throw new ForbiddenError('Version is locked and cannot be modified');
    }

    // Check ownership or admin role
    if (existing.ownerId !== session.user.id && session.user.role !== 'ADMIN') {
      throw new ForbiddenError('You do not have permission to modify this version');
    }

    // Handle status update separately (has validation)
    const bodyData = body as Record<string, unknown> | null;
    if (bodyData && typeof bodyData === 'object' && 'status' in bodyData && bodyData.status) {
      const updated = await versionRepository.updateStatus(
        validated.id,
        bodyData.status as 'DRAFT' | 'READY' | 'LOCKED' | 'ARCHIVED',
        session.user.id
      );

      // Invalidate cache
      await Promise.all([
        invalidateCacheKey(`version:${validated.id}`),
        invalidateCacheByPrefix('versions:'),
      ]).catch(() => {
        // Ignore cache invalidation errors
      });

      return successResponse(updated);
    }

    // Regular update
    // Body is already validated by middleware with updateVersionSchema
    // Filter out undefined values to satisfy exactOptionalPropertyTypes
    const validatedBody = body as z.infer<typeof updateVersionSchema>;
    const updateData: {
      name?: string;
      description?: string;
      status?: 'DRAFT' | 'READY' | 'LOCKED' | 'ARCHIVED';
    } = {};

    if (validatedBody.name !== undefined) {
      updateData.name = validatedBody.name;
    }
    if (validatedBody.description !== undefined) {
      updateData.description = validatedBody.description;
    }
    if (validatedBody.status !== undefined) {
      updateData.status = validatedBody.status;
    }

    const updated = await versionRepository.update({ id: validated.id }, updateData);

    // Invalidate cache
    await Promise.all([
      invalidateCacheKey(`version:${validated.id}`),
      invalidateCacheByPrefix('versions:'),
    ]).catch(() => {
      // Ignore cache invalidation errors
    });

    return successResponse(updated);
  })();
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  return withErrorHandling(async () => {
    await applyApiMiddleware(request, {
      requireAuth: true,
      requireRole: 'ADMIN', // Only ADMIN can delete
    });

    const { id } = await params;
    const validated = idParamSchema.parse({ id });

    const version = await versionRepository.softDelete(validated.id);

    // Invalidate cache
    await Promise.all([
      invalidateCacheKey(`version:${validated.id}`),
      invalidateCacheByPrefix('versions:'),
    ]).catch(() => {
      // Ignore cache invalidation errors
    });

    return successResponse(version);
  })();
}
