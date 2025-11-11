/**
 * Curriculum planning and enrollment calculations
 * Handles curriculum-specific capacity, ramp profiles, and enrollment projections
 */

import {
  MODEL_START_YEAR,
  MODEL_END_YEAR,
  RELOCATION_YEAR,
  RAMP_YEARS,
} from './constants';
import { calculateCpiAdjustedAmount, type CpiFrequency } from './cpi';
import { Decimal, roundCurrency } from './decimal';

export interface CurriculumRampStep {
  yearOffset: number; // Years from launch year (0, 1, 2, 3, 4)
  utilisation: number; // 0.0 to 1.0 (e.g., 0.2 = 20%)
}

export interface CurriculumConfig {
  id: string;
  name: string;
  capacity: number; // Maximum capacity
  launchYear: number; // Year curriculum starts (typically 2028)
  rampSteps: CurriculumRampStep[]; // Ramp profile (e.g., [0.2, 0.4, 0.6, 0.8, 1.0])
  tuitionBase: number; // Base tuition per student
  cpiRate: number; // Annual CPI rate
  cpiFrequency: CpiFrequency; // CPI application frequency
  cpiBaseYear: number; // Base year for CPI (typically launch year)
}

export interface EnrollmentProjection {
  year: number;
  enrollment: number; // Number of students
  capacity: number; // Maximum capacity
  utilisation: number; // Enrollment / Capacity (0.0 to 1.0)
}

export interface CurriculumEnrollmentResult {
  curriculumId: string;
  curriculumName: string;
  projections: EnrollmentProjection[];
}

/**
 * Calculate enrollment for a curriculum in a given year
 * 
 * @param config - Curriculum configuration
 * @param year - Target year
 * @param rampOverrides - Optional ramp overrides by year
 * @returns Enrollment projection for the year
 */
export function calculateCurriculumEnrollment(
  config: CurriculumConfig,
  year: number,
  rampOverrides?: Map<number, number> // year -> utilisation override
): EnrollmentProjection {
  if (year < config.launchYear) {
    // Before launch: no enrollment
    return {
      year,
      enrollment: 0,
      capacity: config.capacity,
      utilisation: 0,
    };
  }

  const yearsFromLaunch = year - config.launchYear;

  // Check for ramp override
  if (rampOverrides?.has(year)) {
    const overrideUtilisation = rampOverrides.get(year)!;
    const enrollment = Math.floor(config.capacity * overrideUtilisation);
    return {
      year,
      enrollment,
      capacity: config.capacity,
      utilisation: overrideUtilisation,
    };
  }

  // Find utilisation from ramp steps
  let utilisation = 0;

  if (yearsFromLaunch < config.rampSteps.length) {
    // Within ramp period: use ramp step
    const rampStep = config.rampSteps[yearsFromLaunch];
    utilisation = rampStep.utilisation;
  } else {
    // After ramp: use 100% (last ramp step should be 1.0)
    const lastStep = config.rampSteps[config.rampSteps.length - 1];
    utilisation = lastStep.utilisation;
  }

  // Calculate enrollment
  const enrollment = Math.floor(config.capacity * utilisation);

  return {
    year,
    enrollment,
    capacity: config.capacity,
    utilisation,
  };
}

/**
 * Generate enrollment projections for a curriculum
 * 
 * @param config - Curriculum configuration
 * @param startYear - Start year for projections
 * @param endYear - End year for projections (inclusive)
 * @param rampOverrides - Optional ramp overrides by year
 * @returns Array of enrollment projections
 */
export function generateCurriculumEnrollmentProjections(
  config: CurriculumConfig,
  startYear: number = MODEL_START_YEAR,
  endYear: number = MODEL_END_YEAR,
  rampOverrides?: Map<number, number>
): EnrollmentProjection[] {
  const projections: EnrollmentProjection[] = [];

  for (let year = startYear; year <= endYear; year++) {
    const projection = calculateCurriculumEnrollment(
      config,
      year,
      rampOverrides
    );
    projections.push(projection);
  }

  return projections;
}

/**
 * Calculate overall capacity utilization
 * 
 * @param curriculumEnrollments - Enrollment projections per curriculum
 * @param year - Target year
 * @returns Overall utilization (total enrollment / total capacity)
 */
export function calculateOverallUtilization(
  curriculumEnrollments: CurriculumEnrollmentResult[],
  year: number
): number {
  let totalEnrollment = 0;
  let totalCapacity = 0;

  for (const curriculum of curriculumEnrollments) {
    const projection = curriculum.projections.find((p) => p.year === year);
    if (projection) {
      totalEnrollment += projection.enrollment;
      totalCapacity += projection.capacity;
    }
  }

  if (totalCapacity === 0) {
    return 0;
  }

  return totalEnrollment / totalCapacity;
}

/**
 * Calculate tuition for a curriculum in a given year
 * 
 * @param config - Curriculum configuration
 * @param year - Target year
 * @param tuitionOverrides - Optional tuition overrides by year
 * @returns Tuition per student rounded to 2 decimal places
 */
export function calculateCurriculumTuition(
  config: CurriculumConfig,
  year: number,
  tuitionOverrides?: Map<number, number> // year -> tuition override
): number {
  // Check for override first
  if (tuitionOverrides?.has(year)) {
    return roundCurrency(tuitionOverrides.get(year)!);
  }

  // Calculate CPI-adjusted tuition
  return calculateCpiAdjustedAmount(
    config.tuitionBase,
    config.cpiRate,
    config.cpiBaseYear,
    year,
    config.cpiFrequency
  );
}

/**
 * Generate tuition ladder for a curriculum
 * 
 * @param config - Curriculum configuration
 * @param startYear - Start year for ladder
 * @param endYear - End year for ladder (inclusive)
 * @param tuitionOverrides - Optional tuition overrides by year
 * @returns Array of tuition amounts by year
 */
export function generateTuitionLadder(
  config: CurriculumConfig,
  startYear: number = MODEL_START_YEAR,
  endYear: number = MODEL_END_YEAR,
  tuitionOverrides?: Map<number, number>
): number[] {
  const ladder: number[] = [];

  for (let year = startYear; year <= endYear; year++) {
    const tuition = calculateCurriculumTuition(config, year, tuitionOverrides);
    ladder.push(tuition);
  }

  return ladder;
}

/**
 * Calculate revenue for a curriculum in a given year
 * 
 * @param config - Curriculum configuration
 * @param year - Target year
 * @param enrollment - Number of students enrolled
 * @param tuitionOverrides - Optional tuition overrides by year
 * @returns Revenue rounded to 2 decimal places
 */
export function calculateCurriculumRevenue(
  config: CurriculumConfig,
  year: number,
  enrollment: number,
  tuitionOverrides?: Map<number, number>
): number {
  if (enrollment <= 0) {
    return 0;
  }

  const tuition = calculateCurriculumTuition(config, year, tuitionOverrides);
  const revenue = new Decimal(tuition).times(enrollment);
  return roundCurrency(revenue);
}

/**
 * Calculate total revenue across all curricula for a given year
 * 
 * @param curriculumEnrollments - Enrollment projections per curriculum
 * @param curriculumConfigs - Curriculum configurations (indexed by curriculumId)
 * @param year - Target year
 * @param tuitionOverridesMap - Optional tuition overrides (curriculumId -> year -> tuition)
 * @returns Total revenue rounded to 2 decimal places
 */
export function calculateTotalRevenue(
  curriculumEnrollments: CurriculumEnrollmentResult[],
  curriculumConfigs: Map<string, CurriculumConfig>,
  year: number,
  tuitionOverridesMap?: Map<string, Map<number, number>>
): number {
  let totalRevenue = new Decimal(0);

  for (const curriculumEnrollment of curriculumEnrollments) {
    const config = curriculumConfigs.get(curriculumEnrollment.curriculumId);
    if (!config) {
      continue;
    }

    const projection = curriculumEnrollment.projections.find(
      (p) => p.year === year
    );
    if (!projection) {
      continue;
    }

    const tuitionOverrides = tuitionOverridesMap?.get(
      curriculumEnrollment.curriculumId
    );
    const revenue = calculateCurriculumRevenue(
      config,
      year,
      projection.enrollment,
      tuitionOverrides
    );

    totalRevenue = totalRevenue.plus(revenue);
  }

  return roundCurrency(totalRevenue);
}

/**
 * Generate revenue schedule across all curricula
 * 
 * @param curriculumEnrollments - Enrollment projections per curriculum
 * @param curriculumConfigs - Curriculum configurations
 * @param startYear - Start year for schedule
 * @param endYear - End year for schedule (inclusive)
 * @param tuitionOverridesMap - Optional tuition overrides
 * @returns Array of total revenue by year
 */
export function generateRevenueSchedule(
  curriculumEnrollments: CurriculumEnrollmentResult[],
  curriculumConfigs: Map<string, CurriculumConfig>,
  startYear: number = MODEL_START_YEAR,
  endYear: number = MODEL_END_YEAR,
  tuitionOverridesMap?: Map<string, Map<number, number>>
): number[] {
  const schedule: number[] = [];

  for (let year = startYear; year <= endYear; year++) {
    const revenue = calculateTotalRevenue(
      curriculumEnrollments,
      curriculumConfigs,
      year,
      tuitionOverridesMap
    );
    schedule.push(revenue);
  }

  return schedule;
}

