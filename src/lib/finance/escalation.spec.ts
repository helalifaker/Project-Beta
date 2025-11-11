/**
 * Escalation calculation tests
 */

import { describe, it, expect } from 'vitest';

import {
  calculateEscalatedAmount,
  shouldApplyEscalation,
  generateEscalationSchedule,
} from './escalation';

describe('calculateEscalatedAmount', () => {
  it('should calculate annual escalation correctly', () => {
    const amount = calculateEscalatedAmount(5_000_000, 0.03, 5, 'ANNUAL');
    // 5M × (1.03)^5 = 5,796,370.37
    expect(amount).toBeCloseTo(5_796_370.37, 2);
  });

  it('should calculate every 2 years escalation correctly', () => {
    const amount = calculateEscalatedAmount(5_000_000, 0.03, 4, 'EVERY_2_YEARS');
    // 5M × (1.03)^2 = 5,304,500.00 (applied at year 2 and 4)
    expect(amount).toBeCloseTo(5_304_500, 2);
  });

  it('should calculate every 3 years escalation correctly', () => {
    const amount = calculateEscalatedAmount(5_000_000, 0.03, 6, 'EVERY_3_YEARS');
    // 5M × (1.03)^2 = 5,304,500.00 (applied at year 3 and 6)
    expect(amount).toBeCloseTo(5_304_500, 2);
  });

  it('should return base amount for year 0', () => {
    const amount = calculateEscalatedAmount(5_000_000, 0.03, 0, 'ANNUAL');
    expect(amount).toBe(5_000_000);
  });

  it('should throw error for negative escalation rate', () => {
    expect(() =>
      calculateEscalatedAmount(5_000_000, -0.03, 5, 'ANNUAL')
    ).toThrow('Escalation rate must be non-negative');
  });

  it('should throw error for negative years from start', () => {
    expect(() =>
      calculateEscalatedAmount(5_000_000, 0.03, -1, 'ANNUAL')
    ).toThrow('Years from start must be non-negative');
  });
});

describe('shouldApplyEscalation', () => {
  it('should apply annual escalation every year after start', () => {
    expect(shouldApplyEscalation(2029, 2028, 'ANNUAL')).toBe(true);
    expect(shouldApplyEscalation(2030, 2028, 'ANNUAL')).toBe(true);
    expect(shouldApplyEscalation(2028, 2028, 'ANNUAL')).toBe(false);
  });

  it('should apply every 2 years escalation correctly', () => {
    expect(shouldApplyEscalation(2030, 2028, 'EVERY_2_YEARS')).toBe(true); // Year 2
    expect(shouldApplyEscalation(2032, 2028, 'EVERY_2_YEARS')).toBe(true); // Year 4
    expect(shouldApplyEscalation(2029, 2028, 'EVERY_2_YEARS')).toBe(false); // Year 1
    expect(shouldApplyEscalation(2031, 2028, 'EVERY_2_YEARS')).toBe(false); // Year 3
  });

  it('should apply every 3 years escalation correctly', () => {
    expect(shouldApplyEscalation(2031, 2028, 'EVERY_3_YEARS')).toBe(true); // Year 3
    expect(shouldApplyEscalation(2034, 2028, 'EVERY_3_YEARS')).toBe(true); // Year 6
    expect(shouldApplyEscalation(2029, 2028, 'EVERY_3_YEARS')).toBe(false); // Year 1
    expect(shouldApplyEscalation(2030, 2028, 'EVERY_3_YEARS')).toBe(false); // Year 2
  });
});

describe('generateEscalationSchedule', () => {
  it('should generate annual escalation schedule', () => {
    const schedule = generateEscalationSchedule(
      5_000_000,
      0.03,
      2028,
      2032,
      'ANNUAL'
    );

    expect(schedule).toHaveLength(5);
    expect(schedule[0]).toBe(5_000_000); // Year 0
    expect(schedule[1]).toBeCloseTo(5_150_000, 2); // Year 1
    expect(schedule[4]).toBeCloseTo(5_627_544.05, 2); // Year 4
  });

  it('should generate every 2 years escalation schedule', () => {
    const schedule = generateEscalationSchedule(
      5_000_000,
      0.03,
      2028,
      2032,
      'EVERY_2_YEARS'
    );

    expect(schedule).toHaveLength(5);
    expect(schedule[0]).toBe(5_000_000); // Year 0
    expect(schedule[1]).toBe(5_000_000); // Year 1 (no escalation)
    expect(schedule[2]).toBeCloseTo(5_150_000, 2); // Year 2 (first escalation)
    expect(schedule[3]).toBeCloseTo(5_150_000, 2); // Year 3 (no escalation)
    expect(schedule[4]).toBeCloseTo(5_304_500, 2); // Year 4 (second escalation)
  });
});

