/**
 * Tests for password reset confirmation page
 */

import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';

import ConfirmResetPasswordPage from './page';
import { updatePassword } from '@/lib/auth/utils';
import { useRouter, useSearchParams } from 'next/navigation';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
}));

vi.mock('@/lib/auth/utils', () => ({
  updatePassword: vi.fn(),
}));

const mockPush = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();
  window.location.hash = '#access_token=token&type=recovery';
  vi.mocked(useRouter).mockReturnValue({ push: mockPush } as any);
  vi.mocked(useSearchParams).mockReturnValue({ get: () => null } as any);
});

afterEach(() => {
  vi.useRealTimers();
  mockPush.mockReset();
});

describe('ConfirmResetPasswordPage', () => {
  it('should show error when reset link is invalid', () => {
    window.location.hash = '';
    render(<ConfirmResetPasswordPage />);

    expect(
      screen.getByText('Invalid or expired reset link. Please request a new one.')
    ).toBeInTheDocument();
  });

  it('should handle validation errors for mismatched passwords', () => {
    render(<ConfirmResetPasswordPage />);

    fireEvent.change(screen.getByLabelText('New Password'), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText('Confirm New Password'), {
      target: { value: 'different' },
    });

    fireEvent.submit(screen.getByRole('button', { name: 'Update password' }));

    expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    expect(updatePassword).not.toHaveBeenCalled();
  });

  it('should update password and redirect on success', async () => {
    vi.mocked(updatePassword).mockResolvedValue({ error: null });

    render(<ConfirmResetPasswordPage />);

    fireEvent.change(screen.getByLabelText('New Password'), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText('Confirm New Password'), {
      target: { value: 'password123' },
    });

    fireEvent.submit(screen.getByRole('button', { name: 'Update password' }));

    await act(async () => {
      await Promise.resolve();
    });

    expect(updatePassword).toHaveBeenCalledWith('password123');
    expect(screen.getByText('Password updated')).toBeInTheDocument();

    await act(async () => {
      vi.runAllTimers();
    });

    expect(mockPush).toHaveBeenCalledWith('/login');
  });

  it('should display error when update fails', async () => {
    vi.mocked(updatePassword).mockResolvedValue({
      error: { message: 'Update failed' },
    });

    render(<ConfirmResetPasswordPage />);

    fireEvent.change(screen.getByLabelText('New Password'), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText('Confirm New Password'), {
      target: { value: 'password123' },
    });

    fireEvent.submit(screen.getByRole('button', { name: 'Update password' }));

    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByText('Update failed')).toBeInTheDocument();

    expect(mockPush).not.toHaveBeenCalled();
  });
});
