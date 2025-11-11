/**
 * Users API route tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

import { requireRole } from '@/lib/auth/session';
import { registerUser } from '@/lib/auth/utils';
import { prisma } from '@/lib/db/prisma';

import { GET, POST } from './route';
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

describe('GET /api/v1/users', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetPrismaMock();
  });

  it('should return 401 if not authenticated', async () => {
    vi.mocked(requireRole).mockRejectedValue(new Error('UNAUTHORIZED'));

    const request = new Request('http://localhost/api/v1/users');
    const response = await GET(request);

    expect(response.status).toBe(401);
    const json = await response.json();
    expect(json.error).toBe('UNAUTHORIZED');
  });

  it('should return 403 if not admin', async () => {
    vi.mocked(requireRole).mockRejectedValue(new Error('FORBIDDEN'));

    const request = new Request('http://localhost/api/v1/users');
    const response = await GET(request);

    expect(response.status).toBe(403);
    const json = await response.json();
    expect(json.error).toBe('FORBIDDEN');
  });

  it('should return users list if authenticated as admin', async () => {
    vi.mocked(requireRole).mockResolvedValue({
      user: {
        id: 'admin-id',
        email: 'admin@example.com',
        role: 'ADMIN',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      accessToken: 'token',
      expiresAt: new Date(),
    });

    const mockUsers = [
      {
        id: 'user-1',
        email: 'user1@example.com',
        role: 'ANALYST',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    vi.mocked(prisma.profile.findMany).mockResolvedValue(mockUsers);
    vi.mocked(prisma.profile.count).mockResolvedValue(1);

    const request = new Request('http://localhost/api/v1/users');
    const response = await GET(request);

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.data).toHaveLength(1);
    expect(json.data[0].email).toBe('user1@example.com');
  });
});

describe('POST /api/v1/users', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetPrismaMock();
  });

  it('should return 401 if not authenticated', async () => {
    vi.mocked(requireRole).mockRejectedValue(new Error('UNAUTHORIZED'));

    const request = new Request('http://localhost/api/v1/users', {
      method: 'POST',
      body: JSON.stringify({
        email: 'new@example.com',
        password: 'password123',
        role: 'ANALYST',
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(401);
  });

  it('should return 400 if validation fails', async () => {
    vi.mocked(requireRole).mockResolvedValue({
      user: {
        id: 'admin-id',
        email: 'admin@example.com',
        role: 'ADMIN',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      accessToken: 'token',
      expiresAt: new Date(),
    });

    const request = new Request('http://localhost/api/v1/users', {
      method: 'POST',
      body: JSON.stringify({
        email: 'invalid-email',
        password: '123',
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBe('VALIDATION_ERROR');
  });

  it('should create user if valid data', async () => {
    vi.mocked(requireRole).mockResolvedValue({
      user: {
        id: 'admin-id',
        email: 'admin@example.com',
        role: 'ADMIN',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      accessToken: 'token',
      expiresAt: new Date(),
    });

    vi.mocked(registerUser).mockResolvedValue({
      userId: 'new-user-id',
      error: null,
    });

    const mockUser = {
      id: 'new-user-id',
      email: 'new@example.com',
      role: 'ANALYST',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(prisma.profile.findUnique).mockResolvedValue(mockUser);

    const request = new Request('http://localhost/api/v1/users', {
      method: 'POST',
      body: JSON.stringify({
        email: 'new@example.com',
        password: 'password123',
        role: 'ANALYST',
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(201);
    const json = await response.json();
    expect(json.data.email).toBe('new@example.com');
  });

  it('should return 404 if user created but not found', async () => {
    vi.mocked(requireRole).mockResolvedValue({
      user: {
        id: 'admin-id',
        email: 'admin@example.com',
        role: 'ADMIN',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      accessToken: 'token',
      expiresAt: new Date(),
    });

    vi.mocked(registerUser).mockResolvedValue({
      userId: 'new-user-id',
      error: null,
    });

    vi.mocked(prisma.profile.findUnique).mockResolvedValue(null);

    const request = new Request('http://localhost/api/v1/users', {
      method: 'POST',
      body: JSON.stringify({
        email: 'new@example.com',
        password: 'password123',
        role: 'ANALYST',
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(404);
    const json = await response.json();
    expect(json.error).toBe('NOT_FOUND');
  });

  it('should return 403 if FORBIDDEN error occurs', async () => {
    vi.mocked(requireRole).mockRejectedValue(new Error('FORBIDDEN'));

    const request = new Request('http://localhost/api/v1/users', {
      method: 'POST',
      body: JSON.stringify({
        email: 'new@example.com',
        password: 'password123',
        role: 'ANALYST',
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(403);
    const json = await response.json();
    expect(json.error).toBe('FORBIDDEN');
  });

  it('should handle generic errors', async () => {
    vi.mocked(requireRole).mockRejectedValue(new Error('Database error'));

    const request = new Request('http://localhost/api/v1/users', {
      method: 'POST',
      body: JSON.stringify({
        email: 'new@example.com',
        password: 'password123',
        role: 'ANALYST',
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(500);
    const json = await response.json();
    expect(json.error).toBe('INTERNAL_ERROR');
  });
});

