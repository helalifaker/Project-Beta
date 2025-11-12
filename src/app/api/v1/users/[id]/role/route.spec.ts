/**
 * User role API route integration tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

import { requireRole } from '@/lib/auth/session';
import { updateUserRole } from '@/lib/auth/utils';
import { prisma } from '@/lib/db/prisma';
import type { Session } from '@/types/auth';

import { PUT } from './route';

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

describe('PUT /api/v1/users/[id]/role', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetPrismaMock();
  });

  it('should require authentication', async () => {
    vi.mocked(requireRole).mockRejectedValue(new Error('UNAUTHORIZED'));

    const response = await PUT(
      new Request('http://localhost/api/v1/users/user-1/role', {
        method: 'PUT',
        body: JSON.stringify({ role: 'ANALYST' }),
      }),
      { params: Promise.resolve({ id: 'user-1' }) }
    );

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error).toBe('UNAUTHORIZED');
  });

  it('should reject invalid payload', async () => {
    vi.mocked(requireRole).mockResolvedValue(adminSession);

    const response = await PUT(
      new Request('http://localhost/api/v1/users/user-1/role', {
        method: 'PUT',
        body: JSON.stringify({ role: 'INVALID_ROLE' }),
      }),
      { params: Promise.resolve({ id: 'user-1' }) }
    );

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBe('VALIDATION_ERROR');
  });

  it('should prevent updating own role', async () => {
    vi.mocked(requireRole).mockResolvedValue(adminSession);
    vi.mocked(prisma.profile.findUnique).mockResolvedValue({
      id: 'admin-id',
      externalId: 'admin-external-id',
      email: 'admin@example.com',
      role: 'ADMIN',
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    });

    const response = await PUT(
      new Request('http://localhost/api/v1/users/admin-id/role', {
        method: 'PUT',
        body: JSON.stringify({ role: 'ANALYST' }),
      }),
      { params: Promise.resolve({ id: 'admin-id' }) }
    );

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBe('VALIDATION_ERROR');
  });

  it('should update role for target user', async () => {
    vi.mocked(requireRole).mockResolvedValue(adminSession);
    vi.mocked(prisma.profile.findUnique)
      .mockResolvedValueOnce({
        id: 'user-2',
        externalId: 'user-2-external-id',
        email: 'viewer@example.com',
        role: 'VIEWER',
        createdAt: new Date('2024-02-01T00:00:00.000Z'),
        updatedAt: new Date('2024-02-01T00:00:00.000Z'),
      })
      .mockResolvedValueOnce({
        id: 'user-2',
        externalId: 'user-2-external-id',
        email: 'viewer@example.com',
        role: 'ANALYST',
        createdAt: new Date('2024-02-01T00:00:00.000Z'),
        updatedAt: new Date('2024-02-10T00:00:00.000Z'),
      });
    vi.mocked(updateUserRole).mockResolvedValue({ error: null });

    const response = await PUT(
      new Request('http://localhost/api/v1/users/user-2/role', {
        method: 'PUT',
        body: JSON.stringify({ role: 'ANALYST' }),
      }),
      { params: Promise.resolve({ id: 'user-2' }) }
    );

    expect(updateUserRole).toHaveBeenCalledWith('user-2', 'ANALYST');
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data?.role).toBe('ANALYST');
  });

  it('should propagate update errors', async () => {
    vi.mocked(requireRole).mockResolvedValue(adminSession);
    vi.mocked(prisma.profile.findUnique).mockResolvedValue({
      id: 'user-3',
      externalId: 'user-3-external',
      email: 'viewer@example.com',
      role: 'VIEWER',
      createdAt: new Date('2024-03-01T00:00:00.000Z'),
      updatedAt: new Date('2024-03-01T00:00:00.000Z'),
    });
    vi.mocked(updateUserRole).mockResolvedValue({
      error: new Error('Database error'),
    });

    const response = await PUT(
      new Request('http://localhost/api/v1/users/user-3/role', {
        method: 'PUT',
        body: JSON.stringify({ role: 'ADMIN' }),
      }),
      { params: Promise.resolve({ id: 'user-3' }) }
    );

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBe('UPDATE_ERROR');
  });

  it('should return 403 when FORBIDDEN error occurs', async () => {
    vi.mocked(requireRole).mockRejectedValue(new Error('FORBIDDEN'));

    const response = await PUT(
      new Request('http://localhost/api/v1/users/user-1/role', {
        method: 'PUT',
        body: JSON.stringify({ role: 'ANALYST' }),
      }),
      { params: Promise.resolve({ id: 'user-1' }) }
    );

    expect(response.status).toBe(403);
    const body = await response.json();
    expect(body.error).toBe('FORBIDDEN');
  });

  it('should handle generic errors', async () => {
    vi.mocked(requireRole).mockRejectedValue(new Error('Database connection failed'));

    const response = await PUT(
      new Request('http://localhost/api/v1/users/user-1/role', {
        method: 'PUT',
        body: JSON.stringify({ role: 'ANALYST' }),
      }),
      { params: Promise.resolve({ id: 'user-1' }) }
    );

    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error).toBe('INTERNAL_ERROR');
  });
});
