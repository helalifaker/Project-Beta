/**
 * Tests for example API route
 */

import { NextRequest } from 'next/server';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { getOrSetCached } from '@/lib/cache/kv';
import { generateCacheKey } from '@/lib/cache/react-cache';
import { userRepository } from '@/lib/db/repositories/user-repository';

import { GET } from './example-route';
import { applyApiMiddleware } from './middleware';


vi.mock('./middleware', () => ({
  applyApiMiddleware: vi.fn(),
  withErrorHandling: (fn: (req: NextRequest) => Promise<Response>) => fn,
}));

vi.mock('@/lib/db/repositories/user-repository', () => ({
  userRepository: {
    findMany: vi.fn(),
    count: vi.fn(),
  },
}));

vi.mock('@/lib/cache/kv', () => ({
  getOrSetCached: vi.fn(),
}));

vi.mock('@/lib/cache/react-cache', () => ({
  generateCacheKey: vi.fn(),
}));

const mockSession = {
  user: {
    id: 'user-1',
    email: 'test@example.com',
    role: 'ADMIN' as const,
  },
  accessToken: 'token',
  expiresAt: new Date(),
};

const mockUsers = [
  {
    id: 'user-1',
    email: 'test@example.com',
    role: 'ADMIN' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe('GET /api/example', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return paginated users without role filter', async () => {
    const request = new NextRequest('https://example.com/api/example?page=1&limit=10');
    vi.mocked(applyApiMiddleware).mockResolvedValue({
      session: mockSession,
      query: { page: 1, limit: 10 },
    } as any);

    vi.mocked(generateCacheKey).mockReturnValue('cache-key-1');
    vi.mocked(getOrSetCached).mockResolvedValue({
      users: mockUsers,
      total: 1,
    });

    const response = await GET(request);
    const data = await response.json();

    expect(data.data).toMatchObject(
      mockUsers.map((u) => ({
        id: u.id,
        email: u.email,
        role: u.role,
      }))
    );
    expect(data.pagination).toMatchObject({
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    });
    expect(generateCacheKey).toHaveBeenCalledWith('users', 1, 10, 'all');
  });

  it('should return paginated users with role filter', async () => {
    const request = new NextRequest(
      'https://example.com/api/example?page=1&limit=10&role=ADMIN'
    );
    vi.mocked(applyApiMiddleware).mockResolvedValue({
      session: mockSession,
      query: { page: 1, limit: 10, role: 'ADMIN' },
    } as any);

    vi.mocked(generateCacheKey).mockReturnValue('cache-key-2');
    vi.mocked(getOrSetCached).mockResolvedValue({
      users: mockUsers,
      total: 1,
    });

    const response = await GET(request);
    const data = await response.json();

    expect(data.data).toMatchObject(
      mockUsers.map((u) => ({
        id: u.id,
        email: u.email,
        role: u.role,
      }))
    );
    expect(generateCacheKey).toHaveBeenCalledWith('users', 1, 10, 'ADMIN');
    expect(getOrSetCached).toHaveBeenCalledWith(
      'cache-key-2',
      expect.any(Function),
      { ttl: 60 }
    );
  });

  it('should fetch users from repository when cache miss', async () => {
    const request = new NextRequest('https://example.com/api/example?page=1&limit=10');
    vi.mocked(applyApiMiddleware).mockResolvedValue({
      session: mockSession,
      query: { page: 1, limit: 10 },
    } as any);

    vi.mocked(generateCacheKey).mockReturnValue('cache-key-3');
    vi.mocked(getOrSetCached).mockImplementation(async (key, fetcher) => {
      return await fetcher!();
    });
    vi.mocked(userRepository.findMany).mockResolvedValue(mockUsers);
    vi.mocked(userRepository.count).mockResolvedValue(1);

    const response = await GET(request);
    const data = await response.json();

    expect(userRepository.findMany).toHaveBeenCalledWith(undefined);
    expect(userRepository.count).toHaveBeenCalledWith(undefined);
    expect(data.data).toMatchObject(
      mockUsers.map((u) => ({
        id: u.id,
        email: u.email,
        role: u.role,
      }))
    );
  });

  it('should fetch filtered users when role provided', async () => {
    const request = new NextRequest(
      'https://example.com/api/example?page=1&limit=10&role=ANALYST'
    );
    vi.mocked(applyApiMiddleware).mockResolvedValue({
      session: mockSession,
      query: { page: 1, limit: 10, role: 'ANALYST' },
    } as any);

    vi.mocked(generateCacheKey).mockReturnValue('cache-key-4');
    vi.mocked(getOrSetCached).mockImplementation(async (key, fetcher) => {
      return await fetcher!();
    });
    vi.mocked(userRepository.findMany).mockResolvedValue(mockUsers);
    vi.mocked(userRepository.count).mockResolvedValue(1);

    const response = await GET(request);

    expect(userRepository.findMany).toHaveBeenCalledWith({ role: 'ANALYST' });
    expect(userRepository.count).toHaveBeenCalledWith({ role: 'ANALYST' });
  });

  it('should calculate pagination correctly', async () => {
    const request = new NextRequest('https://example.com/api/example?page=2&limit=5');
    vi.mocked(applyApiMiddleware).mockResolvedValue({
      session: mockSession,
      query: { page: 2, limit: 5 },
    } as any);

    vi.mocked(generateCacheKey).mockReturnValue('cache-key-5');
    vi.mocked(getOrSetCached).mockResolvedValue({
      users: mockUsers,
      total: 12,
    });

    const response = await GET(request);
    const data = await response.json();

    expect(data.pagination).toMatchObject({
      page: 2,
      limit: 5,
      total: 12,
      totalPages: 3, // Math.ceil(12/5) = 3
      hasNext: true, // 2 * 5 < 12
      hasPrev: true, // page > 1
    });
  });

  it('should include request ID in response when present', async () => {
    const request = new NextRequest('https://example.com/api/example?page=1&limit=10', {
      headers: { 'x-request-id': 'req-123' },
    });
    vi.mocked(applyApiMiddleware).mockResolvedValue({
      session: mockSession,
      query: { page: 1, limit: 10 },
    } as any);

    vi.mocked(generateCacheKey).mockReturnValue('cache-key-6');
    vi.mocked(getOrSetCached).mockResolvedValue({
      users: mockUsers,
      total: 1,
    });

    const response = await GET(request);
    const data = await response.json();

    expect(data.meta?.requestId).toBe('req-123');
  });

  it('should not include request ID when absent', async () => {
    const request = new NextRequest('https://example.com/api/example?page=1&limit=10');
    vi.mocked(applyApiMiddleware).mockResolvedValue({
      session: mockSession,
      query: { page: 1, limit: 10 },
    } as any);

    vi.mocked(generateCacheKey).mockReturnValue('cache-key-7');
    vi.mocked(getOrSetCached).mockResolvedValue({
      users: mockUsers,
      total: 1,
    });

    const response = await GET(request);
    const data = await response.json();

    expect(data.meta?.requestId).toBeUndefined();
  });
});

