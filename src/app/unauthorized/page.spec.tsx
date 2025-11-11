/**
 * Tests for UnauthorizedPage component
 */

import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import UnauthorizedPage from './page';

describe('UnauthorizedPage', () => {
  it('should render unauthorized message', () => {
    render(<UnauthorizedPage />);

    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(
      screen.getByText("You don't have permission to access this page.")
    ).toBeInTheDocument();
  });

  it('should render navigation buttons', () => {
    render(<UnauthorizedPage />);

    expect(screen.getByRole('link', { name: /go to dashboard/i })).toHaveAttribute(
      'href',
      '/overview'
    );
    expect(screen.getByRole('link', { name: /view profile/i })).toHaveAttribute(
      'href',
      '/profile'
    );
  });
});
