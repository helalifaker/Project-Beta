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
import { versionRepository } from '@/lib/db/repositories/version-repository';

const updateVersionSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  status: z.enum(['DRAFT', 'READY', 'LOCKED', 'ARCHIVED']).optional(),
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

    const version = await versionRepository.findUnique({
      id: validated.id,
    });

    if (!version) {
      throw new NotFoundError('Version', validated.id);
    }

    return successResponse(version);
  })();
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    if (body && 'status' in body && body.status) {
      const updated = await versionRepository.updateStatus(
        validated.id,
        body.status as 'DRAFT' | 'READY' | 'LOCKED' | 'ARCHIVED',
        session.user.id
      );
      return successResponse(updated);
    }

    // Regular update
    const updated = await versionRepository.update(
      { id: validated.id },
      body as z.infer<typeof updateVersionSchema>
    );

    return successResponse(updated);
  })();
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    const { session } = await applyApiMiddleware(request, {
      requireAuth: true,
      requireRole: 'ADMIN', // Only ADMIN can delete
    });

    const { id } = await params;
    const validated = idParamSchema.parse({ id });

    const version = await versionRepository.softDelete(validated.id);

    return successResponse(version);
  })();
}

