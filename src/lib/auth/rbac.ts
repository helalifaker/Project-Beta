/**
 * Role-Based Access Control (RBAC) utilities
 * Implements permission checks based on user roles
 */

import type { UserRole, PermissionResult } from '@/types/auth';

/**
 * Role hierarchy (higher roles inherit lower role permissions)
 */
const ROLE_HIERARCHY: Record<UserRole, number> = {
  VIEWER: 1,
  ANALYST: 2,
  ADMIN: 3,
};

/**
 * Check if user has required role or higher
 */
export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

const ACTION_PERMISSIONS: Record<string, UserRole[]> = {
  // Version management
  'versions:create': ['ADMIN', 'ANALYST'],
  'versions:edit': ['ADMIN', 'ANALYST'],
  'versions:delete': ['ADMIN', 'ANALYST'],
  'versions:view': ['ADMIN', 'ANALYST', 'VIEWER'],
  'versions:approve': ['ADMIN'],
  'versions:lock': ['ADMIN'],

  // Assumptions
  'assumptions:edit': ['ADMIN', 'ANALYST'],
  'assumptions:view': ['ADMIN', 'ANALYST', 'VIEWER'],

  // Financial statements
  'statements:generate': ['ADMIN', 'ANALYST'],
  'statements:view': ['ADMIN', 'ANALYST', 'VIEWER'],

  // Comparisons
  'comparisons:create': ['ADMIN', 'ANALYST'],
  'comparisons:view': ['ADMIN', 'ANALYST', 'VIEWER'],

  // Admin actions
  'admin:workspace:edit': ['ADMIN'],
  'admin:templates:edit': ['ADMIN'],
  'admin:rules:edit': ['ADMIN'],
  'admin:users:manage': ['ADMIN'],

  // Reports
  'reports:export': ['ADMIN', 'ANALYST'],
  'reports:view': ['ADMIN', 'ANALYST', 'VIEWER'],
};

/**
 * Check if user can perform action
 * ADMIN has access to all registered actions
 */
export function canPerformAction(
  userRole: UserRole,
  action: string
): PermissionResult {
  const allowedRoles = ACTION_PERMISSIONS[action];

  if (!allowedRoles) {
    return {
      allowed: false,
      reason: `Unknown action: ${action}`,
    };
  }

  if (userRole === 'ADMIN') {
    return { allowed: true };
  }

  const allowed = allowedRoles.includes(userRole);

  return {
    allowed,
    reason: allowed
      ? undefined
      : `Action '${action}' requires one of: ${allowedRoles.join(', ')}`,
  };
}

/**
 * Check if user can access resource
 * ADMIN can access all resources
 */
export function canAccessResource(
  userRole: UserRole,
  resourceOwnerId: string,
  currentUserId: string
): PermissionResult {
  // ADMIN can access all resources
  if (userRole === 'ADMIN') {
    return { allowed: true };
  }

  // Users can access their own resources
  if (resourceOwnerId === currentUserId) {
    return { allowed: true };
  }

  return {
    allowed: false,
    reason: 'Resource belongs to another user',
  };
}

/**
 * Get all allowed actions for a role
 */
export function getAllowedActions(userRole: UserRole): string[] {
  return Object.keys(ACTION_PERMISSIONS).filter((action) => {
    const result = canPerformAction(userRole, action);
    return result.allowed;
  });
}

