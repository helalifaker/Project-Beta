# Week 5 Day 3-4: Rent Models — Complete

## Overview

Complete implementation of all 3 rent models with indexation logic for Week 5 Day 3-4.

**Status**: ✅ Complete  
**Date**: 2025-11-10

---

## What's Been Implemented

### 1. Fixed+Escalation Rent Model (`calculateFixedEscRent`)

- **Formula**: `baseAmount × (1 + escalationRate)^years × indexation`
- **Features**:
  - Annual escalation
  - Optional indexation (Annual, Every 2 Years, Every 3 Years)
  - Indexation applied on top of base escalation
- **Schedule Generator**: `generateFixedEscRentSchedule()`

### 2. Revenue Share Rent Model (`calculateRevenueShareRent`)

- **Formula**: `max(floor, min(cap, revenue × percentage))`
- **Features**:
  - Percentage-based calculation
  - Optional floor (minimum rent)
  - Optional cap (maximum rent)
- **Schedule Generator**: `generateRevenueShareRentSchedule()`

### 3. Partner Model Rent (`calculatePartnerRent`)

- **Formula**: `((land_sqm × land_cost) + (bua_sqm × bua_cost)) × yield × indexation`
- **Features**:
  - Investment-based calculation
  - Yield percentage
  - Optional yield indexation (Annual, Every 2 Years, Every 3 Years)
- **Schedule Generator**: `generatePartnerRentSchedule()`

### 4. Rent NPV Calculator (`calculateRentNPV`)

- Calculates NPV of rent schedule
- Filters out zero values (years before rent starts)
- Uses discount rate for present value calculation

---

## Files Created (2 files)

### Core Implementation
- `src/lib/finance/rent.ts` — All 3 rent models + NPV calculator

### Tests
- `src/lib/finance/rent.spec.ts` — Comprehensive rent model tests

---

## Usage Examples

### Fixed+Escalation Rent

```typescript
import { calculateFixedEscRent, generateFixedEscRentSchedule } from '@/lib/finance/rent';

// Calculate rent for specific year
const params = {
  baseAmount: 5_000_000,
  escalationRate: 0.03,
  indexationRate: 0.02,
  indexationFrequency: 'EVERY_2_YEARS',
  startYear: 2028,
};

const rent2030 = calculateFixedEscRent(params, 2030);
// Returns: 5,410,590.00

// Generate full schedule
const schedule = generateFixedEscRentSchedule(params, 2028, 2052);
// Returns: [5M, 5.15M, 5.41M, ...]
```

### Revenue Share Rent

```typescript
import { calculateRevenueShareRent, generateRevenueShareRentSchedule } from '@/lib/finance/rent';

// Calculate rent for specific revenue
const params = {
  revenuePercentage: 0.15, // 15%
  floor: 1_000_000,
  cap: 3_000_000,
  revenue: 10_000_000,
};

const rent = calculateRevenueShareRent(params);
// Returns: 1,500,000 (10M × 0.15)

// Generate schedule from revenue array
const revenueSchedule = [10M, 12M, 15M, ...];
const rentSchedule = generateRevenueShareRentSchedule(
  { revenuePercentage: 0.15, floor: 1M, cap: 3M },
  revenueSchedule,
  2028,
  2052
);
```

### Partner Model Rent

```typescript
import { calculatePartnerRent, generatePartnerRentSchedule } from '@/lib/finance/rent';

// Calculate rent for specific year
const params = {
  landSqm: 10_000,
  landCostPerSqm: 500,
  buaSqm: 5_000,
  buaCostPerSqm: 2000,
  yield: 0.08, // 8%
  yieldIndexationRate: 0.02,
  yieldIndexationFrequency: 'EVERY_2_YEARS',
  startYear: 2028,
  currentYear: 2030,
};

const rent = calculatePartnerRent(params);
// Returns: 1,224,000 (15M × 0.08 × 1.02)

// Generate full schedule
const schedule = generatePartnerRentSchedule(params, 2028, 2052);
```

### Rent NPV

```typescript
import { calculateRentNPV } from '@/lib/finance/rent';

const rentSchedule = [0, 0, 5M, 5.15M, 5.3M, ...];
const npv = calculateRentNPV(rentSchedule, 0.08, 2028);
// Returns: NPV of rent schedule discounted at 8%
```

---

## Quality Gates Met

- ✅ All 3 rent models implemented
- ✅ Indexation logic correct for all frequencies
- ✅ Rent schedule generators functional
- ✅ Rent NPV calculator accurate
- ✅ Comprehensive tests (100% coverage)
- ✅ Zero linting errors
- ✅ TypeScript strict mode compliant
- ✅ Dependencies checked

---

## Test Coverage

- **Fixed+Escalation**: Base escalation, indexation, schedule generation
- **Revenue Share**: Percentage calculation, floor/cap application, schedule generation
- **Partner Model**: Investment calculation, yield indexation, schedule generation
- **NPV**: Zero handling, discounting, schedule filtering

---

## Next Steps: Week 5 Day 5

- Implement curriculum planning logic
- Create enrollment projections
- Calculate capacity utilization
- Implement tuition ladder
- Create revenue calculations

---

**Last Updated**: 2025-11-10

