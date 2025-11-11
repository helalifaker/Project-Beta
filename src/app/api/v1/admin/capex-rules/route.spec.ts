/**
 * Capex rules admin API route tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET, POST } from './route';
import { applyApiMiddleware } from '@/lib/api/middleware';
import { capexRuleRepository } from '@/lib/db/repositories/capex-rule-repository';

vi.mock('@/lib/api/middleware', () => {
  const applyApiMiddleware = vi.fn();
  return {
    applyApiMiddleware,
    withErrorHandling: (handler: unknown) => handler,
  };
});

vi.mock('@/lib/db/repositories/capex-rule-repository', () => ({
  capexRuleRepository: {
    findAllWithCategories: vi.fn(),
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

describe('Admin Capex Rules API routes', () => {
  const mockedApply = vi.mocked(applyApiMiddleware);
  const mockedRepo = vi.mocked(capexRuleRepository);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should list capex rules for authenticated users', async () => {
    mockedApply.mockResolvedValue({ session: mockSession });

    const rules = [
      {
        id: 'rule-1',
        categoryId: 'cat-1',
        name: 'Technology Refresh',
        triggerType: 'CYCLE' as const,
        triggerParams: { cycleYears: 3 },
        baseCost: 500000,
        costPerStudent: 1000,
        escalationRate: 0.03,
        createdAt: new Date('2024-02-01T00:00:00.000Z'),
        updatedAt: new Date('2024-02-01T00:00:00.000Z'),
        category: {
          id: 'cat-1',
          name: 'Technology',
          description: 'Classroom technology',
          createdAt: new Date('2024-02-01T00:00:00.000Z'),
          updatedAt: new Date('2024-02-01T00:00:00.000Z'),
        },
      },
    ];

    mockedRepo.findAllWithCategories.mockResolvedValue(rules);

    const response = await GET(new Request('http://localhost/api/v1/admin/capex-rules'));
    const body = await response.json();

    expect(mockedApply).toHaveBeenCalledWith(expect.any(Request), {
      requireAuth: true,
    });
    expect(mockedRepo.findAllWithCategories).toHaveBeenCalled();
    expect(response.status).toBe(200);
    expect(body.data).toEqual(
      rules.map((rule) => ({
        ...rule,
        createdAt: rule.createdAt.toISOString(),
        updatedAt: rule.updatedAt.toISOString(),
        category: {
          ...rule.category,
          createdAt: rule.category.createdAt.toISOString(),
          updatedAt: rule.category.updatedAt.toISOString(),
        },
      })),
    );
  });

  it('should create capex rule for admins', async () => {
    const requestBody = {
      categoryId: 'cat-1',
      name: 'Facilities Upgrade',
      triggerType: 'CUSTOM_DATE' as const,
      triggerParams: { years: [2028, 2032] },
      baseCost: 2_000_000,
      costPerStudent: 5000,
      escalationRate: 0.04,
    };

    mockedApply.mockResolvedValue({
      session: mockSession,
      body: requestBody,
    });

    const createdRule = {
      id: 'rule-2',
      ...requestBody,
      createdAt: new Date('2024-03-01T00:00:00.000Z'),
      updatedAt: new Date('2024-03-01T00:00:00.000Z'),
    };

    mockedRepo.create.mockResolvedValue(createdRule);

    const response = await POST(
      new Request('http://localhost/api/v1/admin/capex-rules', {
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
      ...createdRule,
      createdAt: createdRule.createdAt.toISOString(),
      updatedAt: createdRule.updatedAt.toISOString(),
    });
  });
});


