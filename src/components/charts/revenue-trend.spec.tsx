/**
 * Tests for RevenueTrend component
 */

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { RevenueTrend } from './revenue-trend';

// Mock Tremor components
vi.mock('@tremor/react', () => ({
  AreaChart: ({ data, categories }: { data: unknown[]; categories: string[] }) => (
    <div data-testid="area-chart" data-categories={categories.join(',')}>
      {JSON.stringify(data)}
    </div>
  ),
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
  Legend: ({ categories }: { categories: string[] }) => (
    <div data-testid="legend">{categories.join(', ')}</div>
  ),
}));

describe('RevenueTrend', () => {
  it('should render with default data', () => {
    render(<RevenueTrend />);
    expect(screen.getByText('Tuition vs. Operating Expenses')).toBeInTheDocument();
    expect(
      screen.getByText('Projected figures for near-term ramp (2028-2032)'),
    ).toBeInTheDocument();
  });

  it('should render with custom data', () => {
    const customData = [
      { year: 2025, tuition: 20, expenses: 15, ebitdaMargin: 0.25 },
      { year: 2026, tuition: 22, expenses: 16, ebitdaMargin: 0.27 },
    ];
    render(<RevenueTrend data={customData} />);
    expect(screen.getByTestId('area-chart')).toBeInTheDocument();
  });

  it('should render legend with correct categories', () => {
    render(<RevenueTrend />);
    const legend = screen.getByTestId('legend');
    expect(legend).toHaveTextContent('Tuition revenue, Operating expenses');
  });

  it('should apply custom className', () => {
    const { container } = render(<RevenueTrend className="custom-class" />);
    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });

  it('should render area chart with correct categories', () => {
    render(<RevenueTrend />);
    const chart = screen.getByTestId('area-chart');
    expect(chart).toHaveAttribute('data-categories', 'tuition,expenses');
  });
});

