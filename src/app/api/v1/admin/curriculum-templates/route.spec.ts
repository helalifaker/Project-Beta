/**
 * Curriculum template admin API route tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET, POST } from './route';
import { applyApiMiddleware } from '@/lib/api/middleware';
import { curriculumTemplateRepository } from '@/lib/db/repositories/curriculum-template-repository';
import { workspaceRepository } from '@/lib/db/repositories/workspace-repository';

vi.mock('@/lib/api/middleware', () => {
  const applyApiMiddleware = vi.fn();
  return {
    applyApiMiddleware,
    withErrorHandling: (handler: unknown) => handler,
  };
});

vi.mock('@/lib/db/repositories/workspace-repository', () => ({
  workspaceRepository: {
    getOrCreateDefault: vi.fn(),
  },
}));

vi.mock('@/lib/db/repositories/curriculum-template-repository', () => ({
  curriculumTemplateRepository: {
    findByWorkspace: vi.fn(),
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

describe('Admin Curriculum Templates API routes', () => {
  const mockedApply = vi.mocked(applyApiMiddleware);
  const mockedWorkspaceRepo = vi.mocked(workspaceRepository);
  const mockedTemplateRepo = vi.mocked(curriculumTemplateRepository);

  const workspace = {
    id: 'workspace-1',
    name: 'Default Workspace',
    baseCurrency: 'SAR',
    timezone: 'Asia/Riyadh',
    discountRate: 0.08,
    cpiMin: 0.02,
    cpiMax: 0.05,
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockedWorkspaceRepo.getOrCreateDefault.mockResolvedValue({
      ...workspace,
      createdAt: new Date(workspace.createdAt),
      updatedAt: new Date(workspace.updatedAt),
    });
  });

  it('should list curriculum templates for authenticated users', async () => {
    mockedApply.mockResolvedValue({
      session: mockSession,
    });

    const templates = [
      {
        id: 'template-1',
        workspaceId: workspace.id,
        name: 'IB Diploma',
        slug: 'ib-diploma',
        capacity: 600,
        launchYear: 2028,
        tuitionBase: 92000,
        cpiRate: 0.025,
        cpiFrequency: 'ANNUAL' as const,
        createdAt: new Date('2024-02-01T00:00:00.000Z'),
        updatedAt: new Date('2024-02-01T00:00:00.000Z'),
        rampSteps: [],
        tuitionAdjustments: [],
      },
    ];

    mockedTemplateRepo.findByWorkspace.mockResolvedValue(templates);

    const response = await GET(
      new Request('http://localhost/api/v1/admin/curriculum-templates'),
    );
    const body = await response.json();

    expect(mockedApply).toHaveBeenCalledWith(expect.any(Request), {
      requireAuth: true,
    });
    expect(mockedWorkspaceRepo.getOrCreateDefault).toHaveBeenCalled();
    expect(mockedTemplateRepo.findByWorkspace).toHaveBeenCalledWith(workspace.id);
    expect(response.status).toBe(200);
    expect(body.data).toEqual(
      templates.map((template) => ({
        ...template,
        createdAt: template.createdAt.toISOString(),
        updatedAt: template.updatedAt.toISOString(),
      })),
    );
  });

  it('should create curriculum template for admins', async () => {
    const requestBody = {
      name: 'American Curriculum',
      slug: 'american',
      capacity: 800,
      tuitionBase: 88000,
      cpiRate: 0.024,
      cpiFrequency: 'EVERY_2_YEARS' as const,
    };

    mockedApply.mockResolvedValue({
      session: mockSession,
      body: requestBody,
    });

    const createdTemplate = {
      id: 'template-2',
      workspaceId: workspace.id,
      ...requestBody,
      launchYear: 2028,
      createdAt: new Date('2024-03-01T00:00:00.000Z'),
      updatedAt: new Date('2024-03-01T00:00:00.000Z'),
      rampSteps: [],
      tuitionAdjustments: [],
    };

    mockedTemplateRepo.create.mockResolvedValue(createdTemplate);

    const response = await POST(
      new Request('http://localhost/api/v1/admin/curriculum-templates', {
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
    expect(mockedTemplateRepo.create).toHaveBeenCalledWith({
      ...requestBody,
      workspaceId: workspace.id,
      launchYear: 2028,
    });
    expect(response.status).toBe(201);
    expect(body.data).toEqual({
      ...createdTemplate,
      createdAt: createdTemplate.createdAt.toISOString(),
      updatedAt: createdTemplate.updatedAt.toISOString(),
    });
  });
});


