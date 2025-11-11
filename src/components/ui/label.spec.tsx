/**
 * Tests for Label component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Label } from './label';

describe('Label', () => {
  it('should render label with text', () => {
    render(<Label>Username</Label>);
    expect(screen.getByText('Username')).toBeInTheDocument();
  });

  it('should render as label element', () => {
    const { container } = render(<Label>Label</Label>);
    expect(container.querySelector('label')).toBeInTheDocument();
  });

  it('should associate with input using htmlFor', () => {
    render(
      <>
        <Label htmlFor="username">Username</Label>
        <input id="username" />
      </>
    );
    const label = screen.getByText('Username');
    expect(label).toHaveAttribute('for', 'username');
  });

  it('should apply custom className', () => {
    render(<Label className="custom-class">Custom Label</Label>);
    const label = screen.getByText('Custom Label');
    expect(label).toHaveClass('custom-class');
  });

  it('should forward ref', () => {
    const ref = vi.fn();
    render(<Label ref={ref}>Label</Label>);
    expect(ref).toHaveBeenCalled();
  });

  it('should pass through HTML label attributes', () => {
    render(
      <Label htmlFor="field" aria-label="Field label" data-testid="label">
        Field Label
      </Label>
    );
    const label = screen.getByTestId('label');
    expect(label).toHaveAttribute('for', 'field');
    expect(label).toHaveAttribute('aria-label', 'Field label');
  });
});

