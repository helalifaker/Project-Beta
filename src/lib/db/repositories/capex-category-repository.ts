/**
 * Capex category repository
 * Data access layer for capex categories
 */

import type { CapexCategory } from '@prisma/client';

import { prisma } from '../prisma';
import { BaseRepository } from '../repository';

export interface CreateCapexCategoryInput {
  name: string;
  description?: string;
}

export interface UpdateCapexCategoryInput {
  name?: string;
  description?: string;
}

export class CapexCategoryRepository extends BaseRepository<
  CapexCategory,
  CreateCapexCategoryInput,
  UpdateCapexCategoryInput
> {
  protected model = 'capexCategory' as const;

  /**
   * Find all categories ordered by name
   */
  async findAllOrdered(): Promise<CapexCategory[]> {
    return prisma.capexCategory.findMany({
      orderBy: { name: 'asc' },
    });
  }
}

export const capexCategoryRepository = new CapexCategoryRepository();
