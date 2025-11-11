/**
 * Tests for UserManagement component
 */

import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { UserManagement } from '../user-management';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

describe('UserManagement', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    global.confirm = vi.fn().mockReturnValue(true);
  });

  it('should render loading state', () => {
    vi.mocked(global.fetch).mockImplementation(() =>
      new Promise(() => {}), // Never resolves
    );

    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <UserManagement />
      </QueryClientProvider>,
    );

    expect(screen.getByText('Loading users...')).toBeInTheDocument();
  });

  it('should render users list', async () => {
    const mockUsers = {
      data: [
        {
          id: 'user-1',
          email: 'admin@example.com',
          role: 'ADMIN',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
        {
          id: 'user-2',
          email: 'analyst@example.com',
          role: 'ANALYST',
          createdAt: '2024-01-02T00:00:00.000Z',
          updatedAt: '2024-01-02T00:00:00.000Z',
        },
      ],
      pagination: {
        page: 1,
        limit: 20,
        total: 2,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    };

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockUsers,
    } as Response);

    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <UserManagement />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('admin@example.com')).toBeInTheDocument();
      expect(screen.getByText('analyst@example.com')).toBeInTheDocument();
    });
  });

  it('should render error state', async () => {
    vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Failed to fetch'));

    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <UserManagement />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch')).toBeInTheDocument();
    });
  });

  it('should render role filter select', async () => {
    const mockUsers = {
      data: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      },
    };

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => mockUsers,
    } as Response);

    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <UserManagement />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('All Roles')).toBeInTheDocument();
    });
  });
});

