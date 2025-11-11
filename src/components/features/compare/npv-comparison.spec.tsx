/**
 * Tests for NPVComparison component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NPVComparison } from './npv-comparison';

vi.mock('@tremor/react', () => ({
  BarChart: vi.fn(() => <div data-testid="bar-chart" />),
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

describe('NPVComparison', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state', () => {
    vi.mocked(global.fetch).mockImplementation(() => new Promise(() => {}));

    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <NPVComparison versionIds={['v1', 'v2']} />
      </QueryClientProvider>
    );

    expect(screen.getByText('Loading NPV comparison...')).toBeInTheDocument();
  });

  it('should render NPV data', async () => {
    const mockData = [
      { versionId: 'v1', versionName: 'Version 1', npv: 50_000_000 },
      { versionId: 'v2', versionName: 'Version 2', npv: 55_000_000 },
    ];

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockData }),
    } as Response);

    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <NPVComparison versionIds={['v1', 'v2']} />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Version 1')).toBeInTheDocument();
      expect(screen.getByText('Version 2')).toBeInTheDocument();
    });
  });

  it('should not fetch when less than 2 versions', () => {
    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <NPVComparison versionIds={['v1']} />
      </QueryClientProvider>
    );

    expect(global.fetch).not.toHaveBeenCalled();
  });
});

