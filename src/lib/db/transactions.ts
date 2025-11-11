/**
 * Database transaction utilities
 * Helper functions for database transactions
 */

import { prisma } from './prisma';

/**
 * Execute function within a transaction
 */
export async function withTransaction<T>(
  fn: (tx: typeof prisma) => Promise<T>
): Promise<T> {
  return prisma.$transaction(fn, {
    maxWait: 5000, // Maximum time to wait for a transaction slot
    timeout: 10000, // Maximum time the transaction can run
  });
}

/**
 * Execute multiple operations in parallel within a transaction
 */
export async function parallelTransaction<T>(
  operations: Array<(tx: typeof prisma) => Promise<T>>
): Promise<T[]> {
  return prisma.$transaction(async (tx) => {
    return Promise.all(operations.map((op) => op(tx)));
  });
}

