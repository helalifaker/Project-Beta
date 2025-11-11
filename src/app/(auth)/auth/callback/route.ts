/**
 * Auth callback route
 * Handles OAuth and magic link callbacks from Supabase
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

import { prisma } from '@/lib/db/prisma';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const token = requestUrl.searchParams.get('token');
  const tokenHash = requestUrl.searchParams.get('token_hash');
  const type = requestUrl.searchParams.get('type');
  const redirect = requestUrl.searchParams.get('redirect') || '/';

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.redirect(new URL('/login?error=config', requestUrl));
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      },
    },
  });

  try {
    // Handle OAuth code exchange (PKCE flow)
    if (code) {
      const { error: exchangeError } =
        await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error('Code exchange error:', exchangeError);
        return NextResponse.redirect(
          new URL('/login?error=exchange', requestUrl)
        );
      }

      // Get the session to create profile if needed
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        await ensureProfileExists(session.user.id, session.user.email!);
      }

      return NextResponse.redirect(new URL(redirect, requestUrl));
    }

    // Handle magic link token hash (PKCE flow)
    if (tokenHash && type) {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: type as 'email' | 'magiclink' | 'recovery',
      });

      if (verifyError) {
        console.error('Token verification error:', verifyError);
        return NextResponse.redirect(
          new URL('/login?error=verification', requestUrl)
        );
      }

      // Get the session to create profile if needed
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        await ensureProfileExists(session.user.id, session.user.email!);
      }

      return NextResponse.redirect(new URL(redirect, requestUrl));
    }

    // Handle legacy token format (if any)
    if (token && type) {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: type as 'email' | 'magiclink' | 'recovery',
      });

      if (verifyError) {
        console.error('Token verification error:', verifyError);
        return NextResponse.redirect(
          new URL('/login?error=verification', requestUrl)
        );
      }

      // Get the session to create profile if needed
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        await ensureProfileExists(session.user.id, session.user.email!);
      }

      return NextResponse.redirect(new URL(redirect, requestUrl));
    }

    // No valid parameters, redirect to login
    return NextResponse.redirect(new URL('/login?error=invalid', requestUrl));
  } catch (error) {
    console.error('Auth callback error:', error);
    return NextResponse.redirect(new URL('/login?error=unknown', requestUrl));
  }
}

/**
 * Ensure profile exists for authenticated user
 * Creates profile if it doesn't exist (for magic link signups)
 */
async function ensureProfileExists(
  externalId: string,
  email: string
): Promise<void> {
  try {
    const existingProfile = await prisma.profile.findUnique({
      where: { externalId },
    });

    if (!existingProfile) {
      // Create profile with default ANALYST role
      await prisma.profile.create({
        data: {
          externalId,
          email,
          role: 'ANALYST',
        },
      });
    }
  } catch (error) {
    console.error('Error ensuring profile exists:', error);
    // Don't throw - allow login to proceed even if profile creation fails
  }
}

