/**
 * Tests for AppShell component
 */

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AppShell } from './app-shell';

describe('AppShell', () => {
  it('should render children', () => {
    render(
      <AppShell>
        <div>Test Content</div>
      </AppShell>,
    );
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should render header when provided', () => {
    render(
      <AppShell header={<div>Header Content</div>}>
        <div>Test Content</div>
      </AppShell>,
    );
    expect(screen.getByText('Header Content')).toBeInTheDocument();
  });

  it('should render sidebar when provided', () => {
    render(
      <AppShell sidebar={<div>Sidebar Content</div>}>
        <div>Test Content</div>
      </AppShell>,
    );
    expect(screen.getByText('Sidebar Content')).toBeInTheDocument();
  });

  it('should render footer when provided', () => {
    render(
      <AppShell footer={<div>Footer Content</div>}>
        <div>Test Content</div>
      </AppShell>,
    );
    expect(screen.getByText('Footer Content')).toBeInTheDocument();
  });

  it('should set default mainId to main-content', () => {
    const { container } = render(
      <AppShell>
        <div>Test Content</div>
      </AppShell>,
    );
    const main = container.querySelector('main#main-content');
    expect(main).toBeInTheDocument();
  });

  it('should use custom mainId when provided', () => {
    const { container } = render(
      <AppShell mainId="custom-main">
        <div>Test Content</div>
      </AppShell>,
    );
    const main = container.querySelector('main#custom-main');
    expect(main).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <AppShell className="custom-class">
        <div>Test Content</div>
      </AppShell>,
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should render all sections together', () => {
    render(
      <AppShell
        header={<div>Header</div>}
        sidebar={<div>Sidebar</div>}
        footer={<div>Footer</div>}
      >
        <div>Content</div>
      </AppShell>,
    );
    expect(screen.getByText('Header')).toBeInTheDocument();
    expect(screen.getByText('Sidebar')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });
});

