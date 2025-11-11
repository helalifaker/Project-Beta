/**
 * Tests for version detail page
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import VersionDetailPage from './page';

vi.mock('@/components/features/versions/version-detail', () => ({
  VersionDetail: ({ versionId }: { versionId: string }) => (
    <div data-testid="version-detail">Version Detail for {versionId}</div>
  ),
}));

describe('VersionDetailPage', () => {
  it('should render version detail page with Suspense', async () => {
    const paramsPromise = Promise.resolve({ id: 'version-123' });
    const result = await VersionDetailPage({ params: paramsPromise });
    
    render(result as React.ReactElement);

    // Suspense fallback is shown initially
    expect(screen.getByText('Loading version...')).toBeInTheDocument();
  });
});

