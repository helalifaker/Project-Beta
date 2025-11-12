/**
 * Auth middleware for Next.js middleware
 * Protects routes and handles authentication
 */

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

import type { UserRole } from '@/types/auth';

/**
 * Protected route configuration
 */
interface ProtectedRoute {
  path: string;
  roles?: UserRole[];
}

/**
 * Public routes that don't require authentication
 */
const PUBLIC_ROUTES = ['/login', '/auth/callback', '/api/auth'];

/**
 * Protected routes with role requirements
 */
const PROTECTED_ROUTES: ProtectedRoute[] = [
  { path: '/admin', roles: ['ADMIN'] },
  { path: '/versions', roles: ['ADMIN', 'ANALYST', 'VIEWER'] },
  { path: '/compare', roles: ['ADMIN', 'ANALYST', 'VIEWER'] },
  { path: '/reports', roles: ['ADMIN', 'ANALYST', 'VIEWER'] },
];

/**
 * Check if route is public
 */
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
}

/**
 * Check if route requires authentication
 */
function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some((route) => pathname.startsWith(route.path));
}

/**
 * Get required roles for route
 */
function getRequiredRoles(pathname: string): UserRole[] | undefined {
  const route = PROTECTED_ROUTES.find((r) => pathname.startsWith(r.path));
  return route?.roles;
}

/**
 * Next.js middleware for authentication
 */
export async function authMiddleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Allow API routes (they handle auth internally)
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Check if route is protected
  if (!isProtectedRoute(pathname)) {
    return NextResponse.next();
  }

  // Create Supabase client for middleware
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options: _options }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  // Check authentication
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  // Redirect to login if not authenticated
  if (!session || error) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Check role requirements (if any)
  // Note: Role checking in middleware can be expensive
  // For better performance, consider using JWT claims or caching
  const requiredRoles = getRequiredRoles(pathname);
  if (requiredRoles && requiredRoles.length > 0) {
    try {
      // Fetch user profile to check role
      const { data: profile, error: profileError } = await supabase
        .from('profile')
        .select('role')
        .eq('external_id', session.user.id)
        .single();

      if (profileError || !profile || !requiredRoles.includes(profile.role)) {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
    } catch (error) {
      // If role check fails, allow through (will be checked in route handler)
      console.error('Role check error in middleware:', error);
    }
  }

  return response;
}
