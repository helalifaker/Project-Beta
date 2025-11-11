/**
 * Tests for AppHeader component
 */

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { AppHeader } from './app-header';

describe('AppHeader', () => {
  it('should render header with title', () => {
    render(<AppHeader title="Test App" />);

    expect(screen.getByText('Test App')).toBeInTheDocument();
  });

  it('should render description when provided', () => {
    render(<AppHeader title="Test App" description="Test description" />);

    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('should render environment badge', () => {
    render(<AppHeader title="Test App" environment="production" />);

    expect(screen.getByText('Production')).toBeInTheDocument();
  });

  it('should render actions when provided', () => {
    render(
      <AppHeader
        title="Test App"
        actions={<button>Action Button</button>}
      />,
    );

    expect(screen.getByText('Action Button')).toBeInTheDocument();
  });

  it('should call onMenuToggle when menu button clicked', () => {
    const onMenuToggle = vi.fn();
    render(<AppHeader title="Test App" onMenuToggle={onMenuToggle} />);

    const menuButton = screen.getByLabelText('Toggle navigation');
    menuButton.click();

    expect(onMenuToggle).toHaveBeenCalledTimes(1);
  });
});

