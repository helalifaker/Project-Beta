/**
 * API middleware tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { applyApiMiddleware } from './middleware';
import {
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
} from './errors';
import { requireAuth, requireRole } from '@/lib/auth/session';
import { z } from 'zod';

vi.mock('@/lib/auth/session');

describe('applyApiMiddleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should pass through if no options', async () => {
    const request = new Request('http://localhost/api/test') as any;
    const result = await applyApiMiddleware(request);

    expect(result).toEqual({});
  });

  it('should require authentication', async () => {
    vi.mocked(requireAuth).mockRejectedValue(new Error('UNAUTHORIZED'));

    const request = new Request('http://localhost/api/test') as any;

    await expect(
      applyApiMiddleware(request, { requireAuth: true })
    ).rejects.toThrow(UnauthorizedError);
  });

  it('should require specific role', async () => {
    vi.mocked(requireRole).mockRejectedValue(new Error('FORBIDDEN'));

    const request = new Request('http://localhost/api/test') as any;

    await expect(
      applyApiMiddleware(request, { requireRole: 'ADMIN' })
    ).rejects.toThrow(ForbiddenError);
  });

  it('should validate request body', async () => {
    const schema = z.object({
      name: z.string().min(3),
    });

    const request = new Request('http://localhost/api/test', {
      method: 'POST',
      body: JSON.stringify({ name: 'ab' }), // Too short
    }) as any;

    await expect(
      applyApiMiddleware(request, { validateBody: schema })
    ).rejects.toThrow(ValidationError);
  });

  it('should validate query parameters', async () => {
    const schema = z.object({
      page: z.coerce.number().int(),
    });

    const request = new Request('http://localhost/api/test?page=invalid') as any;

    await expect(
      applyApiMiddleware(request, { validateQuery: schema })
    ).rejects.toThrow(ValidationError);
  });

  it('should return validated body and session', async () => {
    const mockSession = {
      user: {
        id: 'user-id',
        email: 'test@example.com',
        role: 'ADMIN' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      accessToken: 'token',
      expiresAt: new Date(),
    };

    vi.mocked(requireAuth).mockResolvedValue(mockSession);

    const bodySchema = z.object({
      name: z.string(),
    });

    const request = new Request('http://localhost/api/test', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test' }),
    }) as any;

    const result = await applyApiMiddleware(request, {
      requireAuth: true,
      validateBody: bodySchema,
    });

    expect(result.session).toBe(mockSession);
    expect(result.body).toEqual({ name: 'Test' });
  });

  it('should throw non-ZodError from body validation', async () => {
    const schema = z.object({
      name: z.string(),
    });

    const request = {
      json: vi.fn().mockRejectedValue(new Error('JSON parse error')),
      url: 'http://localhost/api/test',
    } as any;

    await expect(
      applyApiMiddleware(request, { validateBody: schema })
    ).rejects.toThrow('JSON parse error');
  });

  it('should throw non-ZodError from query validation', async () => {
    const schema = z.object({
      page: z.string(),
    });

    const request = {
      url: 'http://localhost/api/test',
    } as any;

    // Mock URL constructor to throw
    const originalURL = global.URL;
    global.URL = vi.fn().mockImplementation(() => {
      throw new Error('Invalid URL');
    }) as any;

    await expect(
      applyApiMiddleware(request, { validateQuery: schema })
    ).rejects.toThrow('Invalid URL');

    global.URL = originalURL;
  });
});

describe('withErrorHandling', () => {
  it('should handle ValidationError', async () => {
    const { withErrorHandling } = await import('./middleware');
    const handler = vi.fn().mockRejectedValue(
      new ValidationError('Invalid input', { fields: { name: ['Required'] } })
    );

    const wrapped = withErrorHandling(handler);
    const response = await wrapped(new Request('http://localhost/api/test') as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('VALIDATION_ERROR');
    expect(data.fields).toEqual({ fields: { name: ['Required'] } });
  });

  it('should handle UnauthorizedError', async () => {
    const { withErrorHandling } = await import('./middleware');
    const handler = vi.fn().mockRejectedValue(new UnauthorizedError());

    const wrapped = withErrorHandling(handler);
    const response = await wrapped(new Request('http://localhost/api/test') as any);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('UNAUTHORIZED');
  });

  it('should handle ForbiddenError', async () => {
    const { withErrorHandling } = await import('./middleware');
    const handler = vi.fn().mockRejectedValue(new ForbiddenError());

    const wrapped = withErrorHandling(handler);
    const response = await wrapped(new Request('http://localhost/api/test') as any);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe('FORBIDDEN');
  });

  it('should handle unknown errors', async () => {
    const { withErrorHandling } = await import('./middleware');
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const handler = vi.fn().mockRejectedValue(new Error('Unknown error'));

    const wrapped = withErrorHandling(handler);
    const response = await wrapped(new Request('http://localhost/api/test') as any);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('INTERNAL_ERROR');
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});

