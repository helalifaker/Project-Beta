/**
 * Login API route
 * POST /api/auth/login
 */

import { z } from 'zod';
import { loginWithPassword } from '@/lib/auth/utils';

const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const validatedData = LoginSchema.parse(body);

    const { error } = await loginWithPassword(
      validatedData.email,
      validatedData.password
    );

    if (error) {
      return Response.json(
        {
          error: 'AUTH_ERROR',
          message: error.message,
        },
        { status: 401 }
      );
    }

    return Response.json(
      {
        success: true,
        message: 'Login successful',
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        {
          error: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          fields: error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    console.error('Login API error:', error);
    return Response.json(
      {
        error: 'INTERNAL_ERROR',
        message: 'An error occurred during login',
      },
      { status: 500 }
    );
  }
}

