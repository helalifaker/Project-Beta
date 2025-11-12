/**
 * Tests for Supabase server-side client
 */

import { cookies } from 'next/headers';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import { getSupabaseServerClient } from './server';

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(),
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

vi.mock('@/types/database', () => ({
  Database: {},
}));

describe('getSupabaseServerClient', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.clearAllMocks();
  });

  it('should create server client with environment variables', async () => {
    const { createServerClient } = await import('@supabase/ssr');
    const mockClient = { auth: {} };
    const mockCookieStore = {
      getAll: vi.fn().mockReturnValue([]),
      set: vi.fn(),
    };

    vi.mocked(cookies).mockResolvedValue(
      mockCookieStore as unknown as Awaited<ReturnType<typeof cookies>>
    );
    vi.mocked(createServerClient).mockReturnValue(
      mockClient as unknown as ReturnType<typeof createServerClient>
    );

    const client = await getSupabaseServerClient();

    expect(createServerClient).toHaveBeenCalledWith(
      'https://test.supabase.co',
      'test-anon-key',
      expect.objectContaining({
        cookies: expect.objectContaining({
          getAll: expect.any(Function),
          setAll: expect.any(Function),
        }),
      })
    );
    expect(client).toBe(mockClient);
  });

  it('should throw error when URL is missing', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = '';

    await expect(getSupabaseServerClient()).rejects.toThrow(
      'Missing Supabase environment variables'
    );
  });

  it('should throw error when anon key is missing', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = '';

    await expect(getSupabaseServerClient()).rejects.toThrow(
      'Missing Supabase environment variables'
    );
  });

  it('should handle cookie operations', async () => {
    const { createServerClient } = await import('@supabase/ssr');
    const mockClient = { auth: {} };
    const mockCookieStore = {
      getAll: vi.fn().mockReturnValue([{ name: 'test', value: 'cookie' }]),
      set: vi.fn(),
    };

    vi.mocked(cookies).mockResolvedValue(
      mockCookieStore as unknown as Awaited<ReturnType<typeof cookies>>
    );
    vi.mocked(createServerClient).mockImplementation(
      (url: string, key: string, options: Parameters<typeof createServerClient>[2]) => {
        const getAllResult = options.cookies.getAll();
        expect(getAllResult).toEqual([{ name: 'test', value: 'cookie' }]);
        return mockClient as unknown as ReturnType<typeof createServerClient>;
      }
    );

    await getSupabaseServerClient();

    expect(mockCookieStore.getAll).toHaveBeenCalled();
  });

  it('should handle setAll errors gracefully', async () => {
    const { createServerClient } = await import('@supabase/ssr');
    const mockClient = { auth: {} };
    const mockCookieStore = {
      getAll: vi.fn().mockReturnValue([]),
      set: vi.fn().mockImplementation(() => {
        throw new Error('Cannot set cookie in Server Component');
      }),
    };

    vi.mocked(cookies).mockResolvedValue(
      mockCookieStore as unknown as Awaited<ReturnType<typeof cookies>>
    );
    vi.mocked(createServerClient).mockImplementation(
      (url: string, key: string, options: Parameters<typeof createServerClient>[2]) => {
        // Call setAll to trigger the catch block
        options.cookies.setAll([{ name: 'test', value: 'cookie', options: {} }]);
        return mockClient as unknown as ReturnType<typeof createServerClient>;
      }
    );

    // Should not throw - catch block handles it
    const client = await getSupabaseServerClient();
    expect(client).toBe(mockClient);
  });
});
