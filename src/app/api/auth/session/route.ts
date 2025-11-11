/**
 * Get current session API route
 * GET /api/auth/session
 */

import { getServerSession } from '@/lib/auth/session';

export async function GET(): Promise<Response> {
  try {
    const session = await getServerSession();

    if (!session) {
      return Response.json(
        {
          error: 'UNAUTHORIZED',
          message: 'No active session',
        },
        { status: 401 }
      );
    }

    return Response.json(
      {
        data: {
          user: session.user,
          expiresAt: session.expiresAt.toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Session API error:', error);
    return Response.json(
      {
        error: 'INTERNAL_ERROR',
        message: 'An error occurred while fetching session',
      },
      { status: 500 }
    );
  }
}

