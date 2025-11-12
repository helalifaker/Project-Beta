/**
 * Session management tests
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock dependencies before importing
vi.mock('@/lib/supabase/server', () => ({
  getSupabaseServerClient: vi.fn(),
}));

vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    profile: {
      findUnique: vi.fn(),
    },
  },
}));

import { prisma } from '@/lib/db/prisma';
import { getSupabaseServerClient } from '@/lib/supabase/server';

import * as sessionModule from './session';

const { getServerSession, getServerUser, requireAuth, requireRole } = sessionModule;

const baseSession = {
  user: { id: 'auth-user-id' },
  access_token: 'token',
  expires_at: Math.floor(Date.now() / 1000) + 3600,
};

const baseProfile = {
  id: 'profile-id',
  externalId: 'auth-user-id',
  email: 'test@example.com',
  role: 'ANALYST' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
};

function mockSupabaseSession(session: unknown, error: unknown = null): void {
  const mockSupabase = {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session },
        error,
      }),
    },
  };

  vi.mocked(getSupabaseServerClient).mockResolvedValue(mockSupabase as never);
}

function mockProfile(profile: unknown): void {
  vi.mocked(prisma.profile.findUnique).mockResolvedValue(profile);
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('getServerSession', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.mocked(getSupabaseServerClient).mockReset();
    vi.mocked(prisma.profile.findUnique).mockReset();
  });

  it('should return null if no Supabase session', async () => {
    mockSupabaseSession(null);

    const session = await getServerSession();

    expect(session).toBeNull();
  });

  it('should return null if profile not found', async () => {
    mockSupabaseSession(baseSession);
    mockProfile(null);

    const session = await getServerSession();

    expect(session).toBeNull();
  });

  it('should return session if authenticated and profile exists', async () => {
    mockSupabaseSession(baseSession);
    mockProfile(baseProfile);

    const session = await getServerSession();

    expect(session).not.toBeNull();
    expect(session?.user.email).toBe('test@example.com');
    expect(session?.user.role).toBe('ANALYST');
  });

  it('should catch errors and return null', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(getSupabaseServerClient).mockRejectedValue(new Error('Supabase failure'));

    const session = await getServerSession();

    expect(session).toBeNull();
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});

describe('getServerUser', () => {
  afterEach(() => {
    vi.mocked(getSupabaseServerClient).mockReset();
    vi.mocked(prisma.profile.findUnique).mockReset();
  });

  it('should return user when session exists', async () => {
    mockSupabaseSession(baseSession);
    mockProfile(baseProfile);

    const user = await getServerUser();
    expect(user).toMatchObject({
      id: baseProfile.id,
      email: baseProfile.email,
      role: baseProfile.role,
    });
  });

  it('should return null when no session', async () => {
    mockSupabaseSession(null);

    const user = await getServerUser();
    expect(user).toBeNull();
  });
});

describe('requireAuth', () => {
  afterEach(() => {
    vi.mocked(getSupabaseServerClient).mockReset();
    vi.mocked(prisma.profile.findUnique).mockReset();
  });

  it('should return session when authenticated', async () => {
    mockSupabaseSession(baseSession);
    mockProfile(baseProfile);

    const session = await requireAuth();
    expect(session?.user.email).toBe('test@example.com');
  });

  it('should throw error when not authenticated', async () => {
    mockSupabaseSession(null);

    await expect(requireAuth()).rejects.toThrow('UNAUTHORIZED');
  });
});

describe('requireRole', () => {
  afterEach(() => {
    vi.mocked(getSupabaseServerClient).mockReset();
    vi.mocked(prisma.profile.findUnique).mockReset();
  });

  it('should allow when role matches', async () => {
    mockSupabaseSession(baseSession);
    mockProfile({ ...baseProfile, role: 'ADMIN' as const });

    const session = await requireRole('ADMIN');
    expect(session.user.role).toBe('ADMIN');
  });

  it('should throw when role does not match', async () => {
    mockSupabaseSession(baseSession);
    mockProfile({ ...baseProfile, role: 'VIEWER' as const });

    await expect(requireRole('ADMIN')).rejects.toThrow('FORBIDDEN');
  });
});
