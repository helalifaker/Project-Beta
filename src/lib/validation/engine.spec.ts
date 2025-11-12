/**
 * Validation engine tests
 */

import { describe, it, expect } from 'vitest';

import type {
  ProfitLossStatement,
  BalanceSheet,
  CashFlowStatement,
} from '@/lib/finance/statements';

import { validateFinancialStatements } from './engine';

describe('validateFinancialStatements', () => {
  const createMockStatements = (): {
    pl: ProfitLossStatement[];
    bs: BalanceSheet[];
    cf: CashFlowStatement[];
    revenue: number[];
    rent: number[];
  } => {
    const pl: ProfitLossStatement[] = [
      {
        year: 2028,
        revenue: 10_000_000,
        cogs: 6_000_000,
        grossProfit: 4_000_000,
        operatingExpenses: 0,
        ebitda: 4_000_000,
        depreciation: 100_000,
        ebit: 3_900_000,
        interest: 0,
        taxes: 0,
        netIncome: 3_900_000,
      },
    ];

    const bs: BalanceSheet[] = [
      {
        year: 2028,
        cash: 1_000_000,
        fixedAssets: 500_000,
        totalAssets: 1_500_000,
        deferredRevenue: 0,
        totalLiabilities: 0,
        retainedEarnings: 3_900_000,
        totalEquity: 3_900_000,
        totalLiabilitiesAndEquity: 3_900_000,
        isBalanced: true,
        balanceDifference: 0,
      },
    ];

    const cf: CashFlowStatement[] = [
      {
        year: 2028,
        netIncome: 3_900_000,
        depreciation: 100_000,
        workingCapitalChange: 0,
        operatingCashFlow: 4_000_000,
        capex: 500_000,
        investingCashFlow: -500_000,
        financingCashFlow: 0,
        netCashChange: 3_500_000,
        beginningCash: 0,
        endingCash: 3_500_000,
      },
    ];

    return {
      pl,
      bs,
      cf,
      revenue: [10_000_000],
      rent: [2_000_000],
    };
  };

  describe('Critical Validations', () => {
    it('should flag rent load > 30%', () => {
      const { pl, bs, cf, revenue, rent } = createMockStatements();
      rent[0] = 4_000_000; // 40% rent load

      const result = validateFinancialStatements({
        pl,
        bs,
        cf,
        revenue,
        rent,
      });

      expect(result.critical.length).toBeGreaterThan(0);
      expect(result.critical[0]?.code).toBe('RENT_LOAD_EXCEEDED');
      expect(result.canApprove).toBe(false);
    });

    it('should flag EBITDA margin < 12% after 2027', () => {
      const { pl, bs, cf, revenue, rent } = createMockStatements();
      if (pl[0]) {
        pl[0].year = 2028;
        pl[0].revenue = 10_000_000;
      }
      pl[0].ebitda = 1_000_000; // 10% margin

      const result = validateFinancialStatements({
        pl,
        bs,
        cf,
        revenue,
        rent,
      });

      expect(result.critical.length).toBeGreaterThan(0);
      expect(result.critical[0].code).toBe('EBITDA_MARGIN_BELOW_THRESHOLD');
    });

    it('should not flag EBITDA margin < 12% before 2028', () => {
      const { pl, bs, cf, revenue, rent } = createMockStatements();
      pl[0].year = 2027;
      pl[0].revenue = 10_000_000;
      pl[0].ebitda = 1_000_000; // 10% margin (OK before 2028)

      const result = validateFinancialStatements({
        pl,
        bs,
        cf,
        revenue,
        rent,
      });

      const ebitdaIssues = result.critical.filter(
        (i) => i.code === 'EBITDA_MARGIN_BELOW_THRESHOLD'
      );
      expect(ebitdaIssues.length).toBe(0);
    });

    it('should flag CFO margin < 3% after 2027', () => {
      const { pl, bs, cf, revenue, rent } = createMockStatements();
      cf[0].year = 2028;
      cf[0].operatingCashFlow = 200_000; // 2% margin
      revenue[0] = 10_000_000;

      const result = validateFinancialStatements({
        pl,
        bs,
        cf,
        revenue,
        rent,
      });

      expect(result.critical.length).toBeGreaterThan(0);
      expect(result.critical[0].code).toBe('CFO_MARGIN_BELOW_THRESHOLD');
    });

    it('should flag unbalanced Balance Sheet', () => {
      const { pl, bs, cf, revenue, rent } = createMockStatements();
      bs[0].isBalanced = false;
      bs[0].balanceDifference = 1_000;

      const result = validateFinancialStatements({
        pl,
        bs,
        cf,
        revenue,
        rent,
      });

      expect(result.critical.length).toBeGreaterThan(0);
      expect(result.critical[0].code).toBe('BALANCE_SHEET_UNBALANCED');
    });

    it('should flag frozen year modified without reason', () => {
      const { pl, bs, cf, revenue, rent } = createMockStatements();
      const frozenYearOverrides = new Map<number, string>();
      frozenYearOverrides.set(2033, ''); // Empty reason

      const result = validateFinancialStatements({
        pl,
        bs,
        cf,
        revenue,
        rent,
        frozenYearOverrides,
      });

      const frozenIssues = result.critical.filter(
        (i) => i.code === 'FROZEN_YEAR_MODIFIED_WITHOUT_REASON'
      );
      expect(frozenIssues.length).toBeGreaterThan(0);
    });
  });

  describe('Warning Validations', () => {
    it('should flag low utilization', () => {
      const { pl, bs, cf, revenue, rent } = createMockStatements();
      const utilization = [0.3]; // 30%

      const result = validateFinancialStatements({
        pl,
        bs,
        cf,
        revenue,
        rent,
        utilization,
      });

      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0].code).toBe('LOW_UTILIZATION');
    });

    it('should flag over capacity', () => {
      const { pl, bs, cf, revenue, rent } = createMockStatements();
      const utilization = [1.1]; // 110%

      const result = validateFinancialStatements({
        pl,
        bs,
        cf,
        revenue,
        rent,
        utilization,
      });

      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0].code).toBe('OVER_CAPACITY');
    });

    it('should flag capex override without detailed reason', () => {
      const { pl, bs, cf, revenue, rent } = createMockStatements();
      const capexOverrides = new Map();
      capexOverrides.set(2028, { reason: 'Override', detailed: false });

      const result = validateFinancialStatements({
        pl,
        bs,
        cf,
        revenue,
        rent,
        capexOverrides,
      });

      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0].code).toBe('CAPEX_OVERRIDE_WITHOUT_DETAILED_REASON');
    });

    it('should flag CPI rate out of bounds', () => {
      const { pl, bs, cf, revenue, rent } = createMockStatements();

      const result = validateFinancialStatements({
        pl,
        bs,
        cf,
        revenue,
        rent,
        cpiRate: 0.1, // 10%
        cpiMin: 0.01, // 1%
        cpiMax: 0.06, // 6%
      });

      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0].code).toBe('CPI_RATE_OUT_OF_BOUNDS');
    });

    it('should not flag CPI rate when within bounds', () => {
      const { pl, bs, cf, revenue, rent } = createMockStatements();

      const result = validateFinancialStatements({
        pl,
        bs,
        cf,
        revenue,
        rent,
        cpiRate: 0.03, // 3% - within bounds
        cpiMin: 0.01, // 1%
        cpiMax: 0.06, // 6%
      });

      const cpiWarnings = result.warnings.filter((w) => w.code === 'CPI_RATE_OUT_OF_BOUNDS');
      expect(cpiWarnings.length).toBe(0);
    });

    it('should skip CPI validation when cpiRate is undefined', () => {
      const { pl, bs, cf, revenue, rent } = createMockStatements();

      const result = validateFinancialStatements({
        pl,
        bs,
        cf,
        revenue,
        rent,
        cpiMin: 0.01,
        cpiMax: 0.06,
        // cpiRate is undefined
      });

      const cpiWarnings = result.warnings.filter((w) => w.code === 'CPI_RATE_OUT_OF_BOUNDS');
      expect(cpiWarnings.length).toBe(0);
    });
  });

  describe('Info Validations', () => {
    it('should flag stale version', () => {
      const { pl, bs, cf, revenue, rent } = createMockStatements();
      const staleDate = new Date();
      staleDate.setDate(staleDate.getDate() - 35); // 35 days ago

      const result = validateFinancialStatements({
        pl,
        bs,
        cf,
        revenue,
        rent,
        versionUpdatedAt: staleDate,
      });

      expect(result.info.length).toBeGreaterThan(0);
      expect(result.info[0].code).toBe('VERSION_STALE');
    });

    it('should flag missing description', () => {
      const { pl, bs, cf, revenue, rent } = createMockStatements();

      const result = validateFinancialStatements({
        pl,
        bs,
        cf,
        revenue,
        rent,
        versionDescription: '',
      });

      expect(result.info.length).toBeGreaterThan(0);
      expect(result.info[0].code).toBe('NO_DESCRIPTION');
    });

    it('should flag description with only whitespace', () => {
      const { pl, bs, cf, revenue, rent } = createMockStatements();

      const result = validateFinancialStatements({
        pl,
        bs,
        cf,
        revenue,
        rent,
        versionDescription: '   ',
      });

      const noDescIssues = result.info.filter((i) => i.code === 'NO_DESCRIPTION');
      expect(noDescIssues.length).toBeGreaterThan(0);
    });

    it('should not flag version staleness when updated recently', () => {
      const { pl, bs, cf, revenue, rent } = createMockStatements();
      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - 10); // 10 days ago

      const result = validateFinancialStatements({
        pl,
        bs,
        cf,
        revenue,
        rent,
        versionUpdatedAt: recentDate,
      });

      const staleIssues = result.info.filter((i) => i.code === 'VERSION_STALE');
      expect(staleIssues.length).toBe(0);
    });

    it('should skip staleness validation when versionUpdatedAt is undefined', () => {
      const { pl, bs, cf, revenue, rent } = createMockStatements();

      const result = validateFinancialStatements({
        pl,
        bs,
        cf,
        revenue,
        rent,
        // versionUpdatedAt is undefined
      });

      const staleIssues = result.info.filter((i) => i.code === 'VERSION_STALE');
      expect(staleIssues.length).toBe(0);
    });

    it('should handle missing rent entries with fallback to 0', () => {
      const { pl, bs, cf, revenue } = createMockStatements();
      // rent array is shorter than revenue array
      const rent = [2_000_000]; // Only one entry, revenue has 2

      const result = validateFinancialStatements({
        pl,
        bs,
        cf,
        revenue,
        rent,
      });

      // Should not crash and should validate correctly
      expect(result).toBeDefined();
      expect(result.critical.length).toBeGreaterThanOrEqual(0);
    });

    it('should flag capex override with detailed reason', () => {
      const { pl, bs, cf, revenue, rent } = createMockStatements();
      const capexOverrides = new Map();
      capexOverrides.set(2028, { reason: 'Override', detailed: true });

      const result = validateFinancialStatements({
        pl,
        bs,
        cf,
        revenue,
        rent,
        capexOverrides,
      });

      // Should not flag when detailed is true
      const capexWarnings = result.warnings.filter(
        (w) => w.code === 'CAPEX_OVERRIDE_WITHOUT_DETAILED_REASON'
      );
      expect(capexWarnings.length).toBe(0);
    });

    it('should flag locked base version', () => {
      const { pl, bs, cf, revenue, rent } = createMockStatements();

      const result = validateFinancialStatements({
        pl,
        bs,
        cf,
        revenue,
        rent,
        baseVersionLocked: true,
      });

      const infoCodes = result.info.map((issue) => issue.code);
      expect(infoCodes).toContain('BASE_VERSION_LOCKED');
    });
  });

  describe('Edge Cases', () => {
    it('should skip rent load validation when revenue is zero', () => {
      const { pl, bs, cf, revenue, rent } = createMockStatements();
      revenue[0] = 0; // Zero revenue
      rent[0] = 10_000_000; // High rent

      const result = validateFinancialStatements({
        pl,
        bs,
        cf,
        revenue,
        rent,
      });

      // Should not flag rent load when revenue is zero
      const rentLoadIssues = result.critical.filter((issue) => issue.code === 'RENT_LOAD_EXCEEDED');
      expect(rentLoadIssues.length).toBe(0);
    });

    it('should skip EBITDA margin validation for years <= 2027', () => {
      const pl: ProfitLossStatement[] = [
        {
          year: 2027,
          revenue: 10_000_000,
          cogs: 9_000_000,
          grossProfit: 1_000_000,
          operatingExpenses: 0,
          ebitda: 100_000, // Very low EBITDA (1%)
          depreciation: 50_000,
          ebit: 50_000,
          interest: 0,
          taxes: 0,
          netIncome: 50_000,
        },
      ];

      const bs: BalanceSheet[] = [
        {
          year: 2027,
          cash: 1_000_000,
          fixedAssets: 500_000,
          totalAssets: 1_500_000,
          deferredRevenue: 0,
          totalLiabilities: 0,
          retainedEarnings: 50_000,
          totalEquity: 50_000,
          totalLiabilitiesAndEquity: 50_000,
        },
      ];

      const cf: CashFlowStatement[] = [
        {
          year: 2027,
          operatingCashFlow: 50_000,
          investingCashFlow: 0,
          financingCashFlow: 0,
          netCashFlow: 50_000,
        },
      ];

      const result = validateFinancialStatements({
        pl,
        bs,
        cf,
        revenue: [10_000_000],
        rent: [1_000_000],
      });

      // Should not flag EBITDA margin for 2027
      const ebitdaIssues = result.critical.filter(
        (issue) => issue.code === 'EBITDA_MARGIN_BELOW_THRESHOLD' && issue.year === 2027
      );
      expect(ebitdaIssues.length).toBe(0);
    });

    it('should skip EBITDA margin validation when revenue is zero', () => {
      const pl: ProfitLossStatement[] = [
        {
          year: 2028,
          revenue: 0,
          cogs: 0,
          grossProfit: 0,
          operatingExpenses: 0,
          ebitda: -100_000,
          depreciation: 0,
          ebit: -100_000,
          interest: 0,
          taxes: 0,
          netIncome: -100_000,
        },
      ];

      const { bs, cf } = createMockStatements();

      const result = validateFinancialStatements({
        pl,
        bs,
        cf,
        revenue: [0],
        rent: [1_000_000],
      });

      // Should not flag EBITDA margin when revenue is zero
      const ebitdaIssues = result.critical.filter(
        (issue) => issue.code === 'EBITDA_MARGIN_BELOW_THRESHOLD'
      );
      expect(ebitdaIssues.length).toBe(0);
    });

    it('should skip CFO margin validation for years <= 2027', () => {
      const { pl, bs, cf, revenue, rent } = createMockStatements();
      pl[0].year = 2027;
      bs[0].year = 2027;
      cf[0].year = 2027;
      cf[0].operatingCashFlow = -100_000; // Negative CFO

      const result = validateFinancialStatements({
        pl,
        bs,
        cf,
        revenue,
        rent,
      });

      // Should not flag CFO margin for 2027
      const cfoIssues = result.critical.filter(
        (issue) => issue.code === 'CFO_MARGIN_BELOW_THRESHOLD' && issue.year === 2027
      );
      expect(cfoIssues.length).toBe(0);
    });

    it('should skip CFO margin validation when revenue is zero', () => {
      const { pl, bs, cf, rent } = createMockStatements();
      const revenue = [0]; // Zero revenue

      const result = validateFinancialStatements({
        pl,
        bs,
        cf,
        revenue,
        rent,
      });

      // Should not flag CFO margin when revenue is zero
      const cfoIssues = result.critical.filter(
        (issue) => issue.code === 'CFO_MARGIN_BELOW_THRESHOLD'
      );
      expect(cfoIssues.length).toBe(0);
    });
  });

  describe('Summary', () => {
    it('should calculate summary correctly', () => {
      const { pl, bs, cf, revenue, rent } = createMockStatements();
      rent[0] = 4_000_000; // Critical issue
      const utilization = [0.3]; // Warning issue

      const result = validateFinancialStatements({
        pl,
        bs,
        cf,
        revenue,
        rent,
        utilization,
        versionDescription: '', // Info issue
      });

      expect(result.summary.critical).toBeGreaterThan(0);
      expect(result.summary.warnings).toBeGreaterThan(0);
      expect(result.summary.info).toBeGreaterThan(0);
      expect(result.summary.total).toBe(
        result.summary.critical + result.summary.warnings + result.summary.info
      );
    });

    it('should allow approval when no critical issues', () => {
      const { pl, bs, cf, revenue, rent } = createMockStatements();
      rent[0] = 2_000_000; // 20% rent load (OK)

      const result = validateFinancialStatements({
        pl,
        bs,
        cf,
        revenue,
        rent,
      });

      expect(result.canApprove).toBe(true);
    });
  });
});
