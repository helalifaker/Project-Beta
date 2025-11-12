/**
 * Tests for ComparisonView component
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ComparisonView } from './comparison-view';

// Mock child components
vi.mock('./comparison-table', () => ({
  ComparisonTable: ({ versionIds }: { versionIds: string[] }) => (
    <div data-testid="comparison-table">Table {versionIds.join(',')}</div>
  ),
}));

vi.mock('./comparison-charts', () => ({
  ComparisonCharts: ({ versionIds }: { versionIds: string[] }) => (
    <div data-testid="comparison-charts">Charts {versionIds.join(',')}</div>
  ),
}));

vi.mock('./npv-comparison', () => ({
  NPVComparison: ({ versionIds }: { versionIds: string[] }) => (
    <div data-testid="npv-comparison">NPV {versionIds.join(',')}</div>
  ),
}));

// Mock fetch
global.fetch = vi.fn();

const createTestQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

describe('ComparisonView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render version selectors', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ data: [] }),
    } as Response);

    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <ComparisonView />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Select Versions to Compare')).toBeInTheDocument();
    });
  });

  it('should render version options', async () => {
    const mockVersions = [
      { id: 'v1', name: 'Version 1', status: 'DRAFT' },
      { id: 'v2', name: 'Version 2', status: 'DRAFT' },
    ];

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockVersions }),
    } as Response);

    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <ComparisonView />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Select Versions to Compare')).toBeInTheDocument();
    });
  });

  it('should not render comparison components when less than 2 versions selected', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ data: [] }),
    } as Response);

    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <ComparisonView />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('comparison-table')).not.toBeInTheDocument();
      expect(screen.queryByTestId('comparison-charts')).not.toBeInTheDocument();
      expect(screen.queryByTestId('npv-comparison')).not.toBeInTheDocument();
    });
  });
});
