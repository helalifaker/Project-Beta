/**
 * Tests for Vercel KV caching utilities
 */

import { describe, expect, it, vi, beforeEach } from 'vitest';

import { getCached, setCached, deleteCached, getOrSetCached, invalidateCache } from './kv';

vi.mock('@vercel/kv', () => ({
  kv: {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
  },
}));

describe('getCached', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should get cached value', async () => {
    const { kv } = await import('@vercel/kv');
    vi.mocked(kv.get).mockResolvedValue({ id: '1', name: 'Test' });

    const result = await getCached<{ id: string; name: string }>('key-1');

    expect(result).toEqual({ id: '1', name: 'Test' });
    expect(kv.get).toHaveBeenCalledWith('key-1');
  });

  it('should return null on error', async () => {
    const { kv } = await import('@vercel/kv');
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(kv.get).mockRejectedValue(new Error('Cache error'));

    const result = await getCached('key-1');

    expect(result).toBeNull();
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });
});

describe('setCached', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should set cached value with default TTL', async () => {
    const { kv } = await import('@vercel/kv');
    vi.mocked(kv.set).mockResolvedValue('OK');

    await setCached('key-1', { id: '1' });

    expect(kv.set).toHaveBeenCalledWith('key-1', { id: '1' }, { ex: 300 });
  });

  it('should set cached value with custom TTL', async () => {
    const { kv } = await import('@vercel/kv');
    vi.mocked(kv.set).mockResolvedValue('OK');

    await setCached('key-1', { id: '1' }, { ttl: 600 });

    expect(kv.set).toHaveBeenCalledWith('key-1', { id: '1' }, { ex: 600 });
  });

  it('should handle errors gracefully', async () => {
    const { kv } = await import('@vercel/kv');
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(kv.set).mockRejectedValue(new Error('Cache error'));

    await setCached('key-1', { id: '1' });

    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });
});

describe('deleteCached', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should delete cached value', async () => {
    const { kv } = await import('@vercel/kv');
    vi.mocked(kv.del).mockResolvedValue(1);

    await deleteCached('key-1');

    expect(kv.del).toHaveBeenCalledWith('key-1');
  });

  it('should handle errors gracefully', async () => {
    const { kv } = await import('@vercel/kv');
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(kv.del).mockRejectedValue(new Error('Cache error'));

    await deleteCached('key-1');

    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });
});

describe('getOrSetCached', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return cached value if exists', async () => {
    const { kv } = await import('@vercel/kv');
    const cachedValue = { id: '1', name: 'Cached' };
    vi.mocked(kv.get).mockResolvedValue(cachedValue);
    const fetcher = vi.fn();

    const result = await getOrSetCached('key-1', fetcher);

    expect(result).toEqual(cachedValue);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('should fetch and cache if not cached', async () => {
    const { kv } = await import('@vercel/kv');
    const fetchedValue = { id: '1', name: 'Fetched' };
    vi.mocked(kv.get).mockResolvedValue(null);
    vi.mocked(kv.set).mockResolvedValue('OK');
    const fetcher = vi.fn().mockResolvedValue(fetchedValue);

    const result = await getOrSetCached('key-1', fetcher);

    expect(result).toEqual(fetchedValue);
    expect(fetcher).toHaveBeenCalled();
    expect(kv.set).toHaveBeenCalledWith('key-1', fetchedValue, { ex: 300 });
  });
});

describe('invalidateCache', () => {
  it('should log warning (placeholder)', async () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    await invalidateCache('pattern:*');

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Pattern-based cache invalidation not fully implemented',
    );

    consoleWarnSpy.mockRestore();
  });
});

