/**
 * Integration tests for rent template detail API routes
 */

import { describe, expect, it, vi } from 'vitest';

import { NotFoundError } from '@/lib/api/errors';
import { applyApiMiddleware } from '@/lib/api/middleware';
import { rentTemplateRepository } from '@/lib/db/repositories/rent-template-repository';

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
        throw error;
      }
    };
  },
}));

vi.mock('@/lib/db/repositories/rent-template-repository', () => ({
  rentTemplateRepository: {
    findUnique: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockSession = {
  user: { id: 'user-1', email: 'admin@example.com', role: 'ADMIN' },
};

const mockTemplate = {
  id: '550e8400-e29b-41d4-a716-446655440010',
  name: 'Fixed Escalation Template',
  type: 'FIXED_ESC' as const,
  params: { baseAmount: 5000000, escalationRate: 0.03 },
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
};

describe('GET /api/v1/admin/rent-templates/[id]', () => {
  it('should return template when found', async () => {
    vi.mocked(applyApiMiddleware).mockResolvedValue({
      session: mockSession,
    });
    vi.mocked(rentTemplateRepository.findUnique).mockResolvedValue(mockTemplate as any);

    const response = await GET(
      new Request(
        `http://localhost/api/v1/admin/rent-templates/${mockTemplate.id}`,
      ),
      { params: Promise.resolve({ id: mockTemplate.id }) },
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
    vi.mocked(rentTemplateRepository.findUnique).mockResolvedValue(null);

    const templateId = '550e8400-e29b-41d4-a716-446655440011';
    const response = await GET(
      new Request(`http://localhost/api/v1/admin/rent-templates/${templateId}`),
      { params: Promise.resolve({ id: templateId }) },
    );

    expect(response.status).toBe(404);
  });
});

describe('PUT /api/v1/admin/rent-templates/[id]', () => {
  it('should update template successfully', async () => {
    const updateData = { name: 'Updated Template' };
    vi.mocked(applyApiMiddleware).mockResolvedValue({
      session: mockSession,
      body: updateData,
    });
    vi.mocked(rentTemplateRepository.update).mockResolvedValue({
      ...mockTemplate,
      ...updateData,
    } as any);

    const response = await PUT(
      new Request(
        `http://localhost/api/v1/admin/rent-templates/${mockTemplate.id}`,
        {
          method: 'PUT',
          body: JSON.stringify(updateData),
        },
      ),
      { params: Promise.resolve({ id: mockTemplate.id }) },
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data.name).toBe('Updated Template');
  });

  it('should require ADMIN role', async () => {
    vi.mocked(applyApiMiddleware).mockRejectedValue(new Error('Forbidden'));

    await expect(
      PUT(
        new Request(
          `http://localhost/api/v1/admin/rent-templates/${mockTemplate.id}`,
          {
            method: 'PUT',
            body: JSON.stringify({ name: 'Updated' }),
          },
        ),
        { params: Promise.resolve({ id: mockTemplate.id }) },
      ),
    ).rejects.toThrow('Forbidden');
  });
});

describe('DELETE /api/v1/admin/rent-templates/[id]', () => {
  it('should delete template successfully', async () => {
    vi.mocked(applyApiMiddleware).mockResolvedValue({
      session: mockSession,
    });
    vi.mocked(rentTemplateRepository.delete).mockResolvedValue(undefined);

    const response = await DELETE(
      new Request(
        `http://localhost/api/v1/admin/rent-templates/${mockTemplate.id}`,
        {
          method: 'DELETE',
        },
      ),
      { params: Promise.resolve({ id: mockTemplate.id }) },
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data.success).toBe(true);
  });

  it('should require ADMIN role', async () => {
    vi.mocked(applyApiMiddleware).mockRejectedValue(new Error('Forbidden'));

    await expect(
      DELETE(
        new Request(
          `http://localhost/api/v1/admin/rent-templates/${mockTemplate.id}`,
          {
            method: 'DELETE',
          },
        ),
        { params: Promise.resolve({ id: mockTemplate.id }) },
      ),
    ).rejects.toThrow('Forbidden');
  });
});

