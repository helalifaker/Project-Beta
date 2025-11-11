/**
 * NPV calculation tests
 */

import { describe, it, expect } from 'vitest';
import { calculateNPV, calculatePV, calculateFV } from './npv';

describe('calculateNPV', () => {
  it('should calculate NPV correctly with 8% discount rate', () => {
    const cashFlows = [5_000_000, 5_150_000, 5_304_500];
    const discountRate = 0.08;
    const startYear = 2028;

    const npv = calculateNPV(cashFlows, discountRate, startYear);

    // Expected: 5M/1.08^0 + 5.15M/1.08^1 + 5.3045M/1.08^2
    // = 5M + 4.7685M + 4.5478M ≈ 14.3163M
    expect(npv).toBeCloseTo(14_316_272.29, 2);
  });

  it('should handle zero discount rate', () => {
    const cashFlows = [5_000_000, 5_000_000, 5_000_000];
    const discountRate = 0;
    const startYear = 2028;

    const npv = calculateNPV(cashFlows, discountRate, startYear);

    expect(npv).toBe(15_000_000);
  });

  it('should throw error for negative discount rate', () => {
    const cashFlows = [5_000_000];
    const discountRate = -0.08;
    const startYear = 2028;

    expect(() => calculateNPV(cashFlows, discountRate, startYear)).toThrow(
      'Discount rate must be non-negative'
    );
  });

  it('should return 0 for empty cash flows', () => {
    const npv = calculateNPV([], 0.08, 2028);
    expect(npv).toBe(0);
  });

  it('should handle single cash flow', () => {
    const npv = calculateNPV([5_000_000], 0.08, 2028);
    expect(npv).toBe(5_000_000);
  });
});

describe('calculatePV', () => {
  it('should calculate present value correctly', () => {
    const pv = calculatePV(1000, 0.08, 5);
    // PV = 1000 / (1.08)^5 = 680.58
    expect(pv).toBeCloseTo(680.58, 2);
  });

  it('should return same value for 0 years', () => {
    const pv = calculatePV(1000, 0.08, 0);
    expect(pv).toBe(1000);
  });

  it('should throw error for negative discount rate', () => {
    expect(() => calculatePV(1000, -0.08, 5)).toThrow(
      'Discount rate must be non-negative'
    );
  });
});

describe('calculateFV', () => {
  it('should calculate future value correctly', () => {
    const fv = calculateFV(1000, 0.08, 5);
    // FV = 1000 × (1.08)^5 = 1469.33
    expect(fv).toBeCloseTo(1469.33, 2);
  });

  it('should return same value for 0 years', () => {
    const fv = calculateFV(1000, 0.08, 0);
    expect(fv).toBe(1000);
  });
});

