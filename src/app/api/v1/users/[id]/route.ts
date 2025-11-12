/**
 * User detail API route
 * GET /api/v1/users/[id] - Get user
 * PUT /api/v1/users/[id] - Update user (admin only)
 * DELETE /api/v1/users/[id] - Delete user (admin only)
 */

import { z } from 'zod';

import { requireRole } from '@/lib/auth/session';
import { updateUserRole } from '@/lib/auth/utils';
import { prisma } from '@/lib/db/prisma';

const UpdateUserSchema = z.object({
  role: z.enum(['ADMIN', 'ANALYST', 'VIEWER']).optional(),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    // Require ADMIN role
    await requireRole('ADMIN');

    const { id } = await params;
    const user = await prisma.profile.findUnique({
      where: { id },
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
          message: 'User not found',
          meta: {
            resource: 'user',
            id,
            timestamp: new Date().toISOString(),
          },
        },
        { status: 404 }
      );
    }

    return Response.json({
      data: user,
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

    console.error('GET /api/v1/users/[id] error:', error);
    return Response.json(
      {
        error: 'INTERNAL_ERROR',
        message: 'An error occurred while fetching user',
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    // Require ADMIN role
    await requireRole('ADMIN');

    const { id } = await params;
    const body = await request.json();
    const validatedData = UpdateUserSchema.parse(body);

    // Check if user exists
    const existingUser = await prisma.profile.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return Response.json(
        {
          error: 'NOT_FOUND',
          message: 'User not found',
          meta: {
            resource: 'user',
            id,
            timestamp: new Date().toISOString(),
          },
        },
        { status: 404 }
      );
    }

    // Update role if provided
    if (validatedData.role) {
      const { error: updateError } = await updateUserRole(id, validatedData.role);

      if (updateError) {
        return Response.json(
          {
            error: 'UPDATE_ERROR',
            message: updateError.message || 'Failed to update user role',
          },
          { status: 400 }
        );
      }
    }

    // Fetch updated user
    const user = await prisma.profile.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return Response.json({
      data: user,
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

    console.error('PUT /api/v1/users/[id] error:', error);
    return Response.json(
      {
        error: 'INTERNAL_ERROR',
        message: 'An error occurred while updating user',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    // Require ADMIN role
    await requireRole('ADMIN');

    const { id } = await params;
    // Check if user exists
    const user = await prisma.profile.findUnique({
      where: { id },
    });

    if (!user) {
      return Response.json(
        {
          error: 'NOT_FOUND',
          message: 'User not found',
          meta: {
            resource: 'user',
            id,
            timestamp: new Date().toISOString(),
          },
        },
        { status: 404 }
      );
    }

    // Prevent deleting yourself
    const session = await requireRole('ADMIN');
    if (user.id === session.user.id) {
      return Response.json(
        {
          error: 'VALIDATION_ERROR',
          message: 'Cannot delete your own account',
        },
        { status: 400 }
      );
    }

    // Delete user (soft delete - update to DELETED status if we add it)
    // For now, hard delete (will be changed to soft delete later)
    await prisma.profile.delete({
      where: { id },
    });

    return Response.json(
      {
        success: true,
        message: 'User deleted successfully',
        meta: {
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
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

    console.error('DELETE /api/v1/users/[id] error:', error);
    return Response.json(
      {
        error: 'INTERNAL_ERROR',
        message: 'An error occurred while deleting user',
      },
      { status: 500 }
    );
  }
}
