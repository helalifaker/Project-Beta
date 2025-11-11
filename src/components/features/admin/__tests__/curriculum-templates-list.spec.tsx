/**
 * Tests for CurriculumTemplatesList component
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { CurriculumTemplatesList } from '../curriculum-templates-list';

const createTestQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

describe('CurriculumTemplatesList', () => {
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
        <CurriculumTemplatesList />
      </QueryClientProvider>,
    );

    expect(screen.getByText('Loading templates...')).toBeInTheDocument();
  });

  it('should render templates list', async () => {
    const mockTemplates = [
      {
        id: 'tpl-1',
        name: 'Elementary',
        slug: 'elementary',
        capacity: 500,
        tuitionBase: 50000,
        cpiRate: 0.03,
      },
      {
        id: 'tpl-2',
        name: 'Middle School',
        slug: 'middle',
        capacity: 300,
        tuitionBase: 60000,
        cpiRate: 0.035,
      },
    ];

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockTemplates }),
    } as Response);

    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <CurriculumTemplatesList />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Elementary')).toBeInTheDocument();
      expect(screen.getByText('Middle School')).toBeInTheDocument();
    });

    expect(screen.getByText('2 templates configured')).toBeInTheDocument();
  });

  it('should render empty state', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [] }),
    } as Response);

    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <CurriculumTemplatesList />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByText('No curriculum templates found. Create your first template to get started.'),
      ).toBeInTheDocument();
    });
  });

  it('should display template details', async () => {
    const mockTemplates = [
      {
        id: 'tpl-1',
        name: 'Elementary',
        slug: 'elementary',
        capacity: 500,
        tuitionBase: 50000,
        cpiRate: 0.03,
      },
    ];

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockTemplates }),
    } as Response);

    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <CurriculumTemplatesList />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText(/500/)).toBeInTheDocument(); // Capacity
      expect(screen.getByText(/50,000.*SAR/)).toBeInTheDocument(); // Tuition
      expect(screen.getByText(/3\.00%/)).toBeInTheDocument(); // CPI Rate
    });
  });
});

