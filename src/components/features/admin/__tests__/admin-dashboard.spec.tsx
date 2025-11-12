import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { AdminDashboard } from '../admin-dashboard';

const { MockLink } = vi.hoisted(() => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  const MockLink = React.forwardRef<HTMLAnchorElement, React.ComponentProps<'a'>>(
    ({ href, children, ...props }, ref) => (
      <a ref={ref} href={href} {...props}>
        {children}
      </a>
    )
  );
  MockLink.displayName = 'Link';
  return { MockLink };
});

vi.mock('next/link', () => ({
  default: MockLink,
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
