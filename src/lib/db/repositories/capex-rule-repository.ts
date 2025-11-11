/**
 * Capex rule repository
 * Data access layer for capex rules
 */

import type { CapexRule } from '@prisma/client';

import { prisma } from '../prisma';
import { BaseRepository } from '../repository';

export interface CreateCapexRuleInput {
  categoryId: string;
  name: string;
  triggerType: 'CYCLE' | 'UTILIZATION' | 'CUSTOM_DATE';
  triggerParams: Record<string, unknown>;
  baseCost?: number;
  costPerStudent?: number;
  escalationRate?: number;
}

export interface UpdateCapexRuleInput {
  name?: string;
  triggerType?: 'CYCLE' | 'UTILIZATION' | 'CUSTOM_DATE';
  triggerParams?: Record<string, unknown>;
  baseCost?: number;
  costPerStudent?: number;
  escalationRate?: number;
}

export class CapexRuleRepository extends BaseRepository<
  CapexRule,
  CreateCapexRuleInput,
  UpdateCapexRuleInput
> {
  protected model = 'capexRule' as const;

  /**
   * Find rules by category
   */
  async findByCategory(categoryId: string): Promise<CapexRule[]> {
    return prisma.capexRule.findMany({
      where: { categoryId },
      include: {
        category: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Find all rules with categories
   */
  async findAllWithCategories(): Promise<Array<CapexRule & { category: { name: string } }>> {
    return prisma.capexRule.findMany({
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
      orderBy: [{ category: { name: 'asc' } }, { name: 'asc' }],
    });
  }
}

export const capexRuleRepository = new CapexRuleRepository();
