/**
 * Tests for Textarea component
 */

import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { Textarea } from './textarea';

describe('Textarea', () => {
  it('should render textarea', () => {
    render(<Textarea placeholder="Enter text" />);

    const textarea = screen.getByPlaceholderText('Enter text');
    expect(textarea).toBeInTheDocument();
    expect(textarea.tagName).toBe('TEXTAREA');
  });

  it('should accept value prop', () => {
    render(<Textarea value="Test value" onChange={() => {}} />);

    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveValue('Test value');
  });

  it('should accept className prop', () => {
    render(<Textarea className="custom-class" />);

    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveClass('custom-class');
  });

  it('should be disabled when disabled prop is set', () => {
    render(<Textarea disabled />);

    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeDisabled();
  });
});

