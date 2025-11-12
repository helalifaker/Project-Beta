/**
 * Comparison API routes
 * GET: List comparison sets
 * POST: Create comparison set
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';

import { NotFoundError } from '@/lib/api/errors';
import { applyApiMiddleware, withErrorHandling } from '@/lib/api/middleware';
import { successResponse } from '@/lib/api/response';
import { versionRepository } from '@/lib/db/repositories/version-repository';

const createComparisonSchema = z.object({
  name: z.string().min(1).max(200),
  versionIds: z.array(z.string().uuid()).min(2).max(3), // 2-3 versions
  focusYear: z.number().int().min(2023).max(2052).optional(),
});

/**
 * GET /api/v1/compare
 * List comparison sets (for now, return empty array - will be implemented when comparison_set table exists)
 */
export async function GET(request: NextRequest): Promise<Response> {
  return withErrorHandling(async () => {
    await applyApiMiddleware(request, {
      requireAuth: true,
    });

    // TODO: Implement when comparison_set table exists
    return successResponse([]);
  })();
}

/**
 * POST /api/v1/compare
 * Create comparison set and return comparison data
 */
export async function POST(request: NextRequest): Promise<Response> {
  return withErrorHandling(async () => {
    const { session, body } = await applyApiMiddleware(request, {
      requireAuth: true,
      validateBody: createComparisonSchema,
    });

    if (!session?.user) {
      throw new Error('Session not found');
    }

    // Validate all versions exist
    const validatedBody = body as z.infer<typeof createComparisonSchema>;
    const versions = await Promise.all(
      validatedBody.versionIds.map((id) => versionRepository.findUnique({ id }))
    );

    const missingVersions = versions
      .map((v, i) => (v ? null : validatedBody.versionIds[i]))
      .filter((v): v is string => v !== null);

    if (missingVersions.length > 0) {
      throw new NotFoundError('Version', missingVersions.join(', '));
    }

    // Fetch statements for all versions
    const statementsPromises = validatedBody.versionIds.map(async (versionId) => {
      const response = await fetch(
        `${request.nextUrl.origin}/api/v1/versions/${versionId}/statements`,
        {
          headers: {
            Cookie: request.headers.get('Cookie') || '',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch statements for version ${versionId}`);
      }

      const data = await response.json();
      return {
        versionId,
        statements: data.data.statements,
        convergence: data.data.convergence,
      };
    });

    const statementsData = await Promise.all(statementsPromises);

    // Calculate comparison metrics
    const focusYear = validatedBody.focusYear || 2032; // Default to ramp completion year

    const comparison = {
      name: validatedBody.name,
      versions: statementsData.map((data, index) => ({
        id: data.versionId,
        name: versions[index]?.name || `Version ${index + 1}`,
        statements: data.statements,
        convergence: data.convergence,
      })),
      metrics: {
        focusYear,
        // TODO: Calculate NPV, deltas, etc.
      },
    };

    // TODO: Save comparison_set to database when table exists

    return successResponse(comparison);
  })();
}
