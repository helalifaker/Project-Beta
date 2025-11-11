/**
 * Tests for reset password request page
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { sendPasswordReset } from '@/lib/auth/utils';

import ResetPasswordPage from './page';

vi.mock('@/lib/auth/utils', () => ({
  sendPasswordReset: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ResetPasswordPage', () => {
  it('should render reset password form', () => {
    render(<ResetPasswordPage />);

    expect(screen.getByText('Reset password')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Send reset link' })
    ).toBeInTheDocument();
  });

  it('should send reset link successfully', async () => {
    vi.mocked(sendPasswordReset).mockResolvedValue({ error: null });

    render(<ResetPasswordPage />);

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'reset@example.com' },
    });

    fireEvent.submit(screen.getByRole('button', { name: 'Send reset link' }));

    await waitFor(() => {
      expect(sendPasswordReset).toHaveBeenCalled();
    });

    expect(
      screen.getByText(
        "We've sent a password reset link to reset@example.com. Click the link in the email to reset your password."
      )
    ).toBeInTheDocument();
  });

  it('should show error when reset fails', async () => {
    vi.mocked(sendPasswordReset).mockResolvedValue({
      error: { name: 'AuthError', message: 'Reset failed' },
    });

    render(<ResetPasswordPage />);

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'reset@example.com' },
    });

    fireEvent.submit(screen.getByRole('button', { name: 'Send reset link' }));

    await waitFor(() => {
      expect(screen.getByText('Reset failed')).toBeInTheDocument();
    });
  });
});
