/**
 * Capex calculation tests
 */

import { describe, it, expect } from 'vitest';

import {
  calculateCapex,
  generateCapexSchedule,
  type CycleBasedRule,
  type UtilizationBasedRule,
  type CustomDateRule,
} from './capex';

describe('calculateCapex - Cycle-based', () => {
  const rule: CycleBasedRule = {
    type: 'CYCLE',
    categoryId: 'technology',
    categoryName: 'Technology',
    startYear: 2028,
    cycleYears: 3,
    baseCost: 500_000,
    costPerStudent: 100,
    escalationRate: 0.03,
    baseYear: 2023,
  };

  it('should return null for year before start year', () => {
    const result = calculateCapex(rule, 2027, 1200);
    expect(result).toBeNull();
  });

  it('should trigger in start year', () => {
    const result = calculateCapex(rule, 2028, 1200);

    expect(result).not.toBeNull();
    expect(result?.year).toBe(2028);
    expect(result?.amount).toBeGreaterThan(0);
  });

  it('should trigger every cycle years', () => {
    const result2028 = calculateCapex(rule, 2028, 1200);
    const result2031 = calculateCapex(rule, 2031, 1200);
    const result2034 = calculateCapex(rule, 2034, 1200);
    const result2029 = calculateCapex(rule, 2029, 1200); // Should not trigger

    expect(result2028).not.toBeNull();
    expect(result2031).not.toBeNull();
    expect(result2034).not.toBeNull();
    expect(result2029).toBeNull();
  });

  it('should include cost per student', () => {
    const result = calculateCapex(rule, 2028, 1200);

    // Base: 500K, Per student: 100 × 1200 = 120K, Total: 620K
    expect(result?.amount).toBeGreaterThan(500_000);
  });
});

describe('calculateCapex - Utilization-based', () => {
  const rule: UtilizationBasedRule = {
    type: 'UTILIZATION',
    categoryId: 'facilities',
    categoryName: 'Facilities',
    threshold: 0.85,
    baseCost: 1_000_000,
    costPerStudent: 200,
    escalationRate: 0.03,
    baseYear: 2023,
  };

  it('should trigger when utilization equals threshold', () => {
    const result = calculateCapex(rule, 2028, 1700, 2000, 0.85); // Exactly 85%

    expect(result).not.toBeNull();
    expect(result?.year).toBe(2028);
  });

  it('should trigger when utilization exceeds threshold', () => {
    const result = calculateCapex(rule, 2028, 1800, 2000, 0.9); // Above threshold

    expect(result).not.toBeNull();
    expect(result?.year).toBe(2028);
    // Should include cost for additional capacity
    expect(result?.amount).toBeGreaterThan(rule.baseCost);
  });

  it('should not trigger when utilization below threshold', () => {
    const result = calculateCapex(rule, 2028, 1600, 2000, 0.8); // Below threshold

    expect(result).toBeNull();
  });

  it('should not add cost per student when utilization below threshold', () => {
    const result = calculateCapex(rule, 2028, 1600, 2000, 0.8);

    expect(result).toBeNull();
  });

  it('should require utilization parameter', () => {
    const result = calculateCapex(rule, 2028, 1700, 2000);

    expect(result).toBeNull(); // No utilization provided
  });
});

describe('calculateCapex - Custom date', () => {
  const rule: CustomDateRule = {
    type: 'CUSTOM_DATE',
    categoryId: 'expansion',
    categoryName: 'Expansion',
    triggerYears: [2030, 2035, 2040],
    baseCost: 2_000_000,
    escalationRate: 0.03,
    baseYear: 2023,
  };

  it('should trigger only in specified years', () => {
    const result2030 = calculateCapex(rule, 2030);
    const result2035 = calculateCapex(rule, 2035);
    const result2029 = calculateCapex(rule, 2029); // Not in list

    expect(result2030).not.toBeNull();
    expect(result2035).not.toBeNull();
    expect(result2029).toBeNull();
  });
});

describe('generateCapexSchedule', () => {
  const cycleRule: CycleBasedRule = {
    type: 'CYCLE',
    categoryId: 'technology',
    categoryName: 'Technology',
    startYear: 2028,
    cycleYears: 3,
    baseCost: 500_000,
    escalationRate: 0.03,
    baseYear: 2023,
  };

  it('should generate schedule from rules', () => {
    const studentSchedule = [1200, 1500, 1800];
    const capacitySchedule = [2000, 2000, 2000];
    const utilizationSchedule = [0.6, 0.75, 0.9];

    const schedule = generateCapexSchedule(
      [cycleRule],
      studentSchedule,
      capacitySchedule,
      utilizationSchedule,
      2028,
      2030
    );

    expect(schedule.length).toBeGreaterThan(0);
    expect(schedule[0].year).toBe(2028);
  });

  it('should apply overrides', () => {
    const overrides = new Map();
    overrides.set(2029, {
      categoryId: 'technology',
      amount: 600_000,
      reason: 'Manual override',
    });

    const schedule = generateCapexSchedule(
      [cycleRule],
      [1200, 1300],
      [2000, 2000],
      [0.6, 0.65],
      2028,
      2029,
      overrides
    );

    const overrideResult = schedule.find((s) => s.isOverride);
    expect(overrideResult).toBeDefined();
    expect(overrideResult?.amount).toBe(600_000);
  });
});

