/**
 * Logout API route
 * POST /api/auth/logout
 */

import { logout } from '@/lib/auth/utils';

export async function POST(): Promise<Response> {
  try {
    const { error } = await logout();

    if (error) {
      return Response.json(
        {
          error: 'LOGOUT_ERROR',
          message: error.message,
        },
        { status: 500 }
      );
    }

    return Response.json(
      {
        success: true,
        message: 'Logout successful',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Logout API error:', error);
    return Response.json(
      {
        error: 'INTERNAL_ERROR',
        message: 'An error occurred during logout',
      },
      { status: 500 }
    );
  }
}

