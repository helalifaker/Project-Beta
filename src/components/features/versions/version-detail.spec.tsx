/**
 * Tests for VersionDetail component
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { VersionDetail } from './version-detail';

// Mock child components
vi.mock('./assumptions-tab', () => ({
  AssumptionsTab: ({ versionId }: { versionId: string }) => (
    <div data-testid="assumptions-tab">Assumptions {versionId}</div>
  ),
}));

vi.mock('./statements-tab', () => ({
  StatementsTab: ({ versionId }: { versionId: string }) => (
    <div data-testid="statements-tab">Statements {versionId}</div>
  ),
}));

vi.mock('./overview-tab', () => ({
  OverviewTab: ({ versionId }: { versionId: string }) => (
    <div data-testid="overview-tab">Overview {versionId}</div>
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

describe('VersionDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state', () => {
    vi.mocked(global.fetch).mockImplementation(() => new Promise(() => {}));

    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <VersionDetail versionId="version-123" />
      </QueryClientProvider>
    );

    expect(screen.getByText('Loading version...')).toBeInTheDocument();
  });

  it('should render version not found', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      json: async () => ({}),
    } as Response);

    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <VersionDetail versionId="version-123" />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Version not found')).toBeInTheDocument();
    });
  });

  it('should render version details', async () => {
    const mockVersion = {
      id: 'version-123',
      name: 'Test Version',
      description: 'Test Description',
      status: 'DRAFT',
      ownerName: 'Test Owner',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      lockedAt: null,
    };

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockVersion }),
    } as Response);

    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <VersionDetail versionId="version-123" />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Version')).toBeInTheDocument();
      expect(screen.getByText('Test Description')).toBeInTheDocument();
      expect(screen.getByText('DRAFT')).toBeInTheDocument();
    });
  });

  it('should render locked badge when version is locked', async () => {
    const mockVersion = {
      id: 'version-123',
      name: 'Locked Version',
      status: 'LOCKED',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      lockedAt: '2024-01-01T00:00:00Z',
    };

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockVersion }),
    } as Response);

    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <VersionDetail versionId="version-123" />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Locked')).toBeInTheDocument();
    });
  });

  it('should render all tabs', async () => {
    const mockVersion = {
      id: 'version-123',
      name: 'Test Version',
      status: 'DRAFT',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockVersion }),
    } as Response);

    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <VersionDetail versionId="version-123" />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Overview')).toBeInTheDocument();
      expect(screen.getByText('Assumptions')).toBeInTheDocument();
      expect(screen.getByText('Financial Statements')).toBeInTheDocument();
    });
  });
});
