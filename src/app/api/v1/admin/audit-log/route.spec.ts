/**
 * Integration tests for audit log API routes
 */

import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { applyApiMiddleware } from '@/lib/api/middleware';
import { prisma } from '@/lib/db/prisma';
import type { Session } from '@/types/auth';

import { GET } from './route';

vi.mock('@/lib/api/middleware', () => ({
  applyApiMiddleware: vi.fn(),
  withErrorHandling: (fn: () => Promise<Response>) => fn,
}));

vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    auditLog: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
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

const mockAuditLogEntries = [
  {
    id: 'log-1',
    action: 'CREATE',
    entityType: 'version',
    entityId: 'v-1',
    metadata: {},
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    actor: {
      email: 'admin@example.com',
      role: 'ADMIN',
    },
  },
  {
    id: 'log-2',
    action: 'UPDATE',
    entityType: 'template',
    entityId: 'tpl-1',
    metadata: {},
    createdAt: new Date('2024-01-02T00:00:00.000Z'),
    actor: {
      email: 'analyst@example.com',
      role: 'ANALYST',
    },
  },
];

describe('GET /api/v1/admin/audit-log', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return paginated audit log entries', async () => {
    vi.mocked(applyApiMiddleware).mockResolvedValue({
      session: mockSession,
      query: { page: 1, limit: 20 },
    });
    vi.mocked(prisma.auditLog.findMany).mockResolvedValue(mockAuditLogEntries as any);
    vi.mocked(prisma.auditLog.count).mockResolvedValue(2);

    const response = await GET(
      new NextRequest('http://localhost/api/v1/admin/audit-log?page=1&limit=20'),
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data).toHaveLength(2);
    expect(body.pagination.total).toBe(2);
    expect(body.pagination.page).toBe(1);
    expect(body.pagination.limit).toBe(20);
  });

  it('should filter by entity type', async () => {
    vi.mocked(applyApiMiddleware).mockResolvedValue({
      session: mockSession,
      query: { page: 1, limit: 20, entityType: 'version' },
    });
    vi.mocked(prisma.auditLog.findMany).mockResolvedValue([mockAuditLogEntries[0]] as any);
    vi.mocked(prisma.auditLog.count).mockResolvedValue(1);

    const response = await GET(
      new NextRequest('http://localhost/api/v1/admin/audit-log?entityType=version'),
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data).toHaveLength(1);
    expect(prisma.auditLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { entityType: 'version' },
      }),
    );
  });

  it('should filter by action', async () => {
    vi.mocked(applyApiMiddleware).mockResolvedValue({
      session: mockSession,
      query: { page: 1, limit: 20, action: 'CREATE' },
    });
    vi.mocked(prisma.auditLog.findMany).mockResolvedValue([mockAuditLogEntries[0]] as any);
    vi.mocked(prisma.auditLog.count).mockResolvedValue(1);

    const response = await GET(
      new NextRequest('http://localhost/api/v1/admin/audit-log?action=CREATE'),
    );

    expect(response.status).toBe(200);
    expect(prisma.auditLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { action: 'CREATE' },
      }),
    );
  });

  it('should require ADMIN role', async () => {
    vi.mocked(applyApiMiddleware).mockRejectedValue(new Error('Forbidden'));

    await expect(
      GET(new NextRequest('http://localhost/api/v1/admin/audit-log')),
    ).rejects.toThrow('Forbidden');
  });

  it('should handle pagination correctly', async () => {
    vi.mocked(applyApiMiddleware).mockResolvedValue({
      session: mockSession,
      query: { page: 2, limit: 10 },
    });
    vi.mocked(prisma.auditLog.findMany).mockResolvedValue([] as any);
    vi.mocked(prisma.auditLog.count).mockResolvedValue(25);

    const response = await GET(
      new NextRequest('http://localhost/api/v1/admin/audit-log?page=2&limit=10'),
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.pagination.page).toBe(2);
    expect(body.pagination.totalPages).toBe(3);
    expect(body.pagination.hasNext).toBe(true);
    expect(body.pagination.hasPrev).toBe(true);
    expect(prisma.auditLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 10,
        take: 10,
      }),
    );
  });
});

