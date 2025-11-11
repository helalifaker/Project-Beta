/**
 * Version duplicate API route
 * POST: Duplicate version
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';

import { NotFoundError } from '@/lib/api/errors';
import { applyApiMiddleware, withErrorHandling } from '@/lib/api/middleware';
import { successResponse } from '@/lib/api/response';
import { idParamSchema } from '@/lib/api/schemas';
import { versionRepository } from '@/lib/db/repositories/version-repository';

const duplicateVersionSchema = z.object({
  name: z.string().min(1).max(200),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  return withErrorHandling(async () => {
    const { session, body } = await applyApiMiddleware(request, {
      requireAuth: true,
      validateBody: duplicateVersionSchema,
    });

    if (!session?.user) {
      throw new Error('Session not found');
    }

    const { id } = await params;
    const validated = idParamSchema.parse({ id });
    const { name } = body as z.infer<typeof duplicateVersionSchema>;

    // Check if source version exists
    const source = await versionRepository.findUnique({ id: validated.id });
    if (!source) {
      throw new NotFoundError('Version', validated.id);
    }

    const duplicated = await versionRepository.duplicateVersion(
      validated.id,
      name,
      session.user.id
    );

    return successResponse(duplicated, 201);
  })();
}

