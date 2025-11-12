/**
 * Tests for Prisma client initialization
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Prisma client initialization', () => {
  const originalEnv = process.env;
  const originalGlobal = global;

  beforeEach(() => {
    vi.resetModules();
    // Clear global.prisma
    delete (global as Record<string, unknown>).prisma;
  });

  afterEach(() => {
    process.env = originalEnv;
    global = originalGlobal;
  });

  it('should create new client in production', async () => {
    process.env.NODE_ENV = 'production';
    delete (global as Record<string, unknown>).prisma;

    const { prisma } = await import('./prisma');

    expect(prisma).toBeDefined();
    expect((global as Record<string, unknown>).prisma).toBeUndefined();
  });

  it('should cache client in non-production', async () => {
    process.env.NODE_ENV = 'development';
    delete (global as Record<string, unknown>).prisma;

    const { prisma: prisma1 } = await import('./prisma');
    const { prisma: prisma2 } = await import('./prisma');

    expect(prisma1).toBe(prisma2);
    expect((global as Record<string, unknown>).prisma).toBe(prisma1);
  });

  it('should use cached client if exists', async () => {
    process.env.NODE_ENV = 'development';
    const cachedClient = { test: true };
    (global as Record<string, unknown>).prisma = cachedClient;

    const { prisma } = await import('./prisma');

    expect(prisma).toBe(cachedClient);
  });
});
