/**
 * Tests for ComparisonCharts component
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { ComparisonCharts } from './comparison-charts';

vi.mock('@tremor/react', () => ({
  LineChart: vi.fn(() => <div data-testid="line-chart" />),
}));

global.fetch = vi.fn();

const createTestQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

describe('ComparisonCharts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state', () => {
    vi.mocked(global.fetch).mockImplementation(() => new Promise(() => {}));

    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <ComparisonCharts versionIds={['v1', 'v2']} />
      </QueryClientProvider>
    );

    expect(screen.getByText('Loading charts...')).toBeInTheDocument();
  });

  it('should render charts with data', async () => {
    const mockData = [
      { year: 2023, version1: 10_000_000, version2: 11_000_000 },
      { year: 2024, version1: 12_000_000, version2: 13_000_000 },
    ];

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockData }),
    } as Response);

    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <ComparisonCharts versionIds={['v1', 'v2']} />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });
  });

  it('should not fetch when less than 2 versions', () => {
    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <ComparisonCharts versionIds={['v1']} />
      </QueryClientProvider>
    );

    expect(global.fetch).not.toHaveBeenCalled();
  });
});
