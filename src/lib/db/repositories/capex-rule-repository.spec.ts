/**
 * Tests for CapexRuleRepository
 */

import { describe, expect, it, vi, beforeEach } from 'vitest';

import { prisma } from '../prisma';
import { capexRuleRepository } from './capex-rule-repository';

vi.mock('../prisma', () => ({
  prisma: {
    capexRule: {
      findMany: vi.fn(),
    },
  },
}));

describe('CapexRuleRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('findByCategory', () => {
    it('should find rules by category', async () => {
      const mockRules = [
        {
          id: 'rule-1',
          name: 'Tech Refresh',
          categoryId: 'cat-1',
          category: { id: 'cat-1', name: 'Technology' },
        },
      ];

      vi.mocked(prisma.capexRule.findMany).mockResolvedValue(mockRules as any);

      const result = await capexRuleRepository.findByCategory('cat-1');

      expect(result).toEqual(mockRules);
      expect(prisma.capexRule.findMany).toHaveBeenCalledWith({
        where: { categoryId: 'cat-1' },
        include: { category: true },
        orderBy: { name: 'asc' },
      });
    });
  });

  describe('findAllWithCategories', () => {
    it('should find all rules with categories', async () => {
      const mockRules = [
        {
          id: 'rule-1',
          name: 'Tech Refresh',
          category: { name: 'Technology' },
        },
      ];

      vi.mocked(prisma.capexRule.findMany).mockResolvedValue(mockRules as any);

      const result = await capexRuleRepository.findAllWithCategories();

      expect(result).toEqual(mockRules);
      expect(prisma.capexRule.findMany).toHaveBeenCalledWith({
        include: {
          category: {
            select: { name: true },
          },
        },
        orderBy: [{ category: { name: 'asc' } }, { name: 'asc' }],
      });
    });
  });
});

