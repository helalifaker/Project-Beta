/**
 * CPI calculation tests
 */

import { describe, it, expect } from 'vitest';

import {
  calculateCpiAdjustedAmount,
  shouldApplyCpi,
  generateCpiSchedule,
} from './cpi';

describe('calculateCpiAdjustedAmount', () => {
  it('should calculate annual CPI correctly', () => {
    const amount = calculateCpiAdjustedAmount(1000, 0.025, 2023, 2028, 'ANNUAL');
    // 1000 × (1.025)^5 = 1,131.41
    expect(amount).toBeCloseTo(1131.41, 2);
  });

  it('should calculate every 2 years CPI correctly', () => {
    const amount = calculateCpiAdjustedAmount(1000, 0.025, 2023, 2025, 'EVERY_2_YEARS');
    // 1000 × (1.025)^1 = 1,025.00 (one period in 2 years)
    expect(amount).toBeCloseTo(1025, 2);
  });

  it('should calculate every 3 years CPI correctly', () => {
    const amount = calculateCpiAdjustedAmount(1000, 0.025, 2023, 2026, 'EVERY_3_YEARS');
    // 1000 × (1.025)^1 = 1,025.00 (one period in 3 years)
    expect(amount).toBeCloseTo(1025, 2);
  });

  it('should return base amount for same year', () => {
    const amount = calculateCpiAdjustedAmount(1000, 0.025, 2023, 2023, 'ANNUAL');
    expect(amount).toBe(1000);
  });

  it('should throw error for negative CPI rate', () => {
    expect(() =>
      calculateCpiAdjustedAmount(1000, -0.01, 2023, 2028, 'ANNUAL')
    ).toThrow('CPI rate must be non-negative');
  });

  it('should throw error for target year < base year', () => {
    expect(() =>
      calculateCpiAdjustedAmount(1000, 0.025, 2023, 2022, 'ANNUAL')
    ).toThrow('Target year must be >= base year');
  });
});

describe('shouldApplyCpi', () => {
  it('should apply annual CPI every year after base', () => {
    expect(shouldApplyCpi(2024, 2023, 'ANNUAL')).toBe(true);
    expect(shouldApplyCpi(2025, 2023, 'ANNUAL')).toBe(true);
    expect(shouldApplyCpi(2023, 2023, 'ANNUAL')).toBe(false);
  });

  it('should apply every 2 years CPI correctly', () => {
    expect(shouldApplyCpi(2025, 2023, 'EVERY_2_YEARS')).toBe(true); // +2 years
    expect(shouldApplyCpi(2027, 2023, 'EVERY_2_YEARS')).toBe(true); // +4 years
    expect(shouldApplyCpi(2024, 2023, 'EVERY_2_YEARS')).toBe(false); // +1 year
    expect(shouldApplyCpi(2026, 2023, 'EVERY_2_YEARS')).toBe(false); // +3 years
  });

  it('should apply every 3 years CPI correctly', () => {
    expect(shouldApplyCpi(2026, 2023, 'EVERY_3_YEARS')).toBe(true); // +3 years
    expect(shouldApplyCpi(2029, 2023, 'EVERY_3_YEARS')).toBe(true); // +6 years
    expect(shouldApplyCpi(2024, 2023, 'EVERY_3_YEARS')).toBe(false); // +1 year
    expect(shouldApplyCpi(2025, 2023, 'EVERY_3_YEARS')).toBe(false); // +2 years
  });

  it('should return false for invalid frequency', () => {
    // @ts-expect-error - Testing invalid frequency
    expect(shouldApplyCpi(2024, 2023, 'INVALID')).toBe(false);
  });
});

describe('generateCpiSchedule', () => {
  it('should generate annual CPI schedule', () => {
    const schedule = generateCpiSchedule(1000, 0.025, 2023, 2023, 2027, 'ANNUAL');

    expect(schedule).toHaveLength(5);
    expect(schedule[0]).toBe(1000); // Year 0
    expect(schedule[1]).toBeCloseTo(1025, 2); // Year 1
    expect(schedule[4]).toBeCloseTo(1103.81, 2); // Year 4
  });

  it('should generate every 2 years CPI schedule', () => {
    const schedule = generateCpiSchedule(1000, 0.025, 2023, 2023, 2027, 'EVERY_2_YEARS');

    expect(schedule).toHaveLength(5);
    expect(schedule[0]).toBe(1000); // Year 0
    expect(schedule[1]).toBe(1000); // Year 1 (no CPI)
    expect(schedule[2]).toBeCloseTo(1025, 2); // Year 2 (CPI applied)
    expect(schedule[3]).toBeCloseTo(1025, 2); // Year 3 (no CPI)
    expect(schedule[4]).toBeCloseTo(1050.63, 2); // Year 4 (CPI applied again)
  });
});

