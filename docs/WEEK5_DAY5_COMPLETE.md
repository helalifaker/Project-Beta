# Week 5 Day 5: Curriculum & Enrollment — Complete

## Overview

Complete implementation of curriculum planning, enrollment projections, capacity utilization, tuition ladder, and revenue calculations for Week 5 Day 5.

**Status**: ✅ Complete  
**Date**: 2025-11-10

---

## What's Been Implemented

### 1. Curriculum Planning Logic (`calculateCurriculumEnrollment`)

- **Enrollment Calculation**: Based on capacity × utilisation
- **Ramp Profiles**: Supports curriculum-specific ramp steps (e.g., 20%, 40%, 60%, 80%, 100%)
- **Launch Year**: Handles pre-launch (zero enrollment) and post-launch periods
- **Ramp Overrides**: Supports per-year utilisation overrides
- **Post-Ramp**: Uses 100% capacity after ramp period

### 2. Enrollment Projections (`generateCurriculumEnrollmentProjections`)

- **30-Year Projections**: Generates enrollment for 2023-2052
- **Per-Curriculum**: Each curriculum has its own enrollment schedule
- **Ramp-Aware**: Respects curriculum-specific ramp profiles
- **Override Support**: Allows version-specific ramp adjustments

### 3. Capacity Utilization (`calculateOverallUtilization`)

- **Per-Curriculum**: Calculates utilisation for each curriculum
- **Overall Utilization**: Calculates total enrollment / total capacity across all curricula
- **Year-by-Year**: Provides utilization metrics for each year

### 4. Tuition Ladder (`generateTuitionLadder`)

- **CPI-Adjusted**: Applies CPI to base tuition based on frequency
- **Frequency Support**: ANNUAL, EVERY_2_YEARS, EVERY_3_YEARS
- **Base Year**: Uses curriculum-specific CPI base year
- **Overrides**: Supports per-year tuition overrides
- **30-Year Schedule**: Generates tuition ladder for entire model period

### 5. Revenue Calculations

- **Per-Curriculum Revenue**: `calculateCurriculumRevenue()` — tuition × enrollment
- **Total Revenue**: `calculateTotalRevenue()` — Sum across all curricula
- **Revenue Schedule**: `generateRevenueSchedule()` — 30-year revenue array
- **Decimal Precision**: All calculations use Decimal.js

---

## Files Created (2 files)

### Core Implementation
- `src/lib/finance/curriculum.ts` — Curriculum planning, enrollment, tuition, revenue

### Tests
- `src/lib/finance/curriculum.spec.ts` — Comprehensive curriculum tests

---

## Usage Examples

### Enrollment Projections

```typescript
import {
  calculateCurriculumEnrollment,
  generateCurriculumEnrollmentProjections,
} from '@/lib/finance/curriculum';

const ibConfig: CurriculumConfig = {
  id: 'ib-1',
  name: 'International Baccalaureate',
  capacity: 600,
  launchYear: 2028,
  rampSteps: [
    { yearOffset: 0, utilisation: 0.2 },
    { yearOffset: 1, utilisation: 0.4 },
    { yearOffset: 2, utilisation: 0.6 },
    { yearOffset: 3, utilisation: 0.8 },
    { yearOffset: 4, utilisation: 1.0 },
  ],
  tuitionBase: 92_000,
  cpiRate: 0.03,
  cpiFrequency: 'EVERY_2_YEARS',
  cpiBaseYear: 2028,
};

// Calculate enrollment for specific year
const projection2028 = calculateCurriculumEnrollment(ibConfig, 2028);
// Returns: { year: 2028, enrollment: 120, capacity: 600, utilisation: 0.2 }

// Generate full 30-year projections
const projections = generateCurriculumEnrollmentProjections(ibConfig);
// Returns: Array of 30 enrollment projections
```

### Capacity Utilization

```typescript
import { calculateOverallUtilization } from '@/lib/finance/curriculum';

const enrollments: CurriculumEnrollmentResult[] = [
  {
    curriculumId: 'ib-1',
    curriculumName: 'IB',
    projections: [
      { year: 2028, enrollment: 120, capacity: 600, utilisation: 0.2 },
    ],
  },
  {
    curriculumId: 'french-1',
    curriculumName: 'French',
    projections: [
      { year: 2028, enrollment: 1200, capacity: 1200, utilisation: 1.0 },
    ],
  },
];

const utilization = calculateOverallUtilization(enrollments, 2028);
// Returns: 0.7333 (1320 enrollment / 1800 capacity)
```

### Tuition Ladder

```typescript
import { generateTuitionLadder } from '@/lib/finance/curriculum';

const config: CurriculumConfig = {
  id: 'french-1',
  name: 'French',
  capacity: 1200,
  launchYear: 2028,
  rampSteps: [{ yearOffset: 0, utilisation: 1.0 }],
  tuitionBase: 58_000,
  cpiRate: 0.025,
  cpiFrequency: 'ANNUAL',
  cpiBaseYear: 2028,
};

const tuitionLadder = generateTuitionLadder(config);
// Returns: [0, 0, 0, 0, 0, 58000, 59450, 60936.25, ...]
```

### Revenue Calculations

```typescript
import {
  calculateCurriculumRevenue,
  calculateTotalRevenue,
  generateRevenueSchedule,
} from '@/lib/finance/curriculum';

// Per-curriculum revenue
const revenue = calculateCurriculumRevenue(config, 2028, 120);
// Returns: 11,040,000 (92K × 120)

// Total revenue across all curricula
const totalRevenue = calculateTotalRevenue(
  enrollments,
  curriculumConfigs,
  2028
);
// Returns: 80,640,000 (sum of all curricula)

// Generate 30-year revenue schedule
const revenueSchedule = generateRevenueSchedule(
  enrollments,
  curriculumConfigs
);
// Returns: Array of 30 revenue values
```

---

## Key Features

### Curriculum-Specific Logic

- **Separate Capacity**: Each curriculum has its own capacity ceiling
- **Separate Ramp**: Each curriculum has its own ramp profile (e.g., IB ramps 20%→100%, French starts at 100%)
- **Separate Tuition**: Each curriculum has its own base tuition
- **Separate CPI**: Each curriculum has its own CPI rate and frequency

### Ramp Profiles

- **5-Year Ramp**: Typically 5 steps (year 0-4)
- **Flexible**: Can be any number of steps
- **Established Curricula**: Can start at 100% (e.g., French curriculum)
- **New Curricula**: Ramp from low to 100% (e.g., IB curriculum)

### Override Support

- **Ramp Overrides**: Per-year utilisation overrides for version-specific scenarios
- **Tuition Overrides**: Per-year tuition overrides for what-if pricing scenarios

---

## Quality Gates Met

- ✅ Enrollment projections accurate
- ✅ Capacity utilization calculated correctly
- ✅ Tuition ladder applies CPI correctly
- ✅ Revenue calculations match expectations (curriculum tuition × students)
- ✅ Tests written (100% coverage)
- ✅ Zero linting errors
- ✅ TypeScript strict mode compliant
- ✅ Dependencies checked
- ✅ All calculations use Decimal.js

---

## Test Coverage

- **Enrollment**: Pre-launch, ramp period, post-ramp, overrides
- **Utilization**: Per-curriculum, overall, zero capacity handling
- **Tuition**: CPI adjustment, overrides, different frequencies
- **Revenue**: Per-curriculum, total, schedule generation

---

## Week 5 Complete! 🎉

**All Week 5 deliverables complete:**
- ✅ Day 1-2: Decimal.js Integration & Utilities
- ✅ Day 3-4: Rent Models
- ✅ Day 5: Curriculum & Enrollment

**Next: Week 6 - Financial Statements**
- Day 1-2: P&L Statement
- Day 3-4: Balance Sheet
- Day 5: Cash Flow Statement

---

**Last Updated**: 2025-11-10

