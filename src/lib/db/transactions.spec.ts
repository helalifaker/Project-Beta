/**
 * Tests for database transaction utilities
 */

import { describe, expect, it, vi, beforeEach } from 'vitest';

import { prisma } from './prisma';
import { withTransaction, parallelTransaction } from './transactions';

vi.mock('./prisma', () => ({
  prisma: {
    $transaction: vi.fn(),
  },
}));

describe('withTransaction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should execute function within transaction', async () => {
    const mockResult = { id: '1', name: 'Test' };
    const mockFn = vi.fn().mockResolvedValue(mockResult);

    vi.mocked(prisma.$transaction).mockImplementation(async (fn: any) => {
      return fn(prisma);
    });

    const result = await withTransaction(mockFn);

    expect(result).toEqual(mockResult);
    expect(mockFn).toHaveBeenCalledWith(prisma);
    expect(prisma.$transaction).toHaveBeenCalledWith(
      expect.any(Function),
      {
        maxWait: 5000,
        timeout: 10000,
      },
    );
  });

  it('should handle transaction errors', async () => {
    const mockFn = vi.fn().mockRejectedValue(new Error('Transaction failed'));

    vi.mocked(prisma.$transaction).mockImplementation(async (fn: any) => {
      return fn(prisma);
    });

    await expect(withTransaction(mockFn)).rejects.toThrow('Transaction failed');
  });
});

describe('parallelTransaction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should execute multiple operations in parallel', async () => {
    const op1 = vi.fn().mockResolvedValue('result1');
    const op2 = vi.fn().mockResolvedValue('result2');
    const op3 = vi.fn().mockResolvedValue('result3');

    vi.mocked(prisma.$transaction).mockImplementation(async (fn: any) => {
      return fn(prisma);
    });

    const results = await parallelTransaction([op1, op2, op3]);

    expect(results).toEqual(['result1', 'result2', 'result3']);
    expect(op1).toHaveBeenCalledWith(prisma);
    expect(op2).toHaveBeenCalledWith(prisma);
    expect(op3).toHaveBeenCalledWith(prisma);
  });

  it('should handle empty operations array', async () => {
    vi.mocked(prisma.$transaction).mockImplementation(async (fn: any) => {
      return fn(prisma);
    });

    const results = await parallelTransaction([]);

    expect(results).toEqual([]);
  });
});

