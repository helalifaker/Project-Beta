/**
 * User detail API route integration tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

import { requireRole } from '@/lib/auth/session';
import { updateUserRole } from '@/lib/auth/utils';
import { prisma } from '@/lib/db/prisma';
import type { Session } from '@/types/auth';

import { GET, PUT, DELETE } from './route';

type PrismaProfileMock = {
  findMany: ReturnType<typeof vi.fn>;
  count: ReturnType<typeof vi.fn>;
  findUnique: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
};

type PrismaMock = {
  profile: PrismaProfileMock;
};

const prismaMock = vi.hoisted(() => ({
  profile: {
    findMany: vi.fn(),
    count: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
})) as PrismaMock;

const resetPrismaMock = (): void => {
  prismaMock.profile.findMany.mockReset();
  prismaMock.profile.count.mockReset();
  prismaMock.profile.findUnique.mockReset();
  prismaMock.profile.update.mockReset();
  prismaMock.profile.delete.mockReset();
};

vi.mock('@/lib/auth/session');
vi.mock('@/lib/auth/utils');
vi.mock('@/lib/db/prisma', () => ({
  prisma: prismaMock,
}));

const adminSession: Session = {
  user: {
    id: 'admin-id',
    email: 'admin@example.com',
    role: 'ADMIN',
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  },
  accessToken: 'token',
  expiresAt: new Date('2024-12-31T00:00:00.000Z'),
};

describe('User detail API routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetPrismaMock();
  });

  describe('GET /api/v1/users/[id]', () => {
    it('should return 401 when user is not authenticated', async () => {
      vi.mocked(requireRole).mockRejectedValue(new Error('UNAUTHORIZED'));

      const response = await GET(
        new Request('http://localhost/api/v1/users/user-1'),
        { params: { id: 'user-1' } },
      );

      expect(response.status).toBe(401);
      const body = await response.json();
      expect(body.error).toBe('UNAUTHORIZED');
    });

    it('should return 404 when user does not exist', async () => {
      vi.mocked(requireRole).mockResolvedValue(adminSession);
      vi.mocked(prisma.profile.findUnique).mockResolvedValue(null);

      const response = await GET(
        new Request('http://localhost/api/v1/users/missing-id'),
        { params: { id: 'missing-id' } },
      );

      expect(response.status).toBe(404);
      const body = await response.json();
      expect(body.error).toBe('NOT_FOUND');
    });

    it('should return user details for admins', async () => {
      vi.mocked(requireRole).mockResolvedValue(adminSession);
      const user = {
        id: 'user-123',
        email: 'user@example.com',
        role: 'ANALYST' as const,
        createdAt: new Date('2024-02-01T00:00:00.000Z'),
        updatedAt: new Date('2024-02-02T00:00:00.000Z'),
      };
      vi.mocked(prisma.profile.findUnique).mockResolvedValue(user);

      const response = await GET(
        new Request('http://localhost/api/v1/users/user-123'),
        { params: { id: 'user-123' } },
      );

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.data).toEqual({
        ...user,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      });
    });
  });

  describe('PUT /api/v1/users/[id]', () => {
    it('should return 400 when validation fails', async () => {
      vi.mocked(requireRole).mockResolvedValue(adminSession);

      const response = await PUT(
        new Request('http://localhost/api/v1/users/user-123', {
          method: 'PUT',
          body: JSON.stringify({ role: 'INVALID' }),
        }),
        { params: { id: 'user-123' } },
      );

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBe('VALIDATION_ERROR');
    });

    it('should return 404 when attempting to update a missing user', async () => {
      vi.mocked(requireRole).mockResolvedValue(adminSession);
      vi.mocked(prisma.profile.findUnique).mockResolvedValue(null);

      const response = await PUT(
        new Request('http://localhost/api/v1/users/missing-id', {
          method: 'PUT',
          body: JSON.stringify({ role: 'ANALYST' }),
        }),
        { params: { id: 'missing-id' } },
      );

      expect(response.status).toBe(404);
      const body = await response.json();
      expect(body.error).toBe('NOT_FOUND');
    });

    it('should update role when valid data provided', async () => {
      vi.mocked(requireRole).mockResolvedValue(adminSession);
      const currentUser = {
        id: 'user-456',
        email: 'analyst@example.com',
        role: 'VIEWER' as const,
        createdAt: new Date('2024-03-01T00:00:00.000Z'),
        updatedAt: new Date('2024-03-01T00:00:00.000Z'),
      };
      vi.mocked(prisma.profile.findUnique)
        .mockResolvedValueOnce(currentUser)
        .mockResolvedValueOnce({
          ...currentUser,
          role: 'ANALYST' as const,
          updatedAt: new Date('2024-03-02T00:00:00.000Z'),
        });
      vi.mocked(updateUserRole).mockResolvedValue({ error: null });

      const response = await PUT(
        new Request('http://localhost/api/v1/users/user-456', {
          method: 'PUT',
          body: JSON.stringify({ role: 'ANALYST' }),
        }),
        { params: { id: 'user-456' } },
      );

      expect(updateUserRole).toHaveBeenCalledWith('user-456', 'ANALYST');
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.data.role).toBe('ANALYST');
    });

    it('should bubble up errors from updateUserRole', async () => {
      vi.mocked(requireRole).mockResolvedValue(adminSession);
      const currentUser = {
        id: 'user-789',
        email: 'viewer@example.com',
        role: 'VIEWER' as const,
        createdAt: new Date('2024-04-01T00:00:00.000Z'),
        updatedAt: new Date('2024-04-01T00:00:00.000Z'),
      };
      vi.mocked(prisma.profile.findUnique).mockResolvedValue(currentUser);
      vi.mocked(updateUserRole).mockResolvedValue({
        error: new Error('Unable to update role'),
      });

      const response = await PUT(
        new Request('http://localhost/api/v1/users/user-789', {
          method: 'PUT',
          body: JSON.stringify({ role: 'ADMIN' }),
        }),
        { params: { id: 'user-789' } },
      );

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBe('UPDATE_ERROR');
    });

    it('should update user without role change', async () => {
      vi.mocked(requireRole).mockResolvedValue(adminSession);
      const currentUser = {
        id: 'user-111',
        email: 'test@example.com',
        role: 'ANALYST' as const,
        createdAt: new Date('2024-06-01T00:00:00.000Z'),
        updatedAt: new Date('2024-06-01T00:00:00.000Z'),
      };
      vi.mocked(prisma.profile.findUnique).mockResolvedValue(currentUser);

      const response = await PUT(
        new Request('http://localhost/api/v1/users/user-111', {
          method: 'PUT',
          body: JSON.stringify({ email: 'newemail@example.com' }),
        }),
        { params: { id: 'user-111' } },
      );

      expect(updateUserRole).not.toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    it('should return 401 when FORBIDDEN error occurs', async () => {
      vi.mocked(requireRole).mockRejectedValue(new Error('FORBIDDEN'));

      const response = await PUT(
        new Request('http://localhost/api/v1/users/user-123', {
          method: 'PUT',
          body: JSON.stringify({ role: 'ADMIN' }),
        }),
        { params: { id: 'user-123' } },
      );

      expect(response.status).toBe(403);
      const body = await response.json();
      expect(body.error).toBe('FORBIDDEN');
    });

    it('should handle generic errors', async () => {
      vi.mocked(requireRole).mockRejectedValue(new Error('Database connection failed'));

      const response = await PUT(
        new Request('http://localhost/api/v1/users/user-123', {
          method: 'PUT',
          body: JSON.stringify({ role: 'ADMIN' }),
        }),
        { params: { id: 'user-123' } },
      );

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.error).toBe('INTERNAL_ERROR');
    });
  });

  describe('DELETE /api/v1/users/[id]', () => {
    it('should prevent deleting own account', async () => {
      vi.mocked(requireRole).mockResolvedValue(adminSession);
      vi.mocked(prisma.profile.findUnique).mockResolvedValue({
        id: 'admin-id',
        email: 'admin@example.com',
        role: 'ADMIN' as const,
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-01T00:00:00.000Z'),
      });

      const response = await DELETE(
        new Request('http://localhost/api/v1/users/admin-id', {
          method: 'DELETE',
        }),
        { params: { id: 'admin-id' } },
      );

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBe('VALIDATION_ERROR');
      expect(prisma.profile.delete).not.toHaveBeenCalled();
    });

    it('should delete user when admin requests', async () => {
      vi.mocked(requireRole).mockResolvedValue(adminSession);
      vi.mocked(prisma.profile.findUnique).mockResolvedValue({
        id: 'user-999',
        email: 'remove@example.com',
        role: 'VIEWER' as const,
        createdAt: new Date('2024-05-01T00:00:00.000Z'),
        updatedAt: new Date('2024-05-01T00:00:00.000Z'),
      });
      vi.mocked(prisma.profile.delete).mockResolvedValue({
        id: 'user-999',
        email: 'remove@example.com',
        role: 'VIEWER',
        createdAt: new Date('2024-05-01T00:00:00.000Z'),
        updatedAt: new Date('2024-05-01T00:00:00.000Z'),
      });

      const response = await DELETE(
        new Request('http://localhost/api/v1/users/user-999', {
          method: 'DELETE',
        }),
        { params: { id: 'user-999' } },
      );

      expect(prisma.profile.delete).toHaveBeenCalledWith({
        where: { id: 'user-999' },
      });
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.success).toBe(true);
    });

    it('should return 404 when user not found for deletion', async () => {
      vi.mocked(requireRole).mockResolvedValue(adminSession);
      vi.mocked(prisma.profile.findUnique).mockResolvedValue(null);

      const response = await DELETE(
        new Request('http://localhost/api/v1/users/missing-id', {
          method: 'DELETE',
        }),
        { params: { id: 'missing-id' } },
      );

      expect(response.status).toBe(404);
      const body = await response.json();
      expect(body.error).toBe('NOT_FOUND');
      expect(prisma.profile.delete).not.toHaveBeenCalled();
    });

    it('should return 403 when FORBIDDEN error occurs', async () => {
      vi.mocked(requireRole).mockRejectedValue(new Error('FORBIDDEN'));

      const response = await DELETE(
        new Request('http://localhost/api/v1/users/user-123', {
          method: 'DELETE',
        }),
        { params: { id: 'user-123' } },
      );

      expect(response.status).toBe(403);
      const body = await response.json();
      expect(body.error).toBe('FORBIDDEN');
    });

    it('should handle generic errors in DELETE', async () => {
      vi.mocked(requireRole).mockRejectedValue(new Error('Database error'));

      const response = await DELETE(
        new Request('http://localhost/api/v1/users/user-123', {
          method: 'DELETE',
        }),
        { params: { id: 'user-123' } },
      );

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.error).toBe('INTERNAL_ERROR');
    });
  });
});


