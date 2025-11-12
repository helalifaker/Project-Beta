/**
 * Validation API route
 * GET: Get validation results for a version
 */

import { NextRequest } from 'next/server';

import { NotFoundError } from '@/lib/api/errors';
import { applyApiMiddleware, withErrorHandling } from '@/lib/api/middleware';
import { successResponse } from '@/lib/api/response';
import { idParamSchema } from '@/lib/api/schemas';
import { versionRepository } from '@/lib/db/repositories/version-repository';
import { validateVersion } from '@/lib/validation/engine';

/**
 * GET /api/v1/versions/[id]/validation
 * Get validation results for a version
 */
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

    // Check version exists
    const version = await versionRepository.findUnique({
      id: validated.id,
    });

    if (!version) {
      throw new NotFoundError('Version', validated.id);
    }

    // Run validation
    const validationResults = await validateVersion(validated.id);

    // Transform to API response format
    const results = validationResults.map((result) => ({
      code: result.code,
      severity: result.severity,
      message: result.message,
      year: result.year ?? null,
      value: result.value ?? null,
      threshold: result.expected ?? null, // Use expected as threshold
      field: result.field ?? null,
      deepLink: result.deepLink ?? null,
    }));

    const summary = {
      critical: results.filter((r) => r.severity === 'CRITICAL').length,
      warnings: results.filter((r) => r.severity === 'WARNING').length,
      info: results.filter((r) => r.severity === 'INFO').length,
    };

    return successResponse({
      summary,
      results,
    });
  })();
}

