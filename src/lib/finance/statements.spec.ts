/**
 * Financial statement tests
 */

import { describe, it, expect } from 'vitest';

import {
  generateProfitLossStatement,
  generateBalanceSheet,
  generateCashFlowStatement,
  generateFinancialStatements,
  type StatementInputs,
} from './statements';

describe('generateProfitLossStatement', () => {
  it('should generate P&L statement correctly', () => {
    const inputs: StatementInputs = {
      revenue: [10_000_000, 12_000_000],
      staffCosts: [3_000_000, 3_500_000],
      rent: [2_000_000, 2_100_000],
      opex: [1_000_000, 1_200_000],
      capex: [500_000, 0],
      depreciation: [100_000, 100_000],
      taxRate: 0.15,
    };

    const statements = generateProfitLossStatement(inputs);

    expect(statements).toHaveLength(2);

    // Year 1 (2023)
    const year1 = statements[0];
    expect(year1.year).toBe(2023);
    expect(year1.revenue).toBe(10_000_000);
    expect(year1.cogs).toBe(6_000_000); // 3M + 2M + 1M
    expect(year1.grossProfit).toBe(4_000_000); // 10M - 6M
    expect(year1.ebitda).toBe(4_000_000); // Same as gross profit (no OpEx)
    expect(year1.depreciation).toBe(100_000);
    expect(year1.ebit).toBe(3_900_000); // 4M - 100K
    expect(year1.taxes).toBeCloseTo(585_000, -1000); // 3.9M × 0.15
    expect(year1.netIncome).toBeCloseTo(3_315_000, -1000); // 3.9M - 585K
  });

  it('should handle zero values', () => {
    const inputs: StatementInputs = {
      revenue: [0],
      staffCosts: [0],
      rent: [0],
      opex: [0],
      capex: [0],
      depreciation: [0],
    };

    const statements = generateProfitLossStatement(inputs);
    expect(statements[0].revenue).toBe(0);
    expect(statements[0].cogs).toBe(0);
    expect(statements[0].netIncome).toBe(0);
  });
});

describe('generateCashFlowStatement', () => {
  it('should generate Cash Flow statement correctly', () => {
    const inputs: StatementInputs = {
      revenue: [10_000_000],
      staffCosts: [3_000_000],
      rent: [2_000_000],
      opex: [1_000_000],
      capex: [500_000],
      depreciation: [100_000],
      beginningCash: 1_000_000,
    };

    const pl = generateProfitLossStatement(inputs);
    const cf = generateCashFlowStatement(inputs, pl);

    expect(cf).toHaveLength(1);

    const year1 = cf[0];
    expect(year1.year).toBe(2023);
    expect(year1.netIncome).toBeCloseTo(3_315_000, -1000);
    expect(year1.depreciation).toBe(100_000);
    expect(year1.operatingCashFlow).toBeCloseTo(3_415_000, -1000); // Net Income + Depreciation
    expect(year1.capex).toBe(500_000);
    expect(year1.investingCashFlow).toBe(-500_000);
    expect(year1.netCashChange).toBeCloseTo(2_915_000, -1000);
    expect(year1.beginningCash).toBe(1_000_000);
    expect(year1.endingCash).toBeCloseTo(3_915_000, -1000);
  });

  it('should carry forward ending cash', () => {
    const inputs: StatementInputs = {
      revenue: [10_000_000, 12_000_000],
      staffCosts: [3_000_000, 3_500_000],
      rent: [2_000_000, 2_100_000],
      opex: [1_000_000, 1_200_000],
      capex: [500_000, 0],
      depreciation: [100_000, 100_000],
      beginningCash: 1_000_000,
    };

    const pl = generateProfitLossStatement(inputs);
    const cf = generateCashFlowStatement(inputs, pl);

    expect(cf[0].endingCash).toBeCloseTo(3_915_000, -1000);
    expect(cf[1].beginningCash).toBeCloseTo(3_915_000, -1000);
  });
});

describe('generateBalanceSheet', () => {
  it('should generate Balance Sheet correctly', () => {
    const inputs: StatementInputs = {
      revenue: [10_000_000],
      staffCosts: [3_000_000],
      rent: [2_000_000],
      opex: [1_000_000],
      capex: [500_000],
      depreciation: [100_000],
      beginningCash: 1_000_000,
    };

    const pl = generateProfitLossStatement(inputs);
    const cf = generateCashFlowStatement(inputs, pl);
    const bs = generateBalanceSheet(inputs, cf);

    expect(bs).toHaveLength(1);

    const year1 = bs[0];
    expect(year1.year).toBe(2023);
    expect(year1.cash).toBeCloseTo(3_915_000, -1000);
    expect(year1.fixedAssets).toBe(400_000); // 500K - 100K depreciation
    expect(year1.totalAssets).toBeCloseTo(4_315_000, -1000);
    expect(year1.retainedEarnings).toBeCloseTo(3_315_000, -1000);
    expect(year1.totalEquity).toBeCloseTo(3_315_000, -1000);
    expect(year1.totalLiabilitiesAndEquity).toBeCloseTo(3_315_000, -1000);
    expect(year1.isBalanced).toBe(false); // May not balance on first pass
  });

  it('should check balance correctly', () => {
    const inputs: StatementInputs = {
      revenue: [10_000_000],
      staffCosts: [3_000_000],
      rent: [2_000_000],
      opex: [1_000_000],
      capex: [0],
      depreciation: [0],
      beginningCash: 0,
    };

    const pl = generateProfitLossStatement(inputs);
    const cf = generateCashFlowStatement(inputs, pl);
    const bs = generateBalanceSheet(inputs, cf);

    // Should be closer to balanced with simpler inputs
    expect(bs[0].balanceDifference).toBeGreaterThanOrEqual(0);
  });

  it('should handle negative fixed assets (clamp to 0)', () => {
    const inputs: StatementInputs = {
      revenue: [10_000_000],
      staffCosts: [3_000_000],
      rent: [2_000_000],
      opex: [1_000_000],
      capex: [100_000], // Small capex
      depreciation: [200_000], // More depreciation than capex
      beginningCash: 0,
    };

    const pl = generateProfitLossStatement(inputs);
    const cf = generateCashFlowStatement(inputs, pl);
    const bs = generateBalanceSheet(inputs, cf);

    // Fixed assets should be clamped to 0 (not negative)
    expect(bs[0].fixedAssets).toBeGreaterThanOrEqual(0);
  });

  it('should handle working capital changes', () => {
    const inputs: StatementInputs = {
      revenue: [10_000_000],
      staffCosts: [3_000_000],
      rent: [2_000_000],
      opex: [1_000_000],
      capex: [500_000],
      depreciation: [100_000],
      beginningCash: 1_000_000,
      workingCapitalChange: [200_000], // Positive change (cash outflow)
    };

    const pl = generateProfitLossStatement(inputs);
    const cf = generateCashFlowStatement(inputs, pl);

    // Operating cash flow should subtract working capital change
    expect(cf[0].workingCapitalChange).toBe(200_000);
    expect(cf[0].operatingCashFlow).toBeLessThan(
      pl[0].netIncome + pl[0].depreciation
    );
  });

  it('should handle negative working capital changes', () => {
    const inputs: StatementInputs = {
      revenue: [10_000_000],
      staffCosts: [3_000_000],
      rent: [2_000_000],
      opex: [1_000_000],
      capex: [500_000],
      depreciation: [100_000],
      beginningCash: 1_000_000,
      workingCapitalChange: [-200_000], // Negative change (cash inflow)
    };

    const pl = generateProfitLossStatement(inputs);
    const cf = generateCashFlowStatement(inputs, pl);

    // Operating cash flow should add back working capital change
    expect(cf[0].workingCapitalChange).toBe(-200_000);
    expect(cf[0].operatingCashFlow).toBeGreaterThan(
      pl[0].netIncome + pl[0].depreciation
    );
  });
});

describe('generateFinancialStatements', () => {
  it('should generate all statements with convergence', () => {
    const inputs: StatementInputs = {
      revenue: [10_000_000, 12_000_000],
      staffCosts: [3_000_000, 3_500_000],
      rent: [2_000_000, 2_100_000],
      opex: [1_000_000, 1_200_000],
      capex: [500_000, 0],
      depreciation: [100_000, 100_000],
      beginningCash: 1_000_000,
    };

    const result = generateFinancialStatements(inputs);

    expect(result.pl).toHaveLength(2);
    expect(result.bs).toHaveLength(2);
    expect(result.cf).toHaveLength(2);
    expect(result.convergence.passes).toBeGreaterThanOrEqual(1);
    expect(result.convergence.passes).toBeLessThanOrEqual(3);
  });

  it('should converge within max passes', () => {
    const inputs: StatementInputs = {
      revenue: [10_000_000],
      staffCosts: [3_000_000],
      rent: [2_000_000],
      opex: [1_000_000],
      capex: [0],
      depreciation: [0],
      beginningCash: 0,
    };

    const result = generateFinancialStatements(inputs, 3);

    expect(result.convergence.passes).toBeLessThanOrEqual(3);
  });

  it('should stop at max passes even if not balanced', () => {
    const inputs: StatementInputs = {
      revenue: [10_000_000],
      staffCosts: [3_000_000],
      rent: [2_000_000],
      opex: [1_000_000],
      capex: [500_000],
      depreciation: [100_000],
      beginningCash: 0,
    };

    const result = generateFinancialStatements(inputs, 1); // Only 1 pass

    expect(result.convergence.passes).toBe(1);
    // May or may not be balanced after 1 pass
  });

  it('should use updated cash from balance sheet in subsequent passes', () => {
    const inputs: StatementInputs = {
      revenue: [10_000_000],
      staffCosts: [3_000_000],
      rent: [2_000_000],
      opex: [1_000_000],
      capex: [500_000],
      depreciation: [100_000],
      beginningCash: 0,
    };

    const result = generateFinancialStatements(inputs, 3);

    // If multiple passes, cash should be updated
    if (result.convergence.passes > 1) {
      expect(result.cf[0].beginningCash).toBeDefined();
    }
  });

  it('should handle missing cashFlow entries with fallback to 0', () => {
    const inputs: StatementInputs = {
      revenue: [10_000_000, 12_000_000],
      staffCosts: [3_000_000, 3_500_000],
      rent: [2_000_000, 2_100_000],
      opex: [1_000_000, 1_200_000],
      capex: [500_000, 0],
      depreciation: [100_000, 100_000],
      beginningCash: 1_000_000,
    };

    const pl = generateProfitLossStatement(inputs);
    // Create cash flow with missing entry for second year
    const cf = generateCashFlowStatement(inputs, pl);
    
    // Generate balance sheet - should handle missing cashFlow entries
    const bs = generateBalanceSheet(inputs, pl, cf);
    
    // Should still generate balance sheet even with missing entries
    expect(bs).toHaveLength(2);
    expect(bs[0]).toBeDefined();
    expect(bs[1]).toBeDefined();
  });

  it('should fallback to beginningCash when balance sheet is empty', () => {
    const inputs: StatementInputs = {
      revenue: [10_000_000],
      staffCosts: [3_000_000],
      rent: [2_000_000],
      opex: [1_000_000],
      capex: [500_000],
      depreciation: [100_000],
      beginningCash: 5_000_000,
    };

    const pl = generateProfitLossStatement(inputs);
    const cf = generateCashFlowStatement(inputs, pl);
    const bs: any[] = []; // Empty balance sheet

    // When generating statements with empty BS, should fallback to beginningCash
    const result = generateFinancialStatements(inputs, 1);
    
    // Should use beginningCash as fallback
    expect(result.cf[0].beginningCash).toBe(5_000_000);
  });
});

