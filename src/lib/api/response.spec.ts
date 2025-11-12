/**
 * Tests for API response utilities
 */

import { describe, expect, it } from 'vitest';

import { ValidationError, NotFoundError } from './errors';
import { successResponse, errorResponse, paginatedResponse } from './response';

describe('successResponse', () => {
  it('should create success response with default status', async () => {
    const response = successResponse({ id: '1', name: 'Test' });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toEqual({ id: '1', name: 'Test' });
    expect(body.meta.timestamp).toBeDefined();
  });

  it('should create success response with custom status', async () => {
    const response = successResponse({ id: '1' }, 201);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.data).toEqual({ id: '1' });
  });

  it('should include custom meta', async () => {
    const response = successResponse({ id: '1' }, 200, {
      requestId: 'req-123',
      resource: 'version',
      id: '1',
    });
    const body = await response.json();

    expect(body.meta.requestId).toBe('req-123');
    expect(body.meta.resource).toBe('version');
    expect(body.meta.id).toBe('1');
  });
});

describe('errorResponse', () => {
  it('should create error response from ApiError', async () => {
    const error = new NotFoundError('Version', 'v-1');
    const response = errorResponse(error, 'req-123');
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error).toBe('NOT_FOUND');
    expect(body.message).toBe('Version not found');
    expect(body.meta.requestId).toBe('req-123');
    expect(body.meta.resource).toBe('Version');
    expect(body.meta.id).toBe('v-1');
  });

  it('should create error response from ValidationError with fields', async () => {
    const error = new ValidationError('Validation failed', {
      name: ['Name is required'],
      email: ['Invalid email'],
    });
    const response = errorResponse(error);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('VALIDATION_ERROR');
    expect(body.fields).toEqual({
      name: ['Name is required'],
      email: ['Invalid email'],
    });
  });

  it('should create error response from generic Error', async () => {
    const error = new Error('Something went wrong');
    const response = errorResponse(error, 'req-456');
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe('INTERNAL_ERROR');
    expect(body.message).toBe('An unexpected error occurred');
    expect(body.meta.requestId).toBe('req-456');
  });
});

describe('paginatedResponse', () => {
  it('should create paginated response', async () => {
    const data = [{ id: '1' }, { id: '2' }];
    const pagination = {
      page: 1,
      limit: 20,
      total: 50,
      totalPages: 3,
      hasNext: true,
      hasPrev: false,
    };

    const response = paginatedResponse(data, pagination, { requestId: 'req-789' });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toEqual(data);
    expect(body.pagination).toEqual(pagination);
    expect(body.meta.requestId).toBe('req-789');
    expect(body.meta.timestamp).toBeDefined();
  });

  it('should handle empty data', async () => {
    const response = paginatedResponse([], {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
      hasNext: false,
      hasPrev: false,
    });
    const body = await response.json();

    expect(body.data).toEqual([]);
    expect(body.pagination.total).toBe(0);
  });
});
