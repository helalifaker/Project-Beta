/**
 * Tests for ComparisonTable component
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { ComparisonTable } from './comparison-table';

global.fetch = vi.fn();

const createTestQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

describe('ComparisonTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state', () => {
    vi.mocked(global.fetch).mockImplementation(() => new Promise(() => {}));

    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <ComparisonTable versionIds={['v1', 'v2']} />
      </QueryClientProvider>
    );

    expect(screen.getByText('Loading comparison...')).toBeInTheDocument();
  });

  it('should render comparison data', async () => {
    const mockData = [
      {
        metric: 'Revenue',
        values: {
          v1: { 2023: 10_000_000, 2024: 12_000_000 },
          v2: { 2023: 11_000_000, 2024: 13_000_000 },
        },
      },
    ];

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockData }),
    } as Response);

    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <ComparisonTable versionIds={['v1', 'v2']} />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Revenue')).toBeInTheDocument();
    });
  });

  it('should not fetch when less than 2 versions', () => {
    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <ComparisonTable versionIds={['v1']} />
      </QueryClientProvider>
    );

    expect(global.fetch).not.toHaveBeenCalled();
  });
});
