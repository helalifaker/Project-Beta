/**
 * Tests for auth callback route
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import type { Mock } from 'vitest';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import { GET } from './route';

declare const process: NodeJS.Process & {
  env: Record<string, string | undefined>;
};

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(),
}));

const mockCookieStore = {
  getAll: vi.fn(() => []),
  set: vi.fn(),
};

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

const originalEnv = { ...process.env };

beforeEach(() => {
  vi.clearAllMocks();
  (cookies as unknown as Mock).mockResolvedValue(mockCookieStore);
  mockCookieStore.getAll.mockReturnValue([]);
  mockCookieStore.set.mockImplementation(() => undefined);
});

afterEach(() => {
  process.env = { ...originalEnv };
});

describe('GET /auth/callback', () => {
  it('should exchange code and redirect to provided path', async () => {
    const exchangeCodeForSession = vi.fn().mockResolvedValue(undefined);
    vi.mocked(createServerClient).mockReturnValue({
      auth: { exchangeCodeForSession },
    } as unknown as ReturnType<typeof createServerClient>);

    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://supabase.test';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon';

    const request = new NextRequest(
      'https://example.com/auth/callback?code=abc123&redirect=%2Fdashboard'
    );

    const response = await GET(request);

    expect(exchangeCodeForSession).toHaveBeenCalledWith('abc123');
    expect(response.headers.get('location')).toBe('https://example.com/dashboard');
  });

  it('should redirect to config error when env vars missing', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const request = new NextRequest('https://example.com/auth/callback?code=abc123');

    const response = await GET(request);

    expect(response.headers.get('location')).toBe(
      'https://example.com/login?error=config'
    );
    expect(createServerClient).not.toHaveBeenCalled();
  });

  it('should redirect to login when code is missing', async () => {
    const request = new NextRequest('https://example.com/auth/callback');

    const response = await GET(request);

    expect(response.headers.get('location')).toBe('https://example.com/login');
  });
});
