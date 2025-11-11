/**
 * Tests for VersionCard component
 */

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { VersionCard } from '../version-card';

describe('VersionCard', () => {
  const mockVersion = {
    id: 'v-1',
    name: 'Test Version',
    description: 'Test description',
    status: 'DRAFT' as const,
    ownerName: 'John Doe',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
    lockedAt: null,
  };

  it('should render version card with all details', () => {
    render(<VersionCard {...mockVersion} />);

    expect(screen.getByText('Test Version')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
    expect(screen.getByText('DRAFT')).toBeInTheDocument();
    expect(screen.getByText(/Owner: John Doe/i)).toBeInTheDocument();
  });

  it('should render without description', () => {
    render(<VersionCard {...mockVersion} description={null} />);

    expect(screen.queryByText('Test description')).not.toBeInTheDocument();
  });

  it('should render locked badge when locked', () => {
    render(
      <VersionCard {...mockVersion} status="LOCKED" lockedAt={new Date('2024-01-10')} />,
    );

    expect(screen.getByText('LOCKED')).toBeInTheDocument();
  });

  it('should render READY status badge', () => {
    render(<VersionCard {...mockVersion} status="READY" />);

    expect(screen.getByText('READY')).toBeInTheDocument();
  });

  it('should render ARCHIVED status badge', () => {
    render(<VersionCard {...mockVersion} status="ARCHIVED" />);

    expect(screen.getByText('ARCHIVED')).toBeInTheDocument();
  });

  it('should render link to version detail', () => {
    render(<VersionCard {...mockVersion} />);

    const link = screen.getByRole('link', { name: 'Test Version' });
    expect(link).toHaveAttribute('href', '/versions/v-1');
  });
});

