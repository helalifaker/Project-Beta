/**
 * Protected route wrapper component
 * Ensures user is authenticated before rendering children
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase/client';
import type { UserRole } from '@/types/auth';
import type { ReactNode, JSX } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole;
  fallback?: ReactNode;
}

export function ProtectedRoute({
  children,
  requiredRole,
  fallback,
}: ProtectedRouteProps): JSX.Element {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = getSupabaseClient();

      // Check session
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        router.push('/login');
        return;
      }

      // Check role if required
      if (requiredRole) {
        const { data: profile, error: profileError } = await supabase
          .from('profile')
          .select('role')
          .eq('external_id', session.user.id)
          .single();

        if (profileError || !profile) {
          router.push('/unauthorized');
          return;
        }

        setUserRole(profile.role);

        // Check role hierarchy
        const roleHierarchy: Record<UserRole, number> = {
          VIEWER: 1,
          ANALYST: 2,
          ADMIN: 3,
        };

        if (roleHierarchy[profile.role] < roleHierarchy[requiredRole]) {
          router.push('/unauthorized');
          return;
        }
      }

      setIsAuthorized(true);
    };

    checkAuth();
  }, [router, requiredRole]);

  if (isAuthorized === null) {
    return (
      fallback || (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <p className="text-[--color-muted-foreground]">Loading...</p>
          </div>
        </div>
      )
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}

