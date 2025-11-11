/**
 * Tests for auth middleware
 */

import { NextRequest, NextResponse } from 'next/server';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import { authMiddleware } from './middleware';

const mockGetSession = vi.fn();
const mockSingle = vi.fn();

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      getSession: mockGetSession,
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: mockSingle,
    })),
  })),
}));

const originalEnv = { ...process.env } as Record<string, string | undefined>;

function createRequest(path: string): NextRequest {
  return new NextRequest(`https://example.com${path}`);
}

function expectRedirectTo(response: NextResponse, pathname: string) {
  expect(response.headers.get('location')).toBe(`https://example.com${pathname}`);
}

describe('authMiddleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSession.mockReset();
    mockSingle.mockReset();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://supabase.example.com';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('should allow public routes without auth', async () => {
    const request = createRequest('/login');

    const response = await authMiddleware(request);

    expect(response).toBeInstanceOf(NextResponse);
    expect(response.headers.get('location')).toBeNull();
  });

  it('should allow API routes without auth', async () => {
    const request = createRequest('/api/v1/public');

    const response = await authMiddleware(request);

    expect(response).toBeInstanceOf(NextResponse);
    expect(response.headers.get('location')).toBeNull();
  });

  it('should allow non-protected routes', async () => {
    const request = createRequest('/public-page');

    const response = await authMiddleware(request);

    expect(response).toBeInstanceOf(NextResponse);
    expect(response.headers.get('location')).toBeNull();
  });

  it('should redirect to login when supabase env is missing', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;

    const request = createRequest('/admin');
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null });

    const response = await authMiddleware(request);

    expectRedirectTo(response as NextResponse, '/login');
  });

  it('should redirect to login when session is missing', async () => {
    const request = createRequest('/admin');
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null });

    const response = (await authMiddleware(request)) as NextResponse;

    expect(response.headers.get('location')).toBe(
      'https://example.com/login?redirect=%2Fadmin'
    );
  });

  it('should allow access when role requirement passes', async () => {
    const request = createRequest('/admin');
    mockGetSession.mockResolvedValue({
      data: { session: { user: { id: 'user-1' } } },
      error: null,
    });
    mockSingle.mockResolvedValue({ data: { role: 'ADMIN' }, error: null });

    const response = await authMiddleware(request);

    expect(response).toBeInstanceOf(NextResponse);
    expect(response.headers.get('location')).toBeNull();
  });

  it('should redirect to unauthorized when role requirement fails', async () => {
    const request = createRequest('/admin');
    mockGetSession.mockResolvedValue({
      data: { session: { user: { id: 'user-1' } } },
      error: null,
    });
    mockSingle.mockResolvedValue({ data: { role: 'VIEWER' }, error: null });

    const response = (await authMiddleware(request)) as NextResponse;

    expectRedirectTo(response, '/unauthorized');
  });

  it('should ignore role errors and allow request', async () => {
    const request = createRequest('/admin');
    mockGetSession.mockResolvedValue({
      data: { session: { user: { id: 'user-1' } } },
      error: null,
    });
    mockSingle.mockRejectedValue(new Error('Database error'));

    const response = await authMiddleware(request);

    expect(response).toBeInstanceOf(NextResponse);
    expect(response.headers.get('location')).toBeNull();
  });
});
