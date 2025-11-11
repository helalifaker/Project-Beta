/**
 * Tests for RentTemplateRepository
 */

import { describe, expect, it, vi, beforeEach } from 'vitest';

import { prisma } from '../prisma';
import { rentTemplateRepository } from './rent-template-repository';

vi.mock('../prisma', () => ({
  prisma: {
    rentModelTemplate: {
      findMany: vi.fn(),
    },
  },
}));

describe('RentTemplateRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('findByType', () => {
    it('should find templates by type', async () => {
      const mockTemplates = [
        {
          id: 'tpl-1',
          name: 'Fixed Escalation Template',
          type: 'FIXED_ESC' as const,
          params: {},
        },
      ];

      vi.mocked(prisma.rentModelTemplate.findMany).mockResolvedValue(mockTemplates as any);

      const result = await rentTemplateRepository.findByType('FIXED_ESC');

      expect(result).toEqual(mockTemplates);
      expect(prisma.rentModelTemplate.findMany).toHaveBeenCalledWith({
        where: { type: 'FIXED_ESC' },
        orderBy: { name: 'asc' },
      });
    });

    it('should find REV_SHARE templates', async () => {
      vi.mocked(prisma.rentModelTemplate.findMany).mockResolvedValue([]);

      await rentTemplateRepository.findByType('REV_SHARE');

      expect(prisma.rentModelTemplate.findMany).toHaveBeenCalledWith({
        where: { type: 'REV_SHARE' },
        orderBy: { name: 'asc' },
      });
    });

    it('should find PARTNER templates', async () => {
      vi.mocked(prisma.rentModelTemplate.findMany).mockResolvedValue([]);

      await rentTemplateRepository.findByType('PARTNER');

      expect(prisma.rentModelTemplate.findMany).toHaveBeenCalledWith({
        where: { type: 'PARTNER' },
        orderBy: { name: 'asc' },
      });
    });
  });
});

