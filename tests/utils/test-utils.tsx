import { render, RenderOptions } from '@testing-library/react';
import type { JSX, ReactElement, ReactNode } from 'react';

/**
 * Custom render function that wraps components with necessary providers
 * 
 * @param ui - The component to render
 * @param options - Render options
 * @returns Render result with all providers
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
): ReturnType<typeof render> {
  // Add providers here as needed (TanStack Query, Theme, etc.)
  const AllTheProviders = ({ children }: { children: ReactNode }): JSX.Element => (
    <>{children}</>
  );

  return render(ui, { wrapper: AllTheProviders, ...options });
}

// Re-export everything from React Testing Library
export * from '@testing-library/react';
export { renderWithProviders as render };

