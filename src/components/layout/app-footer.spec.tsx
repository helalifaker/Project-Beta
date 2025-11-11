/**
 * Tests for AppFooter component
 */

import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { AppFooter } from './app-footer';

describe('AppFooter', () => {
  it('should render copyright notice with current year', () => {
    render(<AppFooter />);
    const currentYear = new Date().getFullYear();
    expect(
      screen.getByText(`© ${currentYear} School Relocation Planner. All rights reserved.`),
    ).toBeInTheDocument();
  });

  it('should render accessibility link', () => {
    render(<AppFooter />);
    const link = screen.getByRole('link', { name: 'Accessibility' });
    expect(link).toHaveAttribute('href', '/docs/accessibility');
  });

  it('should render support link', () => {
    render(<AppFooter />);
    const link = screen.getByRole('link', { name: 'Support' });
    expect(link).toHaveAttribute('href', '/docs/support');
  });

  it('should render privacy link', () => {
    render(<AppFooter />);
    const link = screen.getByRole('link', { name: 'Privacy' });
    expect(link).toHaveAttribute('href', '/docs/privacy');
  });

  it('should apply custom className', () => {
    const { container } = render(<AppFooter className="custom-class" />);
    expect(container.querySelector('footer.custom-class')).toBeInTheDocument();
  });
});

