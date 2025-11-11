/**
 * Tests for Next.js middleware
 */

import { describe, it, expect, vi } from 'vitest';
import { middleware } from './middleware';
import { authMiddleware } from '@/lib/auth/middleware';
import { NextRequest } from 'next/server';

vi.mock('@/lib/auth/middleware', () => ({
  authMiddleware: vi.fn(),
}));

describe('middleware', () => {
  it('should call authMiddleware', async () => {
    const mockResponse = new Response();
    vi.mocked(authMiddleware).mockResolvedValue(mockResponse);

    const request = new NextRequest('https://example.com/admin');
    const result = await middleware(request);

    expect(authMiddleware).toHaveBeenCalledWith(request);
    expect(result).toBe(mockResponse);
  });
});

