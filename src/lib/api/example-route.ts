/**
 * Example API route using middleware
 * Demonstrates usage of API middleware, validation, and error handling
 */

import { NextRequest } from 'next/server';

import { getOrSetCached } from '@/lib/cache/kv';
import { generateCacheKey } from '@/lib/cache/react-cache';
import { userRepository } from '@/lib/db/repositories/user-repository';

import { applyApiMiddleware, withErrorHandling } from './middleware';
import { successResponse, paginatedResponse } from './response';
import { paginationSchema, filterSchema } from './schemas';

/**
 * Example GET handler with middleware
 */
export const GET = withErrorHandling(async (request: NextRequest) => {
  // Apply middleware: auth + query validation
  const { session, query } = await applyApiMiddleware(request, {
    requireAuth: true,
    validateQuery: paginationSchema.merge(filterSchema),
  });

  const { page, limit, role } = query as {
    page: number;
    limit: number;
    role?: string;
  };

  // Generate cache key
  const cacheKey = generateCacheKey('users', page, limit, role || 'all');

  // Get or set cached data
  const result = await getOrSetCached(
    cacheKey,
    async () => {
      const where = role ? { role: role as 'ADMIN' | 'ANALYST' | 'VIEWER' } : undefined;
      const [users, total] = await Promise.all([
        userRepository.findMany(where),
        userRepository.count(where),
      ]);

      return {
        users,
        total,
      };
    },
    { ttl: 60 } // Cache for 1 minute
  );

  return paginatedResponse(
    result.users,
    {
      page,
      limit,
      total: result.total,
      totalPages: Math.ceil(result.total / limit),
      hasNext: page * limit < result.total,
      hasPrev: page > 1,
    },
    {
      requestId: request.headers.get('x-request-id') || undefined,
    }
  );
});

