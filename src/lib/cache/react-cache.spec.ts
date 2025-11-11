/**
 * Tests for React Cache API utilities
 */

import { describe, expect, it } from 'vitest';

import { createCachedFunction, generateCacheKey } from './react-cache';

describe('createCachedFunction', () => {
  it('should create cached function', async () => {
    const originalFn = vi.fn().mockResolvedValue('result');
    const cachedFn = createCachedFunction(originalFn);

    const result = await cachedFn('arg1', 'arg2');

    expect(result).toBe('result');
    expect(originalFn).toHaveBeenCalledWith('arg1', 'arg2');
  });

  it('should create cached function with key function', async () => {
    const originalFn = vi.fn().mockResolvedValue('result');
    const keyFn = vi.fn().mockReturnValue('custom-key');
    const cachedFn = createCachedFunction(originalFn, keyFn);

    const result = await cachedFn('arg1');

    expect(result).toBe('result');
    expect(originalFn).toHaveBeenCalledWith('arg1');
  });
});

describe('generateCacheKey', () => {
  it('should generate cache key with prefix and parts', () => {
    const key = generateCacheKey('user', '123', 'profile');

    expect(key).toBe('user:123:profile');
  });

  it('should handle multiple parts', () => {
    const key = generateCacheKey('version', 'v-1', 'assumptions', 'lease');

    expect(key).toBe('version:v-1:assumptions:lease');
  });

  it('should handle empty parts', () => {
    const key = generateCacheKey('test');

    expect(key).toBe('test:');
  });
});

