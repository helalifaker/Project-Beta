/**
 * CPI (Consumer Price Index) application utilities
 * Handles CPI-based increases with various frequencies
 */

import { Decimal, roundCurrency } from './decimal';

export type CpiFrequency = 'ANNUAL' | 'EVERY_2_YEARS' | 'EVERY_3_YEARS';

/**
 * Calculate CPI-adjusted amount
 * 
 * @param baseAmount - Base amount to adjust
 * @param cpiRate - Annual CPI rate (e.g., 0.025 for 2.5%)
 * @param baseYear - Base year for CPI calculation
 * @param targetYear - Target year
 * @param frequency - CPI application frequency (default: ANNUAL)
 * @returns CPI-adjusted amount rounded to 2 decimal places
 * 
 * @example
 * ```typescript
 * // Annual CPI: 1000 × (1.025)^5 = 1,131.41
 * const amount = calculateCpiAdjustedAmount(1000, 0.025, 2023, 2028, 'ANNUAL');
 * 
 * // Every 2 years: 1000 × (1.025)^2 = 1,050.63 (applied in 2025, 2027, 2029...)
 * const amount = calculateCpiAdjustedAmount(1000, 0.025, 2023, 2025, 'EVERY_2_YEARS');
 * ```
 */
export function calculateCpiAdjustedAmount(
  baseAmount: number,
  cpiRate: number,
  baseYear: number,
  targetYear: number,
  frequency: CpiFrequency = 'ANNUAL'
): number {
  if (cpiRate < 0) {
    throw new Error('CPI rate must be non-negative');
  }

  if (targetYear < baseYear) {
    throw new Error('Target year must be >= base year');
  }

  const yearsDiff = targetYear - baseYear;

  if (yearsDiff === 0) {
    return roundCurrency(baseAmount);
  }

  let periodsElapsed: number;

  switch (frequency) {
    case 'ANNUAL':
      // Apply CPI every year
      periodsElapsed = yearsDiff;
      break;
    case 'EVERY_2_YEARS':
      // Apply CPI every 2 years
      // Count periods: (2025-2023)/2 = 1, (2027-2023)/2 = 2, etc.
      periodsElapsed = Math.floor(yearsDiff / 2);
      break;
    case 'EVERY_3_YEARS':
      // Apply CPI every 3 years
      // Count periods: (2026-2023)/3 = 1, (2029-2023)/3 = 2, etc.
      periodsElapsed = Math.floor(yearsDiff / 3);
      break;
    default:
      periodsElapsed = yearsDiff;
  }

  const adjustedAmount = new Decimal(baseAmount).times(
    new Decimal(1 + cpiRate).pow(periodsElapsed)
  );

  return roundCurrency(adjustedAmount);
}

/**
 * Check if CPI should be applied in a given year
 * 
 * @param year - Current year
 * @param baseYear - Base year for CPI
 * @param frequency - CPI frequency
 * @returns True if CPI should be applied this year
 */
export function shouldApplyCpi(
  year: number,
  baseYear: number,
  frequency: CpiFrequency
): boolean {
  const yearsDiff = year - baseYear;

  if (yearsDiff <= 0) {
    return false;
  }

  switch (frequency) {
    case 'ANNUAL':
      // Apply every year after base year
      return true;
    case 'EVERY_2_YEARS':
      // Apply in years: baseYear+2, baseYear+4, baseYear+6, ...
      return yearsDiff % 2 === 0;
    case 'EVERY_3_YEARS':
      // Apply in years: baseYear+3, baseYear+6, baseYear+9, ...
      return yearsDiff % 3 === 0;
    default:
      return false;
  }
}

/**
 * Generate CPI-adjusted schedule
 * 
 * @param baseAmount - Base amount
 * @param cpiRate - Annual CPI rate
 * @param baseYear - Base year
 * @param startYear - Start year for schedule
 * @param endYear - End year (inclusive)
 * @param frequency - CPI frequency
 * @returns Array of CPI-adjusted amounts by year
 */
export function generateCpiSchedule(
  baseAmount: number,
  cpiRate: number,
  baseYear: number,
  startYear: number,
  endYear: number,
  frequency: CpiFrequency = 'ANNUAL'
): number[] {
  const schedule: number[] = [];

  for (let year = startYear; year <= endYear; year++) {
    const amount = calculateCpiAdjustedAmount(
      baseAmount,
      cpiRate,
      baseYear,
      year,
      frequency
    );
    schedule.push(amount);
  }

  return schedule;
}

