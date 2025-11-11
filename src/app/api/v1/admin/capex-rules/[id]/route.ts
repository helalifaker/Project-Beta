/**
 * Capex rule detail API routes
 * GET: Get rule
 * PUT: Update rule
 * DELETE: Delete rule
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';

import { NotFoundError } from '@/lib/api/errors';
import { applyApiMiddleware, withErrorHandling } from '@/lib/api/middleware';
import { successResponse } from '@/lib/api/response';
import { idParamSchema } from '@/lib/api/schemas';
import { capexRuleRepository } from '@/lib/db/repositories/capex-rule-repository';

const updateCapexRuleSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  triggerType: z.enum(['CYCLE', 'UTILIZATION', 'CUSTOM_DATE']).optional(),
  triggerParams: z.record(z.unknown()).optional(),
  baseCost: z.number().positive().optional(),
  costPerStudent: z.number().positive().optional(),
  escalationRate: z.number().min(0).max(1).optional(),
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

    const rule = await capexRuleRepository.findUnique({
      id: validated.id,
    });

    if (!rule) {
      throw new NotFoundError('Capex rule', validated.id);
    }

    return successResponse(rule);
  })();
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  return withErrorHandling(async () => {
    const { session, body } = await applyApiMiddleware(request, {
      requireAuth: true,
      requireRole: 'ADMIN',
      validateBody: updateCapexRuleSchema,
    });

    const { id } = await params;
    const validated = idParamSchema.parse({ id });

    const rule = await capexRuleRepository.update(
      { id: validated.id },
      body as z.infer<typeof updateCapexRuleSchema>
    );

    return successResponse(rule);
  })();
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  return withErrorHandling(async () => {
    await applyApiMiddleware(request, {
      requireAuth: true,
      requireRole: 'ADMIN',
    });

    const { id } = await params;
    const validated = idParamSchema.parse({ id });

    await capexRuleRepository.delete({ id: validated.id });

    return successResponse({ success: true });
  })();
}

