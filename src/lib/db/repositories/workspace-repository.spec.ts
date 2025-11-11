/**
 * Tests for WorkspaceRepository
 */

import { describe, expect, it, vi, beforeEach } from 'vitest';

import { prisma } from '../prisma';
import { workspaceRepository } from './workspace-repository';

vi.mock('../prisma', () => ({
  prisma: {
    workspaceSetting: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe('WorkspaceRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getOrCreateDefault', () => {
    it('should return existing workspace', async () => {
      const mockWorkspace = {
        id: 'ws-1',
        name: 'Existing Workspace',
        baseCurrency: 'SAR',
        timezone: 'Asia/Riyadh',
        discountRate: 0.08,
        cpiMin: 0.02,
        cpiMax: 0.05,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.workspaceSetting.findFirst).mockResolvedValue(mockWorkspace as any);

      const result = await workspaceRepository.getOrCreateDefault();

      expect(result).toEqual(mockWorkspace);
      expect(prisma.workspaceSetting.create).not.toHaveBeenCalled();
    });

    it('should create default workspace when none exists', async () => {
      const mockWorkspace = {
        id: 'ws-1',
        name: 'Default Workspace',
        baseCurrency: 'SAR',
        timezone: 'Asia/Riyadh',
        discountRate: 0.08,
        cpiMin: 0.02,
        cpiMax: 0.05,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.workspaceSetting.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.workspaceSetting.create).mockResolvedValue(mockWorkspace as any);

      const result = await workspaceRepository.getOrCreateDefault();

      expect(result).toEqual(mockWorkspace);
      expect(prisma.workspaceSetting.create).toHaveBeenCalledWith({
        data: {
          name: 'Default Workspace',
          baseCurrency: 'SAR',
          timezone: 'Asia/Riyadh',
          discountRate: 0.08,
          cpiMin: 0.02,
          cpiMax: 0.05,
        },
      });
    });
  });

  describe('updateSettings', () => {
    it('should update all settings', async () => {
      const mockWorkspace = {
        id: 'ws-1',
        name: 'Updated Workspace',
        baseCurrency: 'USD',
        timezone: 'UTC',
        discountRate: 0.1,
        cpiMin: 0.03,
        cpiMax: 0.06,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.workspaceSetting.update).mockResolvedValue(mockWorkspace as any);

      const result = await workspaceRepository.updateSettings('ws-1', {
        name: 'Updated Workspace',
        baseCurrency: 'USD',
        timezone: 'UTC',
        discountRate: 0.1,
        cpiMin: 0.03,
        cpiMax: 0.06,
      });

      expect(result).toEqual(mockWorkspace);
      expect(prisma.workspaceSetting.update).toHaveBeenCalledWith({
        where: { id: 'ws-1' },
        data: {
          name: 'Updated Workspace',
          baseCurrency: 'USD',
          timezone: 'UTC',
          discountRate: 0.1,
          cpiMin: 0.03,
          cpiMax: 0.06,
        },
      });
    });

    it('should update partial settings', async () => {
      const mockWorkspace = {
        id: 'ws-1',
        name: 'Updated Workspace',
        baseCurrency: 'SAR',
        timezone: 'Asia/Riyadh',
        discountRate: 0.1,
        cpiMin: 0.02,
        cpiMax: 0.05,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.workspaceSetting.update).mockResolvedValue(mockWorkspace as any);

      await workspaceRepository.updateSettings('ws-1', {
        discountRate: 0.1,
      });

      expect(prisma.workspaceSetting.update).toHaveBeenCalledWith({
        where: { id: 'ws-1' },
        data: {
          discountRate: 0.1,
        },
      });
    });
  });
});

