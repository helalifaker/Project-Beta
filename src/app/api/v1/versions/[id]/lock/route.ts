/**
 * Version lock/unlock API routes
 * PUT: Lock or unlock version
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';

import { NotFoundError } from '@/lib/api/errors';
import { applyApiMiddleware, withErrorHandling } from '@/lib/api/middleware';
import { successResponse } from '@/lib/api/response';
import { idParamSchema } from '@/lib/api/schemas';
import { versionRepository } from '@/lib/db/repositories/version-repository';

const lockVersionSchema = z.object({
  action: z.enum(['lock', 'unlock']),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  return withErrorHandling(async () => {
    const { session, body } = await applyApiMiddleware(request, {
      requireAuth: true,
      requireRole: 'ADMIN', // Only ADMIN can lock/unlock
      validateBody: lockVersionSchema,
    });

    if (!session?.user) {
      throw new Error('Session not found');
    }

    const { id } = await params;
    const validated = idParamSchema.parse({ id });
    const { action } = body as z.infer<typeof lockVersionSchema>;

    const version = await versionRepository.findUnique({ id: validated.id });
    if (!version) {
      throw new NotFoundError('Version', validated.id);
    }

    let updated;
    if (action === 'lock') {
      updated = await versionRepository.lockVersion(validated.id, session.user.id);
    } else {
      updated = await versionRepository.unlockVersion(validated.id);
    }

    return successResponse(updated);
  })();
}

