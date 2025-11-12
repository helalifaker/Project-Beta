/**
 * Integration tests for version lock/unlock API route
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { NotFoundError } from '@/lib/api/errors';
import { applyApiMiddleware } from '@/lib/api/middleware';
import { versionRepository } from '@/lib/db/repositories/version-repository';

import { PUT } from './route';

vi.mock('@/lib/api/middleware', () => ({
  applyApiMiddleware: vi.fn(),
  withErrorHandling: (fn: () => Promise<Response>) => {
    return async () => {
      try {
        return await fn();
      } catch (error: unknown) {
        if (
          error instanceof NotFoundError ||
          (error instanceof Error && error.name === 'NotFoundError')
        ) {
          return Response.json(
            { error: 'NOT_FOUND', message: error instanceof Error ? error.message : 'Not found' },
            { status: 404 }
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
    lockVersion: vi.fn(),
    unlockVersion: vi.fn(),
  },
}));

const mockSession = {
  user: { id: 'admin-1', email: 'admin@example.com', role: 'ADMIN' },
};

const mockVersion = {
  id: '550e8400-e29b-41d4-a716-446655440040',
  name: 'Test Version',
  description: 'Test description',
  status: 'DRAFT' as const,
  ownerId: 'user-1',
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  lockedAt: null,
};

describe('PUT /api/v1/versions/[id]/lock', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should lock version successfully', async () => {
    const lockedVersion = {
      ...mockVersion,
      status: 'LOCKED' as const,
      lockedAt: new Date('2024-01-02T00:00:00.000Z'),
    };

    vi.mocked(applyApiMiddleware).mockResolvedValue({
      session: mockSession,
      body: { action: 'lock' },
    });
    vi.mocked(versionRepository.findUnique).mockResolvedValue(
      mockVersion as Awaited<ReturnType<typeof versionRepository.findUnique>>
    );
    vi.mocked(versionRepository.lockVersion).mockResolvedValue(
      lockedVersion as Awaited<ReturnType<typeof versionRepository.lockVersion>>
    );

    const response = await PUT(
      new Request(`http://localhost/api/v1/versions/${mockVersion.id}/lock`, {
        method: 'PUT',
        body: JSON.stringify({ action: 'lock' }),
      }),
      { params: Promise.resolve({ id: mockVersion.id }) }
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data.status).toBe('LOCKED');
    expect(body.data.lockedAt).toBeDefined();
    expect(versionRepository.lockVersion).toHaveBeenCalledWith(mockVersion.id, mockSession.user.id);
  });

  it('should unlock version successfully', async () => {
    const unlockedVersion = {
      ...mockVersion,
      status: 'DRAFT' as const,
      lockedAt: null,
    };

    const lockedVersion = {
      ...mockVersion,
      status: 'LOCKED' as const,
      lockedAt: new Date('2024-01-01T00:00:00.000Z'),
    };

    vi.mocked(applyApiMiddleware).mockResolvedValue({
      session: mockSession,
      body: { action: 'unlock' },
    });
    vi.mocked(versionRepository.findUnique).mockResolvedValue(
      lockedVersion as Awaited<ReturnType<typeof versionRepository.findUnique>>
    );
    vi.mocked(versionRepository.unlockVersion).mockResolvedValue(
      unlockedVersion as Awaited<ReturnType<typeof versionRepository.unlockVersion>>
    );

    const response = await PUT(
      new Request(`http://localhost/api/v1/versions/${mockVersion.id}/lock`, {
        method: 'PUT',
        body: JSON.stringify({ action: 'unlock' }),
      }),
      { params: Promise.resolve({ id: mockVersion.id }) }
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data.status).toBe('DRAFT');
    expect(body.data.lockedAt).toBeNull();
    expect(versionRepository.unlockVersion).toHaveBeenCalledWith(mockVersion.id);
  });

  it('should return 404 when version not found', async () => {
    vi.mocked(applyApiMiddleware).mockResolvedValue({
      session: mockSession,
      body: { action: 'lock' },
    });
    vi.mocked(versionRepository.findUnique).mockResolvedValue(null);

    const versionId = '550e8400-e29b-41d4-a716-446655440041';
    const response = await PUT(
      new Request(`http://localhost/api/v1/versions/${versionId}/lock`, {
        method: 'PUT',
        body: JSON.stringify({ action: 'lock' }),
      }),
      { params: Promise.resolve({ id: versionId }) }
    );

    expect(response.status).toBe(404);
  });

  it('should require ADMIN role', async () => {
    vi.mocked(applyApiMiddleware).mockRejectedValue(new Error('Forbidden'));

    await expect(
      PUT(
        new Request(`http://localhost/api/v1/versions/${mockVersion.id}/lock`, {
          method: 'PUT',
          body: JSON.stringify({ action: 'lock' }),
        }),
        { params: Promise.resolve({ id: mockVersion.id }) }
      )
    ).rejects.toThrow('Forbidden');
  });

  it('should validate action value', async () => {
    vi.mocked(applyApiMiddleware).mockRejectedValue(new Error('Validation failed'));

    await expect(
      PUT(
        new Request(`http://localhost/api/v1/versions/${mockVersion.id}/lock`, {
          method: 'PUT',
          body: JSON.stringify({ action: 'invalid' }),
        }),
        { params: Promise.resolve({ id: mockVersion.id }) }
      )
    ).rejects.toThrow('Validation failed');
  });
});
