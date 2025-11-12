/**
 * Tests for version repository
 */

import { describe, expect, it, vi, beforeEach } from 'vitest';

import { prisma } from '../prisma';

import { versionRepository } from './version-repository';

vi.mock('../prisma', () => ({
  prisma: {
    version: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

const mockVersion = {
  id: 'version-1',
  name: 'Test Version',
  description: 'Test Description',
  status: 'DRAFT' as const,
  ownerId: 'user-1',
  baseVersionId: null,
  lockedAt: null,
  approvedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('VersionRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('findByStatus', () => {
    it('should find versions by status', async () => {
      const mockVersions = [mockVersion];
      vi.mocked(prisma.version.findMany).mockResolvedValue(mockVersions);

      const result = await versionRepository.findByStatus('DRAFT');

      expect(result).toEqual(mockVersions);
      expect(prisma.version.findMany).toHaveBeenCalledWith({
        where: { status: 'DRAFT' },
        orderBy: { updatedAt: 'desc' },
      });
    });
  });

  describe('findByOwner', () => {
    it('should find versions by owner', async () => {
      const mockVersions = [mockVersion];
      vi.mocked(prisma.version.findMany).mockResolvedValue(mockVersions);

      const result = await versionRepository.findByOwner('user-1');

      expect(result).toEqual(mockVersions);
      expect(prisma.version.findMany).toHaveBeenCalledWith({
        where: { ownerId: 'user-1' },
        orderBy: { updatedAt: 'desc' },
      });
    });
  });

  describe('findWithFilters', () => {
    it('should find versions with status filter', async () => {
      const mockVersions = [mockVersion];
      vi.mocked(prisma.version.findMany).mockResolvedValue(mockVersions);
      vi.mocked(prisma.version.count).mockResolvedValue(1);

      const result = await versionRepository.findWithFilters({ status: 'DRAFT' });

      expect(result).toEqual({ data: mockVersions, total: 1 });
      expect(prisma.version.findMany).toHaveBeenCalledWith({
        where: { status: 'DRAFT' },
        orderBy: { updatedAt: 'desc' },
        skip: undefined,
        take: undefined,
        select: expect.any(Object),
      });
      expect(prisma.version.count).toHaveBeenCalledWith({
        where: { status: 'DRAFT' },
      });
    });

    it('should find versions with ownerId filter', async () => {
      const mockVersions = [mockVersion];
      vi.mocked(prisma.version.findMany).mockResolvedValue(mockVersions);
      vi.mocked(prisma.version.count).mockResolvedValue(1);

      const result = await versionRepository.findWithFilters({ ownerId: 'user-1' });

      expect(result).toEqual({ data: mockVersions, total: 1 });
      expect(prisma.version.findMany).toHaveBeenCalledWith({
        where: { ownerId: 'user-1' },
        orderBy: { updatedAt: 'desc' },
        skip: undefined,
        take: undefined,
        select: expect.any(Object),
      });
      expect(prisma.version.count).toHaveBeenCalledWith({
        where: { ownerId: 'user-1' },
      });
    });

    it('should find versions with search filter', async () => {
      const mockVersions = [mockVersion];
      vi.mocked(prisma.version.findMany).mockResolvedValue(mockVersions);
      vi.mocked(prisma.version.count).mockResolvedValue(1);

      const result = await versionRepository.findWithFilters({ search: 'Test' });

      expect(result).toEqual({ data: mockVersions, total: 1 });
      expect(prisma.version.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: { contains: 'Test', mode: 'insensitive' } },
            { description: { contains: 'Test', mode: 'insensitive' } },
          ],
        },
        orderBy: { updatedAt: 'desc' },
        skip: undefined,
        take: undefined,
        select: expect.any(Object),
      });
      expect(prisma.version.count).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: { contains: 'Test', mode: 'insensitive' } },
            { description: { contains: 'Test', mode: 'insensitive' } },
          ],
        },
      });
    });

    it('should combine multiple filters', async () => {
      const mockVersions = [mockVersion];
      vi.mocked(prisma.version.findMany).mockResolvedValue(mockVersions);
      vi.mocked(prisma.version.count).mockResolvedValue(1);

      const result = await versionRepository.findWithFilters({
        status: 'DRAFT',
        ownerId: 'user-1',
        search: 'Test',
      });

      expect(result).toEqual({ data: mockVersions, total: 1 });
      expect(prisma.version.findMany).toHaveBeenCalledWith({
        where: {
          status: 'DRAFT',
          ownerId: 'user-1',
          OR: [
            { name: { contains: 'Test', mode: 'insensitive' } },
            { description: { contains: 'Test', mode: 'insensitive' } },
          ],
        },
        orderBy: { updatedAt: 'desc' },
        skip: undefined,
        take: undefined,
        select: expect.any(Object),
      });
      expect(prisma.version.count).toHaveBeenCalledWith({
        where: {
          status: 'DRAFT',
          ownerId: 'user-1',
          OR: [
            { name: { contains: 'Test', mode: 'insensitive' } },
            { description: { contains: 'Test', mode: 'insensitive' } },
          ],
        },
      });
    });
  });

  describe('lockVersion', () => {
    it('should lock version', async () => {
      const lockedVersion = { ...mockVersion, status: 'LOCKED' as const, lockedAt: new Date() };
      vi.mocked(prisma.version.update).mockResolvedValue(lockedVersion);

      const result = await versionRepository.lockVersion('version-1', 'user-1');

      expect(result).toEqual(lockedVersion);
      expect(prisma.version.update).toHaveBeenCalledWith({
        where: { id: 'version-1' },
        data: {
          lockedAt: expect.any(Date),
          status: 'LOCKED',
        },
      });
    });
  });

  describe('unlockVersion', () => {
    it('should unlock version', async () => {
      const unlockedVersion = { ...mockVersion, status: 'DRAFT' as const, lockedAt: null };
      vi.mocked(prisma.version.update).mockResolvedValue(unlockedVersion);

      const result = await versionRepository.unlockVersion('version-1');

      expect(result).toEqual(unlockedVersion);
      expect(prisma.version.update).toHaveBeenCalledWith({
        where: { id: 'version-1' },
        data: {
          lockedAt: null,
          status: 'DRAFT',
        },
      });
    });
  });

  describe('updateStatus', () => {
    it('should update status with valid transition', async () => {
      vi.mocked(prisma.version.findUnique).mockResolvedValue(mockVersion);
      const updatedVersion = { ...mockVersion, status: 'READY' as const };
      vi.mocked(prisma.version.update).mockResolvedValue(updatedVersion);

      const result = await versionRepository.updateStatus('version-1', 'READY', 'user-1');

      expect(result).toEqual(updatedVersion);
      expect(prisma.version.update).toHaveBeenCalledWith({
        where: { id: 'version-1' },
        data: {
          status: 'READY',
          approvedAt: expect.any(Date),
        },
      });
    });

    it('should throw error if version not found', async () => {
      vi.mocked(prisma.version.findUnique).mockResolvedValue(null);

      await expect(versionRepository.updateStatus('version-1', 'READY', 'user-1')).rejects.toThrow(
        'Version not found'
      );
    });

    it('should throw error for invalid transition', async () => {
      vi.mocked(prisma.version.findUnique).mockResolvedValue(mockVersion);

      await expect(versionRepository.updateStatus('version-1', 'LOCKED', 'user-1')).rejects.toThrow(
        'Invalid status transition from DRAFT to LOCKED'
      );
    });

    it('should allow DRAFT to ARCHIVED transition', async () => {
      vi.mocked(prisma.version.findUnique).mockResolvedValue(mockVersion);
      const archivedVersion = { ...mockVersion, status: 'ARCHIVED' as const };
      vi.mocked(prisma.version.update).mockResolvedValue(archivedVersion);

      const result = await versionRepository.updateStatus('version-1', 'ARCHIVED', 'user-1');

      expect(result).toEqual(archivedVersion);
    });

    it('should allow READY to LOCKED transition', async () => {
      const readyVersion = { ...mockVersion, status: 'READY' as const };
      vi.mocked(prisma.version.findUnique).mockResolvedValue(readyVersion);
      const lockedVersion = { ...readyVersion, status: 'LOCKED' as const };
      vi.mocked(prisma.version.update).mockResolvedValue(lockedVersion);

      const result = await versionRepository.updateStatus('version-1', 'LOCKED', 'user-1');

      expect(result).toEqual(lockedVersion);
    });
  });

  describe('duplicateVersion', () => {
    it('should duplicate version with curricula', async () => {
      const originalVersion = {
        ...mockVersion,
        curricula: [
          {
            id: 'curriculum-1',
            curriculumTemplateId: 'template-1',
            customCapacity: 1000,
            rampOverrides: [{ id: 'ramp-1', year: 2028, utilisation: 0.8 }],
            tuitionOverrides: [{ id: 'tuition-1', year: 2028, tuition: 50000 }],
          },
        ],
      };

      vi.mocked(prisma.version.findUnique).mockResolvedValue(
        originalVersion as Awaited<ReturnType<typeof prisma.version.findUnique>>
      );
      const duplicatedVersion = { ...mockVersion, id: 'version-2', name: 'New Name' };
      vi.mocked(prisma.version.create).mockResolvedValue(duplicatedVersion);

      const result = await versionRepository.duplicateVersion('version-1', 'New Name', 'user-2');

      expect(result).toEqual(duplicatedVersion);
      expect(prisma.version.create).toHaveBeenCalledWith({
        data: {
          name: 'New Name',
          description: 'Test Description (Copy)',
          ownerId: 'user-2',
          status: 'DRAFT',
          curricula: {
            create: [
              {
                curriculumTemplateId: 'template-1',
                customCapacity: 1000,
                rampOverrides: {
                  create: [{ year: 2028, utilisation: 0.8 }],
                },
                tuitionOverrides: {
                  create: [{ year: 2028, tuition: 50000 }],
                },
              },
            ],
          },
        },
      });
    });

    it('should duplicate version without description', async () => {
      const originalVersion = {
        ...mockVersion,
        description: null,
        curricula: [],
      };

      vi.mocked(prisma.version.findUnique).mockResolvedValue(
        originalVersion as Awaited<ReturnType<typeof prisma.version.findUnique>>
      );
      const duplicatedVersion = { ...mockVersion, id: 'version-2', name: 'New Name' };
      vi.mocked(prisma.version.create).mockResolvedValue(duplicatedVersion);

      const result = await versionRepository.duplicateVersion('version-1', 'New Name', 'user-2');

      expect(result).toEqual(duplicatedVersion);
      expect(prisma.version.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          description: null,
        }),
      });
    });

    it('should throw error if version not found', async () => {
      vi.mocked(prisma.version.findUnique).mockResolvedValue(null);

      await expect(
        versionRepository.duplicateVersion('version-1', 'New Name', 'user-2')
      ).rejects.toThrow('Version not found');
    });
  });

  describe('softDelete', () => {
    it('should soft delete version by archiving', async () => {
      const archivedVersion = { ...mockVersion, status: 'ARCHIVED' as const };
      vi.mocked(prisma.version.update).mockResolvedValue(archivedVersion);

      const result = await versionRepository.softDelete('version-1');

      expect(result).toEqual(archivedVersion);
      expect(prisma.version.update).toHaveBeenCalledWith({
        where: { id: 'version-1' },
        data: { status: 'ARCHIVED' },
      });
    });
  });
});
