/**
 * Decimal utilities tests
 */

import { describe, it, expect } from 'vitest';

import {
  roundCurrency,
  roundPercentage,
  roundRatio,
  equals,
  sum,
  product,
  safeDivide,
} from './decimal';
import { Decimal } from './decimal';

describe('roundCurrency', () => {
  it('should round to 2 decimal places', () => {
    expect(roundCurrency(123.456)).toBe(123.46);
    expect(roundCurrency(123.454)).toBe(123.45);
    expect(roundCurrency(123.455)).toBe(123.46); // Round half up
  });

  it('should handle large numbers', () => {
    expect(roundCurrency(1234567.89)).toBe(1234567.89);
    expect(roundCurrency(1234567.895)).toBe(1234567.9);
  });

  it('should handle zero', () => {
    expect(roundCurrency(0)).toBe(0);
  });

  it('should handle negative numbers', () => {
    expect(roundCurrency(-123.456)).toBe(-123.46);
  });
});

describe('roundPercentage', () => {
  it('should round to 4 decimal places', () => {
    expect(roundPercentage(0.123456)).toBe(0.1235);
    expect(roundPercentage(0.123454)).toBe(0.1235);
  });
});

describe('roundRatio', () => {
  it('should round to 2 decimal places', () => {
    expect(roundRatio(20.456)).toBe(20.46);
  });
});

describe('equals', () => {
  it('should return true for equal values', () => {
    expect(equals(100, 100)).toBe(true);
    expect(equals(100.01, 100.01)).toBe(true);
  });

  it('should return true within tolerance', () => {
    expect(equals(100, 100.005, 0.01)).toBe(true);
    expect(equals(100, 100.015, 0.01)).toBe(false);
  });

  it('should use default tolerance of 0.01', () => {
    expect(equals(100, 100.005)).toBe(true);
    expect(equals(100, 100.015)).toBe(false);
  });
});

describe('sum', () => {
  it('should sum array of numbers', () => {
    expect(sum([1, 2, 3]).toNumber()).toBe(6);
    expect(sum([100.5, 200.3, 300.2]).toNumber()).toBe(601);
  });

  it('should handle empty array', () => {
    expect(sum([]).toNumber()).toBe(0);
  });

  it('should handle Decimal values', () => {
    expect(sum([new Decimal(1), new Decimal(2), new Decimal(3)]).toNumber()).toBe(6);
  });
});

describe('product', () => {
  it('should multiply array of numbers', () => {
    expect(product([2, 3, 4]).toNumber()).toBe(24);
    expect(product([1.5, 2, 3]).toNumber()).toBe(9);
  });

  it('should return 1 for empty array', () => {
    expect(product([]).toNumber()).toBe(1);
  });
});

describe('safeDivide', () => {
  it('should divide correctly', () => {
    expect(safeDivide(10, 2).toNumber()).toBe(5);
    expect(safeDivide(100, 4).toNumber()).toBe(25);
  });

  it('should return 0 when dividing by zero', () => {
    expect(safeDivide(10, 0).toNumber()).toBe(0);
    expect(safeDivide(100, 0).toNumber()).toBe(0);
  });

  it('should handle Decimal values', () => {
    expect(safeDivide(new Decimal(10), new Decimal(2)).toNumber()).toBe(5);
  });
});

