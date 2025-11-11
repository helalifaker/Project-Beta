/**
 * Curriculum template repository
 * Data access layer for curriculum templates
 */

import type { CurriculumTemplate } from '@prisma/client';

import { prisma } from '../prisma';
import { BaseRepository } from '../repository';

export interface CreateCurriculumTemplateInput {
  workspaceId: string;
  name: string;
  slug: string;
  capacity: number;
  launchYear?: number;
  tuitionBase: number;
  cpiRate: number;
  cpiFrequency: 'ANNUAL' | 'EVERY_2_YEARS' | 'EVERY_3_YEARS';
}

export interface UpdateCurriculumTemplateInput {
  name?: string;
  capacity?: number;
  tuitionBase?: number;
  cpiRate?: number;
  cpiFrequency?: 'ANNUAL' | 'EVERY_2_YEARS' | 'EVERY_3_YEARS';
}

export class CurriculumTemplateRepository extends BaseRepository<
  CurriculumTemplate,
  CreateCurriculumTemplateInput,
  UpdateCurriculumTemplateInput
> {
  protected model = 'curriculumTemplate' as const;

  /**
   * Find templates by workspace
   */
  async findByWorkspace(workspaceId: string): Promise<CurriculumTemplate[]> {
    return prisma.curriculumTemplate.findMany({
      where: { workspaceId },
      include: {
        rampSteps: {
          orderBy: { sortOrder: 'asc' },
        },
        tuitionAdjustments: {
          orderBy: { year: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Find template by slug
   */
  async findBySlug(slug: string): Promise<CurriculumTemplate | null> {
    return prisma.curriculumTemplate.findUnique({
      where: { slug },
      include: {
        rampSteps: {
          orderBy: { sortOrder: 'asc' },
        },
        tuitionAdjustments: {
          orderBy: { year: 'asc' },
        },
      },
    });
  }
}

export const curriculumTemplateRepository = new CurriculumTemplateRepository();
