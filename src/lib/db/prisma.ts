import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var -- allow global mutable Prisma caching in dev
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}


