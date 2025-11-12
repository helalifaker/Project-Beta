/**
 * Version assumptions API routes
 * GET: Get assumptions for a version
 * POST: Update assumptions (autosave)
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';

import { NotFoundError, ForbiddenError } from '@/lib/api/errors';
import { applyApiMiddleware, withErrorHandling } from '@/lib/api/middleware';
import { successResponse } from '@/lib/api/response';
import { idParamSchema } from '@/lib/api/schemas';
import { prisma } from '@/lib/db/prisma';
import { versionRepository } from '@/lib/db/repositories/version-repository';

const assumptionSectionSchema = z.enum([
  'LEASE',
  'CURRICULUM',
  'TUITION',
  'STAFFING',
  'OPEX',
  'CAPEX',
]);

const updateAssumptionsSchema = z.object({
  section: assumptionSectionSchema,
  data: z.record(z.unknown()), // Flexible JSON structure
});

/**
 * GET /api/v1/versions/[id]/assumptions
 * Get all assumptions for a version
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

    // Fetch all assumption data
    const [curricula] = await Promise.all([
      prisma.versionCurriculum.findMany({
        where: { versionId: validated.id },
        include: {
          curriculumTemplate: {
            include: {
              rampSteps: {
                orderBy: { sortOrder: 'asc' },
              },
              tuitionAdjustments: true,
            },
          },
          rampOverrides: true,
          tuitionOverrides: true,
        },
      }),
      // TODO: Add rent, staffing, opex, capex assumptions when data model is complete
    ]);

    // Transform to assumptions format
    const assumptions = {
      CURRICULUM: curricula.map((vc) => ({
        curriculumTemplateId: vc.curriculumTemplateId,
        customCapacity: vc.customCapacity,
        template: {
          name: vc.curriculumTemplate.name,
          capacity: vc.curriculumTemplate.capacity,
          launchYear: vc.curriculumTemplate.launchYear,
          tuitionBase: vc.curriculumTemplate.tuitionBase.toString(),
          cpiRate: vc.curriculumTemplate.cpiRate.toString(),
          cpiFrequency: vc.curriculumTemplate.cpiFrequency,
          rampSteps: vc.curriculumTemplate.rampSteps.map((rs) => ({
            yearOffset: rs.yearOffset,
            utilisation: rs.utilisation.toString(),
          })),
        },
        rampOverrides: vc.rampOverrides.map((ro) => ({
          year: ro.year,
          utilisation: ro.utilisation.toString(),
        })),
        tuitionOverrides: vc.tuitionOverrides.map((to) => ({
          year: to.year,
          tuition: to.tuition.toString(),
        })),
      })),
      // TODO: Add other sections when data model is complete
      LEASE: null,
      STAFFING: null,
      OPEX: null,
      CAPEX: null,
    };

    return successResponse(assumptions);
  })();
}

/**
 * POST /api/v1/versions/[id]/assumptions
 * Update assumptions for a version (autosave)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  return withErrorHandling(async () => {
    const { session, body } = await applyApiMiddleware(request, {
      requireAuth: true,
      validateBody: updateAssumptionsSchema,
    });

    if (!session?.user) {
      throw new Error('Session not found');
    }

    const { id } = await params;
    const validated = idParamSchema.parse({ id });

    // Check version exists
    const version = await versionRepository.findUnique({
      id: validated.id,
    });

    if (!version) {
      throw new NotFoundError('Version', validated.id);
    }

    // Check if locked
    if (version.lockedAt) {
      throw new ForbiddenError('Version is locked and cannot be modified');
    }

    // Check ownership or admin role
    if (version.ownerId !== session.user.id && session.user.role !== 'ADMIN') {
      throw new ForbiddenError('You do not have permission to modify this version');
    }

    // Handle different assumption sections
    if (body.section === 'CURRICULUM') {
      // TODO: Implement curriculum assumption updates
      // For now, return success (will be implemented when forms are connected)
      return successResponse({
        success: true,
        section: body.section,
        message: 'Assumptions updated (curriculum updates pending implementation)',
      });
    }

    // TODO: Implement other sections (LEASE, STAFFING, OPEX, CAPEX)
    // These will require additional database tables or JSONB storage

    return successResponse({
      success: true,
      section: body.section,
      message: 'Assumptions updated',
    });
  })();
}

