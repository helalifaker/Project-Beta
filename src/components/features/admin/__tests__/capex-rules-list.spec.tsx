/**
 * Tests for CapexRulesList component
 */

import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { CapexRulesList } from '../capex-rules-list';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

describe('CapexRulesList', () => {
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
        <CapexRulesList />
      </QueryClientProvider>,
    );

    expect(screen.getByText('Loading rules...')).toBeInTheDocument();
  });

  it('should render rules list', async () => {
    const mockRules = [
      {
        id: 'rule-1',
        name: 'Technology Refresh',
        triggerType: 'CYCLE',
        category: { name: 'Technology' },
      },
      {
        id: 'rule-2',
        name: 'Facilities Upgrade',
        triggerType: 'UTILIZATION',
        category: { name: 'Facilities' },
      },
    ];

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockRules }),
    } as Response);

    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <CapexRulesList />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Technology Refresh')).toBeInTheDocument();
      expect(screen.getByText('Facilities Upgrade')).toBeInTheDocument();
    });

    expect(screen.getByText('2 rules configured')).toBeInTheDocument();
  });

  it('should render empty state', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [] }),
    } as Response);

    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <CapexRulesList />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByText('No capex rules found. Create your first rule to get started.'),
      ).toBeInTheDocument();
    });
  });

  it('should display trigger type badges', async () => {
    const mockRules = [
      {
        id: 'rule-1',
        name: 'Technology Refresh',
        triggerType: 'CYCLE',
        category: { name: 'Technology' },
      },
    ];

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockRules }),
    } as Response);

    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <CapexRulesList />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('CYCLE')).toBeInTheDocument();
    });
  });
});

