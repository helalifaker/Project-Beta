import { PrismaClient } from '@prisma/client';

declare global {
   
  var prisma: PrismaClient | undefined;
}

// Ensure global exists (Node.js environment check)
const globalForPrisma = typeof global !== 'undefined' ? global : undefined;

export const prisma =
  (globalForPrisma as typeof globalThis & { prisma?: PrismaClient })?.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production' && globalForPrisma) {
  (globalForPrisma as typeof globalThis & { prisma?: PrismaClient }).prisma = prisma;
}


