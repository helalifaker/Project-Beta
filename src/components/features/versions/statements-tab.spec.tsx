/**
 * Tests for StatementsTab component
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { StatementsTab } from './statements-tab';

// Mock child components
vi.mock('./statements/profit-loss-table', () => ({
  ProfitLossTable: ({ versionId }: { versionId: string }) => (
    <div data-testid="profit-loss-table">P&L Table {versionId}</div>
  ),
}));

vi.mock('./statements/balance-sheet-table', () => ({
  BalanceSheetTable: ({ versionId }: { versionId: string }) => (
    <div data-testid="balance-sheet-table">Balance Sheet Table {versionId}</div>
  ),
}));

vi.mock('./statements/cash-flow-table', () => ({
  CashFlowTable: ({ versionId }: { versionId: string }) => (
    <div data-testid="cash-flow-table">Cash Flow Table {versionId}</div>
  ),
}));

describe('StatementsTab', () => {
  it('should render statements tab with all tabs', () => {
    render(<StatementsTab versionId="version-123" />);
    
    expect(screen.getByText('P&L')).toBeInTheDocument();
    expect(screen.getByText('Balance Sheet')).toBeInTheDocument();
    expect(screen.getByText('Cash Flow')).toBeInTheDocument();
  });

  it('should render P&L table by default', () => {
    render(<StatementsTab versionId="version-123" />);
    expect(screen.getByTestId('profit-loss-table')).toBeInTheDocument();
  });

  it('should pass versionId to child components', () => {
    render(<StatementsTab versionId="version-456" />);
    expect(screen.getByText('P&L Table version-456')).toBeInTheDocument();
  });
});

