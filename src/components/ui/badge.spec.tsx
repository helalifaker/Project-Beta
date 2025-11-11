/**
 * Tests for Badge component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from './badge';

describe('Badge', () => {
  it('should render badge with text', () => {
    render(<Badge>New</Badge>);
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('should render with default variant', () => {
    const { container } = render(<Badge>Default</Badge>);
    const badge = container.querySelector('span');
    expect(badge).toHaveClass('bg-[--color-primary]/15');
  });

  it('should render with different variants', () => {
    const { rerender, container } = render(<Badge variant="fluent">Fluent</Badge>);
    expect(container.querySelector('span')).toHaveClass('bg-[--color-secondary]/30');

    rerender(<Badge variant="muted">Muted</Badge>);
    expect(container.querySelector('span')).toHaveClass('bg-[--color-muted]');

    rerender(<Badge variant="outline">Outline</Badge>);
    expect(container.querySelector('span')).toHaveClass('border-[--color-border]');

    rerender(<Badge variant="destructive">Destructive</Badge>);
    expect(container.querySelector('span')).toHaveClass('bg-[--color-destructive]/10');
  });

  it('should apply custom className', () => {
    const { container } = render(<Badge className="custom-class">Custom</Badge>);
    expect(container.querySelector('span')).toHaveClass('custom-class');
  });

  it('should pass through HTML span attributes', () => {
    render(
      <Badge data-testid="badge" aria-label="Status badge">
        Status
      </Badge>
    );
    const badge = screen.getByTestId('badge');
    expect(badge).toHaveAttribute('aria-label', 'Status badge');
  });

  it('should render as span element', () => {
    const { container } = render(<Badge>Badge</Badge>);
    expect(container.querySelector('span')).toBeInTheDocument();
  });
});

