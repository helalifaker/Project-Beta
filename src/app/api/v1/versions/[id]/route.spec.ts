/**
 * Integration tests for version detail API routes
 */

import { describe, expect, it, vi } from 'vitest';

import { NotFoundError, ForbiddenError } from '@/lib/api/errors';
import { applyApiMiddleware } from '@/lib/api/middleware';
import { versionRepository } from '@/lib/db/repositories/version-repository';

import { GET, PUT, DELETE } from './route';

vi.mock('@/lib/api/middleware', () => ({
  applyApiMiddleware: vi.fn(),
  withErrorHandling: (fn: () => Promise<Response>) => {
    return async () => {
      try {
        return await fn();
      } catch (error: any) {
        if (error instanceof NotFoundError || error.name === 'NotFoundError') {
          return Response.json(
            { error: 'NOT_FOUND', message: error.message },
            { status: 404 },
          );
        }
        if (error instanceof ForbiddenError || error.name === 'ForbiddenError') {
          return Response.json(
            { error: 'FORBIDDEN', message: error.message },
            { status: 403 },
          );
        }
        throw error;
      }
    };
  },
}));

vi.mock('@/lib/db/repositories/version-repository', () => ({
  versionRepository: {
    findUnique: vi.fn(),
    update: vi.fn(),
    updateStatus: vi.fn(),
    softDelete: vi.fn(),
  },
}));

const adminSession = {
  user: { id: 'admin-1', email: 'admin@example.com', role: 'ADMIN' },
};

const analystSession = {
  user: { id: 'analyst-1', email: 'analyst@example.com', role: 'ANALYST' },
};

const mockVersion = {
  id: '550e8400-e29b-41d4-a716-446655440020',
  name: 'Test Version',
  description: 'Test description',
  status: 'DRAFT' as const,
  ownerId: 'analyst-1',
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  lockedAt: null,
};

describe('GET /api/v1/versions/[id]', () => {
  it('should return version when found', async () => {
    vi.mocked(applyApiMiddleware).mockResolvedValue({
      session: adminSession,
    });
    vi.mocked(versionRepository.findUnique).mockResolvedValue(mockVersion as any);

    const response = await GET(
      new Request(`http://localhost/api/v1/versions/${mockVersion.id}`),
      { params: Promise.resolve({ id: mockVersion.id }) },
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data).toEqual({
      ...mockVersion,
      createdAt: mockVersion.createdAt.toISOString(),
      updatedAt: mockVersion.updatedAt.toISOString(),
    });
  });

  it('should return 404 when version not found', async () => {
    vi.mocked(applyApiMiddleware).mockResolvedValue({
      session: adminSession,
    });
    vi.mocked(versionRepository.findUnique).mockResolvedValue(null);

    const versionId = '550e8400-e29b-41d4-a716-446655440021';
    const response = await GET(
      new Request(`http://localhost/api/v1/versions/${versionId}`),
      { params: Promise.resolve({ id: versionId }) },
    );

    expect(response.status).toBe(404);
  });
});

describe('PUT /api/v1/versions/[id]', () => {
  it('should update version successfully', async () => {
    const updateData = { name: 'Updated Version' };
    vi.mocked(applyApiMiddleware).mockResolvedValue({
      session: analystSession,
      body: updateData,
    });
    vi.mocked(versionRepository.findUnique)
      .mockResolvedValueOnce(mockVersion as any)
      .mockResolvedValueOnce({ ...mockVersion, ...updateData } as any);
    vi.mocked(versionRepository.update).mockResolvedValue({
      ...mockVersion,
      ...updateData,
    } as any);

    const response = await PUT(
      new Request(`http://localhost/api/v1/versions/${mockVersion.id}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      }),
      { params: Promise.resolve({ id: mockVersion.id }) },
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data.name).toBe('Updated Version');
  });

  it('should update status via updateStatus', async () => {
    vi.mocked(applyApiMiddleware).mockResolvedValue({
      session: adminSession,
      body: { status: 'READY' },
    });
    vi.mocked(versionRepository.findUnique).mockResolvedValue(mockVersion as any);
    vi.mocked(versionRepository.updateStatus).mockResolvedValue({
      ...mockVersion,
      status: 'READY',
    } as any);

    const response = await PUT(
      new Request(`http://localhost/api/v1/versions/${mockVersion.id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'READY' }),
      }),
      { params: Promise.resolve({ id: mockVersion.id }) },
    );

    expect(response.status).toBe(200);
    expect(versionRepository.updateStatus).toHaveBeenCalledWith(
      mockVersion.id,
      'READY',
      adminSession.user.id,
    );
  });

  it('should prevent update of locked version', async () => {
    const lockedVersion = { ...mockVersion, lockedAt: new Date() };
    vi.mocked(applyApiMiddleware).mockResolvedValue({
      session: analystSession,
      body: { name: 'Updated' },
    });
    vi.mocked(versionRepository.findUnique).mockResolvedValue(lockedVersion as any);

    const response = await PUT(
      new Request(`http://localhost/api/v1/versions/${mockVersion.id}`, {
        method: 'PUT',
        body: JSON.stringify({ name: 'Updated' }),
      }),
      { params: Promise.resolve({ id: mockVersion.id }) },
    );

    expect(response.status).toBe(403);
  });

  it('should prevent non-owner from updating', async () => {
    const otherUserSession = {
      user: { id: 'other-1', email: 'other@example.com', role: 'ANALYST' },
    };
    vi.mocked(applyApiMiddleware).mockResolvedValue({
      session: otherUserSession,
      body: { name: 'Updated' },
    });
    vi.mocked(versionRepository.findUnique).mockResolvedValue(mockVersion as any);

    const response = await PUT(
      new Request(`http://localhost/api/v1/versions/${mockVersion.id}`, {
        method: 'PUT',
        body: JSON.stringify({ name: 'Updated' }),
      }),
      { params: Promise.resolve({ id: mockVersion.id }) },
    );

    expect(response.status).toBe(403);
  });

  it('should allow admin to update any version', async () => {
    vi.mocked(applyApiMiddleware).mockResolvedValue({
      session: adminSession,
      body: { name: 'Updated by Admin' },
    });
    vi.mocked(versionRepository.findUnique)
      .mockResolvedValueOnce(mockVersion as any)
      .mockResolvedValueOnce({ ...mockVersion, name: 'Updated by Admin' } as any);
    vi.mocked(versionRepository.update).mockResolvedValue({
      ...mockVersion,
      name: 'Updated by Admin',
    } as any);

    const response = await PUT(
      new Request(`http://localhost/api/v1/versions/${mockVersion.id}`, {
        method: 'PUT',
        body: JSON.stringify({ name: 'Updated by Admin' }),
      }),
      { params: Promise.resolve({ id: mockVersion.id }) },
    );

    expect(response.status).toBe(200);
  });
});

describe('DELETE /api/v1/versions/[id]', () => {
  it('should soft delete version successfully', async () => {
    vi.mocked(applyApiMiddleware).mockResolvedValue({
      session: adminSession,
    });
    vi.mocked(versionRepository.softDelete).mockResolvedValue({
      ...mockVersion,
      deletedAt: new Date(),
    } as any);

    const response = await DELETE(
      new Request(`http://localhost/api/v1/versions/${mockVersion.id}`, {
        method: 'DELETE',
      }),
      { params: Promise.resolve({ id: mockVersion.id }) },
    );

    expect(response.status).toBe(200);
    expect(versionRepository.softDelete).toHaveBeenCalledWith(mockVersion.id);
  });

  it('should require ADMIN role', async () => {
    vi.mocked(applyApiMiddleware).mockRejectedValue(new Error('Forbidden'));

    await expect(
      DELETE(
        new Request(`http://localhost/api/v1/versions/${mockVersion.id}`, {
          method: 'DELETE',
        }),
        { params: Promise.resolve({ id: mockVersion.id }) },
      ),
    ).rejects.toThrow('Forbidden');
  });
});

