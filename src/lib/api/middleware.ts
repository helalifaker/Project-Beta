/**
 * API middleware utilities
 * Reusable middleware functions for API routes
 */

import { z } from 'zod';

import { getServerSession, requireAuth, requireRole } from '@/lib/auth/session';
import type { UserRole } from '@/types/auth';

import {
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
} from './errors';

/**
 * Middleware options
 */
export interface ApiMiddlewareOptions {
  requireAuth?: boolean;
  requireRole?: UserRole;
  validateBody?: z.ZodSchema;
  validateQuery?: z.ZodSchema;
  rateLimit?: {
    limit: number;
    window: string; // e.g., '1 m', '1 h'
  };
}

/**
 * API middleware result
 */
export interface ApiMiddlewareResult {
  session?: Awaited<ReturnType<typeof getServerSession>>;
  body?: unknown;
  query?: unknown;
}

/**
 * Apply API middleware
 * Handles authentication, authorization, validation, and rate limiting
 */
export async function applyApiMiddleware(
  request: Request,
  options: ApiMiddlewareOptions = {}
): Promise<ApiMiddlewareResult> {
  const result: ApiMiddlewareResult = {};

  // Rate limiting (if enabled)
  if (options.rateLimit) {
    // TODO: Implement rate limiting when @upstash/ratelimit is installed
    // const { success } = await ratelimit.limit(identifier);
    // if (!success) {
    //   throw new RateLimitError();
    // }
  }

  // Authentication
  if (options.requireAuth || options.requireRole) {
    try {
      if (options.requireRole) {
        result.session = await requireRole(options.requireRole);
      } else {
        result.session = await requireAuth();
      }
    } catch (error) {
      if (error instanceof Error && error.message === 'UNAUTHORIZED') {
        throw new UnauthorizedError();
      }
      if (error instanceof Error && error.message === 'FORBIDDEN') {
        throw new ForbiddenError();
      }
      throw error;
    }
  }

  // Body validation
  if (options.validateBody) {
    try {
      const body = await request.json();
      result.body = options.validateBody.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError('Invalid request body', {
          fields: error.flatten().fieldErrors,
        });
      }
      throw error;
    }
  }

  // Query validation
  if (options.validateQuery) {
    try {
      const { searchParams } = new URL(request.url);
      const query: Record<string, string> = {};
      searchParams.forEach((value, key) => {
        query[key] = value;
      });
      result.query = options.validateQuery.parse(query);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError('Invalid query parameters', {
          fields: error.flatten().fieldErrors,
        });
      }
      throw error;
    }
  }

  return result;
}

/**
 * Wrap API route handler with error handling
 */
export function withErrorHandling<T extends unknown[]>(
  handler: (...args: T) => Promise<Response>
) {
  return async (...args: T): Promise<Response> => {
    try {
      return await handler(...args);
    } catch (error) {
      console.error('API error:', error);
      
      if (error instanceof ValidationError) {
        return Response.json(
          {
            error: error.code,
            message: error.message,
            fields: error.fields,
            meta: {
              timestamp: new Date().toISOString(),
            },
          },
          { status: error.statusCode }
        );
      }

      if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
        return Response.json(
          {
            error: error.code,
            message: error.message,
            meta: {
              timestamp: new Date().toISOString(),
            },
          },
          { status: error.statusCode }
        );
      }

      // Unknown error
      return Response.json(
        {
          error: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
          meta: {
            timestamp: new Date().toISOString(),
          },
        },
        { status: 500 }
      );
    }
  };
}

