/**
 * Capex categories admin API route tests
 */

import { NextRequest } from 'next/server';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { applyApiMiddleware } from '@/lib/api/middleware';
import { capexCategoryRepository } from '@/lib/db/repositories/capex-category-repository';

import { GET, POST } from './route';

vi.mock('@/lib/api/middleware', () => {
  const applyApiMiddleware = vi.fn();
  return {
    applyApiMiddleware,
    withErrorHandling: (handler: unknown) => handler,
  };
});

vi.mock('@/lib/db/repositories/capex-category-repository', () => ({
  capexCategoryRepository: {
    findAllOrdered: vi.fn(),
    create: vi.fn(),
  },
}));

const mockSession = {
  user: {
    id: 'admin-id',
    email: 'admin@example.com',
    role: 'ADMIN' as const,
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  },
  accessToken: 'token',
  expiresAt: new Date('2024-12-31T00:00:00.000Z'),
};

describe('Admin Capex Categories API routes', () => {
  const mockedApply = vi.mocked(applyApiMiddleware);
  const mockedRepo = vi.mocked(capexCategoryRepository);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should list capex categories for authenticated users', async () => {
    mockedApply.mockResolvedValue({ session: mockSession });

    const categories = [
      {
        id: 'cat-1',
        name: 'Technology',
        description: 'Devices and classroom technology',
        createdAt: new Date('2024-02-01T00:00:00.000Z'),
        updatedAt: new Date('2024-02-01T00:00:00.000Z'),
      },
    ];

    mockedRepo.findAllOrdered.mockResolvedValue(categories);

    const response = await GET(new NextRequest('http://localhost/api/v1/admin/capex-categories'));
    const body = await response.json();

    expect(mockedApply).toHaveBeenCalledWith(expect.any(Request), {
      requireAuth: true,
    });
    expect(mockedRepo.findAllOrdered).toHaveBeenCalled();
    expect(response.status).toBe(200);
    expect(body.data).toEqual(
      categories.map((category) => ({
        ...category,
        createdAt: category.createdAt.toISOString(),
        updatedAt: category.updatedAt.toISOString(),
      })),
    );
  });

  it('should create capex category for admins', async () => {
    const requestBody = {
      name: 'Infrastructure',
      description: 'Building improvements',
    };

    mockedApply.mockResolvedValue({
      session: mockSession,
      body: requestBody,
    });

    const createdCategory = {
      id: 'cat-2',
      ...requestBody,
      createdAt: new Date('2024-03-01T00:00:00.000Z'),
      updatedAt: new Date('2024-03-01T00:00:00.000Z'),
    };

    mockedRepo.create.mockResolvedValue(createdCategory);

    const response = await POST(
      new NextRequest('http://localhost/api/v1/admin/capex-categories', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      }),
    );
    const body = await response.json();

    expect(mockedApply).toHaveBeenCalledWith(expect.any(Request), {
      requireAuth: true,
      requireRole: 'ADMIN',
      validateBody: expect.anything(),
    });
    expect(mockedRepo.create).toHaveBeenCalledWith(requestBody);
    expect(response.status).toBe(201);
    expect(body.data).toEqual({
      ...createdCategory,
      createdAt: createdCategory.createdAt.toISOString(),
      updatedAt: createdCategory.updatedAt.toISOString(),
    });
  });
});


