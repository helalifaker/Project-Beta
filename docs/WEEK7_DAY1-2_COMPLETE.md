# Week 7 Day 1-2: Validation Engine — Complete

## Overview

Complete implementation of validation rule engine with Critical, Warning, and Info validations for Week 7 Day 1-2.

**Status**: ✅ Complete  
**Date**: 2025-11-10

---

## What's Been Implemented

### 1. Validation Rule Engine (`validateFinancialStatements`)

- **Unified Validation**: Single function to validate all financial statements
- **Severity Levels**: CRITICAL, WARNING, INFO
- **Deep Links**: Each issue includes a deep link to the source field
- **Approval Gate**: `canApprove` flag (true if no critical issues)

### 2. Critical Validations (Block Draft → Ready)

#### Rent Load Validation
- **Rule**: Rent load > 30% in any year
- **Code**: `RENT_LOAD_EXCEEDED`
- **Threshold**: 30% (MAX_RENT_LOAD_PERCENTAGE)
- **Deep Link**: `/versions/:id/assumptions?section=lease&year={year}`

#### EBITDA Margin Validation
- **Rule**: EBITDA margin < 12% in any year after 2027
- **Code**: `EBITDA_MARGIN_BELOW_THRESHOLD`
- **Threshold**: 12% (MIN_EBITDA_MARGIN)
- **Deep Link**: `/versions/:id/statements?type=PL&year={year}`

#### CFO Margin Validation
- **Rule**: CFO margin < 3% in any year after 2027
- **Code**: `CFO_MARGIN_BELOW_THRESHOLD`
- **Threshold**: 3% (MIN_CFO_MARGIN)
- **Deep Link**: `/versions/:id/statements?type=CF&year={year}`

#### Frozen Years Validation
- **Rule**: Frozen years (≥2033) modified without override reason
- **Code**: `FROZEN_YEAR_MODIFIED_WITHOUT_REASON`
- **Deep Link**: `/versions/:id/assumptions?year={year}`

#### Balance Sheet Validation
- **Rule**: Balance Sheet does not balance (tolerance > 0.01)
- **Code**: `BALANCE_SHEET_UNBALANCED`
- **Tolerance**: 0.01 SAR (BALANCE_TOLERANCE)
- **Deep Link**: `/versions/:id/statements?type=BS&year={year}`

### 3. Warning Validations (Allow but Flag)

#### Utilization Validation
- **Rule**: Utilization < 50% or > 100% in any year
- **Codes**: `LOW_UTILIZATION`, `OVER_CAPACITY`
- **Deep Link**: `/versions/:id/assumptions?section=curriculum&year={year}`

#### Capex Override Validation
- **Rule**: Capex override without detailed reason
- **Code**: `CAPEX_OVERRIDE_WITHOUT_DETAILED_REASON`
- **Deep Link**: `/versions/:id/assumptions?section=capex&year={year}`

#### CPI Bounds Validation
- **Rule**: CPI rate outside workspace bounds (cpi_min, cpi_max)
- **Code**: `CPI_RATE_OUT_OF_BOUNDS`
- **Deep Link**: `/versions/:id/assumptions?section=tuition`

#### Staffing Ratios Validation
- **Rule**: Staffing ratio significantly different from templates
- **Code**: (Placeholder - requires template data)
- **Status**: Framework ready, needs template integration

### 4. Info Validations (Informational Only)

#### Version Staleness
- **Rule**: Version not updated in 30+ days
- **Code**: `VERSION_STALE`
- **Deep Link**: `/versions/:id`

#### Version Description
- **Rule**: No description provided
- **Code**: `NO_DESCRIPTION`
- **Deep Link**: `/versions/:id/edit`

#### Base Version Locked
- **Rule**: Base version is locked (cannot inherit changes)
- **Code**: `BASE_VERSION_LOCKED`
- **Deep Link**: `/versions/:id`

---

## Files Created (2 files)

### Core Implementation
- `src/lib/validation/engine.ts` — Validation rule engine

### Tests
- `src/lib/validation/engine.spec.ts` — Comprehensive validation tests

---

## Usage Examples

### Validate Financial Statements

```typescript
import { validateFinancialStatements } from '@/lib/validation/engine';

const result = validateFinancialStatements({
  pl: profitLossStatements,
  bs: balanceSheets,
  cf: cashFlowStatements,
  revenue: revenueSchedule,
  rent: rentSchedule,
  utilization: utilizationSchedule,
  frozenYearOverrides: new Map([[2033, 'Override reason']]),
  capexOverrides: new Map([[2028, { reason: 'Detailed reason', detailed: true }]]),
  cpiRate: 0.025,
  cpiMin: 0.01,
  cpiMax: 0.06,
  versionUpdatedAt: new Date(),
  versionDescription: 'Version description',
  baseVersionLocked: false,
});

// Check if can approve
if (result.canApprove) {
  // Proceed with approval
} else {
  // Show critical issues
  console.log(`Cannot approve: ${result.summary.critical} critical issues`);
}

// Access issues by severity
const criticalIssues = result.critical;
const warnings = result.warnings;
const info = result.info;

// Summary
console.log(`Total: ${result.summary.total}`);
console.log(`Critical: ${result.summary.critical}`);
console.log(`Warnings: ${result.summary.warnings}`);
console.log(`Info: ${result.summary.info}`);
```

### Access Validation Issues

```typescript
// Iterate through critical issues
for (const issue of result.critical) {
  console.log(`${issue.code}: ${issue.message}`);
  console.log(`Year: ${issue.year}`);
  console.log(`Deep Link: ${issue.deepLink}`);
  console.log(`Value: ${issue.value}, Expected: ${issue.expected}`);
}

// Filter by code
const rentLoadIssues = result.critical.filter(
  (i) => i.code === 'RENT_LOAD_EXCEEDED'
);

// Group by year
const issuesByYear = new Map<number, ValidationIssue[]>();
for (const issue of result.critical) {
  if (issue.year) {
    const yearIssues = issuesByYear.get(issue.year) || [];
    yearIssues.push(issue);
    issuesByYear.set(issue.year, yearIssues);
  }
}
```

---

## Validation Matrix Structure

Each validation issue includes:
- **Severity**: CRITICAL, WARNING, or INFO
- **Code**: Unique identifier (e.g., `RENT_LOAD_EXCEEDED`)
- **Message**: Human-readable message
- **Year**: Year of the issue (if applicable)
- **Field**: Field name (e.g., `rent`, `ebitda`)
- **Value**: Actual value
- **Expected**: Expected/threshold value
- **Deep Link**: URL to navigate to source field

---

## Quality Gates Met

- ✅ All validations work correctly
- ✅ Critical validations block draft→ready (`canApprove` flag)
- ✅ Validation matrix structure complete (deep links included)
- ✅ Tests written (comprehensive coverage)
- ✅ Zero linting errors
- ✅ TypeScript strict mode compliant
- ✅ Dependencies checked

---

## Test Coverage

- **Critical Validations**: Rent load, EBITDA margin, CFO margin, frozen years, balance sheet
- **Warning Validations**: Utilization, capex override, CPI bounds
- **Info Validations**: Staleness, description, base version locked
- **Summary**: Total counts, approval gate
- **Edge Cases**: Zero revenue, before/after 2027, empty overrides

---

## Next Steps: Week 7 Day 3-5

- Staffing calculations (ratio-based)
- OpEx calculations (revenue-based %)
- Capex rule engine (cycle, utilization, custom date)
- Integration testing

---

**Last Updated**: 2025-11-10

