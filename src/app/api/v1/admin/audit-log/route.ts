/**
 * Audit log API routes
 * GET: List audit log entries
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';

import { applyApiMiddleware, withErrorHandling } from '@/lib/api/middleware';
import { paginatedResponse } from '@/lib/api/response';
import { paginationSchema } from '@/lib/api/schemas';
import { prisma } from '@/lib/db/prisma';

const auditLogQuerySchema = paginationSchema.extend({
  entityType: z.string().optional(),
  action: z.string().optional(),
});

export const GET = withErrorHandling(async (request: NextRequest) => {
  const { query } = await applyApiMiddleware(request, {
    requireAuth: true,
    requireRole: 'ADMIN',
    validateQuery: auditLogQuerySchema,
  });

  const { page, limit, entityType, action } = query as {
    page: number;
    limit: number;
    entityType?: string;
    action?: string;
  };

  const where: {
    entityType?: string;
    action?: string;
  } = {};

  if (entityType) {
    where.entityType = entityType;
  }

  if (action) {
    where.action = action;
  }

  const [entries, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        actor: {
          select: {
            email: true,
            role: true,
          },
        },
      },
    }),
    prisma.auditLog.count({ where }),
  ]);

  const requestId = request.headers.get('x-request-id');
  return paginatedResponse(
    entries,
    {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
    requestId ? { requestId } : undefined
  );
});

