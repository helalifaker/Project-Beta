/**
 * Authentication utility functions
 * Client-side and server-side auth helpers
 */

import { prisma } from '@/lib/db/prisma';
import { getSupabaseClient } from '@/lib/supabase/client';
import { getSupabaseServerClient } from '@/lib/supabase/server';
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
 * Magic links can also create new users if they don't exist (if enabled in Supabase)
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
        shouldCreateUser: true, // Allow magic link to create user if doesn't exist
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
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return {
        userId: null,
        error: new Error(
          'User registration requires SUPABASE_SERVICE_ROLE_KEY. Please configure it in your environment variables.'
        ),
      };
    }

    // Create admin client with service role key
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Create user in Supabase Auth
    const { data: authUser, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirm email for admin-created users
      });

    if (authError || !authUser.user) {
      return {
        userId: null,
        error: authError || new Error('Failed to create user in Supabase Auth'),
      };
    }

    // Create profile record in database
    const { prisma } = await import('@/lib/db/prisma');
    const profile = await prisma.profile.create({
      data: {
        externalId: authUser.user.id,
        email: authUser.user.email!,
        role,
      },
    });

    return {
      userId: profile.id,
      error: null,
    };
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

