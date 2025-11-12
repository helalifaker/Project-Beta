/**
 * Tests for API validation schemas
 */

import { describe, expect, it } from 'vitest';

import {
  paginationSchema,
  sortSchema,
  idParamSchema,
  userRoleSchema,
  emailSchema,
  passwordSchema,
  dateRangeSchema,
  filterSchema,
} from './schemas';

describe('paginationSchema', () => {
  it('should parse default values', () => {
    const result = paginationSchema.parse({});
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
  });

  it('should parse string values', () => {
    const result = paginationSchema.parse({ page: '2', limit: '10' });
    expect(result.page).toBe(2);
    expect(result.limit).toBe(10);
  });

  it('should reject invalid page', () => {
    expect(() => paginationSchema.parse({ page: '0' })).toThrow();
    expect(() => paginationSchema.parse({ page: '-1' })).toThrow();
  });

  it('should reject limit over max', () => {
    expect(() => paginationSchema.parse({ limit: '101' })).toThrow();
  });
});

describe('sortSchema', () => {
  it('should parse default values', () => {
    const result = sortSchema.parse({});
    expect(result.sort).toBe('createdAt');
    expect(result.order).toBe('desc');
  });

  it('should parse custom values', () => {
    const result = sortSchema.parse({ sort: 'name', order: 'asc' });
    expect(result.sort).toBe('name');
    expect(result.order).toBe('asc');
  });
});

describe('idParamSchema', () => {
  it('should parse valid UUID', () => {
    const result = idParamSchema.parse({
      id: '550e8400-e29b-41d4-a716-446655440000',
    });
    expect(result.id).toBe('550e8400-e29b-41d4-a716-446655440000');
  });

  it('should reject invalid UUID', () => {
    expect(() => idParamSchema.parse({ id: 'invalid' })).toThrow();
    expect(() => idParamSchema.parse({ id: '123' })).toThrow();
  });
});

describe('userRoleSchema', () => {
  it('should accept valid roles', () => {
    expect(userRoleSchema.parse('ADMIN')).toBe('ADMIN');
    expect(userRoleSchema.parse('ANALYST')).toBe('ANALYST');
    expect(userRoleSchema.parse('VIEWER')).toBe('VIEWER');
  });

  it('should reject invalid roles', () => {
    expect(() => userRoleSchema.parse('INVALID')).toThrow();
  });
});

describe('emailSchema', () => {
  it('should accept valid email', () => {
    expect(emailSchema.parse('test@example.com')).toBe('test@example.com');
  });

  it('should reject invalid email', () => {
    expect(() => emailSchema.parse('invalid')).toThrow();
    expect(() => emailSchema.parse('@example.com')).toThrow();
  });
});

describe('passwordSchema', () => {
  it('should accept valid password', () => {
    expect(passwordSchema.parse('password123')).toBe('password123');
  });

  it('should reject short password', () => {
    expect(() => passwordSchema.parse('short')).toThrow();
  });

  it('should reject long password', () => {
    expect(() => passwordSchema.parse('a'.repeat(101))).toThrow();
  });
});

describe('dateRangeSchema', () => {
  it('should parse valid date range', () => {
    const result = dateRangeSchema.parse({
      startDate: '2024-01-01T00:00:00.000Z',
      endDate: '2024-12-31T23:59:59.999Z',
    });
    expect(result.startDate).toBe('2024-01-01T00:00:00.000Z');
    expect(result.endDate).toBe('2024-12-31T23:59:59.999Z');
  });

  it('should accept optional dates', () => {
    const result = dateRangeSchema.parse({});
    expect(result.startDate).toBeUndefined();
    expect(result.endDate).toBeUndefined();
  });
});

describe('filterSchema', () => {
  it('should parse all filters', () => {
    const result = filterSchema.parse({
      search: 'test',
      status: 'DRAFT',
      role: 'ADMIN',
    });
    expect(result.search).toBe('test');
    expect(result.status).toBe('DRAFT');
    expect(result.role).toBe('ADMIN');
  });

  it('should accept optional filters', () => {
    const result = filterSchema.parse({});
    expect(result.search).toBeUndefined();
    expect(result.status).toBeUndefined();
    expect(result.role).toBeUndefined();
  });
});
