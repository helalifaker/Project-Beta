/**
 * Tests for register page
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { getSupabaseClient } from '@/lib/supabase/client';

import RegisterPage from './page';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('@/lib/supabase/client', () => ({
  getSupabaseClient: vi.fn(),
}));

const mockPush = vi.fn();
const mockSupabaseClient = {
  auth: {
    getSession: vi.fn(),
  },
  from: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useRouter).mockReturnValue({
    push: mockPush,
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  } as unknown as ReturnType<typeof useRouter>);

  // Mock Supabase client to return authenticated admin session
  const mockSelect = vi.fn().mockReturnThis();
  const mockEq = vi.fn().mockReturnThis();
  const mockSingle = vi.fn().mockResolvedValue({
    data: { role: 'ADMIN' },
    error: null,
  });

  const mockFrom = vi.fn(() => ({
    select: mockSelect,
    eq: mockEq,
    single: mockSingle,
  }));

  mockSupabaseClient.from = mockFrom as unknown as ReturnType<typeof mockSupabaseClient.from>;
  mockSupabaseClient.auth.getSession = vi.fn().mockResolvedValue({
    data: {
      session: {
        user: { id: 'admin-user-id' },
      },
    },
    error: null,
  });

  vi.mocked(getSupabaseClient).mockReturnValue(
    mockSupabaseClient as ReturnType<typeof getSupabaseClient>
  );
});

describe('RegisterPage', () => {
  it('should display validation error when passwords do not match', async () => {
    render(<RegisterPage />);

    // Wait for form to appear after auth check
    const emailInput = await screen.findByLabelText('Email');
    const passwordInput = await screen.findByLabelText('Password');
    const confirmPasswordInput = await screen.findByLabelText('Confirm Password');
    const submitButton = await screen.findByRole('button', { name: 'Create user' });

    fireEvent.change(emailInput, {
      target: { value: 'new-user@example.com' },
    });
    fireEvent.change(passwordInput, {
      target: { value: 'password123' },
    });
    fireEvent.change(confirmPasswordInput, {
      target: { value: 'different' },
    });

    fireEvent.submit(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });
  });

  it('should show error when password is too short', async () => {
    render(<RegisterPage />);

    // Wait for form to appear after auth check
    const emailInput = await screen.findByLabelText('Email');
    const passwordInput = await screen.findByLabelText('Password');
    const confirmPasswordInput = await screen.findByLabelText('Confirm Password');
    const submitButton = await screen.findByRole('button', { name: 'Create user' });

    fireEvent.change(emailInput, {
      target: { value: 'short@example.com' },
    });
    fireEvent.change(passwordInput, {
      target: { value: 'short' },
    });
    fireEvent.change(confirmPasswordInput, {
      target: { value: 'short' },
    });

    fireEvent.submit(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
    });
  });

  it('should handle registration error from server', async () => {
    // Mock fetch to return error
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ message: 'Not authorized' }),
    });

    render(<RegisterPage />);

    // Wait for form to appear after auth check
    const emailInput = await screen.findByLabelText('Email');
    const passwordInput = await screen.findByLabelText('Password');
    const confirmPasswordInput = await screen.findByLabelText('Confirm Password');
    const submitButton = await screen.findByRole('button', { name: 'Create user' });

    fireEvent.change(emailInput, {
      target: { value: 'new-user@example.com' },
    });
    fireEvent.change(passwordInput, {
      target: { value: 'password123' },
    });
    fireEvent.change(confirmPasswordInput, {
      target: { value: 'password123' },
    });

    fireEvent.submit(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Not authorized')).toBeInTheDocument();
    });

    expect(mockPush).not.toHaveBeenCalled();
  });

  it('should create user and redirect on success', async () => {
    // Mock fetch to return success
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: { id: 'user-1' } }),
    });

    render(<RegisterPage />);

    // Wait for form to appear after auth check
    const emailInput = await screen.findByLabelText('Email');
    const passwordInput = await screen.findByLabelText('Password');
    const confirmPasswordInput = await screen.findByLabelText('Confirm Password');
    const submitButton = await screen.findByRole('button', { name: 'Create user' });

    fireEvent.change(emailInput, {
      target: { value: 'new-user@example.com' },
    });
    fireEvent.change(passwordInput, {
      target: { value: 'password123' },
    });
    fireEvent.change(confirmPasswordInput, {
      target: { value: 'password123' },
    });

    fireEvent.submit(submitButton);

    await waitFor(() => {
      expect(screen.getByText('User created successfully')).toBeInTheDocument();
    });

    await waitFor(
      () => {
        expect(mockPush).toHaveBeenCalledWith('/admin/users');
      },
      { timeout: 3000 }
    );
  });
});
