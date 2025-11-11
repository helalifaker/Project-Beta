/**
 * Tests for login page
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import { loginWithPassword, loginWithMagicLink } from '@/lib/auth/utils';

import LoginPage from './page';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
}));

vi.mock('@/lib/auth/utils', () => ({
  loginWithPassword: vi.fn(),
  loginWithMagicLink: vi.fn(),
}));

const mockPush = vi.fn();
const mockRefresh = vi.fn();
const mockGet = vi.fn<(key: string) => string | null>((key: string) =>
  key === 'redirect' ? null : null
);
const mockSearchParams = {
  get: mockGet,
};

beforeEach(() => {
  vi.clearAllMocks();
  mockGet.mockImplementation((key: string) => (key === 'redirect' ? null : null));
  vi.mocked(useRouter).mockReturnValue({
    push: mockPush,
    refresh: mockRefresh,
  } as unknown as ReturnType<typeof useRouter>);
  vi.mocked(useSearchParams).mockReturnValue(mockSearchParams as unknown as ReturnType<typeof useSearchParams>);
});

afterEach(() => {
  mockPush.mockReset();
  mockRefresh.mockReset();
});

describe('LoginPage', () => {
  it('should render password login form by default', () => {
    render(<LoginPage />);

    expect(
      screen.getByRole('heading', { name: 'Sign in', level: 3 })
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
  });

  it('should submit password login and redirect on success', async () => {
    mockGet.mockImplementation((key: string) =>
      key === 'redirect' ? '/overview/custom' : null
    );
    vi.mocked(loginWithPassword).mockResolvedValue({ error: null });

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' },
    });
    fireEvent.submit(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(loginWithPassword).toHaveBeenCalledWith(
        'user@example.com',
        'password123'
      );
    });

    expect(mockPush).toHaveBeenCalledWith('/overview/custom');
    expect(mockRefresh).toHaveBeenCalled();
  });

  it('should show error when password login fails', async () => {
    vi.mocked(loginWithPassword).mockResolvedValue({
      error: { name: 'AuthError', message: 'Invalid credentials' },
    });

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'wrong' },
    });
    fireEvent.submit(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(
        screen.getByText('Invalid credentials')
      ).toBeInTheDocument();
    });

    expect(mockPush).not.toHaveBeenCalled();
  });

  it('should handle magic link flow successfully', async () => {
    vi.mocked(loginWithMagicLink).mockResolvedValue({ error: null });

    render(<LoginPage />);

    // Switch to magic link mode
    fireEvent.click(screen.getByRole('button', { name: 'Use magic link instead' }));

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'user@example.com' },
    });

    fireEvent.submit(screen.getByRole('button', { name: 'Send magic link' }));

    await waitFor(() => {
      expect(loginWithMagicLink).toHaveBeenCalled();
    });

    expect(
      screen.getByText(
        "We've sent a magic link to user@example.com. Click the link in the email to sign in."
      )
    ).toBeInTheDocument();
  });
});
