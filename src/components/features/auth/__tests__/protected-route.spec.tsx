/**
 * Tests for ProtectedRoute component
 */

import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';

import { ProtectedRoute } from '../protected-route';
import { getSupabaseClient } from '@/lib/supabase/client';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('@/lib/supabase/client', () => ({
  getSupabaseClient: vi.fn(),
}));

describe('ProtectedRoute', () => {
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
    } as any);
    vi.mocked(getSupabaseClient).mockReturnValue(mockSupabaseClient as any);
  });

  it('should render loading state initially', () => {
    vi.mocked(mockSupabaseClient.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>,
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should render custom fallback when provided', () => {
    vi.mocked(mockSupabaseClient.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    });

    render(
      <ProtectedRoute fallback={<div>Custom Loading</div>}>
        <div>Protected Content</div>
      </ProtectedRoute>,
    );

    expect(screen.getByText('Custom Loading')).toBeInTheDocument();
  });

  it('should redirect to login when no session', async () => {
    vi.mocked(mockSupabaseClient.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>,
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login');
    });
  });

  it('should redirect to login when session error', async () => {
    vi.mocked(mockSupabaseClient.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: new Error('Session error'),
    });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>,
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login');
    });
  });

  it('should render children when authenticated', async () => {
    vi.mocked(mockSupabaseClient.auth.getSession).mockResolvedValue({
      data: {
        session: {
          user: { id: 'user-1' },
        },
      },
      error: null,
    });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>,
    );

    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });

  it('should check role when requiredRole is provided', async () => {
    const mockSelect = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockReturnThis();
    const mockSingle = vi.fn().mockResolvedValue({
      data: { role: 'ADMIN' },
      error: null,
    });

    mockSupabaseClient.from = vi.fn(() => ({
      select: mockSelect,
      eq: mockEq,
      single: mockSingle,
    })) as any;

    vi.mocked(mockSupabaseClient.auth.getSession).mockResolvedValue({
      data: {
        session: {
          user: { id: 'user-1' },
        },
      },
      error: null,
    });

    render(
      <ProtectedRoute requiredRole="ADMIN">
        <div>Admin Content</div>
      </ProtectedRoute>,
    );

    await waitFor(() => {
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('profile');
      expect(mockSelect).toHaveBeenCalledWith('role');
      expect(mockEq).toHaveBeenCalledWith('external_id', 'user-1');
    });
  });

  it('should redirect to unauthorized when role check fails', async () => {
    const mockSelect = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockReturnThis();
    const mockSingle = vi.fn().mockResolvedValue({
      data: { role: 'VIEWER' },
      error: null,
    });

    mockSupabaseClient.from = vi.fn(() => ({
      select: mockSelect,
      eq: mockEq,
      single: mockSingle,
    })) as any;

    vi.mocked(mockSupabaseClient.auth.getSession).mockResolvedValue({
      data: {
        session: {
          user: { id: 'user-1' },
        },
      },
      error: null,
    });

    render(
      <ProtectedRoute requiredRole="ADMIN">
        <div>Admin Content</div>
      </ProtectedRoute>,
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/unauthorized');
    });
  });

  it('should redirect to unauthorized when profile not found', async () => {
    const mockSelect = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockReturnThis();
    const mockSingle = vi.fn().mockResolvedValue({
      data: null,
      error: new Error('Not found'),
    });

    mockSupabaseClient.from = vi.fn(() => ({
      select: mockSelect,
      eq: mockEq,
      single: mockSingle,
    })) as any;

    vi.mocked(mockSupabaseClient.auth.getSession).mockResolvedValue({
      data: {
        session: {
          user: { id: 'user-1' },
        },
      },
      error: null,
    });

    render(
      <ProtectedRoute requiredRole="ADMIN">
        <div>Admin Content</div>
      </ProtectedRoute>,
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/unauthorized');
    });
  });

  it('should allow ANALYST to access VIEWER routes', async () => {
    const mockSelect = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockReturnThis();
    const mockSingle = vi.fn().mockResolvedValue({
      data: { role: 'ANALYST' },
      error: null,
    });

    mockSupabaseClient.from = vi.fn(() => ({
      select: mockSelect,
      eq: mockEq,
      single: mockSingle,
    })) as any;

    vi.mocked(mockSupabaseClient.auth.getSession).mockResolvedValue({
      data: {
        session: {
          user: { id: 'user-1' },
        },
      },
      error: null,
    });

    render(
      <ProtectedRoute requiredRole="VIEWER">
        <div>Viewer Content</div>
      </ProtectedRoute>,
    );

    await waitFor(() => {
      expect(screen.getByText('Viewer Content')).toBeInTheDocument();
    });
  });
});

