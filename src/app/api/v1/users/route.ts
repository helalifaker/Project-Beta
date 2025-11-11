/**
 * Users API route
 * GET /api/v1/users - List users (admin only)
 * POST /api/v1/users - Create user (admin only)
 */

import { z } from 'zod';
import { requireRole } from '@/lib/auth/session';
import { registerUser } from '@/lib/auth/utils';
import { prisma } from '@/lib/db/prisma';
import type { UserRole } from '@/types/auth';

const CreateUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['ADMIN', 'ANALYST', 'VIEWER']).default('ANALYST'),
});

export async function GET(request: Request): Promise<Response> {
  try {
    // Require ADMIN role
    await requireRole('ADMIN');

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);
    const role = searchParams.get('role') as UserRole | null;

    // Build query
    const where: Record<string, unknown> = {};
    if (role) {
      where.role = role;
    }

    // Fetch users
    const [users, total] = await Promise.all([
      prisma.profile.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.profile.count({ where }),
    ]);

    return Response.json({
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return Response.json(
        {
          error: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
        { status: 401 }
      );
    }

    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return Response.json(
        {
          error: 'FORBIDDEN',
          message: 'Insufficient permissions. Admin access required.',
        },
        { status: 403 }
      );
    }

    console.error('GET /api/v1/users error:', error);
    return Response.json(
      {
        error: 'INTERNAL_ERROR',
        message: 'An error occurred while fetching users',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    // Require ADMIN role
    await requireRole('ADMIN');

    const body = await request.json();
    const validatedData = CreateUserSchema.parse(body);

    // Register user
    const { userId, error: registerError } = await registerUser(
      validatedData.email,
      validatedData.password,
      validatedData.role
    );

    if (registerError || !userId) {
      return Response.json(
        {
          error: 'REGISTRATION_ERROR',
          message:
            registerError?.message || 'Failed to create user account',
        },
        { status: 400 }
      );
    }

    // Fetch created user
    const user = await prisma.profile.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return Response.json(
        {
          error: 'NOT_FOUND',
          message: 'User created but not found',
        },
        { status: 404 }
      );
    }

    return Response.json(
      {
        data: user,
        meta: {
          timestamp: new Date().toISOString(),
        },
      },
      { status: 201 }
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

    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return Response.json(
        {
          error: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
        { status: 401 }
      );
    }

    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return Response.json(
        {
          error: 'FORBIDDEN',
          message: 'Insufficient permissions. Admin access required.',
        },
        { status: 403 }
      );
    }

    console.error('POST /api/v1/users error:', error);
    return Response.json(
      {
        error: 'INTERNAL_ERROR',
        message: 'An error occurred while creating user',
      },
      { status: 500 }
    );
  }
}

