/**
 * Tests for ProfitLossTable component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProfitLossTable } from './profit-loss-table';

vi.mock('@/lib/utils/export', () => ({
  exportToCsv: vi.fn(),
  exportToExcel: vi.fn(),
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

describe('ProfitLossTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state', () => {
    vi.mocked(global.fetch).mockImplementation(() => new Promise(() => {}));

    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <ProfitLossTable versionId="version-123" />
      </QueryClientProvider>
    );

    expect(screen.getByText('Loading P&L statement...')).toBeInTheDocument();
  });

  it('should render P&L table with data', async () => {
    const mockData = [
      {
        label: 'Revenue',
        values: { 2023: 10_000_000, 2024: 12_000_000 },
        level: 0,
      },
    ];

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockData }),
    } as Response);

    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <ProfitLossTable versionId="version-123" />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Revenue')).toBeInTheDocument();
    });
  });

  it('should render export buttons', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ data: [] }),
    } as Response);

    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <ProfitLossTable versionId="version-123" />
      </QueryClientProvider>
    );

    await waitFor(() => {
      const exportButtons = screen.getAllByRole('button');
      expect(exportButtons.length).toBeGreaterThan(0);
    });
  });
});

