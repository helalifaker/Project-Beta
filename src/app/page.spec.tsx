import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import Home from './page';

vi.mock('@/components/charts/revenue-trend', () => ({
  RevenueTrend: () => (
    <div data-testid="revenue-trend-chart" role="img" aria-label="Revenue trend chart placeholder" />
  ),
}));

describe('Home Page', () => {
  it('should render the hero section content', () => {
    render(<Home />);

    expect(
      screen.getByRole('heading', {
        name: 'Model the complete school relocation journey.',
      }),
    ).toBeInTheDocument();

    expect(screen.getByText('2028 Relocation Program')).toBeInTheDocument();
    expect(screen.getByText(/generate tuition projections by curriculum/i)).toBeInTheDocument();
    expect(screen.getByText(/Last synchronized:/i)).toBeInTheDocument();
  });

  it('should render primary call-to-action buttons', () => {
    render(<Home />);

    expect(screen.getByRole('button', { name: 'View Latest Scenario' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Compare Plans' })).toBeInTheDocument();
  });

  it('should display all metric cards', () => {
    render(<Home />);

    const metrics = [
      'Projected Tuition (2032)',
      'Operating Margin',
      'Capex Headroom',
    ];

    metrics.forEach((metric) => {
      const card = screen.getByText(metric).closest('div');
      expect(card).toBeTruthy();
      const cardScope = within(card as HTMLElement);
      expect(cardScope.getByText(metric)).toBeInTheDocument();
    });
  });

  it('should render the revenue trend chart and next steps content', () => {
    render(<Home />);

    expect(screen.getByTestId('revenue-trend-chart')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Next Steps' })).toBeInTheDocument();
    expect(screen.getByText('Curriculum ramp audit')).toBeInTheDocument();
    expect(screen.getByText('Staffing salary review')).toBeInTheDocument();
  });
});

