/**
 * Tests for CapexCategoriesList component
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { CapexCategoriesList } from '../capex-categories-list';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

describe('CapexCategoriesList', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  it('should render loading state', () => {
    vi.mocked(global.fetch).mockImplementation(() =>
      new Promise(() => {}), // Never resolves
    );

    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <CapexCategoriesList />
      </QueryClientProvider>,
    );

    expect(screen.getByText('Loading categories...')).toBeInTheDocument();
  });

  it('should render categories list', async () => {
    const mockCategories = [
      { id: 'cat-1', name: 'Technology', description: 'IT equipment' },
      { id: 'cat-2', name: 'Facilities', description: 'Building maintenance' },
    ];

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockCategories }),
    } as Response);

    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <CapexCategoriesList />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Technology')).toBeInTheDocument();
      expect(screen.getByText('Facilities')).toBeInTheDocument();
    });

    expect(screen.getByText('2 categories configured')).toBeInTheDocument();
  });

  it('should render empty state', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [] }),
    } as Response);

    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <CapexCategoriesList />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByText('No capex categories found. Create your first category to get started.'),
      ).toBeInTheDocument();
    });
  });

  it('should handle delete action', async () => {
    const mockCategories = [{ id: 'cat-1', name: 'Technology', description: null }];

    vi.mocked(global.fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockCategories }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as Response);

    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <CapexCategoriesList />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Technology')).toBeInTheDocument();
    });

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    deleteButton.click();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/v1/admin/capex-categories/cat-1', {
        method: 'DELETE',
      });
    });
  });
});

