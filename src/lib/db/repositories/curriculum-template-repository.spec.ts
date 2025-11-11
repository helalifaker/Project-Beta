/**
 * Tests for CurriculumTemplateRepository
 */

import { describe, expect, it, vi, beforeEach } from 'vitest';

import { prisma } from '../prisma';

import { curriculumTemplateRepository } from './curriculum-template-repository';

vi.mock('../prisma', () => ({
  prisma: {
    curriculumTemplate: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

describe('CurriculumTemplateRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('findByWorkspace', () => {
    it('should find templates by workspace', async () => {
      const mockTemplates = [
        {
          id: 'tpl-1',
          name: 'Elementary',
          workspaceId: 'ws-1',
          rampSteps: [],
          tuitionAdjustments: [],
        },
        {
          id: 'tpl-2',
          name: 'Middle School',
          workspaceId: 'ws-1',
          rampSteps: [],
          tuitionAdjustments: [],
        },
      ];

      vi.mocked(prisma.curriculumTemplate.findMany).mockResolvedValue(mockTemplates as any);

      const result = await curriculumTemplateRepository.findByWorkspace('ws-1');

      expect(result).toEqual(mockTemplates);
      expect(prisma.curriculumTemplate.findMany).toHaveBeenCalledWith({
        where: { workspaceId: 'ws-1' },
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
    });
  });

  describe('findBySlug', () => {
    it('should find template by slug', async () => {
      const mockTemplate = {
        id: 'tpl-1',
        name: 'Elementary',
        slug: 'elementary',
        rampSteps: [],
        tuitionAdjustments: [],
      };

      vi.mocked(prisma.curriculumTemplate.findUnique).mockResolvedValue(mockTemplate as any);

      const result = await curriculumTemplateRepository.findBySlug('elementary');

      expect(result).toEqual(mockTemplate);
      expect(prisma.curriculumTemplate.findUnique).toHaveBeenCalledWith({
        where: { slug: 'elementary' },
        include: {
          rampSteps: {
            orderBy: { sortOrder: 'asc' },
          },
          tuitionAdjustments: {
            orderBy: { year: 'asc' },
          },
        },
      });
    });

    it('should return null when template not found', async () => {
      vi.mocked(prisma.curriculumTemplate.findUnique).mockResolvedValue(null);

      const result = await curriculumTemplateRepository.findBySlug('nonexistent');

      expect(result).toBeNull();
    });
  });
});

