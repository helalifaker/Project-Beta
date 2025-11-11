/**
 * Tests for versions page
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import VersionsPage from './page';

vi.mock('@/components/features/versions/version-list', () => ({
  VersionList: () => <div data-testid="version-list">Version List</div>,
}));

describe('VersionsPage', () => {
  it('should render versions page with title and list', () => {
    render(<VersionsPage />);

    expect(screen.getByText('Versions')).toBeInTheDocument();
    expect(
      screen.getByText('Manage and compare financial planning scenarios')
    ).toBeInTheDocument();
    expect(screen.getByTestId('version-list')).toBeInTheDocument();
  });
});

