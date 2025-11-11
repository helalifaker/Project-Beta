/**
 * Tests for API error classes
 */

import { describe, expect, it } from 'vitest';

import {
  ApiError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  InternalServerError,
} from './errors';

describe('ApiError', () => {
  it('should create ApiError with all properties', () => {
    const error = new ApiError('Test error', 400, 'TEST_ERROR', { key: 'value' });

    expect(error.message).toBe('Test error');
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe('TEST_ERROR');
    expect(error.details).toEqual({ key: 'value' });
    expect(error.name).toBe('ApiError');
    expect(error).toBeInstanceOf(Error);
  });
});

describe('ValidationError', () => {
  it('should create ValidationError with default message', () => {
    const error = new ValidationError();

    expect(error.message).toBe('Validation failed');
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.name).toBe('ValidationError');
  });

  it('should create ValidationError with custom message and fields', () => {
    const fields = { name: ['Required'], email: ['Invalid'] };
    const error = new ValidationError('Custom message', fields);

    expect(error.message).toBe('Custom message');
    expect(error.fields).toEqual(fields);
    expect(error.details?.fields).toEqual(fields);
  });
});

describe('UnauthorizedError', () => {
  it('should create UnauthorizedError with default message', () => {
    const error = new UnauthorizedError();

    expect(error.message).toBe('Authentication required');
    expect(error.statusCode).toBe(401);
    expect(error.code).toBe('UNAUTHORIZED');
  });

  it('should create UnauthorizedError with custom message', () => {
    const error = new UnauthorizedError('Please login');

    expect(error.message).toBe('Please login');
  });
});

describe('ForbiddenError', () => {
  it('should create ForbiddenError with default message', () => {
    const error = new ForbiddenError();

    expect(error.message).toBe('Insufficient permissions');
    expect(error.statusCode).toBe(403);
    expect(error.code).toBe('FORBIDDEN');
  });
});

describe('NotFoundError', () => {
  it('should create NotFoundError with resource and id', () => {
    const error = new NotFoundError('Version', 'v-1');

    expect(error.message).toBe('Version not found');
    expect(error.statusCode).toBe(404);
    expect(error.code).toBe('NOT_FOUND');
    expect(error.details?.resource).toBe('Version');
    expect(error.details?.id).toBe('v-1');
  });

  it('should create NotFoundError with custom message', () => {
    const error = new NotFoundError('Version', 'v-1', 'Custom not found message');

    expect(error.message).toBe('Custom not found message');
  });
});

describe('ConflictError', () => {
  it('should create ConflictError with default message', () => {
    const error = new ConflictError();

    expect(error.message).toBe('Resource conflict');
    expect(error.statusCode).toBe(409);
    expect(error.code).toBe('CONFLICT');
  });
});

describe('RateLimitError', () => {
  it('should create RateLimitError with default message', () => {
    const error = new RateLimitError();

    expect(error.message).toBe('Rate limit exceeded');
    expect(error.statusCode).toBe(429);
    expect(error.code).toBe('RATE_LIMIT_EXCEEDED');
  });
});

describe('InternalServerError', () => {
  it('should create InternalServerError with default message', () => {
    const error = new InternalServerError();

    expect(error.message).toBe('Internal server error');
    expect(error.statusCode).toBe(500);
    expect(error.code).toBe('INTERNAL_ERROR');
  });
});

