/**
 * Tests for AuthError component
 */

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AuthError } from '../auth-error';

describe('AuthError', () => {
  it('should render nothing when error is null', () => {
    const { container } = render(<AuthError error={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render error message from string', () => {
    render(<AuthError error="Invalid login credentials" />);
    expect(
      screen.getByText('Invalid email or password. Please try again.'),
    ).toBeInTheDocument();
  });

  it('should render error message from Error object', () => {
    const error = new Error('Invalid login credentials');
    render(<AuthError error={error} />);
    expect(
      screen.getByText('Invalid email or password. Please try again.'),
    ).toBeInTheDocument();
  });

  it('should map common error codes to friendly messages', () => {
    const { rerender } = render(<AuthError error="Email not confirmed" />);
    expect(
      screen.getByText('Please check your email and confirm your account.'),
    ).toBeInTheDocument();

    rerender(<AuthError error="User already registered" />);
    expect(
      screen.getByText('An account with this email already exists.'),
    ).toBeInTheDocument();

    rerender(<AuthError error="Password should be at least 8 characters" />);
    expect(
      screen.getByText('Password must be at least 8 characters long.'),
    ).toBeInTheDocument();

    rerender(<AuthError error="UNAUTHORIZED" />);
    expect(
      screen.getByText('You must be signed in to access this page.'),
    ).toBeInTheDocument();

    rerender(<AuthError error="FORBIDDEN" />);
    expect(
      screen.getByText('You do not have permission to perform this action.'),
    ).toBeInTheDocument();
  });

  it('should display original message for unmapped errors', () => {
    render(<AuthError error="Custom error message" />);
    expect(screen.getByText('Custom error message')).toBeInTheDocument();
  });

  it('should handle Error object with message property', () => {
    const error = new Error('Custom error');
    render(<AuthError error={error} />);
    expect(screen.getByText('Custom error')).toBeInTheDocument();
  });

  it('should handle Error object without message property', () => {
    const error = new Error();
    render(<AuthError error={error} />);
    expect(screen.getByText('An error occurred')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <AuthError error="Test error" className="custom-class" />,
    );
    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });
});

