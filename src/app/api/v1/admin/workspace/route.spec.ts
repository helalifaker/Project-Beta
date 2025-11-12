/**
 * Workspace settings admin API route tests
 */

import type { WorkspaceSetting } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { applyApiMiddleware } from '@/lib/api/middleware';
import { workspaceRepository } from '@/lib/db/repositories/workspace-repository';

import { GET, PUT } from './route';

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
    updateSettings: vi.fn(),
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

describe('Admin Workspace API routes', () => {
  const mockedApply = vi.mocked(applyApiMiddleware);
  const mockedRepo = vi.mocked(workspaceRepository);

  const mockWorkspace: WorkspaceSetting = {
    id: 'workspace-1',
    name: 'Default Workspace',
    baseCurrency: 'SAR',
    timezone: 'Asia/Riyadh',
    discountRate: new Decimal(0.08),
    cpiMin: new Decimal(0.02),
    cpiMax: new Decimal(0.05),
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockedRepo.getOrCreateDefault.mockResolvedValue(mockWorkspace);
  });

  it('should return workspace settings for admins', async () => {
    mockedApply.mockResolvedValue({
      session: mockSession,
    });

    const response = await GET(new NextRequest('http://localhost/api/v1/admin/workspace'));
    const body = await response.json();

    expect(mockedApply).toHaveBeenCalledWith(expect.any(Request), {
      requireAuth: true,
      requireRole: 'ADMIN',
    });
    expect(mockedRepo.getOrCreateDefault).toHaveBeenCalled();
    expect(response.status).toBe(200);
    expect(body.data).toEqual({
      ...mockWorkspace,
      discountRate: mockWorkspace.discountRate.toString(),
      cpiMin: mockWorkspace.cpiMin.toString(),
      cpiMax: mockWorkspace.cpiMax.toString(),
      createdAt: mockWorkspace.createdAt.toISOString(),
      updatedAt: mockWorkspace.updatedAt.toISOString(),
    });
    expect(body.meta?.timestamp).toEqual(expect.any(String));
  });

  it('should update workspace settings', async () => {
    const updatePayload = {
      name: 'Updated Workspace',
      discountRate: 0.09,
    };

    mockedApply.mockResolvedValue({
      session: mockSession,
      body: updatePayload,
    });

    const updatedWorkspace: WorkspaceSetting = {
      ...mockWorkspace,
      name: updatePayload.name,
      discountRate: new Decimal(updatePayload.discountRate),
    };

    mockedRepo.updateSettings.mockResolvedValue(updatedWorkspace);

    const response = await PUT(
      new NextRequest('http://localhost/api/v1/admin/workspace', {
        method: 'PUT',
        body: JSON.stringify(updatePayload),
      })
    );
    const body = await response.json();

    expect(mockedApply).toHaveBeenCalledWith(expect.any(Request), {
      requireAuth: true,
      requireRole: 'ADMIN',
      validateBody: expect.anything(),
    });
    expect(mockedRepo.updateSettings).toHaveBeenCalledWith(mockWorkspace.id, updatePayload);
    expect(response.status).toBe(200);
    expect(body.data).toEqual({
      ...updatedWorkspace,
      discountRate: updatedWorkspace.discountRate.toString(),
      cpiMin: updatedWorkspace.cpiMin.toString(),
      cpiMax: updatedWorkspace.cpiMax.toString(),
      createdAt: updatedWorkspace.createdAt.toISOString(),
      updatedAt: updatedWorkspace.updatedAt.toISOString(),
    });
  });
});
