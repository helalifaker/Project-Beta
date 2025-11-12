/**
 * Rate limiting utility
 * Uses @upstash/ratelimit for distributed rate limiting
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Rate limiter instance
 * Configured with environment variables
 */
let ratelimit: Ratelimit | null = null;

function _getRatelimit(): Ratelimit {
  if (!ratelimit) {
    const redis = Redis.fromEnv();
    ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, '1 m'),
      analytics: true,
    });
  }
  return ratelimit;
}

/**
 * Check rate limit for identifier
 */
export async function checkRateLimit(
  identifier: string,
  limit: number = 100,
  window: string = '1 m'
): Promise<RateLimitResult> {
  try {
    // Parse window (e.g., '1 m', '1 h')
    const [amount, unit] = window.split(' ');
    const windowSeconds =
      parseInt(amount, 10) * (unit === 's' ? 1 : unit === 'm' ? 60 : unit === 'h' ? 3600 : 60);

    const customRatelimit = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(limit, `${windowSeconds} s`),
    });

    const result = await customRatelimit.limit(identifier);

    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  } catch (error) {
    // If rate limiting fails, allow the request (fail open)
    console.error('Rate limit error:', error);
    return {
      success: true,
      limit,
      remaining: limit,
      reset: Date.now() + 60000,
    };
  }
}

/**
 * Get rate limit headers
 */
export function getRateLimitHeaders(result: RateLimitResult): HeadersInit {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.reset.toString(),
  };
}
