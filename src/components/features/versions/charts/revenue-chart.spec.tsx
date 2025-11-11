/**
 * Tests for RevenueChart component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RevenueChart } from './revenue-chart';

vi.mock('@tremor/react', () => ({
  LineChart: vi.fn(() => <div data-testid="line-chart" />),
}));

global.fetch = vi.fn();

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

describe('RevenueChart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state', () => {
    vi.mocked(global.fetch).mockImplementation(() => new Promise(() => {}));

    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <RevenueChart versionId="version-123" />
      </QueryClientProvider>
    );

    expect(screen.getByText('Loading chart...')).toBeInTheDocument();
  });

  it('should render chart with title', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ data: [] }),
    } as Response);

    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <RevenueChart versionId="version-123" />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Revenue Trend')).toBeInTheDocument();
    });
  });
});

