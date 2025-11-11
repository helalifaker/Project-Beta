/**
 * Tests for OverviewTab component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OverviewTab } from './overview-tab';

describe('OverviewTab', () => {
  it('should render overview tab', () => {
    render(<OverviewTab versionId="version-123" />);
    expect(screen.getByText('Version Overview')).toBeInTheDocument();
  });

  it('should display placeholder text', () => {
    render(<OverviewTab versionId="version-123" />);
    expect(
      screen.getByText('Version details and summary will be displayed here.')
    ).toBeInTheDocument();
  });
});

