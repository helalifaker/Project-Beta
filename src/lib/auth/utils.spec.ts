/**
 * Tests for authentication utility functions
 */

import { describe, expect, it, vi, beforeEach } from 'vitest';

import { prisma } from '@/lib/db/prisma';
import { getSupabaseClient } from '@/lib/supabase/client';

import {
  loginWithPassword,
  loginWithMagicLink,
  logout,
  registerUser,
  updateUserRole,
  sendPasswordReset,
  updatePassword,
} from './utils';

vi.mock('@/lib/supabase/client');
vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    profile: {
      update: vi.fn(),
    },
  },
}));

const mockSupabaseClient = {
  auth: {
    signInWithPassword: vi.fn(),
    signInWithOtp: vi.fn(),
    signOut: vi.fn(),
    resetPasswordForEmail: vi.fn(),
    updateUser: vi.fn(),
  },
};

describe('loginWithPassword', () => {
  beforeEach(() => {
    vi.mocked(getSupabaseClient).mockReturnValue(mockSupabaseClient as any);
  });

  it('should login successfully', async () => {
    vi.mocked(mockSupabaseClient.auth.signInWithPassword).mockResolvedValue({
      data: { user: { id: 'user-1' }, session: {} },
      error: null,
    } as any);

    const result = await loginWithPassword('test@example.com', 'password123');

    expect(result.error).toBeNull();
    expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });

  it('should return error on failure', async () => {
    const error = new Error('Invalid credentials');
    vi.mocked(mockSupabaseClient.auth.signInWithPassword).mockResolvedValue({
      data: { user: null, session: null },
      error,
    } as any);

    const result = await loginWithPassword('test@example.com', 'wrong');

    expect(result.error).toBe(error);
  });

  it('should handle exceptions', async () => {
    vi.mocked(mockSupabaseClient.auth.signInWithPassword).mockRejectedValue(
      new Error('Network error'),
    );

    const result = await loginWithPassword('test@example.com', 'password');

    expect(result.error).toBeInstanceOf(Error);
    expect(result.error?.message).toBe('Network error');
  });
});

describe('loginWithMagicLink', () => {
  beforeEach(() => {
    vi.mocked(getSupabaseClient).mockReturnValue(mockSupabaseClient as any);
  });

  it('should send magic link successfully', async () => {
    vi.mocked(mockSupabaseClient.auth.signInWithOtp).mockResolvedValue({
      data: {},
      error: null,
    } as any);

    const result = await loginWithMagicLink('test@example.com');

    expect(result.error).toBeNull();
    expect(mockSupabaseClient.auth.signInWithOtp).toHaveBeenCalledWith({
      email: 'test@example.com',
      options: {
        emailRedirectTo: undefined,
      },
    });
  });

  it('should include redirect URL when provided', async () => {
    vi.mocked(mockSupabaseClient.auth.signInWithOtp).mockResolvedValue({
      data: {},
      error: null,
    } as any);

    await loginWithMagicLink('test@example.com', '/dashboard');

    expect(mockSupabaseClient.auth.signInWithOtp).toHaveBeenCalledWith({
      email: 'test@example.com',
      options: {
        emailRedirectTo: '/dashboard',
      },
    });
  });

  it('should return error on failure', async () => {
    const error = new Error('Failed to send');
    vi.mocked(mockSupabaseClient.auth.signInWithOtp).mockResolvedValue({
      data: {},
      error,
    } as any);

    const result = await loginWithMagicLink('test@example.com');

    expect(result.error).toBe(error);
  });

  it('should catch and return error when signInWithOtp throws', async () => {
    vi.mocked(mockSupabaseClient.auth.signInWithOtp).mockRejectedValue(
      new Error('Network error')
    );

    const result = await loginWithMagicLink('test@example.com');

    expect(result.error).toBeInstanceOf(Error);
    expect(result.error?.message).toBe('Network error');
  });

  it('should wrap non-Error exceptions', async () => {
    vi.mocked(mockSupabaseClient.auth.signInWithOtp).mockRejectedValue('String error');

    const result = await loginWithMagicLink('test@example.com');

    expect(result.error).toBeInstanceOf(Error);
    expect(result.error?.message).toBe('Magic link failed');
  });
});

describe('logout', () => {
  beforeEach(() => {
    vi.mocked(getSupabaseClient).mockReturnValue(mockSupabaseClient as any);
  });

  it('should logout successfully', async () => {
    vi.mocked(mockSupabaseClient.auth.signOut).mockResolvedValue({
      error: null,
    } as any);

    const result = await logout();

    expect(result.error).toBeNull();
    expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled();
  });

  it('should return error on failure', async () => {
    const error = new Error('Logout failed');
    vi.mocked(mockSupabaseClient.auth.signOut).mockResolvedValue({
      error,
    } as any);

    const result = await logout();

    expect(result.error).toBe(error);
  });

  it('should catch and return error when signOut throws', async () => {
    vi.mocked(mockSupabaseClient.auth.signOut).mockRejectedValue(new Error('Network error'));

    const result = await logout();

    expect(result.error).toBeInstanceOf(Error);
    expect(result.error?.message).toBe('Network error');
  });

  it('should wrap non-Error exceptions', async () => {
    vi.mocked(mockSupabaseClient.auth.signOut).mockRejectedValue('String error');

    const result = await logout();

    expect(result.error).toBeInstanceOf(Error);
    expect(result.error?.message).toBe('Logout failed');
  });
});

describe('registerUser', () => {
  it('should throw error indicating service role key required', async () => {
    const result = await registerUser('test@example.com', 'password123', 'ANALYST');

    expect(result.userId).toBeNull();
    expect(result.error).toBeInstanceOf(Error);
    expect(result.error?.message).toContain('SUPABASE_SERVICE_ROLE_KEY');
  });
});

describe('updateUserRole', () => {
  it('should update user role successfully', async () => {
    vi.mocked(prisma.profile.update).mockResolvedValue({
      id: 'user-1',
      role: 'ADMIN',
    } as any);

    const result = await updateUserRole('user-1', 'ADMIN');

    expect(result.error).toBeNull();
    expect(prisma.profile.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { role: 'ADMIN' },
    });
  });

  it('should return error on failure', async () => {
    const error = new Error('User not found');
    vi.mocked(prisma.profile.update).mockRejectedValue(error);

    const result = await updateUserRole('user-999', 'ADMIN');

    expect(result.error).toBeInstanceOf(Error);
    expect(result.error?.message).toBe('User not found');
  });
});

describe('sendPasswordReset', () => {
  beforeEach(() => {
    vi.mocked(getSupabaseClient).mockReturnValue(mockSupabaseClient as any);
  });

  it('should send password reset email successfully', async () => {
    vi.mocked(mockSupabaseClient.auth.resetPasswordForEmail).mockResolvedValue({
      data: {},
      error: null,
    } as any);

    const result = await sendPasswordReset('test@example.com');

    expect(result.error).toBeNull();
    expect(mockSupabaseClient.auth.resetPasswordForEmail).toHaveBeenCalledWith(
      'test@example.com',
      { redirectTo: undefined },
    );
  });

  it('should include redirect URL when provided', async () => {
    vi.mocked(mockSupabaseClient.auth.resetPasswordForEmail).mockResolvedValue({
      data: {},
      error: null,
    } as any);

    await sendPasswordReset('test@example.com', '/reset-password/confirm');

    expect(mockSupabaseClient.auth.resetPasswordForEmail).toHaveBeenCalledWith(
      'test@example.com',
      { redirectTo: '/reset-password/confirm' },
    );
  });

  it('should return error on failure', async () => {
    const error = new Error('Failed to send');
    vi.mocked(mockSupabaseClient.auth.resetPasswordForEmail).mockResolvedValue({
      data: {},
      error,
    } as any);

    const result = await sendPasswordReset('test@example.com');

    expect(result.error).toBe(error);
  });

  it('should catch and wrap non-Error exceptions', async () => {
    vi.mocked(mockSupabaseClient.auth.resetPasswordForEmail).mockRejectedValue('String error');

    const result = await sendPasswordReset('test@example.com');

    expect(result.error).toBeInstanceOf(Error);
    expect(result.error?.message).toBe('Password reset failed');
  });
});

describe('updatePassword', () => {
  beforeEach(() => {
    vi.mocked(getSupabaseClient).mockReturnValue(mockSupabaseClient as any);
  });

  it('should update password successfully', async () => {
    vi.mocked(mockSupabaseClient.auth.updateUser).mockResolvedValue({
      data: { user: {} },
      error: null,
    } as any);

    const result = await updatePassword('newPassword123');

    expect(result.error).toBeNull();
    expect(mockSupabaseClient.auth.updateUser).toHaveBeenCalledWith({
      password: 'newPassword123',
    });
  });

  it('should return error on failure', async () => {
    const error = new Error('Password too weak');
    vi.mocked(mockSupabaseClient.auth.updateUser).mockResolvedValue({
      data: { user: null },
      error,
    } as any);

    const result = await updatePassword('weak');

    expect(result.error).toBe(error);
  });

  it('should catch and wrap non-Error exceptions', async () => {
    vi.mocked(mockSupabaseClient.auth.updateUser).mockRejectedValue('String error');

    const result = await updatePassword('newPassword123');

    expect(result.error).toBeInstanceOf(Error);
    expect(result.error?.message).toBe('Password update failed');
  });
});

