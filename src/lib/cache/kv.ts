/**
 * Vercel KV caching utilities
 * Provides caching layer using Vercel KV (Redis)
 */

import { kv } from '@vercel/kv';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
}

/**
 * Get cached value
 */
export async function getCached<T>(key: string): Promise<T | null> {
  try {
    const value = await kv.get<T>(key);
    return value;
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
}

/**
 * Set cached value
 */
export async function setCached<T>(
  key: string,
  value: T,
  options?: CacheOptions
): Promise<void> {
  try {
    const ttl = options?.ttl || 300; // Default 5 minutes
    await kv.set(key, value, { ex: ttl });
  } catch (error) {
    console.error('Cache set error:', error);
  }
}

/**
 * Delete cached value
 */
export async function deleteCached(key: string): Promise<void> {
  try {
    await kv.del(key);
  } catch (error) {
    console.error('Cache delete error:', error);
  }
}

/**
 * Get or set cached value
 * Returns cached value if exists, otherwise executes fetcher and caches result
 */
export async function getOrSetCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: CacheOptions
): Promise<T> {
  const cached = await getCached<T>(key);
  if (cached !== null) {
    return cached;
  }

  const value = await fetcher();
  await setCached(key, value, options);
  // Track key for invalidation
  await trackCacheKey(key);
  return value;
}

/**
 * Invalidate cache by prefix
 * Note: Vercel KV doesn't support pattern matching, so we track keys in a set
 */
const CACHE_KEYS_SET = 'cache:keys';

/**
 * Track a cache key for later invalidation
 */
async function trackCacheKey(key: string): Promise<void> {
  try {
    await kv.sadd(CACHE_KEYS_SET, key);
  } catch {
    // Ignore tracking errors
  }
}

/**
 * Invalidate all cache keys with a prefix
 */
export async function invalidateCacheByPrefix(prefix: string): Promise<void> {
  try {
    // Get all tracked keys
    const allKeys = await kv.smembers<string[]>(CACHE_KEYS_SET);
    const keysToDelete = allKeys.filter((key) => key.startsWith(prefix));
    
    if (keysToDelete.length > 0) {
      await Promise.all([
        ...keysToDelete.map((key) => kv.del(key)),
        // Remove tracked keys
        ...keysToDelete.map((key) => kv.srem(CACHE_KEYS_SET, key)),
      ]);
    }
  } catch {
    // Best effort - ignore errors
  }
}

/**
 * Invalidate a specific cache key
 */
export async function invalidateCacheKey(key: string): Promise<void> {
  try {
    await Promise.all([
      kv.del(key),
      kv.srem(CACHE_KEYS_SET, key),
    ]);
  } catch {
    // Best effort - ignore errors
  }
}

