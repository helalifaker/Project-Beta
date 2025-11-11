/**
 * Audit logging utility
 * Logs user actions for audit trail
 */

import { prisma } from '@/lib/db/prisma';
import type { UserRole } from '@/types/auth';

export type AuditAction =
  | 'USER_CREATED'
  | 'USER_UPDATED'
  | 'USER_DELETED'
  | 'USER_ROLE_CHANGED'
  | 'VERSION_CREATED'
  | 'VERSION_UPDATED'
  | 'VERSION_DELETED'
  | 'VERSION_APPROVED'
  | 'VERSION_LOCKED'
  | 'ASSUMPTIONS_UPDATED'
  | 'STATEMENTS_GENERATED'
  | 'COMPARISON_CREATED'
  | 'EXPORT_GENERATED';

export interface AuditLogEntry {
  action: AuditAction;
  userId: string;
  userRole: UserRole;
  entityType: string;
  entityId: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Create audit log entry
 * Note: This will be implemented when AuditLog model is added to Prisma schema
 */
export async function createAuditLog(entry: AuditLogEntry): Promise<void> {
  try {
    // TODO: Implement when AuditLog model is added to Prisma schema
    // For now, log to console
    console.log('[AUDIT]', {
      ...entry,
      timestamp: new Date().toISOString(),
    });

    // Future implementation:
    // await prisma.auditLog.create({
    //   data: {
    //     action: entry.action,
    //     userId: entry.userId,
    //     userRole: entry.userRole,
    //     entityType: entry.entityType,
    //     entityId: entry.entityId,
    //     details: entry.details || {},
    //     ipAddress: entry.ipAddress,
    //     userAgent: entry.userAgent,
    //   },
    // });
  } catch (error) {
    // Don't throw - audit logging should not break the application
    console.error('Failed to create audit log:', error);
  }
}

/**
 * Get audit logs for a user
 */
export async function getAuditLogs(
  userId?: string,
  entityType?: string,
  entityId?: string,
  limit: number = 100
): Promise<unknown[]> {
  try {
    // TODO: Implement when AuditLog model is added to Prisma schema
    return [];
  } catch (error) {
    console.error('Failed to fetch audit logs:', error);
    return [];
  }
}

