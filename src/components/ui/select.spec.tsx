/**
 * Tests for Select component
 */

import { render, screen } from '@testing-library/react';
import type React from 'react';
import { describe, it, expect, vi } from 'vitest';

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectGroup,
  SelectSeparator,
} from './select';

// Mock Radix UI Select to avoid portal issues in tests
vi.mock('@radix-ui/react-select', () => ({
  Root: ({ children, ...props }: React.ComponentProps<'div'>) => (
    <div data-testid="select-root" {...props}>
      {children}
    </div>
  ),
  Trigger: ({ children, ...props }: React.ComponentProps<'button'>) => (
    <button data-testid="select-trigger" {...props}>
      {children}
    </button>
  ),
  Value: ({ children, ...props }: React.ComponentProps<'span'>) => (
    <span data-testid="select-value" {...props}>
      {children}
    </span>
  ),
  Content: ({ children, ...props }: React.ComponentProps<'div'>) => (
    <div data-testid="select-content" {...props}>
      {children}
    </div>
  ),
  Item: ({ children, ...props }: React.ComponentProps<'div'>) => (
    <div data-testid="select-item" {...props}>
      {children}
    </div>
  ),
  Label: ({ children, ...props }: React.ComponentProps<'div'>) => (
    <div data-testid="select-label" {...props}>
      {children}
    </div>
  ),
  Group: ({ children, ...props }: React.ComponentProps<'div'>) => (
    <div data-testid="select-group" {...props}>
      {children}
    </div>
  ),
  Separator: (props: React.ComponentProps<'div'>) => (
    <div data-testid="select-separator" {...props} />
  ),
  Portal: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Viewport: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="select-viewport">{children}</div>
  ),
  Icon: ({ children }: { children: React.ReactNode }) => (
    <span data-testid="select-icon">{children}</span>
  ),
  ItemIndicator: ({ children }: { children: React.ReactNode }) => (
    <span data-testid="select-item-indicator">{children}</span>
  ),
  ItemText: ({ children }: { children: React.ReactNode }) => (
    <span data-testid="select-item-text">{children}</span>
  ),
  ScrollUpButton: (props: React.ComponentProps<'button'>) => (
    <button data-testid="select-scroll-up" {...props} />
  ),
  ScrollDownButton: (props: React.ComponentProps<'button'>) => (
    <button data-testid="select-scroll-down" {...props} />
  ),
}));

describe('Select', () => {
  it('should render Select root', () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
      </Select>
    );
    expect(screen.getByTestId('select-root')).toBeInTheDocument();
  });

  it('should render SelectTrigger', () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
      </Select>
    );
    expect(screen.getByTestId('select-trigger')).toBeInTheDocument();
  });

  it('should render SelectValue', () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
      </Select>
    );
    expect(screen.getByTestId('select-value')).toBeInTheDocument();
  });

  it('should render SelectContent with items', () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
        </SelectContent>
      </Select>
    );
    expect(screen.getByTestId('select-content')).toBeInTheDocument();
    expect(screen.getAllByTestId('select-item')).toHaveLength(2);
  });

  it('should render SelectLabel', () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectLabel>Category</SelectLabel>
          <SelectItem value="option1">Option 1</SelectItem>
        </SelectContent>
      </Select>
    );
    expect(screen.getByTestId('select-label')).toBeInTheDocument();
    expect(screen.getByText('Category')).toBeInTheDocument();
  });

  it('should render SelectGroup', () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Group</SelectLabel>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    );
    expect(screen.getByTestId('select-group')).toBeInTheDocument();
  });

  it('should render SelectSeparator', () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectSeparator />
          <SelectItem value="option2">Option 2</SelectItem>
        </SelectContent>
      </Select>
    );
    expect(screen.getByTestId('select-separator')).toBeInTheDocument();
  });

  it('should apply custom className to SelectTrigger', () => {
    render(
      <Select>
        <SelectTrigger className="custom-trigger">
          <SelectValue />
        </SelectTrigger>
      </Select>
    );
    const trigger = screen.getByTestId('select-trigger');
    expect(trigger).toHaveClass('custom-trigger');
  });

  it('should apply custom className to SelectContent', () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="custom-content">
          <SelectItem value="option1">Option 1</SelectItem>
        </SelectContent>
      </Select>
    );
    const content = screen.getByTestId('select-content');
    expect(content).toHaveClass('custom-content');
  });
});
