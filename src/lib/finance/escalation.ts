/**
 * Escalation calculation utilities
 * Handles annual escalation with various frequencies
 */

import { Decimal, roundCurrency } from './decimal';

export type EscalationFrequency = 'ANNUAL' | 'EVERY_2_YEARS' | 'EVERY_3_YEARS';

/**
 * Calculate escalated amount
 * 
 * @param baseAmount - Base amount to escalate
 * @param escalationRate - Annual escalation rate (e.g., 0.03 for 3%)
 * @param yearsFromStart - Number of years from start
 * @param frequency - Escalation frequency (default: ANNUAL)
 * @returns Escalated amount rounded to 2 decimal places
 * 
 * @example
 * ```typescript
 * // Annual escalation: 5M × (1.03)^5 = 5,796,370.37
 * const amount = calculateEscalatedAmount(5000000, 0.03, 5, 'ANNUAL');
 * 
 * // Every 2 years: 5M × (1.03)^2 = 5,304,500.00 (applied in years 2, 4, 6...)
 * const amount = calculateEscalatedAmount(5000000, 0.03, 2, 'EVERY_2_YEARS');
 * ```
 */
export function calculateEscalatedAmount(
  baseAmount: number,
  escalationRate: number,
  yearsFromStart: number,
  frequency: EscalationFrequency = 'ANNUAL'
): number {
  if (escalationRate < 0) {
    throw new Error('Escalation rate must be non-negative');
  }

  if (yearsFromStart < 0) {
    throw new Error('Years from start must be non-negative');
  }

  let periodsElapsed: number;

  switch (frequency) {
    case 'ANNUAL':
      periodsElapsed = yearsFromStart;
      break;
    case 'EVERY_2_YEARS':
      // Apply escalation every 2 years
      // Year 0: no escalation, Year 2: 1 period, Year 4: 2 periods, etc.
      periodsElapsed = Math.floor(yearsFromStart / 2);
      break;
    case 'EVERY_3_YEARS':
      // Apply escalation every 3 years
      // Year 0: no escalation, Year 3: 1 period, Year 6: 2 periods, etc.
      periodsElapsed = Math.floor(yearsFromStart / 3);
      break;
    default:
      periodsElapsed = yearsFromStart;
  }

  const escalatedAmount = new Decimal(baseAmount).times(
    new Decimal(1 + escalationRate).pow(periodsElapsed)
  );

  return roundCurrency(escalatedAmount);
}

/**
 * Check if escalation should be applied in a given year
 * 
 * @param year - Current year
 * @param startYear - Start year for escalation
 * @param frequency - Escalation frequency
 * @returns True if escalation should be applied this year
 */
export function shouldApplyEscalation(
  year: number,
  startYear: number,
  frequency: EscalationFrequency
): boolean {
  const yearsFromStart = year - startYear;

  if (yearsFromStart < 0) {
    return false;
  }

  switch (frequency) {
    case 'ANNUAL':
      // Apply every year after start
      return yearsFromStart > 0;
    case 'EVERY_2_YEARS':
      // Apply in years: startYear+2, startYear+4, startYear+6, ...
      return yearsFromStart > 0 && yearsFromStart % 2 === 0;
    case 'EVERY_3_YEARS':
      // Apply in years: startYear+3, startYear+6, startYear+9, ...
      return yearsFromStart > 0 && yearsFromStart % 3 === 0;
    default:
      return false;
  }
}

/**
 * Generate escalation schedule
 * 
 * @param baseAmount - Base amount
 * @param escalationRate - Annual escalation rate
 * @param startYear - Start year
 * @param endYear - End year (inclusive)
 * @param frequency - Escalation frequency
 * @returns Array of amounts by year
 */
export function generateEscalationSchedule(
  baseAmount: number,
  escalationRate: number,
  startYear: number,
  endYear: number,
  frequency: EscalationFrequency = 'ANNUAL'
): number[] {
  const schedule: number[] = [];

  for (let year = startYear; year <= endYear; year++) {
    const yearsFromStart = year - startYear;
    const amount = calculateEscalatedAmount(
      baseAmount,
      escalationRate,
      yearsFromStart,
      frequency
    );
    schedule.push(amount);
  }

  return schedule;
}

