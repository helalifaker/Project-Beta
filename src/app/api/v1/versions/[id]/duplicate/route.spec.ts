/**
 * Integration tests for version duplicate API route
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { applyApiMiddleware } from '@/lib/api/middleware';
import { versionRepository } from '@/lib/db/repositories/version-repository';
import { NotFoundError } from '@/lib/api/errors';

import { POST } from './route';

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
        throw error;
      }
    };
  },
}));

vi.mock('@/lib/db/repositories/version-repository', () => ({
  versionRepository: {
    findUnique: vi.fn(),
    duplicateVersion: vi.fn(),
  },
}));

const mockSession = {
  user: { id: 'user-1', email: 'analyst@example.com', role: 'ANALYST' },
};

const mockSourceVersion = {
  id: '550e8400-e29b-41d4-a716-446655440030',
  name: 'Source Version',
  description: 'Source description',
  status: 'DRAFT' as const,
  ownerId: 'user-1',
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  lockedAt: null,
};

const mockDuplicatedVersion = {
  id: '550e8400-e29b-41d4-a716-446655440031',
  name: 'Duplicated Version',
  description: 'Source description (Copy)',
  status: 'DRAFT' as const,
  ownerId: 'user-1',
  createdAt: new Date('2024-01-02T00:00:00.000Z'),
  updatedAt: new Date('2024-01-02T00:00:00.000Z'),
  lockedAt: null,
};

describe('POST /api/v1/versions/[id]/duplicate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should duplicate version successfully', async () => {
    vi.mocked(applyApiMiddleware).mockResolvedValue({
      session: mockSession,
      body: { name: 'Duplicated Version' },
    });
    vi.mocked(versionRepository.findUnique).mockResolvedValue(mockSourceVersion as any);
    vi.mocked(versionRepository.duplicateVersion).mockResolvedValue(
      mockDuplicatedVersion as any,
    );

    const response = await POST(
      new Request(`http://localhost/api/v1/versions/${mockSourceVersion.id}/duplicate`, {
        method: 'POST',
        body: JSON.stringify({ name: 'Duplicated Version' }),
      }),
      { params: Promise.resolve({ id: mockSourceVersion.id }) },
    );

    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.data.name).toBe('Duplicated Version');
    expect(versionRepository.duplicateVersion).toHaveBeenCalledWith(
      mockSourceVersion.id,
      'Duplicated Version',
      mockSession.user.id,
    );
  });

  it('should return 404 when source version not found', async () => {
    vi.mocked(applyApiMiddleware).mockResolvedValue({
      session: mockSession,
      body: { name: 'Duplicated Version' },
    });
    vi.mocked(versionRepository.findUnique).mockResolvedValue(null);

    const versionId = '550e8400-e29b-41d4-a716-446655440032';
    const response = await POST(
      new Request(`http://localhost/api/v1/versions/${versionId}/duplicate`, {
        method: 'POST',
        body: JSON.stringify({ name: 'Duplicated Version' }),
      }),
      { params: Promise.resolve({ id: versionId }) },
    );

    expect(response.status).toBe(404);
  });

  it('should require authentication', async () => {
    vi.mocked(applyApiMiddleware).mockRejectedValue(new Error('Unauthorized'));

    await expect(
      POST(
        new Request(`http://localhost/api/v1/versions/${mockSourceVersion.id}/duplicate`, {
          method: 'POST',
          body: JSON.stringify({ name: 'Duplicated' }),
        }),
        { params: Promise.resolve({ id: mockSourceVersion.id }) },
      ),
    ).rejects.toThrow('Unauthorized');
  });

  it('should validate request body', async () => {
    vi.mocked(applyApiMiddleware).mockRejectedValue(new Error('Validation failed'));

    await expect(
      POST(
        new Request(`http://localhost/api/v1/versions/${mockSourceVersion.id}/duplicate`, {
          method: 'POST',
          body: JSON.stringify({ name: '' }),
        }),
        { params: Promise.resolve({ id: mockSourceVersion.id }) },
      ),
    ).rejects.toThrow('Validation failed');
  });
});

