/**
 * Integration tests for capex rule detail API routes
 */

import { NextRequest } from 'next/server';
import { describe, expect, it, vi } from 'vitest';

import { NotFoundError } from '@/lib/api/errors';
import { applyApiMiddleware } from '@/lib/api/middleware';
import { capexRuleRepository } from '@/lib/db/repositories/capex-rule-repository';
import type { Session } from '@/types/auth';

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

vi.mock('@/lib/db/repositories/capex-rule-repository', () => ({
  capexRuleRepository: {
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

const mockRule = {
  id: '550e8400-e29b-41d4-a716-446655440002',
  name: 'Technology Refresh',
  triggerType: 'CYCLE' as const,
  triggerParams: { cycleYears: 3 },
  baseCost: null,
  costPerStudent: null,
  escalationRate: null,
  categoryId: 'cat-1',
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
} as unknown as {
  id: string;
  name: string;
  triggerType: 'CYCLE';
  triggerParams: Record<string, unknown>;
  baseCost: null;
  costPerStudent: null;
  escalationRate: null;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
};

describe('GET /api/v1/admin/capex-rules/[id]', () => {
  it('should return rule when found', async () => {
    vi.mocked(applyApiMiddleware).mockResolvedValue({
      session: mockSession,
    });
    vi.mocked(capexRuleRepository.findUnique).mockResolvedValue(mockRule as unknown as Awaited<ReturnType<typeof capexRuleRepository.findUnique>>);

    const response = await GET(
      new NextRequest('http://localhost/api/v1/admin/capex-rules/550e8400-e29b-41d4-a716-446655440002'),
      { params: Promise.resolve({ id: '550e8400-e29b-41d4-a716-446655440002' }) },
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data).toEqual({
      ...mockRule,
      createdAt: mockRule.createdAt.toISOString(),
      updatedAt: mockRule.updatedAt.toISOString(),
    });
  });

  it('should return 404 when rule not found', async () => {
    vi.mocked(applyApiMiddleware).mockResolvedValue({
      session: mockSession,
    });
    vi.mocked(capexRuleRepository.findUnique).mockResolvedValue(null);

    const response = await GET(
      new NextRequest('http://localhost/api/v1/admin/capex-rules/550e8400-e29b-41d4-a716-446655440003'),
      { params: Promise.resolve({ id: '550e8400-e29b-41d4-a716-446655440003' }) },
    );

    expect(response.status).toBe(404);
  });

  it('should require authentication', async () => {
    vi.mocked(applyApiMiddleware).mockRejectedValue(new Error('Unauthorized'));

    await expect(
      GET(
        new NextRequest('http://localhost/api/v1/admin/capex-rules/550e8400-e29b-41d4-a716-446655440002'),
        { params: Promise.resolve({ id: '550e8400-e29b-41d4-a716-446655440002' }) },
      ),
    ).rejects.toThrow('Unauthorized');
  });
});

describe('PUT /api/v1/admin/capex-rules/[id]', () => {
  it('should update rule successfully', async () => {
    const updateData = { name: 'Updated Rule', baseCost: 150000 };
    vi.mocked(applyApiMiddleware).mockResolvedValue({
      session: mockSession,
      body: updateData,
    });
    vi.mocked(capexRuleRepository.update).mockResolvedValue({
      ...mockRule,
      ...updateData,
    });

    const response = await PUT(
      new NextRequest('http://localhost/api/v1/admin/capex-rules/550e8400-e29b-41d4-a716-446655440002', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      }),
      { params: Promise.resolve({ id: '550e8400-e29b-41d4-a716-446655440002' }) },
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data.name).toBe('Updated Rule');
    expect(body.data.baseCost).toBe(150000);
  });

  it('should require ADMIN role', async () => {
    vi.mocked(applyApiMiddleware).mockRejectedValue(new Error('Forbidden'));

    await expect(
      PUT(
        new NextRequest('http://localhost/api/v1/admin/capex-rules/550e8400-e29b-41d4-a716-446655440002', {
          method: 'PUT',
          body: JSON.stringify({ name: 'Updated' }),
        }),
        { params: Promise.resolve({ id: '550e8400-e29b-41d4-a716-446655440002' }) },
      ),
    ).rejects.toThrow('Forbidden');
  });
});

describe('DELETE /api/v1/admin/capex-rules/[id]', () => {
  it('should delete rule successfully', async () => {
    vi.mocked(applyApiMiddleware).mockResolvedValue({
      session: mockSession,
    });
    vi.mocked(capexRuleRepository.delete).mockResolvedValue(mockRule as unknown as Awaited<ReturnType<typeof capexRuleRepository.delete>>);

    const response = await DELETE(
      new NextRequest('http://localhost/api/v1/admin/capex-rules/550e8400-e29b-41d4-a716-446655440002', {
        method: 'DELETE',
      }),
      { params: Promise.resolve({ id: '550e8400-e29b-41d4-a716-446655440002' }) },
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data.success).toBe(true);
  });

  it('should require ADMIN role', async () => {
    vi.mocked(applyApiMiddleware).mockRejectedValue(new Error('Forbidden'));

    await expect(
      DELETE(
        new NextRequest('http://localhost/api/v1/admin/capex-rules/550e8400-e29b-41d4-a716-446655440002', {
          method: 'DELETE',
        }),
        { params: Promise.resolve({ id: '550e8400-e29b-41d4-a716-446655440002' }) },
      ),
    ).rejects.toThrow('Forbidden');
  });
});

