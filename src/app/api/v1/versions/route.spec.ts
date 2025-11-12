/**
 * Integration tests for versions API routes
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { applyApiMiddleware } from '@/lib/api/middleware';
import { versionRepository } from '@/lib/db/repositories/version-repository';

import { GET, POST } from './route';

vi.mock('@/lib/api/middleware', () => ({
  applyApiMiddleware: vi.fn(),
  withErrorHandling: (fn: () => Promise<Response>) => fn,
}));

vi.mock('@/lib/db/repositories/version-repository', () => ({
  versionRepository: {
    findWithFilters: vi.fn(),
    create: vi.fn(),
    duplicateVersion: vi.fn(),
  },
}));

const mockSession = {
  user: { id: 'user-1', email: 'admin@example.com', role: 'ADMIN' },
};

const mockVersions = [
  {
    id: 'v-1',
    name: 'Version 1',
    description: 'Test version 1',
    status: 'DRAFT' as const,
    ownerId: 'user-1',
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    lockedAt: null,
  },
  {
    id: 'v-2',
    name: 'Version 2',
    description: 'Test version 2',
    status: 'READY' as const,
    ownerId: 'user-1',
    createdAt: new Date('2024-01-02T00:00:00.000Z'),
    updatedAt: new Date('2024-01-02T00:00:00.000Z'),
    lockedAt: null,
  },
];

describe('GET /api/v1/versions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return paginated versions', async () => {
    vi.mocked(applyApiMiddleware).mockResolvedValue({
      session: mockSession,
      query: { page: 1, limit: 20 },
    });
    vi.mocked(versionRepository.findWithFilters).mockResolvedValue(
      mockVersions as Awaited<ReturnType<typeof versionRepository.findWithFilters>>
    );

    const response = await GET(new Request('http://localhost/api/v1/versions?page=1&limit=20'));

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data).toHaveLength(2);
    expect(body.pagination.total).toBe(2);
    expect(body.pagination.page).toBe(1);
  });

  it('should filter by status', async () => {
    vi.mocked(applyApiMiddleware).mockResolvedValue({
      session: mockSession,
      query: { page: 1, limit: 20, status: 'DRAFT' },
    });
    vi.mocked(versionRepository.findWithFilters).mockResolvedValue([mockVersions[0]!] as Awaited<
      ReturnType<typeof versionRepository.findWithFilters>
    >);

    const response = await GET(new Request('http://localhost/api/v1/versions?status=DRAFT'));

    expect(response.status).toBe(200);
    expect(versionRepository.findWithFilters).toHaveBeenCalledWith({
      status: 'DRAFT',
    });
  });

  it('should filter by search query', async () => {
    vi.mocked(applyApiMiddleware).mockResolvedValue({
      session: mockSession,
      query: { page: 1, limit: 20, search: 'Version 1' },
    });
    vi.mocked(versionRepository.findWithFilters).mockResolvedValue([mockVersions[0]!] as Awaited<
      ReturnType<typeof versionRepository.findWithFilters>
    >);

    const response = await GET(new Request('http://localhost/api/v1/versions?search=Version%201'));

    expect(response.status).toBe(200);
    expect(versionRepository.findWithFilters).toHaveBeenCalledWith({
      search: 'Version 1',
    });
  });

  it('should require authentication', async () => {
    vi.mocked(applyApiMiddleware).mockRejectedValue(new Error('Unauthorized'));

    await expect(GET(new Request('http://localhost/api/v1/versions'))).rejects.toThrow(
      'Unauthorized'
    );
  });
});

describe('POST /api/v1/versions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create new version', async () => {
    const newVersion = {
      id: 'v-3',
      name: 'New Version',
      description: 'New test version',
      status: 'DRAFT' as const,
      ownerId: 'user-1',
      createdAt: new Date('2024-01-03T00:00:00.000Z'),
      updatedAt: new Date('2024-01-03T00:00:00.000Z'),
      lockedAt: null,
    };

    vi.mocked(applyApiMiddleware).mockResolvedValue({
      session: mockSession,
      body: {
        name: 'New Version',
        description: 'New test version',
      },
    });
    vi.mocked(versionRepository.create).mockResolvedValue(
      newVersion as Awaited<ReturnType<typeof versionRepository.create>>
    );

    const response = await POST(
      new Request('http://localhost/api/v1/versions', {
        method: 'POST',
        body: JSON.stringify({
          name: 'New Version',
          description: 'New test version',
        }),
      })
    );

    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.data.name).toBe('New Version');
    expect(versionRepository.create).toHaveBeenCalledWith({
      name: 'New Version',
      description: 'New test version',
      ownerId: 'user-1',
    });
  });

  it('should duplicate version when baseVersionId provided', async () => {
    const duplicatedVersion = {
      id: 'v-4',
      name: 'Duplicated Version',
      description: 'Copy of Version 1',
      status: 'DRAFT' as const,
      ownerId: 'user-1',
      createdAt: new Date('2024-01-04T00:00:00.000Z'),
      updatedAt: new Date('2024-01-04T00:00:00.000Z'),
      lockedAt: null,
    };

    vi.mocked(applyApiMiddleware).mockResolvedValue({
      session: mockSession,
      body: {
        name: 'Duplicated Version',
        baseVersionId: 'v-1',
      },
    });
    vi.mocked(versionRepository.duplicateVersion).mockResolvedValue(
      duplicatedVersion as Awaited<ReturnType<typeof versionRepository.duplicateVersion>>
    );

    const response = await POST(
      new Request('http://localhost/api/v1/versions', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Duplicated Version',
          baseVersionId: 'v-1',
        }),
      })
    );

    expect(response.status).toBe(201);
    expect(versionRepository.duplicateVersion).toHaveBeenCalledWith(
      'v-1',
      'Duplicated Version',
      'user-1'
    );
  });

  it('should require ADMIN or ANALYST role', async () => {
    vi.mocked(applyApiMiddleware).mockRejectedValue(new Error('Forbidden'));

    await expect(
      POST(
        new Request('http://localhost/api/v1/versions', {
          method: 'POST',
          body: JSON.stringify({ name: 'Test Version' }),
        })
      )
    ).rejects.toThrow('Forbidden');
  });
});
