import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Home from './page';

describe('Home Page', () => {
  it('should render without crashing', () => {
    render(<Home />);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('should display the Next.js logo', () => {
    render(<Home />);
    const logo = screen.getByAltText('Next.js logo');
    expect(logo).toBeInTheDocument();
  });

  it('should display the getting started heading', () => {
    render(<Home />);
    const heading = screen.getByRole('heading', {
      name: /to get started/i,
    });
    expect(heading).toBeInTheDocument();
  });

  it('should have links to documentation', () => {
    render(<Home />);
    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
  });
});

