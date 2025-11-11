/**
 * Tests for VersionList component
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { VersionList } from '../version-list';

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

describe('VersionList', () => {
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
        <VersionList />
      </QueryClientProvider>,
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should render versions list', async () => {
    const mockVersions = [
      {
        id: 'v-1',
        name: 'Version 1',
        description: 'Test version 1',
        status: 'DRAFT',
        ownerName: 'John Doe',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-15T00:00:00.000Z',
        lockedAt: null,
      },
      {
        id: 'v-2',
        name: 'Version 2',
        description: 'Test version 2',
        status: 'READY',
        ownerName: 'Jane Smith',
        createdAt: '2024-01-02T00:00:00.000Z',
        updatedAt: '2024-01-16T00:00:00.000Z',
        lockedAt: null,
      },
    ];

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockVersions }),
    } as Response);

    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <VersionList />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Version 1')).toBeInTheDocument();
      expect(screen.getByText('Version 2')).toBeInTheDocument();
    });
  });

  it('should render empty state', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [] }),
    } as Response);

    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <VersionList />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByText('No versions found. Create your first version to get started.'),
      ).toBeInTheDocument();
    });
  });
});

