/**
 * Integration tests for curriculum template detail API routes
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { applyApiMiddleware } from '@/lib/api/middleware';
import { curriculumTemplateRepository } from '@/lib/db/repositories/curriculum-template-repository';

import { GET, PUT, DELETE } from './route';

import { NotFoundError } from '@/lib/api/errors';

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

vi.mock('@/lib/db/repositories/curriculum-template-repository', () => ({
  curriculumTemplateRepository: {
    findUnique: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockSession = {
  user: { id: 'user-1', email: 'admin@example.com', role: 'ADMIN' },
};

const mockTemplate = {
  id: '550e8400-e29b-41d4-a716-446655440004',
  name: 'Elementary',
  slug: 'elementary',
  capacity: 500,
  tuitionBase: 50000,
  cpiRate: 0.03,
  cpiFrequency: 'ANNUAL' as const,
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
};

describe('GET /api/v1/admin/curriculum-templates/[id]', () => {
  it('should return template when found', async () => {
    vi.mocked(applyApiMiddleware).mockResolvedValue({
      session: mockSession,
    });
    vi.mocked(curriculumTemplateRepository.findUnique).mockResolvedValue(mockTemplate);

    const response = await GET(
      new Request('http://localhost/api/v1/admin/curriculum-templates/550e8400-e29b-41d4-a716-446655440004'),
      { params: Promise.resolve({ id: '550e8400-e29b-41d4-a716-446655440004' }) },
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data).toEqual({
      ...mockTemplate,
      createdAt: mockTemplate.createdAt.toISOString(),
      updatedAt: mockTemplate.updatedAt.toISOString(),
    });
  });

  it('should return 404 when template not found', async () => {
    vi.mocked(applyApiMiddleware).mockResolvedValue({
      session: mockSession,
    });
    vi.mocked(curriculumTemplateRepository.findUnique).mockResolvedValue(null);

    const response = await GET(
      new Request('http://localhost/api/v1/admin/curriculum-templates/550e8400-e29b-41d4-a716-446655440005'),
      { params: Promise.resolve({ id: '550e8400-e29b-41d4-a716-446655440005' }) },
    );

    expect(response.status).toBe(404);
  });

  it('should require authentication', async () => {
    vi.mocked(applyApiMiddleware).mockRejectedValue(new Error('Unauthorized'));

    await expect(
      GET(
        new Request('http://localhost/api/v1/admin/curriculum-templates/550e8400-e29b-41d4-a716-446655440004'),
        { params: Promise.resolve({ id: '550e8400-e29b-41d4-a716-446655440004' }) },
      ),
    ).rejects.toThrow('Unauthorized');
  });
});

describe('PUT /api/v1/admin/curriculum-templates/[id]', () => {
  it('should update template successfully', async () => {
    const updateData = { name: 'Updated Elementary', capacity: 600 };
    vi.mocked(applyApiMiddleware).mockResolvedValue({
      session: mockSession,
      body: updateData,
    });
    vi.mocked(curriculumTemplateRepository.update).mockResolvedValue({
      ...mockTemplate,
      ...updateData,
    });

    const response = await PUT(
      new Request('http://localhost/api/v1/admin/curriculum-templates/550e8400-e29b-41d4-a716-446655440004', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      }),
      { params: Promise.resolve({ id: '550e8400-e29b-41d4-a716-446655440004' }) },
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data.name).toBe('Updated Elementary');
    expect(body.data.capacity).toBe(600);
  });

  it('should require ADMIN role', async () => {
    vi.mocked(applyApiMiddleware).mockRejectedValue(new Error('Forbidden'));

    await expect(
      PUT(
        new Request('http://localhost/api/v1/admin/curriculum-templates/550e8400-e29b-41d4-a716-446655440004', {
          method: 'PUT',
          body: JSON.stringify({ name: 'Updated' }),
        }),
        { params: Promise.resolve({ id: '550e8400-e29b-41d4-a716-446655440004' }) },
      ),
    ).rejects.toThrow('Forbidden');
  });
});

describe('DELETE /api/v1/admin/curriculum-templates/[id]', () => {
  it('should delete template successfully', async () => {
    vi.mocked(applyApiMiddleware).mockResolvedValue({
      session: mockSession,
    });
    vi.mocked(curriculumTemplateRepository.delete).mockResolvedValue(undefined);

    const response = await DELETE(
      new Request('http://localhost/api/v1/admin/curriculum-templates/550e8400-e29b-41d4-a716-446655440004', {
        method: 'DELETE',
      }),
      { params: Promise.resolve({ id: '550e8400-e29b-41d4-a716-446655440004' }) },
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data.success).toBe(true);
  });

  it('should require ADMIN role', async () => {
    vi.mocked(applyApiMiddleware).mockRejectedValue(new Error('Forbidden'));

    await expect(
      DELETE(
        new Request('http://localhost/api/v1/admin/curriculum-templates/550e8400-e29b-41d4-a716-446655440004', {
          method: 'DELETE',
        }),
        { params: Promise.resolve({ id: '550e8400-e29b-41d4-a716-446655440004' }) },
      ),
    ).rejects.toThrow('Forbidden');
  });
});

