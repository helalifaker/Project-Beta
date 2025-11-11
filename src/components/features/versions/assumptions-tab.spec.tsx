/**
 * Tests for AssumptionsTab component
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { AssumptionsTab } from './assumptions-tab';

// Mock child components
vi.mock('./assumptions/lease-terms-form', () => ({
  LeaseTermsForm: ({ versionId }: { versionId: string }) => (
    <div data-testid="lease-terms-form">Lease Terms Form {versionId}</div>
  ),
}));

vi.mock('./assumptions/curriculum-form', () => ({
  CurriculumForm: ({ versionId }: { versionId: string }) => (
    <div data-testid="curriculum-form">Curriculum Form {versionId}</div>
  ),
}));

vi.mock('./assumptions/staffing-form', () => ({
  StaffingForm: ({ versionId }: { versionId: string }) => (
    <div data-testid="staffing-form">Staffing Form {versionId}</div>
  ),
}));

vi.mock('./assumptions/opex-form', () => ({
  OpExForm: ({ versionId }: { versionId: string }) => (
    <div data-testid="opex-form">OpEx Form {versionId}</div>
  ),
}));

vi.mock('./assumptions/capex-form', () => ({
  CapexForm: ({ versionId }: { versionId: string }) => (
    <div data-testid="capex-form">Capex Form {versionId}</div>
  ),
}));

describe('AssumptionsTab', () => {
  it('should render assumptions tab with all tabs', () => {
    render(<AssumptionsTab versionId="version-123" />);
    
    expect(screen.getByText('Lease Terms')).toBeInTheDocument();
    expect(screen.getByText('Curriculum')).toBeInTheDocument();
    expect(screen.getByText('Staffing')).toBeInTheDocument();
    expect(screen.getByText('OpEx')).toBeInTheDocument();
    expect(screen.getByText('Capex')).toBeInTheDocument();
  });

  it('should render lease terms form by default', () => {
    render(<AssumptionsTab versionId="version-123" />);
    expect(screen.getByTestId('lease-terms-form')).toBeInTheDocument();
  });

  it('should pass versionId to child components', () => {
    render(<AssumptionsTab versionId="version-456" />);
    expect(screen.getByText('Lease Terms Form version-456')).toBeInTheDocument();
  });
});

