/**
 * Next.js middleware
 * Handles authentication and route protection
 */

import { NextResponse, type NextRequest } from 'next/server';

import { authMiddleware } from '@/lib/auth/middleware';

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const response = await authMiddleware(request);

  // Set pathname header for layout to check
  const pathname = request.nextUrl.pathname;
  response.headers.set('x-pathname', pathname);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
