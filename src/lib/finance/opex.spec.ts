/**
 * OpEx calculation tests
 */

import { describe, it, expect } from 'vitest';
import {
  calculateCategoryOpEx,
  calculateOpEx,
  generateOpExSchedule,
  type OpExCategory,
} from './opex';

describe('calculateCategoryOpEx', () => {
  const category: OpExCategory = {
    id: 'utilities',
    name: 'Utilities',
    revenuePercentage: 0.025, // 2.5%
  };

  it('should calculate OpEx from revenue percentage', () => {
    const opex = calculateCategoryOpEx(category, 10_000_000);
    expect(opex).toBe(250_000); // 10M × 0.025
  });

  it('should use override if provided', () => {
    const opex = calculateCategoryOpEx(category, 10_000_000, 300_000);
    expect(opex).toBe(300_000);
  });
});

describe('calculateOpEx', () => {
  const categories: OpExCategory[] = [
    { id: 'utilities', name: 'Utilities', revenuePercentage: 0.025 },
    { id: 'maintenance', name: 'Maintenance', revenuePercentage: 0.015 },
  ];

  it('should calculate total OpEx for all categories', () => {
    const result = calculateOpEx(categories, 10_000_000, 2028);

    expect(result.categories).toHaveLength(2);
    expect(result.categories[0].amount).toBe(250_000); // Utilities: 2.5%
    expect(result.categories[1].amount).toBe(150_000); // Maintenance: 1.5%
    expect(result.totalOpEx).toBe(400_000);
  });

  it('should apply overrides correctly', () => {
    const overrides = new Map<string, Array<{ year: number; categoryId: string; amount: number; reason: string }>>();
    overrides.set('utilities', [
      { year: 2028, categoryId: 'utilities', amount: 300_000, reason: 'Override' },
    ]);

    const result = calculateOpEx(categories, 10_000_000, 2028, overrides);

    expect(result.categories[0].amount).toBe(300_000); // Override applied
    expect(result.categories[0].isOverride).toBe(true);
    expect(result.categories[1].amount).toBe(150_000); // No override
  });

  it('should handle categories without overrides', () => {
    const overrides = new Map<string, Array<{ year: number; categoryId: string; amount: number; reason: string }>>();
    overrides.set('utilities', [
      { year: 2028, categoryId: 'utilities', amount: 300_000, reason: 'Override' },
    ]);

    const result = calculateOpEx(categories, 10_000_000, 2028, overrides);

    // Maintenance category should not have override
    expect(result.categories[1].isOverride).toBe(false);
  });

  it('should handle override for different year', () => {
    const overrides = new Map<string, Array<{ year: number; categoryId: string; amount: number; reason: string }>>();
    overrides.set('utilities', [
      { year: 2029, categoryId: 'utilities', amount: 300_000, reason: 'Override' },
    ]);

    const result = calculateOpEx(categories, 10_000_000, 2028, overrides);

    // Should not apply override for different year
    expect(result.categories[0].amount).toBe(250_000); // Calculated, not override
    expect(result.categories[0].isOverride).toBe(false);
  });
});

describe('generateOpExSchedule', () => {
  const categories: OpExCategory[] = [
    { id: 'utilities', name: 'Utilities', revenuePercentage: 0.025 },
  ];

  it('should generate schedule correctly', () => {
    const revenueSchedule = [10_000_000, 12_000_000, 15_000_000];
    const schedule = generateOpExSchedule(categories, revenueSchedule, 2028, 2030);

    expect(schedule).toHaveLength(3);
    expect(schedule[0].totalOpEx).toBe(250_000); // 10M × 0.025
    expect(schedule[1].totalOpEx).toBe(300_000); // 12M × 0.025
    expect(schedule[2].totalOpEx).toBe(375_000); // 15M × 0.025
  });
});

