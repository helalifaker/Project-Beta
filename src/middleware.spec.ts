/**
 * Tests for Next.js middleware
 */

import { NextRequest, NextResponse } from 'next/server';
import { describe, it, expect, vi } from 'vitest';

import { authMiddleware } from '@/lib/auth/middleware';

import { middleware } from './middleware';

vi.mock('@/lib/auth/middleware', () => ({
  authMiddleware: vi.fn(),
}));

describe('middleware', () => {
  it('should call authMiddleware', async () => {
    const mockResponse = NextResponse.next();
    vi.mocked(authMiddleware).mockResolvedValue(mockResponse);

    const request = new NextRequest('https://example.com/admin');
    const result = await middleware(request);

    expect(authMiddleware).toHaveBeenCalledWith(request);
    expect(result).toBe(mockResponse);
  });
});
