/**
 * Net Present Value (NPV) calculations
 * Financial discounting utilities
 */

import { Decimal, roundCurrency } from './decimal';

/**
 * Calculate NPV of a cash flow series
 * 
 * @param cashFlows - Array of cash flows (can be positive or negative)
 * @param discountRate - Annual discount rate (e.g., 0.08 for 8%)
 * @param startYear - First year of cash flows (e.g., 2028)
 * @returns NPV rounded to 2 decimal places
 * 
 * @example
 * ```typescript
 * const npv = calculateNPV([5000000, 5150000, 5304500], 0.08, 2028);
 * // Returns: 13,245,678.90
 * ```
 */
export function calculateNPV(
  cashFlows: number[],
  discountRate: number,
  startYear: number
): number {
  if (cashFlows.length === 0) {
    return 0;
  }

  if (discountRate < 0) {
    throw new Error('Discount rate must be non-negative');
  }

  let npv = new Decimal(0);
  const baseYear = startYear;

  for (let i = 0; i < cashFlows.length; i++) {
    const year = baseYear + i;
    const yearsFromStart = year - baseYear;

    // NPV formula: CF / (1 + r)^t
    const presentValue = new Decimal(cashFlows[i]).dividedBy(
      new Decimal(1 + discountRate).pow(yearsFromStart)
    );

    npv = npv.plus(presentValue);
  }

  return roundCurrency(npv);
}

/**
 * Calculate present value of a single future cash flow
 * 
 * @param futureValue - Future cash flow amount
 * @param discountRate - Annual discount rate
 * @param yearsFromNow - Number of years in the future
 * @returns Present value rounded to 2 decimal places
 */
export function calculatePV(
  futureValue: number,
  discountRate: number,
  yearsFromNow: number
): number {
  if (discountRate < 0) {
    throw new Error('Discount rate must be non-negative');
  }

  if (yearsFromNow < 0) {
    throw new Error('Years from now must be non-negative');
  }

  const pv = new Decimal(futureValue).dividedBy(
    new Decimal(1 + discountRate).pow(yearsFromNow)
  );

  return roundCurrency(pv);
}

/**
 * Calculate future value of a present cash flow
 * 
 * @param presentValue - Present cash flow amount
 * @param discountRate - Annual discount rate
 * @param yearsFromNow - Number of years in the future
 * @returns Future value rounded to 2 decimal places
 */
export function calculateFV(
  presentValue: number,
  discountRate: number,
  yearsFromNow: number
): number {
  if (discountRate < 0) {
    throw new Error('Discount rate must be non-negative');
  }

  if (yearsFromNow < 0) {
    throw new Error('Years from now must be non-negative');
  }

  const fv = new Decimal(presentValue).times(
    new Decimal(1 + discountRate).pow(yearsFromNow)
  );

  return roundCurrency(fv);
}

