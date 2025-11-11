/**
 * API route to ensure profile exists for authenticated user
 * Called after magic link authentication to create profile if needed
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function POST(): Promise<NextResponse> {
  try {
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

    // Get the current session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Check if profile exists
    const existingProfile = await prisma.profile.findUnique({
      where: { externalId: session.user.id },
    });

    if (existingProfile) {
      return NextResponse.json({
        success: true,
        profile: {
          id: existingProfile.id,
          email: existingProfile.email,
          role: existingProfile.role,
        },
      });
    }

    // Create profile if it doesn't exist
    const newProfile = await prisma.profile.create({
      data: {
        externalId: session.user.id,
        email: session.user.email!,
        role: 'ANALYST', // Default role
      },
    });

    return NextResponse.json({
      success: true,
      profile: {
        id: newProfile.id,
        email: newProfile.email,
        role: newProfile.role,
      },
    });
  } catch (error) {
    console.error('Ensure profile error:', error);
    return NextResponse.json(
      { error: 'Failed to ensure profile exists' },
      { status: 500 }
    );
  }
}

