/**
 * Tests for RentTemplatesList component
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { RentTemplatesList } from '../rent-templates-list';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

describe('RentTemplatesList', () => {
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
        <RentTemplatesList />
      </QueryClientProvider>,
    );

    expect(screen.getByText('Loading templates...')).toBeInTheDocument();
  });

  it('should render templates list', async () => {
    const mockTemplates = [
      {
        id: 'tpl-1',
        name: 'Fixed Escalation Template',
        type: 'FIXED_ESC',
        params: { baseAmount: 5000000 },
      },
      {
        id: 'tpl-2',
        name: 'Revenue Share Template',
        type: 'REV_SHARE',
        params: { revenuePercentage: 0.15 },
      },
    ];

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockTemplates }),
    } as Response);

    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <RentTemplatesList />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Fixed Escalation Template')).toBeInTheDocument();
      expect(screen.getByText('Revenue Share Template')).toBeInTheDocument();
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
        <RentTemplatesList />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByText('No rent templates found. Create your first template to get started.'),
      ).toBeInTheDocument();
    });
  });

  it('should handle delete action', async () => {
    const mockTemplates = [
      {
        id: 'tpl-1',
        name: 'Test Template',
        type: 'FIXED_ESC',
        params: {},
      },
    ];

    vi.mocked(global.fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockTemplates }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as Response);

    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <RentTemplatesList />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Test Template')).toBeInTheDocument();
    });

    // Find delete button - it's the last button in the card (after Edit button)
    const cards = screen.getAllByText('Test Template');
    expect(cards.length).toBeGreaterThan(0);
    
    // Get all buttons and find the one that's not "Edit" and not "New Template"
    const allButtons = screen.getAllByRole('button');
    const deleteButton = allButtons.find(
      (btn) =>
        btn.textContent !== 'Edit' &&
        btn.textContent !== 'New Template' &&
        !btn.disabled &&
        btn.querySelector('svg'),
    );
    
    expect(deleteButton).toBeDefined();
    
    // Click the delete button
    fireEvent.click(deleteButton!);

    // Wait for the DELETE request
    await waitFor(
      () => {
        const calls = vi.mocked(global.fetch).mock.calls;
        const deleteCall = calls.find(
          (call) =>
            call[0] === '/api/v1/admin/rent-templates/tpl-1' &&
            (call[1] as RequestInit)?.method === 'DELETE',
        );
        expect(deleteCall).toBeDefined();
      },
      { timeout: 3000 },
    );
  });
});

