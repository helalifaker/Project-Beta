/**
 * Staffing cost calculations
 * Ratio-based staffing with separate teacher and non-teacher costs
 */

import { Decimal, roundCurrency } from './decimal';
import { calculateEscalatedAmount } from './escalation';
import { MODEL_START_YEAR, MODEL_END_YEAR } from './constants';

export interface StaffingConfig {
  teacherRatio: number; // Students per teacher (e.g., 20)
  nonTeacherRatio: number; // Students per non-teacher (e.g., 50)
  teacherAvgCost: number; // Average teacher salary
  nonTeacherAvgCost: number; // Average non-teacher salary
  teacherEscalationRate: number; // Annual escalation rate
  nonTeacherEscalationRate: number; // Annual escalation rate
  baseYear: number; // Base year for escalation (typically 2023)
}

export interface StaffingResult {
  year: number;
  totalStudents: number;
  teacherHeadcount: number;
  nonTeacherHeadcount: number;
  teacherCost: number;
  nonTeacherCost: number;
  totalCost: number;
}

/**
 * Calculate staffing costs for a given year
 * 
 * @param config - Staffing configuration
 * @param year - Target year
 * @param totalStudents - Total number of students across all curricula
 * @returns Staffing result for the year
 */
export function calculateStaffingCost(
  config: StaffingConfig,
  year: number,
  totalStudents: number
): StaffingResult {
  // Calculate headcount (always round up)
  const teacherHeadcount = Math.ceil(totalStudents / config.teacherRatio);
  const nonTeacherHeadcount = Math.ceil(totalStudents / config.nonTeacherRatio);

  // Calculate years from base year
  const yearsFromBase = year - config.baseYear;

  // Calculate escalated costs
  const teacherCost = roundCurrency(
    new Decimal(teacherHeadcount)
      .times(
        calculateEscalatedAmount(
          config.teacherAvgCost,
          config.teacherEscalationRate,
          yearsFromBase,
          'ANNUAL'
        )
      )
  );

  const nonTeacherCost = roundCurrency(
    new Decimal(nonTeacherHeadcount)
      .times(
        calculateEscalatedAmount(
          config.nonTeacherAvgCost,
          config.nonTeacherEscalationRate,
          yearsFromBase,
          'ANNUAL'
        )
      )
  );

  const totalCost = roundCurrency(
    sum([teacherCost, nonTeacherCost])
  );

  return {
    year,
    totalStudents,
    teacherHeadcount,
    nonTeacherHeadcount,
    teacherCost,
    nonTeacherCost,
    totalCost,
  };
}

/**
 * Generate staffing cost schedule
 * 
 * @param config - Staffing configuration
 * @param studentSchedule - Array of total students by year
 * @param startYear - Start year for schedule
 * @param endYear - End year for schedule (inclusive)
 * @returns Array of staffing results by year
 */
export function generateStaffingSchedule(
  config: StaffingConfig,
  studentSchedule: number[],
  startYear: number = MODEL_START_YEAR,
  endYear: number = MODEL_END_YEAR
): StaffingResult[] {
  const schedule: StaffingResult[] = [];
  const totalYears = endYear - startYear + 1;

  for (let i = 0; i < totalYears; i++) {
    const year = startYear + i;
    const totalStudents = studentSchedule[i] || 0;
    const result = calculateStaffingCost(config, year, totalStudents);
    schedule.push(result);
  }

  return schedule;
}

// Import sum
import { sum } from './decimal';

