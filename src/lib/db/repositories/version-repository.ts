/**
 * Version repository
 * Data access layer for version operations
 */

import type { Prisma, Version, VersionStatus } from '@prisma/client';

import { prisma } from '../prisma';
import { BaseRepository } from '../repository';

export interface CreateVersionInput {
  name: string;
  description?: string;
  ownerId: string;
  baseVersionId?: string;
}

export interface UpdateVersionInput {
  name?: string;
  description?: string;
  status?: VersionStatus;
}

export class VersionRepository extends BaseRepository<
  Version,
  CreateVersionInput,
  UpdateVersionInput
> {
  protected model = 'version' as const;

  /**
   * Find versions by status
   */
  async findByStatus(status: VersionStatus): Promise<Version[]> {
    return prisma.version.findMany({
      where: { status },
      orderBy: { updatedAt: 'desc' },
    });
  }

  /**
   * Find versions by owner
   */
  async findByOwner(ownerId: string): Promise<Version[]> {
    return prisma.version.findMany({
      where: { ownerId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  /**
   * Find versions with filters
   */
  async findWithFilters(filters: {
    status?: VersionStatus;
    ownerId?: string;
    search?: string;
  }): Promise<Version[]> {
    const where: Prisma.VersionWhereInput = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.ownerId) {
      where.ownerId = filters.ownerId;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return prisma.version.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
    });
  }

  /**
   * Lock version
   */
  async lockVersion(versionId: string, userId: string): Promise<Version> {
    return prisma.version.update({
      where: { id: versionId },
      data: {
        lockedAt: new Date(),
        status: 'LOCKED',
      },
    });
  }

  /**
   * Unlock version
   */
  async unlockVersion(versionId: string): Promise<Version> {
    return prisma.version.update({
      where: { id: versionId },
      data: {
        lockedAt: null,
        status: 'DRAFT',
      },
    });
  }

  /**
   * Update status with validation
   */
  async updateStatus(
    versionId: string,
    newStatus: VersionStatus,
    userId: string
  ): Promise<Version> {
    const version = await this.findUnique({ id: versionId });
    if (!version) {
      throw new Error('Version not found');
    }

    // Validate status transition
    const validTransitions: Record<VersionStatus, VersionStatus[]> = {
      DRAFT: ['READY', 'ARCHIVED'],
      READY: ['LOCKED', 'DRAFT', 'ARCHIVED'],
      LOCKED: ['DRAFT', 'ARCHIVED'],
      ARCHIVED: ['DRAFT'],
    };

    if (!validTransitions[version.status].includes(newStatus)) {
      throw new Error(`Invalid status transition from ${version.status} to ${newStatus}`);
    }

    const updateData: Prisma.VersionUpdateInput = {
      status: newStatus,
    };

    if (newStatus === 'READY') {
      updateData.approvedAt = new Date();
    }

    return prisma.version.update({
      where: { id: versionId },
      data: updateData,
    });
  }

  /**
   * Duplicate version
   */
  async duplicateVersion(versionId: string, newName: string, newOwnerId: string): Promise<Version> {
    const original = await prisma.version.findUnique({
      where: { id: versionId },
      include: {
        curricula: {
          include: {
            rampOverrides: true,
            tuitionOverrides: true,
          },
        },
      },
    });

    if (!original) {
      throw new Error('Version not found');
    }

    // Create new version
    const duplicated = await prisma.version.create({
      data: {
        name: newName,
        description: original.description ? `${original.description} (Copy)` : null,
        ownerId: newOwnerId,
        status: 'DRAFT',
        curricula: {
          create: original.curricula.map((curriculum) => ({
            curriculumTemplateId: curriculum.curriculumTemplateId,
            customCapacity: curriculum.customCapacity,
            rampOverrides: {
              create: curriculum.rampOverrides.map((ramp) => ({
                year: ramp.year,
                utilisation: ramp.utilisation,
              })),
            },
            tuitionOverrides: {
              create: curriculum.tuitionOverrides.map((tuition) => ({
                year: tuition.year,
                tuition: tuition.tuition,
              })),
            },
          })),
        },
      },
    });

    return duplicated;
  }

  /**
   * Soft delete version
   */
  async softDelete(versionId: string): Promise<Version> {
    // TODO: Add deletedAt field to schema when soft delete is implemented
    // For now, mark as ARCHIVED
    return prisma.version.update({
      where: { id: versionId },
      data: { status: 'ARCHIVED' },
    });
  }
}

export const versionRepository = new VersionRepository();
