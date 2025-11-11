/**
 * RBAC tests
 */

import { describe, it, expect } from 'vitest';
import {
  hasRole,
  canPerformAction,
  canAccessResource,
  getAllowedActions,
} from './rbac';
import type { UserRole } from '@/types/auth';

describe('hasRole', () => {
  it('should return true if user role is higher than required', () => {
    expect(hasRole('ADMIN', 'ANALYST')).toBe(true);
    expect(hasRole('ADMIN', 'VIEWER')).toBe(true);
    expect(hasRole('ANALYST', 'VIEWER')).toBe(true);
  });

  it('should return true if user role equals required', () => {
    expect(hasRole('ADMIN', 'ADMIN')).toBe(true);
    expect(hasRole('ANALYST', 'ANALYST')).toBe(true);
    expect(hasRole('VIEWER', 'VIEWER')).toBe(true);
  });

  it('should return false if user role is lower than required', () => {
    expect(hasRole('VIEWER', 'ANALYST')).toBe(false);
    expect(hasRole('VIEWER', 'ADMIN')).toBe(false);
    expect(hasRole('ANALYST', 'ADMIN')).toBe(false);
  });
});

describe('canPerformAction', () => {
  it('should allow ADMIN to perform any action', () => {
    const result = canPerformAction('ADMIN', 'versions:create');
    expect(result.allowed).toBe(true);
  });

  it('should allow ANALYST to create versions', () => {
    const result = canPerformAction('ANALYST', 'versions:create');
    expect(result.allowed).toBe(true);
  });

  it('should not allow VIEWER to create versions', () => {
    const result = canPerformAction('VIEWER', 'versions:create');
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('ANALYST');
  });

  it('should allow all roles to view versions', () => {
    expect(canPerformAction('ADMIN', 'versions:view').allowed).toBe(true);
    expect(canPerformAction('ANALYST', 'versions:view').allowed).toBe(true);
    expect(canPerformAction('VIEWER', 'versions:view').allowed).toBe(true);
  });

  it('should only allow ADMIN to approve versions', () => {
    expect(canPerformAction('ADMIN', 'versions:approve').allowed).toBe(true);
    expect(canPerformAction('ANALYST', 'versions:approve').allowed).toBe(false);
    expect(canPerformAction('VIEWER', 'versions:approve').allowed).toBe(false);
  });

  it('should return error for unknown action', () => {
    const result = canPerformAction('ADMIN', 'unknown:action');
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('Unknown action');
  });
});

describe('canAccessResource', () => {
  it('should allow ADMIN to access any resource', () => {
    const result = canAccessResource('ADMIN', 'other-user-id', 'admin-id');
    expect(result.allowed).toBe(true);
  });

  it('should allow user to access their own resource', () => {
    const result = canAccessResource('ANALYST', 'user-id', 'user-id');
    expect(result.allowed).toBe(true);
  });

  it('should not allow user to access other user resource', () => {
    const result = canAccessResource('ANALYST', 'other-user-id', 'user-id');
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('another user');
  });
});

describe('getAllowedActions', () => {
  it('should return all actions for ADMIN', () => {
    const actions = getAllowedActions('ADMIN');
    expect(actions.length).toBeGreaterThan(0);
    expect(actions).toContain('versions:create');
    expect(actions).toContain('admin:users:manage');
  });

  it('should return limited actions for ANALYST', () => {
    const actions = getAllowedActions('ANALYST');
    expect(actions).toContain('versions:create');
    expect(actions).not.toContain('admin:users:manage');
  });

  it('should return read-only actions for VIEWER', () => {
    const actions = getAllowedActions('VIEWER');
    expect(actions).toContain('versions:view');
    expect(actions).not.toContain('versions:create');
  });
});

