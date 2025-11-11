/**
 * Rent calculation tests
 */

import { describe, it, expect } from 'vitest';

import {
  calculateFixedEscRent,
  calculateRevenueShareRent,
  calculatePartnerRent,
  generateFixedEscRentSchedule,
  generateRevenueShareRentSchedule,
  generatePartnerRentSchedule,
  calculateRentNPV,
} from './rent';

describe('calculateFixedEscRent', () => {
  it('should calculate Fixed+Escalation rent correctly', () => {
    const params = {
      baseAmount: 5_000_000,
      escalationRate: 0.03,
      startYear: 2028,
    };

    const rent2028 = calculateFixedEscRent(params, 2028);
    expect(rent2028).toBe(5_000_000); // Year 0

    const rent2029 = calculateFixedEscRent(params, 2029);
    expect(rent2029).toBeCloseTo(5_150_000, 2); // Year 1: 5M × 1.03

    const rent2032 = calculateFixedEscRent(params, 2032);
    expect(rent2032).toBeCloseTo(5_627_544.05, 2); // Year 4: 5M × (1.03)^4
  });

  it('should apply indexation correctly', () => {
    const params = {
      baseAmount: 5_000_000,
      escalationRate: 0.03,
      indexationRate: 0.02,
      indexationFrequency: 'EVERY_2_YEARS' as const,
      startYear: 2028,
    };

    const rent2030 = calculateFixedEscRent(params, 2030);
    // Base escalation: 5M × (1.03)^2 = 5,304,500
    // Indexation (every 2 years): 5M × (1.02)^1 = 5,100,000
    // Combined: 5,304,500 × (5,100,000 / 5,000,000) = 5,410,590
    expect(rent2030).toBeCloseTo(5_410_590, 2);
  });

  it('should throw error for year < start year', () => {
    const params = {
      baseAmount: 5_000_000,
      escalationRate: 0.03,
      startYear: 2028,
    };

    expect(() => calculateFixedEscRent(params, 2027)).toThrow(
      'Year must be >= start year'
    );
  });

  it('should handle zero base amount', () => {
    const params = {
      baseAmount: 0,
      escalationRate: 0.03,
      startYear: 2028,
    };

    const rent = calculateFixedEscRent(params, 2028);
    expect(rent).toBe(0);
  });
});

describe('calculateRevenueShareRent', () => {
  it('should calculate revenue share rent correctly', () => {
    const params = {
      revenuePercentage: 0.15, // 15%
      revenue: 10_000_000,
    };

    const rent = calculateRevenueShareRent(params);
    expect(rent).toBe(1_500_000); // 10M × 0.15
  });

  it('should apply floor correctly', () => {
    const params = {
      revenuePercentage: 0.15,
      revenue: 1_000_000, // Low revenue
      floor: 2_000_000, // Floor higher than calculated
    };

    const rent = calculateRevenueShareRent(params);
    expect(rent).toBe(2_000_000); // Floor applied
  });

  it('should apply cap correctly', () => {
    const params = {
      revenuePercentage: 0.15,
      revenue: 20_000_000, // High revenue
      cap: 2_500_000, // Cap lower than calculated
    };

    const rent = calculateRevenueShareRent(params);
    expect(rent).toBe(2_500_000); // Cap applied
  });

  it('should apply both floor and cap', () => {
    const params = {
      revenuePercentage: 0.15,
      revenue: 1_000_000,
      floor: 1_200_000,
      cap: 2_000_000,
    };

    const rent = calculateRevenueShareRent(params);
    expect(rent).toBe(1_200_000); // Floor applied because calculated amount is below 1.2M
  });

  it('should throw error when revenue percentage is negative', () => {
    const params = {
      revenuePercentage: -0.1,
      revenue: 10_000_000,
    };

    expect(() => calculateRevenueShareRent(params)).toThrow(
      'Revenue percentage must be between 0 and 1'
    );
  });

  it('should throw error when revenue percentage exceeds one', () => {
    const params = {
      revenuePercentage: 1.25,
      revenue: 10_000_000,
    };

    expect(() => calculateRevenueShareRent(params)).toThrow(
      'Revenue percentage must be between 0 and 1'
    );
  });
});

describe('calculatePartnerRent', () => {
  it('should calculate Partner rent correctly', () => {
    const params = {
      landSqm: 10_000,
      landCostPerSqm: 500,
      buaSqm: 5_000,
      buaCostPerSqm: 2000,
      yield: 0.08, // 8% yield
      startYear: 2028,
      currentYear: 2028,
    };

    const rent = calculatePartnerRent(params);
    // Investment: (10K × 500) + (5K × 2000) = 5M + 10M = 15M
    // Rent: 15M × 0.08 = 1.2M
    expect(rent).toBe(1_200_000);
  });

  it('should apply yield indexation correctly', () => {
    const params = {
      landSqm: 10_000,
      landCostPerSqm: 500,
      buaSqm: 5_000,
      buaCostPerSqm: 2000,
      yield: 0.08,
      yieldIndexationRate: 0.02,
      yieldIndexationFrequency: 'EVERY_2_YEARS' as const,
      startYear: 2028,
      currentYear: 2030, // 2 years later
    };

    const rent = calculatePartnerRent(params);
    // Base yield: 15M × 0.08 = 1.2M
    // Indexation factor: (1.02)^1 = 1.02
    // Rent: 1.2M × 1.02 = 1.224M
    expect(rent).toBeCloseTo(1_224_000, 2);
  });
});

describe('generateFixedEscRentSchedule', () => {
  it('should generate schedule correctly', () => {
    const params = {
      baseAmount: 5_000_000,
      escalationRate: 0.03,
      startYear: 2028,
    };

    const schedule = generateFixedEscRentSchedule(params, 2028, 2032);

    expect(schedule).toHaveLength(5);
    expect(schedule[0]).toBe(5_000_000); // 2028
    expect(schedule[1]).toBeCloseTo(5_150_000, 2); // 2029
    expect(schedule[4]).toBeCloseTo(5_627_544.05, 2); // 2032
  });

  it('should return zeros for years before start', () => {
    const params = {
      baseAmount: 5_000_000,
      escalationRate: 0.03,
      startYear: 2028,
    };

    const schedule = generateFixedEscRentSchedule(params, 2025, 2030);

    expect(schedule[0]).toBe(0); // 2025
    expect(schedule[1]).toBe(0); // 2026
    expect(schedule[2]).toBe(0); // 2027
    expect(schedule[3]).toBe(5_000_000); // 2028
  });
});

describe('generateRevenueShareRentSchedule', () => {
  it('should generate schedule correctly', () => {
    const params = {
      revenuePercentage: 0.15,
      floor: 1_000_000,
      cap: 3_000_000,
    };

    const revenueSchedule = [
      10_000_000, // Year 1
      12_000_000, // Year 2
      15_000_000, // Year 3
    ];

    const schedule = generateRevenueShareRentSchedule(
      params,
      revenueSchedule,
      2028,
      2030
    );

    expect(schedule).toHaveLength(3);
    expect(schedule[0]).toBe(1_500_000); // 10M × 0.15
    expect(schedule[1]).toBe(1_800_000); // 12M × 0.15
    expect(schedule[2]).toBe(2_250_000); // 15M × 0.15
  });

  it('should default to floor when revenue data is missing', () => {
    const params = {
      revenuePercentage: 0.15,
      floor: 1_000_000,
      cap: 3_000_000,
    };

    const schedule = generateRevenueShareRentSchedule(
      params,
      [10_000_000],
      2028,
      2030
    );

    expect(schedule).toEqual([1_500_000, 1_000_000, 1_000_000]);
  });
});

describe('generatePartnerRentSchedule', () => {
  const baseParams = {
    landSqm: 10_000,
    landCostPerSqm: 500,
    buaSqm: 5_000,
    buaCostPerSqm: 2000,
    yield: 0.08,
    startYear: 2028,
    currentYear: 2028,
  };

  it('should return zeros for years before start', () => {
    const schedule = generatePartnerRentSchedule(baseParams, 2026, 2029);

    expect(schedule).toEqual([0, 0, 1_200_000, 1_200_000]);
  });

  it('should apply yield indexation across the schedule', () => {
    const schedule = generatePartnerRentSchedule(
      {
        ...baseParams,
        yieldIndexationRate: 0.02,
        yieldIndexationFrequency: 'EVERY_2_YEARS' as const,
      },
      2028,
      2032
    );

    expect(schedule).toHaveLength(5);
    expect(schedule[0]).toBe(1_200_000);
    expect(schedule[2]).toBeCloseTo(1_224_000, 2);
    expect(schedule[4]).toBeCloseTo(1_248_000, 2);
  });
});

describe('calculateRentNPV', () => {
  it('should calculate NPV correctly', () => {
    const schedule = [0, 0, 5_000_000, 5_150_000, 5_304_500]; // Starts in year 2
    const npv = calculateRentNPV(schedule, 0.08, 2028);

    // NPV of [5M, 5.15M, 5.3045M] starting in 2030
    expect(npv).toBeCloseTo(14_316_272.29, 2);
  });

  it('should return 0 for empty schedule', () => {
    const npv = calculateRentNPV([], 0.08, 2028);
    expect(npv).toBe(0);
  });
});

