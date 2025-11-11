/**
 * Authentication utility functions
 * Client-side and server-side auth helpers
 */

import { getSupabaseClient } from '@/lib/supabase/client';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/db/prisma';
import type { UserRole } from '@/types/auth';

/**
 * Login with email and password (client-side)
 */
export async function loginWithPassword(
  email: string,
  password: string
): Promise<{ error: Error | null }> {
  try {
    const supabase = getSupabaseClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error };
    }

    return { error: null };
  } catch (error) {
    return {
      error: error instanceof Error ? error : new Error('Login failed'),
    };
  }
}

/**
 * Login with magic link (client-side)
 */
export async function loginWithMagicLink(
  email: string,
  redirectTo?: string
): Promise<{ error: Error | null }> {
  try {
    const supabase = getSupabaseClient();

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
      },
    });

    if (error) {
      return { error };
    }

    return { error: null };
  } catch (error) {
    return {
      error: error instanceof Error ? error : new Error('Magic link failed'),
    };
  }
}

/**
 * Logout (client-side)
 */
export async function logout(): Promise<{ error: Error | null }> {
  try {
    const supabase = getSupabaseClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
      return { error };
    }

    return { error: null };
  } catch (error) {
    return {
      error: error instanceof Error ? error : new Error('Logout failed'),
    };
  }
}

/**
 * Register new user (server-side, admin only)
 * 
 * Note: This requires SUPABASE_SERVICE_ROLE_KEY for admin.createUser()
 * For production, use Supabase Admin API with service role key
 */
export async function registerUser(
  email: string,
  password: string,
  role: UserRole = 'ANALYST'
): Promise<{ userId: string | null; error: Error | null }> {
  try {
    // TODO: Implement with Supabase Admin API using service role key
    // For now, this is a placeholder that will be implemented when
    // SUPABASE_SERVICE_ROLE_KEY is configured
    
    // In production, use:
    // const supabaseAdmin = createClient(
    //   process.env.NEXT_PUBLIC_SUPABASE_URL!,
    //   process.env.SUPABASE_SERVICE_ROLE_KEY!
    // );
    // const { data: authUser, error } = await supabaseAdmin.auth.admin.createUser({...});
    
    throw new Error(
      'User registration requires SUPABASE_SERVICE_ROLE_KEY. This will be implemented in production setup.'
    );
  } catch (error) {
    return {
      userId: null,
      error: error instanceof Error ? error : new Error('Registration failed'),
    };
  }
}

/**
 * Update user role (server-side, admin only)
 */
export async function updateUserRole(
  userId: string,
  role: UserRole
): Promise<{ error: Error | null }> {
  try {
    await prisma.profile.update({
      where: { id: userId },
      data: { role },
    });

    return { error: null };
  } catch (error) {
    return {
      error: error instanceof Error ? error : new Error('Failed to update role'),
    };
  }
}

/**
 * Send password reset email (client-side)
 */
export async function sendPasswordReset(
  email: string,
  redirectTo?: string
): Promise<{ error: Error | null }> {
  try {
    const supabase = getSupabaseClient();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (error) {
      return { error };
    }

    return { error: null };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error : new Error('Password reset failed'),
    };
  }
}

/**
 * Update password (client-side)
 */
export async function updatePassword(
  newPassword: string
): Promise<{ error: Error | null }> {
  try {
    const supabase = getSupabaseClient();

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return { error };
    }

    return { error: null };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error : new Error('Password update failed'),
    };
  }
}

