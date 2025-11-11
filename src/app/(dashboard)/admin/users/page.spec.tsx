/**
 * Tests for admin users page
 */

import { render, screen } from '@testing-library/react';
import { redirect } from 'next/navigation';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { requireRole, getServerUser } from '@/lib/auth/session';

import AdminUsersPage from './page';


vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

vi.mock('@/lib/auth/session', () => ({
  requireRole: vi.fn(),
  getServerUser: vi.fn(),
}));

vi.mock('@/components/features/admin/user-management', () => ({
  UserManagement: () => <div data-testid="user-management">User Management</div>,
}));

describe('AdminUsersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should redirect to unauthorized if not admin', async () => {
    vi.mocked(requireRole).mockRejectedValue(new Error('FORBIDDEN'));

    await AdminUsersPage();

    expect(redirect).toHaveBeenCalledWith('/unauthorized');
  });

  it('should redirect to login if no user', async () => {
    vi.mocked(requireRole).mockResolvedValue({
      user: {
        id: 'admin-id',
        email: 'admin@example.com',
        role: 'ADMIN' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      accessToken: 'token',
      expiresAt: new Date(),
    });
    vi.mocked(getServerUser).mockResolvedValue(null);

    await AdminUsersPage();

    expect(redirect).toHaveBeenCalledWith('/login');
  });

  it('should render user management when authenticated as admin', async () => {
    const mockUser = {
      id: 'admin-id',
      email: 'admin@example.com',
      role: 'ADMIN' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(requireRole).mockResolvedValue({
      user: mockUser,
      accessToken: 'token',
      expiresAt: new Date(),
    });
    vi.mocked(getServerUser).mockResolvedValue(mockUser);

    const result = await AdminUsersPage();
    render(result as React.ReactElement);

    expect(screen.getByRole('heading', { name: 'User Management' })).toBeInTheDocument();
    expect(screen.getByTestId('user-management')).toBeInTheDocument();
  });
});

