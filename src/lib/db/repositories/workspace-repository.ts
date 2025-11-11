/**
 * Workspace settings repository
 * Data access layer for workspace configuration
 */

import type { Prisma, WorkspaceSetting } from '@prisma/client';

import { prisma } from '../prisma';
import { BaseRepository } from '../repository';

export interface UpdateWorkspaceSettingsInput {
  name?: string;
  baseCurrency?: string;
  timezone?: string;
  discountRate?: number;
  cpiMin?: number;
  cpiMax?: number;
}

export class WorkspaceRepository extends BaseRepository<
  WorkspaceSetting,
  { name: string },
  UpdateWorkspaceSettingsInput
> {
  protected model = 'workspaceSetting' as const;

  /**
   * Get or create default workspace
   */
  async getOrCreateDefault(): Promise<WorkspaceSetting> {
    let workspace = await prisma.workspaceSetting.findFirst();

    if (!workspace) {
      workspace = await prisma.workspaceSetting.create({
        data: {
          name: 'Default Workspace',
          baseCurrency: 'SAR',
          timezone: 'Asia/Riyadh',
          discountRate: 0.08,
          cpiMin: 0.02,
          cpiMax: 0.05,
        },
      });
    }

    return workspace;
  }

  /**
   * Update workspace settings
   */
  async updateSettings(id: string, data: UpdateWorkspaceSettingsInput): Promise<WorkspaceSetting> {
    const updateData: Prisma.WorkspaceSettingUpdateInput = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.baseCurrency !== undefined) updateData.baseCurrency = data.baseCurrency;
    if (data.timezone !== undefined) updateData.timezone = data.timezone;
    if (data.discountRate !== undefined) updateData.discountRate = data.discountRate;
    if (data.cpiMin !== undefined) updateData.cpiMin = data.cpiMin;
    if (data.cpiMax !== undefined) updateData.cpiMax = data.cpiMax;

    return prisma.workspaceSetting.update({
      where: { id },
      data: updateData,
    });
  }
}

export const workspaceRepository = new WorkspaceRepository();
