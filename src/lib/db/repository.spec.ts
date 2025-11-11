/**
 * Repository pattern tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

import { prisma } from './prisma';
import { BaseRepository } from './repository';

vi.mock('./prisma', () => ({
  prisma: {
    profile: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
  },
}));

class TestRepository extends BaseRepository<
  { id: string; name: string },
  { name: string },
  { name?: string }
> {
  protected model = 'profile' as const;
}

describe('BaseRepository', () => {
  let repository: TestRepository;

  beforeEach(() => {
    repository = new TestRepository();
    vi.clearAllMocks();
  });

  describe('findMany', () => {
    it('should call prisma findMany', async () => {
      const mockData = [{ id: '1', name: 'Test' }];
      vi.mocked(prisma.profile.findMany).mockResolvedValue(mockData as never);

      const result = await repository.findMany();

      expect(prisma.profile.findMany).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });

    it('should pass where clause', async () => {
      const where = { name: 'Test' };
      await repository.findMany(where);

      expect(prisma.profile.findMany).toHaveBeenCalledWith({ where });
    });

    it('should handle includeDeleted option', async () => {
      const where = { name: 'Test' };
      await repository.findMany(where, { includeDeleted: true });

      expect(prisma.profile.findMany).toHaveBeenCalledWith({ where });
    });

    it('should handle includeDeleted false option', async () => {
      const where = { name: 'Test' };
      await repository.findMany(where, { includeDeleted: false });

      expect(prisma.profile.findMany).toHaveBeenCalledWith({ where });
    });
  });

  describe('findUnique', () => {
    it('should call prisma findUnique', async () => {
      const mockData = { id: '1', name: 'Test' };
      vi.mocked(prisma.profile.findUnique).mockResolvedValue(mockData as never);

      const result = await repository.findUnique({ id: '1' });

      expect(prisma.profile.findUnique).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });

    it('should handle includeDeleted option', async () => {
      const mockData = { id: '1', name: 'Test' };
      vi.mocked(prisma.profile.findUnique).mockResolvedValue(mockData as never);

      await repository.findUnique({ id: '1' }, { includeDeleted: true });

      expect(prisma.profile.findUnique).toHaveBeenCalledWith({ where: { id: '1' } });
    });

    it('should handle includeDeleted false option', async () => {
      const mockData = { id: '1', name: 'Test' };
      vi.mocked(prisma.profile.findUnique).mockResolvedValue(mockData as never);

      await repository.findUnique({ id: '1' }, { includeDeleted: false });

      expect(prisma.profile.findUnique).toHaveBeenCalledWith({ where: { id: '1' } });
    });
  });

  describe('create', () => {
    it('should call prisma create', async () => {
      const mockData = { id: '1', name: 'Test' };
      const input = { name: 'Test' };
      vi.mocked(prisma.profile.create).mockResolvedValue(mockData as never);

      const result = await repository.create(input);

      expect(prisma.profile.create).toHaveBeenCalledWith({ data: input });
      expect(result).toEqual(mockData);
    });
  });

  describe('update', () => {
    it('should call prisma update', async () => {
      const mockData = { id: '1', name: 'Updated' };
      const input = { name: 'Updated' };
      vi.mocked(prisma.profile.update).mockResolvedValue(mockData as never);

      const result = await repository.update({ id: '1' }, input);

      expect(prisma.profile.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: input,
      });
      expect(result).toEqual(mockData);
    });
  });

  describe('delete', () => {
    it('should call prisma delete', async () => {
      const mockData = { id: '1', name: 'Test' };
      vi.mocked(prisma.profile.delete).mockResolvedValue(mockData as never);

      const result = await repository.delete({ id: '1' });

      expect(prisma.profile.delete).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(result).toEqual(mockData);
    });
  });

  describe('count', () => {
    it('should call prisma count', async () => {
      vi.mocked(prisma.profile.count).mockResolvedValue(10);

      const result = await repository.count();

      expect(prisma.profile.count).toHaveBeenCalled();
      expect(result).toBe(10);
    });
  });
});

