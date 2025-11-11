/**
 * Tests for UserRepository
 */

import { describe, expect, it, vi, beforeEach } from 'vitest';

import { prisma } from '../prisma';
import { userRepository } from './user-repository';

vi.mock('../prisma', () => ({
  prisma: {
    profile: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe('UserRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        role: 'ANALYST' as const,
      };

      vi.mocked(prisma.profile.findUnique).mockResolvedValue(mockUser as any);

      const result = await userRepository.findByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(prisma.profile.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should return null when user not found', async () => {
      vi.mocked(prisma.profile.findUnique).mockResolvedValue(null);

      const result = await userRepository.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findByExternalId', () => {
    it('should find user by external ID', async () => {
      const mockUser = {
        id: 'user-1',
        externalId: 'ext-123',
        email: 'test@example.com',
      };

      vi.mocked(prisma.profile.findUnique).mockResolvedValue(mockUser as any);

      const result = await userRepository.findByExternalId('ext-123');

      expect(result).toEqual(mockUser);
      expect(prisma.profile.findUnique).toHaveBeenCalledWith({
        where: { externalId: 'ext-123' },
      });
    });
  });

  describe('findByRole', () => {
    it('should find users by role', async () => {
      const mockUsers = [
        { id: 'user-1', email: 'admin1@example.com', role: 'ADMIN' as const },
        { id: 'user-2', email: 'admin2@example.com', role: 'ADMIN' as const },
      ];

      vi.mocked(prisma.profile.findMany).mockResolvedValue(mockUsers as any);

      const result = await userRepository.findByRole('ADMIN');

      expect(result).toEqual(mockUsers);
      expect(prisma.profile.findMany).toHaveBeenCalledWith({
        where: { role: 'ADMIN' },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('updateRole', () => {
    it('should update user role', async () => {
      const updatedUser = {
        id: 'user-1',
        email: 'test@example.com',
        role: 'ADMIN' as const,
      };

      vi.mocked(prisma.profile.update).mockResolvedValue(updatedUser as any);

      const result = await userRepository.updateRole('user-1', 'ADMIN');

      expect(result).toEqual(updatedUser);
      expect(prisma.profile.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { role: 'ADMIN' },
      });
    });
  });
});

