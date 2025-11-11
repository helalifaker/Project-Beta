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
  return value;
}

/**
 * Invalidate cache by pattern
 */
export async function invalidateCache(pattern: string): Promise<void> {
  try {
    // Vercel KV doesn't support pattern matching directly
    // For now, we'll need to track keys manually or use a prefix strategy
    // This is a placeholder - implement based on your key naming strategy
    console.warn('Pattern-based cache invalidation not fully implemented');
  } catch (error) {
    console.error('Cache invalidation error:', error);
  }
}

