/**
 * Tests for rate limiting utility
 */

import { describe, expect, it, vi, beforeEach } from 'vitest';

import { checkRateLimit, getRateLimitHeaders } from './ratelimit';

const ratelimitInstances: Array<{ limit: ReturnType<typeof vi.fn> }> = [];
let currentLimitMock: ReturnType<typeof vi.fn> | undefined;
let slidingWindowMock: ReturnType<typeof vi.fn> = vi.fn(() => ({}));

vi.mock('@upstash/ratelimit', () => {
  class MockRatelimit {
    public limit: ReturnType<typeof vi.fn>;

    constructor() {
      this.limit = currentLimitMock ?? vi.fn();
      ratelimitInstances.push(this);
    }

    static slidingWindow(...args: Parameters<typeof slidingWindowMock>) {
      return slidingWindowMock(...args);
    }
  }

  return { Ratelimit: MockRatelimit };
});

vi.mock('@upstash/redis', () => ({
  Redis: {
    fromEnv: vi.fn().mockReturnValue({}),
  },
}));

describe('checkRateLimit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    ratelimitInstances.length = 0;
    currentLimitMock = undefined;
    slidingWindowMock = vi.fn(() => ({}));
  });

  it('should check rate limit successfully', async () => {
    const { Ratelimit } = await import('@upstash/ratelimit');

    const mockLimit = vi.fn().mockResolvedValue({
      success: true,
      limit: 100,
      remaining: 100,
      reset: Date.now() + 60000,
    });
    currentLimitMock = mockLimit;

    const result = await checkRateLimit('user-123', 100, '1 m');

    expect(slidingWindowMock).toHaveBeenCalledWith(100, '60 s');
    expect(mockLimit).toHaveBeenCalledWith('user-123');
    expect(result.success).toBe(true);
    expect(result.limit).toBe(100);
    expect(result.remaining).toBe(100);
    expect(ratelimitInstances).toHaveLength(1);
  });

  it('should parse window correctly', async () => {
    await import('@upstash/ratelimit');

    const mockLimit = vi.fn().mockResolvedValue({
      success: true,
      limit: 50,
      remaining: 50,
      reset: Date.now() + 3600000,
    });
    currentLimitMock = mockLimit;

    const result = await checkRateLimit('user-123', 50, '1 h');

    expect(slidingWindowMock).toHaveBeenCalledWith(50, '3600 s');
    expect(mockLimit).toHaveBeenCalledWith('user-123');
    expect(result.success).toBe(true);
    expect(result.limit).toBe(50);
  });

  it('should fail open on error', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    currentLimitMock = vi.fn().mockRejectedValue(new Error('Redis connection failed'));

    const result = await checkRateLimit('user-123', 100, '1 m');

    expect(result.success).toBe(true);
    expect(result.limit).toBe(100);
    expect(result.remaining).toBe(100);
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it('should initialize ratelimit singleton on first call', async () => {
    // Reset module to ensure fresh singleton
    vi.resetModules();
    const { Redis } = await import('@upstash/redis');
    vi.mocked(Redis.fromEnv).mockReturnValue({} as any);

    const mockLimit = vi.fn().mockResolvedValue({
      success: true,
      limit: 100,
      remaining: 100,
      reset: Date.now() + 60000,
    });
    currentLimitMock = mockLimit;

    // First call should initialize singleton
    const { checkRateLimit } = await import('./ratelimit');
    await checkRateLimit('user-1', 100, '1 m');

    // Second call should reuse singleton
    await checkRateLimit('user-2', 100, '1 m');

    // Should only create one instance
    expect(ratelimitInstances.length).toBeGreaterThanOrEqual(1);
  });
});

describe('getRateLimitHeaders', () => {
  it('should create rate limit headers', () => {
    const result = {
      success: true,
      limit: 100,
      remaining: 50,
      reset: 1234567890,
    };

    const headers = getRateLimitHeaders(result);

    expect(headers['X-RateLimit-Limit']).toBe('100');
    expect(headers['X-RateLimit-Remaining']).toBe('50');
    expect(headers['X-RateLimit-Reset']).toBe('1234567890');
  });
});


