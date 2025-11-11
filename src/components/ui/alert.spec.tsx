/**
 * Tests for Alert component
 */

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Alert, AlertDescription } from './alert';

describe('Alert', () => {
  it('should render alert with default variant', () => {
    render(<Alert>Test alert</Alert>);

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent('Test alert');
  });

  it('should render alert with destructive variant', () => {
    render(<Alert variant="destructive">Error alert</Alert>);

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent('Error alert');
  });

  it('should render AlertDescription', () => {
    render(
      <Alert>
        <AlertDescription>Description text</AlertDescription>
      </Alert>,
    );

    expect(screen.getByText('Description text')).toBeInTheDocument();
  });
});

