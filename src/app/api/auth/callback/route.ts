/**
 * Server-side auth callback API route
 * Handles OAuth code exchange and token verification (PKCE flow)
 * Called by the client-side callback page when needed
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

import { prisma } from '@/lib/db/prisma';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { code, token_hash: tokenHash, type } = body;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: 'Configuration error' },
        { status: 500 }
      );
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

    // Handle OAuth code exchange (PKCE flow)
    if (code) {
      const { error: exchangeError } =
        await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error('Code exchange error:', exchangeError);
        return NextResponse.json(
          { error: 'Code exchange failed', details: exchangeError.message },
          { status: 400 }
        );
      }

      // Get the session to create profile if needed
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        await ensureProfileExists(session.user.id, session.user.email!);
      }

      return NextResponse.json({ success: true });
    }

    // Handle magic link token hash (PKCE flow)
    if (tokenHash && type) {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: type as 'email' | 'magiclink' | 'recovery',
      });

      if (verifyError) {
        console.error('Token verification error:', verifyError);
        return NextResponse.json(
          { error: 'Token verification failed', details: verifyError.message },
          { status: 400 }
        );
      }

      // Get the session to create profile if needed
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        await ensureProfileExists(session.user.id, session.user.email!);
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: 'Missing required parameters' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Auth callback API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
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

