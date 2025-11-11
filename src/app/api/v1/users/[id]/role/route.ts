/**
 * User role assignment API route
 * PUT /api/v1/users/[id]/role - Update user role (admin only)
 */

import { z } from 'zod';
import { requireRole } from '@/lib/auth/session';
import { updateUserRole } from '@/lib/auth/utils';
import { prisma } from '@/lib/db/prisma';

const UpdateRoleSchema = z.object({
  role: z.enum(['ADMIN', 'ANALYST', 'VIEWER'], {
    required_error: 'Role is required',
  }),
});

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
): Promise<Response> {
  try {
    // Require ADMIN role
    const session = await requireRole('ADMIN');

    const body = await request.json();
    const validatedData = UpdateRoleSchema.parse(body);

    // Check if user exists
    const user = await prisma.profile.findUnique({
      where: { id: params.id },
    });

    if (!user) {
      return Response.json(
        {
          error: 'NOT_FOUND',
          message: 'User not found',
          meta: {
            resource: 'user',
            id: params.id,
            timestamp: new Date().toISOString(),
          },
        },
        { status: 404 }
      );
    }

    // Prevent changing your own role
    if (user.id === session.user.id) {
      return Response.json(
        {
          error: 'VALIDATION_ERROR',
          message: 'Cannot change your own role',
        },
        { status: 400 }
      );
    }

    // Update role
    const { error: updateError } = await updateUserRole(
      params.id,
      validatedData.role
    );

    if (updateError) {
      return Response.json(
        {
          error: 'UPDATE_ERROR',
          message: updateError.message || 'Failed to update user role',
        },
        { status: 400 }
      );
    }

    // Fetch updated user
    const updatedUser = await prisma.profile.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return Response.json({
      data: updatedUser,
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
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

    console.error('PUT /api/v1/users/[id]/role error:', error);
    return Response.json(
      {
        error: 'INTERNAL_ERROR',
        message: 'An error occurred while updating user role',
      },
      { status: 500 }
    );
  }
}

