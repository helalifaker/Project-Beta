/**
 * Integration tests for rent templates API routes
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { applyApiMiddleware } from '@/lib/api/middleware';
import { rentTemplateRepository } from '@/lib/db/repositories/rent-template-repository';

import { GET, POST } from './route';

vi.mock('@/lib/api/middleware', () => ({
  applyApiMiddleware: vi.fn(),
  withErrorHandling: (fn: () => Promise<Response>) => fn,
}));

vi.mock('@/lib/db/repositories/rent-template-repository', () => ({
  rentTemplateRepository: {
    findAll: vi.fn(),
    create: vi.fn(),
  },
}));

const mockSession = {
  user: { id: 'user-1', email: 'admin@example.com', role: 'ADMIN' },
};

const mockTemplates = [
  {
    id: 'tpl-1',
    name: 'Fixed Escalation Template',
    type: 'FIXED_ESC' as const,
    params: { baseAmount: 5000000, escalationRate: 0.03 },
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  },
];

describe('GET /api/v1/admin/rent-templates', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return all rent templates', async () => {
    vi.mocked(applyApiMiddleware).mockResolvedValue({
      session: mockSession,
    });
    vi.mocked(rentTemplateRepository.findAll).mockResolvedValue(mockTemplates as any);

    const response = await GET(
      new Request('http://localhost/api/v1/admin/rent-templates'),
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data).toEqual(
      mockTemplates.map((t) => ({
        ...t,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
      })),
    );
  });

  it('should require authentication', async () => {
    vi.mocked(applyApiMiddleware).mockRejectedValue(new Error('Unauthorized'));

    await expect(
      GET(new Request('http://localhost/api/v1/admin/rent-templates')),
    ).rejects.toThrow('Unauthorized');
  });
});

describe('POST /api/v1/admin/rent-templates', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create rent template successfully', async () => {
    const newTemplate = {
      id: 'tpl-2',
      name: 'Revenue Share Template',
      type: 'REV_SHARE' as const,
      params: { revenuePercentage: 0.15, floor: 1000000 },
      createdAt: new Date('2024-01-02T00:00:00.000Z'),
      updatedAt: new Date('2024-01-02T00:00:00.000Z'),
    };

    vi.mocked(applyApiMiddleware).mockResolvedValue({
      session: mockSession,
      body: {
        name: 'Revenue Share Template',
        type: 'REV_SHARE',
        params: { revenuePercentage: 0.15, floor: 1000000 },
      },
    });
    vi.mocked(rentTemplateRepository.create).mockResolvedValue(newTemplate as any);

    const response = await POST(
      new Request('http://localhost/api/v1/admin/rent-templates', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Revenue Share Template',
          type: 'REV_SHARE',
          params: { revenuePercentage: 0.15, floor: 1000000 },
        }),
      }),
    );

    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.data.name).toBe('Revenue Share Template');
    expect(rentTemplateRepository.create).toHaveBeenCalled();
  });

  it('should require ADMIN role', async () => {
    vi.mocked(applyApiMiddleware).mockRejectedValue(new Error('Forbidden'));

    await expect(
      POST(
        new Request('http://localhost/api/v1/admin/rent-templates', {
          method: 'POST',
          body: JSON.stringify({
            name: 'Test Template',
            type: 'FIXED_ESC',
            params: {},
          }),
        }),
      ),
    ).rejects.toThrow('Forbidden');
  });

  it('should validate request body', async () => {
    vi.mocked(applyApiMiddleware).mockRejectedValue(new Error('Validation failed'));

    await expect(
      POST(
        new Request('http://localhost/api/v1/admin/rent-templates', {
          method: 'POST',
          body: JSON.stringify({ name: '' }),
        }),
      ),
    ).rejects.toThrow('Validation failed');
  });
});

