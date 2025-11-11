import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { WorkspaceSettings } from '../workspace-settings';

const debouncedSpy = vi.fn();
const originalFetch = globalThis.fetch;

vi.mock('@/lib/utils/debounce', () => ({
  useDebouncedCallback: () => debouncedSpy,
}));

describe('WorkspaceSettings component', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    (globalThis.fetch as unknown) = fetchMock;
    debouncedSpy.mockReset();
  });

afterEach(() => {
  globalThis.fetch = originalFetch;
  vi.clearAllMocks();
});

  it('loads workspace settings and submits updates', async () => {
    const initialSettings = {
      name: 'Default Workspace',
      baseCurrency: 'SAR',
      timezone: 'Asia/Riyadh',
      discountRate: 0.08,
      cpiMin: 0.02,
      cpiMax: 0.05,
    };

    const updatedSettings = {
      ...initialSettings,
      name: 'New Workspace Name',
    };

    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: initialSettings }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: updatedSettings }),
      });

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <WorkspaceSettings />
      </QueryClientProvider>,
    );

    // Wait for the form to hydrate with fetched values
    expect(await screen.findByDisplayValue('Default Workspace')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Workspace Name'), {
      target: { value: 'New Workspace Name' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Save Settings' }));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/v1/admin/workspace',
        expect.objectContaining({
          method: 'PUT',
          body: expect.stringContaining('"name":"New Workspace Name"'),
        }),
      ),
    );

    await waitFor(() =>
      expect(screen.getByText('Settings saved successfully')).toBeInTheDocument(),
    );
  });
});


