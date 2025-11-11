import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AdminDashboard } from '../admin-dashboard';

vi.mock('next/link', () => ({
  default: React.forwardRef<HTMLAnchorElement, React.ComponentProps<'a'>>(
    ({ href, children, ...props }, ref) => (
      <a ref={ref} href={href} {...props}>
        {children}
      </a>
    ),
  ),
}));

describe('AdminDashboard component', () => {
  it('renders navigation cards for all admin sections', () => {
    render(<AdminDashboard />);

    const sections = [
      'Workspace Settings',
      'Curriculum Templates',
      'Rent Templates',
      'Capex Rules',
      'User Management',
      'Audit Log',
    ];

    sections.forEach((title) => {
      expect(screen.getByText(title)).toBeInTheDocument();
    });

    const manageLinks = screen.getAllByRole('link', { name: 'Manage' });
    expect(manageLinks).toHaveLength(sections.length);
    expect(manageLinks.map((link) => link.getAttribute('href'))).toEqual([
      '/admin/workspace',
      '/admin/curriculum-templates',
      '/admin/rent-templates',
      '/admin/capex',
      '/admin/users',
      '/admin/audit-log',
    ]);
  });
});


