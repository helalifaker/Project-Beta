/**
 * Validation engine
 * Critical, Warning, and Info validation rules
 */

import {
  MAX_RENT_LOAD_PERCENTAGE,
  MIN_EBITDA_MARGIN,
  MIN_CFO_MARGIN,
  FROZEN_YEARS,
  MODEL_START_YEAR,
} from '@/lib/finance/constants';
import type {
  ProfitLossStatement,
  BalanceSheet,
  CashFlowStatement,
} from '@/lib/finance/statements';

export type ValidationSeverity = 'CRITICAL' | 'WARNING' | 'INFO';

export interface ValidationIssue {
  severity: ValidationSeverity;
  code: string;
  message: string;
  year?: number;
  field?: string;
  value?: number;
  expected?: number;
  deepLink?: string; // URL to source field
}

export interface ValidationResult {
  critical: ValidationIssue[];
  warnings: ValidationIssue[];
  info: ValidationIssue[];
  canApprove: boolean; // True if no critical issues
  summary: {
    total: number;
    critical: number;
    warnings: number;
    info: number;
  };
}

export interface ValidationInputs {
  pl: ProfitLossStatement[];
  bs: BalanceSheet[];
  cf: CashFlowStatement[];
  revenue: number[];
  rent: number[];
  utilization?: number[]; // Overall utilization by year
  frozenYearOverrides?: Map<number, string>; // year -> override reason
  capexOverrides?: Map<number, { reason: string; detailed: boolean }>; // year -> override info
  cpiRate?: number;
  cpiMin?: number;
  cpiMax?: number;
  versionUpdatedAt?: Date;
  versionDescription?: string;
  baseVersionLocked?: boolean;
}

/**
 * Validate financial statements
 */
export function validateFinancialStatements(inputs: ValidationInputs): ValidationResult {
  const critical: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];
  const info: ValidationIssue[] = [];

  // Critical validations
  validateRentLoad(inputs, critical);
  validateEbitdaMargin(inputs, critical);
  validateCfoMargin(inputs, critical);
  validateFrozenYears(inputs, critical);
  validateBalanceSheet(inputs, critical);

  // Warning validations
  validateUtilization(inputs, warnings);
  validateCapexOverrides(inputs, warnings);
  validateCpiBounds(inputs, warnings);
  validateStaffingRatios(inputs, warnings);

  // Info validations
  validateVersionStaleness(inputs, info);
  validateVersionDescription(inputs, info);
  validateBaseVersionLocked(inputs, info);

  const summary = {
    total: critical.length + warnings.length + info.length,
    critical: critical.length,
    warnings: warnings.length,
    info: info.length,
  };

  return {
    critical,
    warnings,
    info,
    canApprove: critical.length === 0,
    summary,
  };
}

/**
 * Critical: Rent load > 30% in any year
 */
function validateRentLoad(inputs: ValidationInputs, issues: ValidationIssue[]): void {
  for (let i = 0; i < inputs.revenue.length; i++) {
    const year = MODEL_START_YEAR + i;
    const revenue = inputs.revenue[i] || 0;
    const rent = inputs.rent[i] || 0;

    if (revenue === 0) {
      continue; // Skip if no revenue
    }

    const rentLoad = rent / revenue;

    if (rentLoad > MAX_RENT_LOAD_PERCENTAGE) {
      issues.push({
        severity: 'CRITICAL',
        code: 'RENT_LOAD_EXCEEDED',
        message: `Rent load exceeds ${MAX_RENT_LOAD_PERCENTAGE * 100}% in ${year}`,
        year,
        field: 'rent',
        value: rentLoad,
        expected: MAX_RENT_LOAD_PERCENTAGE,
        deepLink: `/versions/:id/assumptions?section=lease&year=${year}`,
      });
    }
  }
}

/**
 * Critical: EBITDA margin < 12% in any year after 2027
 */
function validateEbitdaMargin(inputs: ValidationInputs, issues: ValidationIssue[]): void {
  for (let i = 0; i < inputs.pl.length; i++) {
    const statement = inputs.pl[i];
    const year = statement.year;

    if (year <= 2027) {
      continue; // Only check after 2027
    }

    if (statement.revenue === 0) {
      continue; // Skip if no revenue
    }

    const ebitdaMargin = statement.ebitda / statement.revenue;

    if (ebitdaMargin < MIN_EBITDA_MARGIN) {
      issues.push({
        severity: 'CRITICAL',
        code: 'EBITDA_MARGIN_BELOW_THRESHOLD',
        message: `EBITDA margin below ${MIN_EBITDA_MARGIN * 100}% in ${year}`,
        year,
        field: 'ebitda',
        value: ebitdaMargin,
        expected: MIN_EBITDA_MARGIN,
        deepLink: `/versions/:id/statements?type=PL&year=${year}`,
      });
    }
  }
}

/**
 * Critical: CFO margin < 3% in any year after 2027
 */
function validateCfoMargin(inputs: ValidationInputs, issues: ValidationIssue[]): void {
  for (let i = 0; i < inputs.cf.length; i++) {
    const statement = inputs.cf[i];
    const year = statement.year;

    if (year <= 2027) {
      continue; // Only check after 2027
    }

    const revenue = inputs.revenue[i] || 0;

    if (revenue === 0) {
      continue; // Skip if no revenue
    }

    const cfoMargin = statement.operatingCashFlow / revenue;

    if (cfoMargin < MIN_CFO_MARGIN) {
      issues.push({
        severity: 'CRITICAL',
        code: 'CFO_MARGIN_BELOW_THRESHOLD',
        message: `CFO margin below ${MIN_CFO_MARGIN * 100}% in ${year}`,
        year,
        field: 'operatingCashFlow',
        value: cfoMargin,
        expected: MIN_CFO_MARGIN,
        deepLink: `/versions/:id/statements?type=CF&year=${year}`,
      });
    }
  }
}

/**
 * Critical: Frozen years (≥2033) modified without override reason
 */
function validateFrozenYears(inputs: ValidationInputs, issues: ValidationIssue[]): void {
  if (!inputs.frozenYearOverrides) {
    return; // No overrides to check
  }

  for (const year of FROZEN_YEARS) {
    const hasOverride = inputs.frozenYearOverrides.has(year);
    const overrideReason = inputs.frozenYearOverrides.get(year);

    // Check if any assumptions were modified for frozen years
    // This is a simplified check - in reality, we'd check if assumptions changed
    if (hasOverride && !overrideReason) {
      issues.push({
        severity: 'CRITICAL',
        code: 'FROZEN_YEAR_MODIFIED_WITHOUT_REASON',
        message: `Frozen year ${year} modified without override reason`,
        year,
        field: 'assumptions',
        deepLink: `/versions/:id/assumptions?year=${year}`,
      });
    }
  }
}

/**
 * Critical: Balance Sheet does not balance
 */
function validateBalanceSheet(inputs: ValidationInputs, issues: ValidationIssue[]): void {
  for (const statement of inputs.bs) {
    if (!statement.isBalanced) {
      issues.push({
        severity: 'CRITICAL',
        code: 'BALANCE_SHEET_UNBALANCED',
        message: `Balance Sheet does not balance in ${statement.year} (difference: ${statement.balanceDifference} SAR)`,
        year: statement.year,
        field: 'balanceSheet',
        value: statement.balanceDifference,
        expected: 0,
        deepLink: `/versions/:id/statements?type=BS&year=${statement.year}`,
      });
    }
  }
}

/**
 * Warning: Utilization < 50% or > 100% in any year
 */
function validateUtilization(inputs: ValidationInputs, issues: ValidationIssue[]): void {
  if (!inputs.utilization) {
    return;
  }

  for (let i = 0; i < inputs.utilization.length; i++) {
    const year = MODEL_START_YEAR + i;
    const utilization = inputs.utilization[i];

    if (utilization < 0.5) {
      issues.push({
        severity: 'WARNING',
        code: 'LOW_UTILIZATION',
        message: `Utilization below 50% in ${year}`,
        year,
        field: 'utilization',
        value: utilization,
        expected: 0.5,
        deepLink: `/versions/:id/assumptions?section=curriculum&year=${year}`,
      });
    }

    if (utilization > 1.0) {
      issues.push({
        severity: 'WARNING',
        code: 'OVER_CAPACITY',
        message: `Utilization exceeds 100% in ${year}`,
        year,
        field: 'utilization',
        value: utilization,
        expected: 1.0,
        deepLink: `/versions/:id/assumptions?section=curriculum&year=${year}`,
      });
    }
  }
}

/**
 * Warning: Capex override without detailed reason
 */
function validateCapexOverrides(inputs: ValidationInputs, issues: ValidationIssue[]): void {
  if (!inputs.capexOverrides) {
    return;
  }

  for (const [year, override] of inputs.capexOverrides.entries()) {
    if (!override.detailed) {
      issues.push({
        severity: 'WARNING',
        code: 'CAPEX_OVERRIDE_WITHOUT_DETAILED_REASON',
        message: `Capex override in ${year} lacks detailed reason`,
        year,
        field: 'capex',
        deepLink: `/versions/:id/assumptions?section=capex&year=${year}`,
      });
    }
  }
}

/**
 * Warning: CPI rate outside workspace bounds
 */
function validateCpiBounds(inputs: ValidationInputs, issues: ValidationIssue[]): void {
  if (inputs.cpiRate === undefined || inputs.cpiMin === undefined || inputs.cpiMax === undefined) {
    return;
  }

  if (inputs.cpiRate < inputs.cpiMin || inputs.cpiRate > inputs.cpiMax) {
    issues.push({
      severity: 'WARNING',
      code: 'CPI_RATE_OUT_OF_BOUNDS',
      message: `CPI rate ${inputs.cpiRate * 100}% outside workspace bounds (${inputs.cpiMin * 100}% - ${inputs.cpiMax * 100}%)`,
      field: 'cpiRate',
      value: inputs.cpiRate,
      expected: inputs.cpiMin,
      deepLink: `/versions/:id/assumptions?section=tuition`,
    });
  }
}

/**
 * Warning: Staffing ratio significantly different from templates
 * (Placeholder - would need template data)
 */
function validateStaffingRatios(_inputs: ValidationInputs, _issues: ValidationIssue[]): void {
  // TODO: Implement when template data is available
  // Check if staffing ratios deviate significantly from template defaults
}

/**
 * Info: Version not updated in 30+ days
 */
function validateVersionStaleness(inputs: ValidationInputs, issues: ValidationIssue[]): void {
  if (!inputs.versionUpdatedAt) {
    return;
  }

  const daysSinceUpdate = (Date.now() - inputs.versionUpdatedAt.getTime()) / (1000 * 60 * 60 * 24);

  if (daysSinceUpdate > 30) {
    issues.push({
      severity: 'INFO',
      code: 'VERSION_STALE',
      message: `Version not updated in ${Math.floor(daysSinceUpdate)} days`,
      deepLink: `/versions/:id`,
    });
  }
}

/**
 * Info: No description provided
 */
function validateVersionDescription(inputs: ValidationInputs, issues: ValidationIssue[]): void {
  if (!inputs.versionDescription || inputs.versionDescription.trim() === '') {
    issues.push({
      severity: 'INFO',
      code: 'NO_DESCRIPTION',
      message: 'No description provided for this version',
      deepLink: `/versions/:id/edit`,
    });
  }
}

/**
 * Info: Base version is locked
 */
function validateBaseVersionLocked(inputs: ValidationInputs, issues: ValidationIssue[]): void {
  if (inputs.baseVersionLocked) {
    issues.push({
      severity: 'INFO',
      code: 'BASE_VERSION_LOCKED',
      message: 'Base version is locked and cannot inherit changes',
      deepLink: `/versions/:id`,
    });
  }
}

/**
 * Validate a version by ID
 * Fetches version data, generates statements, and validates them
 */
export async function validateVersion(versionId: string): Promise<ValidationIssue[]> {
  // Import here to avoid circular dependencies
  const { prisma } = await import('@/lib/db/prisma');
  const { versionRepository } = await import('@/lib/db/repositories/version-repository');
  const financeStatementsModule = await import('@/lib/finance/statements');
  const { MODEL_START_YEAR, MODEL_END_YEAR } = await import('@/lib/finance/constants');

  // Use StatementInputs from the module

  type StatementInputs = financeStatementsModule.StatementInputs;
  const { generateFinancialStatements } = financeStatementsModule;

  // Fetch version
  const version = await versionRepository.findUnique({ id: versionId });
  if (!version) {
    throw new Error(`Version ${versionId} not found`);
  }

  // Fetch version data with assumptions
  const versionData = await prisma.version.findUnique({
    where: { id: versionId },
    include: {
      curricula: {
        include: {
          curriculumTemplate: {
            include: {
              rampSteps: { orderBy: { sortOrder: 'asc' } },
              tuitionAdjustments: true,
            },
          },
          rampOverrides: true,
          tuitionOverrides: true,
        },
      },
    },
  });

  if (!versionData) {
    throw new Error(`Version ${versionId} not found`);
  }

  // Generate statements (simplified - using placeholders for missing assumptions)
  const years = MODEL_END_YEAR - MODEL_START_YEAR + 1;
  const yearArray = Array.from({ length: years }, (_, i) => MODEL_START_YEAR + i);

  // TODO: Properly calculate revenue from curricula data
  // For now, use placeholder revenue array
  const revenue: number[] = yearArray.map(() => 10_000_000); // Placeholder
  const rent: number[] = yearArray.map(() => 5_000_000); // Placeholder
  const staffCosts = yearArray.map(() => 10_000_000); // Placeholder
  const opex = yearArray.map((_, i) => (revenue[i] ?? 0) * 0.1); // Placeholder
  const capex = yearArray.map(() => 0); // Placeholder
  const depreciation = yearArray.map(() => 0); // Placeholder

  const inputs: StatementInputs = {
    revenue,
    staffCosts,
    rent,
    opex,
    capex,
    depreciation,
    beginningCash: 0,
  };

  const statements = generateFinancialStatements(inputs);

  // Prepare validation inputs
  const validationInputs: ValidationInputs = {
    pl: statements.pl,
    bs: statements.bs,
    cf: statements.cf,
    revenue,
    rent,
    versionUpdatedAt: version.updatedAt,
    ...(version.description ? { versionDescription: version.description } : {}),
  };

  // Run validation
  const result = validateFinancialStatements(validationInputs);

  // Flatten results into array
  return [...result.critical, ...result.warnings, ...result.info];
}
