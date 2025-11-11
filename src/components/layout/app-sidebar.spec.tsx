/**
 * Tests for AppSidebar component
 */

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AppSidebar } from './app-sidebar';

describe('AppSidebar', () => {
  it('should render sidebar with default sections', () => {
    render(<AppSidebar />);

    expect(screen.getByText('School Relocation Planner')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('should render custom sections', () => {
    const customSections = [
      {
        title: 'Custom Section',
        items: [
          { label: 'Custom Item', href: '/custom' },
        ],
      },
    ];

    render(<AppSidebar sections={customSections} />);

    expect(screen.getByText('Custom Section')).toBeInTheDocument();
    expect(screen.getByText('Custom Item')).toBeInTheDocument();
  });

  it('should render badges for items with badges', () => {
    render(<AppSidebar />);

    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('should mark active items', () => {
    const sections = [
      {
        title: 'Test',
        items: [
          { label: 'Active Item', href: '/active', isActive: true },
          { label: 'Inactive Item', href: '/inactive', isActive: false },
        ],
      },
    ];

    render(<AppSidebar sections={sections} />);

    const activeLink = screen.getByText('Active Item').closest('a');
    expect(activeLink).toHaveAttribute('aria-current', 'page');
  });
});

