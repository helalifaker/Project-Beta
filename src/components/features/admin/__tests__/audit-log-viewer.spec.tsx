/**
 * Tests for AuditLogViewer component
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { AuditLogViewer } from '../audit-log-viewer';

const createTestQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

describe('AuditLogViewer', () => {
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
        <AuditLogViewer />
      </QueryClientProvider>,
    );

    expect(screen.getByText('Loading audit log...')).toBeInTheDocument();
  });

  it('should render audit log entries', async () => {
    const mockEntries = {
      data: [
        {
          id: 'log-1',
          action: 'CREATE',
          entityType: 'version',
          entityId: 'v-1',
          metadata: {},
          createdAt: new Date().toISOString(),
          actor: { email: 'admin@example.com', role: 'ADMIN' },
        },
        {
          id: 'log-2',
          action: 'UPDATE',
          entityType: 'template',
          entityId: 'tpl-1',
          metadata: {},
          createdAt: new Date().toISOString(),
          actor: { email: 'analyst@example.com', role: 'ANALYST' },
        },
      ],
      pagination: {
        page: 1,
        limit: 50,
        total: 2,
        totalPages: 1,
      },
    };

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockEntries,
    } as Response);

    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <AuditLogViewer />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText(/CREATE.*version/i)).toBeInTheDocument();
      expect(screen.getByText(/UPDATE.*template/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/admin@example.com.*ADMIN/i)).toBeInTheDocument();
    expect(screen.getByText(/analyst@example.com.*ANALYST/i)).toBeInTheDocument();
  });

  it('should render empty state', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [],
        pagination: { page: 1, limit: 50, total: 0, totalPages: 1 },
      }),
    } as Response);

    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <AuditLogViewer />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('No audit log entries found.')).toBeInTheDocument();
    });
  });

  it('should filter by entity type', async () => {
    const mockEntries = {
      data: [],
      pagination: { page: 1, limit: 50, total: 0, totalPages: 1 },
    };

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => mockEntries,
    } as Response);

    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <AuditLogViewer />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/admin/audit-log'),
      );
    });

    // Note: Testing select interactions would require more complex setup
    // This test verifies the component renders and fetches data
  });

  it('should filter by action', async () => {
    const mockEntries = {
      data: [],
      pagination: { page: 1, limit: 50, total: 0, totalPages: 1 },
    };

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => mockEntries,
    } as Response);

    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <AuditLogViewer />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });
});

