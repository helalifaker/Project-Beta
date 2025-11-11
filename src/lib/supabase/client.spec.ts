/**
 * Tests for Supabase client-side client
 */

import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import { getSupabaseClient } from './client';

vi.mock('@supabase/ssr', () => ({
  createBrowserClient: vi.fn(),
}));

vi.mock('@/types/database', () => ({
  Database: {},
}));

describe('getSupabaseClient', () => {
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

  it('should create client with environment variables', async () => {
    const { createBrowserClient } = await import('@supabase/ssr');
    const mockClient = { auth: {} };
    vi.mocked(createBrowserClient).mockReturnValue(mockClient as any);

    const client = getSupabaseClient();

    expect(createBrowserClient).toHaveBeenCalledWith(
      'https://test.supabase.co',
      'test-anon-key',
    );
    expect(client).toBe(mockClient);
  });

  it('should return singleton instance', async () => {
    vi.resetModules();
    const { createBrowserClient } = await import('@supabase/ssr');
    const mockClient = { auth: {} };
    vi.mocked(createBrowserClient).mockReturnValue(mockClient as any);

    const { getSupabaseClient: getClient } = await import('./client');
    const client1 = getClient();
    const client2 = getClient();

    expect(client1).toBe(client2);
    expect(createBrowserClient).toHaveBeenCalledTimes(1);
  });

  it('should throw error when URL is missing', async () => {
    vi.resetModules();
    process.env.NEXT_PUBLIC_SUPABASE_URL = '';
    const { getSupabaseClient: getClient } = await import('./client');

    expect(() => getClient()).toThrow('Missing Supabase environment variables');
  });

  it('should throw error when anon key is missing', async () => {
    vi.resetModules();
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = '';
    const { getSupabaseClient: getClient } = await import('./client');

    expect(() => getClient()).toThrow('Missing Supabase environment variables');
  });
});

