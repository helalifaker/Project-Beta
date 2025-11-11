/**
 * Repository pattern base class
 * Provides base CRUD operations for database entities
 */

import { prisma } from './prisma';
import type { Prisma } from '@prisma/client';

export interface RepositoryOptions {
  includeDeleted?: boolean;
}

/**
 * Base repository class
 */
export abstract class BaseRepository<T, CreateInput, UpdateInput> {
  protected abstract model: keyof typeof prisma;

  /**
   * Find many records
   */
  async findMany(
    where?: Prisma.Args<T, 'findMany'>['where'],
    options?: RepositoryOptions
  ): Promise<T[]> {
    const model = prisma[this.model as keyof typeof prisma] as {
      findMany: (args: unknown) => Promise<T[]>;
    };

    const args: Record<string, unknown> = { where };

    if (!options?.includeDeleted) {
      // Add soft delete filter if model has deletedAt
      // This will be implemented when soft delete is added
    }

    return model.findMany(args);
  }

  /**
   * Find unique record
   */
  async findUnique(
    where: Prisma.Args<T, 'findUnique'>['where'],
    options?: RepositoryOptions
  ): Promise<T | null> {
    const model = prisma[this.model as keyof typeof prisma] as {
      findUnique: (args: unknown) => Promise<T | null>;
    };

    const args: Record<string, unknown> = { where };

    if (!options?.includeDeleted) {
      // Add soft delete filter
    }

    return model.findUnique(args);
  }

  /**
   * Create record
   */
  async create(data: CreateInput): Promise<T> {
    const model = prisma[this.model as keyof typeof prisma] as {
      create: (args: { data: CreateInput }) => Promise<T>;
    };

    return model.create({ data });
  }

  /**
   * Update record
   */
  async update(
    where: Prisma.Args<T, 'update'>['where'],
    data: UpdateInput
  ): Promise<T> {
    const model = prisma[this.model as keyof typeof prisma] as {
      update: (args: { where: unknown; data: UpdateInput }) => Promise<T>;
    };

    return model.update({ where, data });
  }

  /**
   * Delete record (soft delete when implemented)
   */
  async delete(where: Prisma.Args<T, 'delete'>['where']): Promise<T> {
    const model = prisma[this.model as keyof typeof prisma] as {
      delete: (args: { where: unknown }) => Promise<T>;
    };

    // TODO: Implement soft delete when deletedAt field is added
    return model.delete({ where });
  }

  /**
   * Count records
   */
  async count(where?: Prisma.Args<T, 'count'>['where']): Promise<number> {
    const model = prisma[this.model as keyof typeof prisma] as {
      count: (args: { where?: unknown }) => Promise<number>;
    };

    return model.count({ where });
  }
}

