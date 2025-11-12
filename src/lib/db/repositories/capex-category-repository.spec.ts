/**
 * Tests for CapexCategoryRepository
 */

import { describe, expect, it, vi, beforeEach } from 'vitest';

import { prisma } from '../prisma';

import { capexCategoryRepository } from './capex-category-repository';

vi.mock('../prisma', () => ({
  prisma: {
    capexCategory: {
      findMany: vi.fn(),
    },
  },
}));

describe('CapexCategoryRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('findAllOrdered', () => {
    it('should find all categories ordered by name', async () => {
      const mockCategories = [
        { id: 'cat-1', name: 'Facilities', description: null },
        { id: 'cat-2', name: 'Technology', description: 'IT equipment' },
      ];

      vi.mocked(prisma.capexCategory.findMany).mockResolvedValue(
        mockCategories as Awaited<ReturnType<typeof prisma.capexCategory.findMany>>
      );

      const result = await capexCategoryRepository.findAllOrdered();

      expect(result).toEqual(mockCategories);
      expect(prisma.capexCategory.findMany).toHaveBeenCalledWith({
        orderBy: { name: 'asc' },
      });
    });
  });
});
