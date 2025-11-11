/**
 * Tests for Providers wrapper
 */

import { useQueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Providers } from './providers';

function QueryClientConsumer(): JSX.Element {
  const queryClient = useQueryClient();
  return <div data-testid="query-client-present">{queryClient ? 'ready' : 'missing'}</div>;
}

describe('Providers', () => {
  it('should render children inside query client provider', () => {
    render(
      <Providers>
        <div data-testid="content">Hello</div>
        <QueryClientConsumer />
      </Providers>
    );

    expect(screen.getByTestId('content')).toHaveTextContent('Hello');
    expect(screen.getByTestId('query-client-present')).toHaveTextContent('ready');
  });
});
