/**
 * Operating Expenses (OpEx) calculations
 * Revenue-based percentage calculations
 */

import { MODEL_START_YEAR, MODEL_END_YEAR } from './constants';
import { Decimal, roundCurrency } from './decimal';

export interface OpExCategory {
  id: string;
  name: string;
  revenuePercentage: number; // Percentage of revenue (e.g., 0.025 for 2.5%)
}

export interface OpExOverride {
  year: number;
  categoryId: string;
  amount: number;
  reason: string;
}

export interface OpExResult {
  year: number;
  revenue: number;
  categories: Array<{
    categoryId: string;
    categoryName: string;
    amount: number;
    isOverride: boolean;
  }>;
  totalOpEx: number;
}

/**
 * Calculate OpEx for a category in a given year
 * 
 * @param category - OpEx category configuration
 * @param revenue - Annual revenue
 * @param override - Optional override amount
 * @returns OpEx amount rounded to 2 decimal places
 */
export function calculateCategoryOpEx(
  category: OpExCategory,
  revenue: number,
  override?: number
): number {
  if (override !== undefined) {
    return roundCurrency(override);
  }

  // OpEx = Revenue × Revenue Percentage
  return roundCurrency(
    new Decimal(revenue).times(category.revenuePercentage)
  );
}

/**
 * Calculate total OpEx for a given year
 * 
 * @param categories - OpEx category configurations
 * @param revenue - Annual revenue
 * @param overrides - Optional overrides by category and year
 * @param year - Target year
 * @returns OpEx result for the year
 */
export function calculateOpEx(
  categories: OpExCategory[],
  revenue: number,
  year: number,
  overrides?: Map<string, OpExOverride[]> // categoryId -> overrides by year
): OpExResult {
  const categoryResults: OpExResult['categories'] = [];
  let totalOpEx = new Decimal(0);

  for (const category of categories) {
    const categoryOverrides = overrides?.get(category.id);
    const override = categoryOverrides?.find((o) => o.year === year);

    const amount = calculateCategoryOpEx(
      category,
      revenue,
      override?.amount
    );

    categoryResults.push({
      categoryId: category.id,
      categoryName: category.name,
      amount,
      isOverride: override !== undefined,
    });

    totalOpEx = totalOpEx.plus(amount);
  }

  return {
    year,
    revenue,
    categories: categoryResults,
    totalOpEx: roundCurrency(totalOpEx),
  };
}

/**
 * Generate OpEx schedule
 * 
 * @param categories - OpEx category configurations
 * @param revenueSchedule - Array of annual revenues by year
 * @param startYear - Start year for schedule
 * @param endYear - End year for schedule (inclusive)
 * @param overrides - Optional overrides
 * @returns Array of OpEx results by year
 */
export function generateOpExSchedule(
  categories: OpExCategory[],
  revenueSchedule: number[],
  startYear: number = MODEL_START_YEAR,
  endYear: number = MODEL_END_YEAR,
  overrides?: Map<string, OpExOverride[]>
): OpExResult[] {
  const schedule: OpExResult[] = [];
  const totalYears = endYear - startYear + 1;

  for (let i = 0; i < totalYears; i++) {
    const year = startYear + i;
    const revenue = revenueSchedule[i] || 0;
    const result = calculateOpEx(categories, revenue, year, overrides);
    schedule.push(result);
  }

  return schedule;
}

