/**
 * Integration tests for capex category detail API routes
 */

import { NextRequest } from 'next/server';
import { describe, expect, it, vi } from 'vitest';

import { NotFoundError } from '@/lib/api/errors';
import { applyApiMiddleware } from '@/lib/api/middleware';
import { capexCategoryRepository } from '@/lib/db/repositories/capex-category-repository';
import type { Session } from '@/types/auth';

import { GET, PUT, DELETE } from './route';

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
          return Response.json({ error: 'NOT_FOUND', message: error.message }, { status: 404 });
        }
        throw error;
      }
    };
  },
}));

vi.mock('@/lib/db/repositories/capex-category-repository', () => ({
  capexCategoryRepository: {
    findUnique: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockSession: Session = {
  user: {
    id: 'user-1',
    email: 'admin@example.com',
    role: 'ADMIN',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  accessToken: 'mock-access-token',
  expiresAt: new Date(Date.now() + 3600000),
};

const mockCategory = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'Technology',
  description: 'IT equipment',
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
};

describe('GET /api/v1/admin/capex-categories/[id]', () => {
  it('should return category when found', async () => {
    vi.mocked(applyApiMiddleware).mockResolvedValue({
      session: mockSession,
    });
    vi.mocked(capexCategoryRepository.findUnique).mockResolvedValue(mockCategory);

    const response = await GET(
      new NextRequest(
        'http://localhost/api/v1/admin/capex-categories/550e8400-e29b-41d4-a716-446655440000'
      ),
      { params: Promise.resolve({ id: '550e8400-e29b-41d4-a716-446655440000' }) }
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data).toEqual({
      ...mockCategory,
      createdAt: mockCategory.createdAt.toISOString(),
      updatedAt: mockCategory.updatedAt.toISOString(),
    });
  });

  it('should return 404 when category not found', async () => {
    vi.mocked(applyApiMiddleware).mockResolvedValue({
      session: mockSession,
    });
    vi.mocked(capexCategoryRepository.findUnique).mockResolvedValue(null);

    const response = await GET(
      new NextRequest(
        'http://localhost/api/v1/admin/capex-categories/550e8400-e29b-41d4-a716-446655440001'
      ),
      { params: Promise.resolve({ id: '550e8400-e29b-41d4-a716-446655440001' }) }
    );

    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.error).toBe('NOT_FOUND');
  });

  it('should require authentication', async () => {
    vi.mocked(applyApiMiddleware).mockRejectedValue(new Error('Unauthorized'));

    await expect(
      GET(
        new NextRequest(
          'http://localhost/api/v1/admin/capex-categories/550e8400-e29b-41d4-a716-446655440000'
        ),
        { params: Promise.resolve({ id: '550e8400-e29b-41d4-a716-446655440000' }) }
      )
    ).rejects.toThrow('Unauthorized');
  });
});

describe('PUT /api/v1/admin/capex-categories/[id]', () => {
  it('should update category successfully', async () => {
    const updateData = { name: 'Updated Technology' };
    vi.mocked(applyApiMiddleware).mockResolvedValue({
      session: mockSession,
      body: updateData,
    });
    vi.mocked(capexCategoryRepository.update).mockResolvedValue({
      ...mockCategory,
      name: 'Updated Technology',
    });

    const categoryId = '550e8400-e29b-41d4-a716-446655440000';
    const response = await PUT(
      new NextRequest(`http://localhost/api/v1/admin/capex-categories/${categoryId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      }),
      { params: Promise.resolve({ id: categoryId }) }
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data.name).toBe('Updated Technology');
    expect(capexCategoryRepository.update).toHaveBeenCalledWith({ id: categoryId }, updateData);
  });

  it('should require ADMIN role', async () => {
    vi.mocked(applyApiMiddleware).mockRejectedValue(new Error('Forbidden'));

    await expect(
      PUT(
        new NextRequest(
          'http://localhost/api/v1/admin/capex-categories/550e8400-e29b-41d4-a716-446655440000',
          {
            method: 'PUT',
            body: JSON.stringify({ name: 'Updated' }),
          }
        ),
        { params: Promise.resolve({ id: '550e8400-e29b-41d4-a716-446655440000' }) }
      )
    ).rejects.toThrow('Forbidden');
  });

  it('should validate request body', async () => {
    vi.mocked(applyApiMiddleware).mockRejectedValue(new Error('Validation failed'));

    await expect(
      PUT(
        new NextRequest('http://localhost/api/v1/admin/capex-categories/cat-1', {
          method: 'PUT',
          body: JSON.stringify({ name: '' }),
        }),
        { params: Promise.resolve({ id: 'cat-1' }) }
      )
    ).rejects.toThrow('Validation failed');
  });
});

describe('DELETE /api/v1/admin/capex-categories/[id]', () => {
  it('should delete category successfully', async () => {
    vi.mocked(applyApiMiddleware).mockResolvedValue({
      session: mockSession,
    });
    vi.mocked(capexCategoryRepository.delete).mockResolvedValue(mockCategory);

    const categoryId = '550e8400-e29b-41d4-a716-446655440000';
    const response = await DELETE(
      new NextRequest(`http://localhost/api/v1/admin/capex-categories/${categoryId}`, {
        method: 'DELETE',
      }),
      { params: Promise.resolve({ id: categoryId }) }
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data.success).toBe(true);
    expect(capexCategoryRepository.delete).toHaveBeenCalledWith({ id: categoryId });
  });

  it('should require ADMIN role', async () => {
    vi.mocked(applyApiMiddleware).mockRejectedValue(new Error('Forbidden'));

    await expect(
      DELETE(
        new NextRequest(
          'http://localhost/api/v1/admin/capex-categories/550e8400-e29b-41d4-a716-446655440000',
          {
            method: 'DELETE',
          }
        ),
        { params: Promise.resolve({ id: '550e8400-e29b-41d4-a716-446655440000' }) }
      )
    ).rejects.toThrow('Forbidden');
  });
});
