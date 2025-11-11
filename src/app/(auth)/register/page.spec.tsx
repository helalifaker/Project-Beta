/**
 * Tests for register page
 */

import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';

import RegisterPage from './page';
import { registerUser } from '@/lib/auth/utils';
import { useRouter } from 'next/navigation';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('@/lib/auth/utils', () => ({
  registerUser: vi.fn(),
}));

const mockPush = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();
  vi.mocked(useRouter).mockReturnValue({
    push: mockPush,
  } as any);
});

afterEach(() => {
  vi.useRealTimers();
  mockPush.mockReset();
});

describe('RegisterPage', () => {
  const fillBaseFields = () => {
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'new-user@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' },
    });
  };

  it('should display validation error when passwords do not match', () => {
    render(<RegisterPage />);

    fillBaseFields();
    fireEvent.change(screen.getByLabelText('Confirm Password'), {
      target: { value: 'different' },
    });

    fireEvent.submit(screen.getByRole('button', { name: 'Create user' }));

    expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    expect(registerUser).not.toHaveBeenCalled();
  });

  it('should show error when password is too short', () => {
    render(<RegisterPage />);

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'short@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'short' },
    });
    fireEvent.change(screen.getByLabelText('Confirm Password'), {
      target: { value: 'short' },
    });

    fireEvent.submit(screen.getByRole('button', { name: 'Create user' }));

    expect(
      screen.getByText('Password must be at least 8 characters')
    ).toBeInTheDocument();
    expect(registerUser).not.toHaveBeenCalled();
  });

  it('should handle registration error from server', async () => {
    vi.mocked(registerUser).mockResolvedValue({
      userId: null,
      error: { message: 'Not authorized' },
    });

    render(<RegisterPage />);

    fillBaseFields();
    fireEvent.change(screen.getByLabelText('Confirm Password'), {
      target: { value: 'password123' },
    });

    fireEvent.submit(screen.getByRole('button', { name: 'Create user' }));

    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByText('Not authorized')).toBeInTheDocument();

    expect(mockPush).not.toHaveBeenCalled();
  });

  it('should create user and redirect on success', async () => {
    vi.mocked(registerUser).mockResolvedValue({ userId: 'user-1', error: null });

    render(<RegisterPage />);

    fillBaseFields();
    fireEvent.change(screen.getByLabelText('Confirm Password'), {
      target: { value: 'password123' },
    });

    fireEvent.submit(screen.getByRole('button', { name: 'Create user' }));

    await act(async () => {
      await Promise.resolve();
    });

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.getByText('User created successfully')).toBeInTheDocument();

    expect(mockPush).toHaveBeenCalledWith('/admin/users');
  });
});
