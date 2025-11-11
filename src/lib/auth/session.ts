/**
 * Session management utilities
 * Handles server-side session retrieval and validation
 */

import { prisma } from '@/lib/db/prisma';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import type { User, Session } from '@/types/auth';

/**
 * Get current user session from server-side
 * Returns null if not authenticated
 */
export async function getServerSession(): Promise<Session | null> {
  try {
    const supabase = await getSupabaseServerClient();

    // Get Supabase session
    const {
      data: { session: supabaseSession },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !supabaseSession) {
      return null;
    }

    // Get user profile from database
    const profile = await prisma.profile.findUnique({
      where: {
        externalId: supabaseSession.user.id,
      },
    });

    if (!profile) {
      return null;
    }

    // Map to application User type
    const user: User = {
      id: profile.id,
      email: profile.email,
      role: profile.role,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };

    return {
      user,
      accessToken: supabaseSession.access_token,
      expiresAt: new Date(supabaseSession.expires_at! * 1000),
    };
  } catch (error) {
    console.error('Error getting server session:', error);
    return null;
  }
}

/**
 * Get current user from server-side
 * Returns null if not authenticated
 */
export async function getServerUser(): Promise<User | null> {
  const session = await getServerSession();
  return session?.user ?? null;
}

/**
 * Require authentication
 * Throws error if not authenticated
 */
export async function requireAuth(): Promise<Session> {
  const session = await getServerSession();

  if (!session) {
    throw new Error('UNAUTHORIZED');
  }

  return session;
}

/**
 * Require specific role or higher (using RBAC hierarchy)
 * ADMIN has access to everything
 * Throws error if user doesn't have required role or higher
 */
export async function requireRole(
  requiredRole: User['role']
): Promise<Session> {
  const session = await requireAuth();

  // Import RBAC utilities
  const { hasRole } = await import('@/lib/auth/rbac');

  // Check if user has required role or higher
  if (!hasRole(session.user.role, requiredRole)) {
    throw new Error('FORBIDDEN');
  }

  return session;
}

