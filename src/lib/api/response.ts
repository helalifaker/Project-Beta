/**
 * API response utilities
 * Standardized response formatting for API routes
 */

import { ApiError } from './errors';

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
  fields?: Record<string, string[]>;
  meta?: {
    timestamp: string;
    requestId?: string;
    resource?: string;
    id?: string;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Create success response
 */
export function successResponse<T>(
  data: T,
  statusCode: number = 200,
  meta?: ApiResponse['meta']
): Response {
  return Response.json(
    {
      data,
      meta: {
        timestamp: new Date().toISOString(),
        ...meta,
      },
    },
    { status: statusCode }
  );
}

/**
 * Create error response
 */
export function errorResponse(
  error: ApiError | Error,
  requestId?: string
): Response {
  if (error instanceof ApiError) {
    return Response.json(
      {
        error: error.code,
        message: error.message,
        fields: (error as { fields?: Record<string, string[]> }).fields,
        meta: {
          timestamp: new Date().toISOString(),
          requestId,
          ...error.details,
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
        requestId,
      },
    },
    { status: 500 }
  );
}

/**
 * Create paginated response
 */
export function paginatedResponse<T>(
  data: T[],
  pagination: PaginatedResponse<T>['pagination'],
  meta?: ApiResponse['meta']
): Response {
  return Response.json(
    {
      data,
      pagination,
      meta: {
        timestamp: new Date().toISOString(),
        ...meta,
      },
    },
    { status: 200 }
  );
}

