import { vi } from 'vitest';

/**
 * Mock Supabase client
 */
export const mockSupabaseClient = {
  auth: {
    getSession: vi.fn(),
    getUser: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChange: vi.fn(),
  },
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
  })),
};

/**
 * Mock Prisma client
 */
export const mockPrismaClient = {
  version: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  $transaction: vi.fn(),
};

/**
 * Mock fetch
 */
export const mockFetch = vi.fn();

/**
 * Create mock user
 */
export function createMockUser(overrides = {}) {
  return {
    id: 'user-123',
    email: 'test@example.com',
    role: 'ADMIN',
    name: 'Test User',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  };
}

/**
 * Create mock version
 */
export function createMockVersion(overrides = {}) {
  return {
    id: 'version-123',
    name: 'Test Version',
    status: 'DRAFT',
    rentModelType: 'FIXED_ESC',
    ownerId: 'user-123',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  };
}

