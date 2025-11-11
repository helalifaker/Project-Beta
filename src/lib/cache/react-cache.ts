/**
 * React Cache API utilities
 * Request deduplication using React Cache API
 */

import { cache } from 'react';

/**
 * Create cached async function
 * Deduplicates requests within the same React render
 */
export function createCachedFunction<T extends unknown[], R>(
  fn: (...args: T) => Promise<R>,
  keyFn?: (...args: T) => string
): (...args: T) => Promise<R> {
  return cache(async (...args: T): Promise<R> => {
    return fn(...args);
  });
}

/**
 * Cache key generator
 */
export function generateCacheKey(prefix: string, ...parts: unknown[]): string {
  return `${prefix}:${parts.join(':')}`;
}

