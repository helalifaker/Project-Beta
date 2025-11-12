/**
 * Tests for audit logging utility
 */

import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import { createAuditLog, getAuditLogs } from './logger';

describe('createAuditLog', () => {
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it('should log audit entry to console', async () => {
    const entry = {
      action: 'VERSION_CREATED' as const,
      userId: 'user-1',
      userRole: 'ADMIN' as const,
      entityType: 'version',
      entityId: 'v-1',
      details: { name: 'Test Version' },
    };

    await createAuditLog(entry);

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      '[AUDIT]',
      expect.objectContaining({
        action: 'VERSION_CREATED',
        userId: 'user-1',
        timestamp: expect.any(String),
      })
    );
  });

  it('should handle errors gracefully', async () => {
    // Force an error by making console.warn throw
    consoleWarnSpy.mockImplementation(() => {
      throw new Error('Logging failed');
    });

    const entry = {
      action: 'VERSION_CREATED' as const,
      userId: 'user-1',
      userRole: 'ADMIN' as const,
      entityType: 'version',
      entityId: 'v-1',
    };

    // Should not throw (errors are caught in try-catch)
    await expect(createAuditLog(entry)).resolves.not.toThrow();
    // Error handling is internal, so we just verify it doesn't throw
  });
});

describe('getAuditLogs', () => {
  it('should return empty array (placeholder)', async () => {
    const logs = await getAuditLogs();

    expect(logs).toEqual([]);
  });

  it('should accept filters without error', async () => {
    const logs = await getAuditLogs('user-1', 'version', 'v-1', 50);

    expect(logs).toEqual([]);
  });
});
