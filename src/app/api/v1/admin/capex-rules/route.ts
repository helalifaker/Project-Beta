/**
 * Capex rules API routes
 * GET: List capex rules
 * POST: Create capex rule
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';

import { applyApiMiddleware, withErrorHandling } from '@/lib/api/middleware';
import { successResponse } from '@/lib/api/response';
import { capexRuleRepository } from '@/lib/db/repositories/capex-rule-repository';

const createCapexRuleSchema = z.object({
  categoryId: z.string().uuid(),
  name: z.string().min(1).max(200),
  triggerType: z.enum(['CYCLE', 'UTILIZATION', 'CUSTOM_DATE']),
  triggerParams: z.record(z.unknown()),
  baseCost: z.number().positive().optional(),
  costPerStudent: z.number().positive().optional(),
  escalationRate: z.number().min(0).max(1).optional(),
});

export const GET = withErrorHandling(async (request: NextRequest) => {
  await applyApiMiddleware(request, {
    requireAuth: true,
  });

  const rules = await capexRuleRepository.findAllWithCategories();

  return successResponse(rules);
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  const { body } = await applyApiMiddleware(request, {
    requireAuth: true,
    requireRole: 'ADMIN',
    validateBody: createCapexRuleSchema,
  });

  const createData = body as z.infer<typeof createCapexRuleSchema>;
  
  // Filter out undefined values for exactOptionalPropertyTypes
  const createInput: {
    categoryId: string;
    name: string;
    triggerType: 'CYCLE' | 'UTILIZATION' | 'CUSTOM_DATE';
    triggerParams: Record<string, unknown>;
    baseCost?: number;
    costPerStudent?: number;
    escalationRate?: number;
  } = {
    categoryId: createData.categoryId,
    name: createData.name,
    triggerType: createData.triggerType,
    triggerParams: createData.triggerParams,
  };
  
  if (createData.baseCost !== undefined) {
    createInput.baseCost = createData.baseCost;
  }
  if (createData.costPerStudent !== undefined) {
    createInput.costPerStudent = createData.costPerStudent;
  }
  if (createData.escalationRate !== undefined) {
    createInput.escalationRate = createData.escalationRate;
  }

  const rule = await capexRuleRepository.create(createInput);

  return successResponse(rule, 201);
});

