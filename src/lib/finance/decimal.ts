/**
 * Decimal.js configuration and utilities
 * Financial precision utilities using Decimal.js
 */

import Decimal from 'decimal.js';

// Configure Decimal.js for financial calculations
Decimal.set({
  precision: 20, // High precision for intermediate calculations
  rounding: Decimal.ROUND_HALF_UP, // Standard financial rounding
  toExpNeg: -9,
  toExpPos: 9,
  maxE: 9e15,
  minE: -9e15,
});

export { Decimal };

/**
 * Round currency value to 2 decimal places
 * Use this for all monetary values at display time
 */
export function roundCurrency(value: Decimal.Value): number {
  return new Decimal(value).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber();
}

/**
 * Round percentage to 4 decimal places
 * Use this for rates and percentages
 */
export function roundPercentage(value: Decimal.Value): number {
  return new Decimal(value).toDecimalPlaces(4, Decimal.ROUND_HALF_UP).toNumber();
}

/**
 * Round ratio to 2 decimal places
 * Use this for ratios (e.g., student:teacher ratio)
 */
export function roundRatio(value: Decimal.Value): number {
  return new Decimal(value).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber();
}

/**
 * Check if two Decimal values are equal within tolerance
 */
export function equals(
  a: Decimal.Value,
  b: Decimal.Value,
  tolerance: Decimal.Value = 0.01
): boolean {
  const diff = new Decimal(a).minus(b).abs();
  return diff.lessThanOrEqualTo(tolerance);
}

/**
 * Sum array of Decimal values
 */
export function sum(values: Decimal.Value[]): Decimal {
  return values.reduce(
    (acc, val) => acc.plus(new Decimal(val)),
    new Decimal(0)
  );
}

/**
 * Multiply array of Decimal values
 */
export function product(values: Decimal.Value[]): Decimal {
  if (values.length === 0) {
    return new Decimal(1);
  }
  return values.reduce(
    (acc, val) => acc.times(new Decimal(val)),
    new Decimal(1)
  );
}

/**
 * Safe division (returns 0 if divisor is 0)
 */
export function safeDivide(
  dividend: Decimal.Value,
  divisor: Decimal.Value
): Decimal {
  const divisorDecimal = new Decimal(divisor);
  if (divisorDecimal.isZero()) {
    return new Decimal(0);
  }
  return new Decimal(dividend).dividedBy(divisorDecimal);
}

