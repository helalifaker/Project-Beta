/**
 * User repository
 * Data access layer for user operations
 */

import type { Profile } from '@prisma/client';

import type { UserRole } from '@/types/auth';

import { BaseRepository } from '../repository';
import { prisma } from '../prisma';

export interface CreateUserInput {
  email: string;
  role: UserRole;
  externalId: string;
}

export interface UpdateUserInput {
  email?: string;
  role?: UserRole;
}

export class UserRepository extends BaseRepository<Profile, CreateUserInput, UpdateUserInput> {
  protected model = 'profile' as const;

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<Profile | null> {
    return prisma.profile.findUnique({
      where: { email },
    });
  }

  /**
   * Find user by external ID (Supabase auth ID)
   */
  async findByExternalId(externalId: string): Promise<Profile | null> {
    return prisma.profile.findUnique({
      where: { externalId },
    });
  }

  /**
   * Find users by role
   */
  async findByRole(role: UserRole): Promise<Profile[]> {
    return prisma.profile.findMany({
      where: { role },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Update user role
   */
  async updateRole(userId: string, role: UserRole): Promise<Profile> {
    return prisma.profile.update({
      where: { id: userId },
      data: { role },
    });
  }
}

export const userRepository = new UserRepository();
