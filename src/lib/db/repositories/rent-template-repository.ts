/**
 * Rent template repository
 * Data access layer for rent model templates
 */

import type { RentModelTemplate } from '@prisma/client';

import { prisma } from '../prisma';
import { BaseRepository } from '../repository';

export interface CreateRentTemplateInput {
  name: string;
  type: 'FIXED_ESC' | 'REV_SHARE' | 'PARTNER';
  params: Record<string, unknown>;
}

export interface UpdateRentTemplateInput {
  name?: string;
  params?: Record<string, unknown>;
}

export class RentTemplateRepository extends BaseRepository<
  RentModelTemplate,
  CreateRentTemplateInput,
  UpdateRentTemplateInput
> {
  protected model = 'rentModelTemplate' as const;

  /**
   * Find templates by type
   */
  async findByType(type: 'FIXED_ESC' | 'REV_SHARE' | 'PARTNER'): Promise<RentModelTemplate[]> {
    return prisma.rentModelTemplate.findMany({
      where: { type },
      orderBy: { name: 'asc' },
    });
  }
}

export const rentTemplateRepository = new RentTemplateRepository();
