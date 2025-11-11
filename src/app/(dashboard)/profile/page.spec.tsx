/**
 * Tests for profile page
 */

import { render, screen } from '@testing-library/react';
import { redirect } from 'next/navigation';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { getServerUser } from '@/lib/auth/session';

import ProfilePage from './page';


vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

vi.mock('@/lib/auth/session', () => ({
  getServerUser: vi.fn(),
}));

vi.mock('@/components/features/auth/profile-form', () => ({
  ProfileForm: ({ user }: { user: any }) => (
    <div data-testid="profile-form">Profile Form for {user.email}</div>
  ),
}));

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should redirect to login if no user', async () => {
    vi.mocked(getServerUser).mockResolvedValue(null);

    await ProfilePage();

    expect(redirect).toHaveBeenCalledWith('/login');
  });

  it('should render profile form when authenticated', async () => {
    const mockUser = {
      id: 'user-1',
      email: 'test@example.com',
      role: 'ANALYST' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(getServerUser).mockResolvedValue(mockUser);

    const result = await ProfilePage();
    render(result as React.ReactElement);

    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByTestId('profile-form')).toBeInTheDocument();
    expect(screen.getByText(/Profile Form for test@example.com/)).toBeInTheDocument();
  });
});

