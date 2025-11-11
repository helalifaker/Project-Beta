/**
 * Financial calculation constants
 * Single source of truth for financial model constants
 */

/**
 * Model timeline constants
 */
export const MODEL_START_YEAR = 2023;
export const MODEL_END_YEAR = 2052;
export const MODEL_DURATION_YEARS = 30;
export const RELOCATION_YEAR = 2028;

/**
 * Year categories
 */
export const HISTORY_YEARS = [2023, 2024] as const;
export const NEAR_TERM_YEARS = [2025, 2026, 2027] as const;
export const LONG_TERM_YEARS = [
  2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035, 2036, 2037, 2038, 2039,
  2040, 2041, 2042, 2043, 2044, 2045, 2046, 2047, 2048, 2049, 2050, 2051,
  2052,
] as const;
export const RAMP_YEARS = [2028, 2029, 2030, 2031, 2032] as const;
export const FROZEN_YEARS = [
  2033, 2034, 2035, 2036, 2037, 2038, 2039, 2040, 2041, 2042, 2043, 2044,
  2045, 2046, 2047, 2048, 2049, 2050, 2051, 2052,
] as const;

/**
 * Validation thresholds
 */
export const MAX_RENT_LOAD_PERCENTAGE = 0.3; // 30%
export const MIN_EBITDA_MARGIN = 0.12; // 12%
export const MIN_CFO_MARGIN = 0.03; // 3%
export const HIGH_UTILIZATION_THRESHOLD = 0.85; // 85%
export const LOW_UTILIZATION_THRESHOLD = 0.5; // 50%

/**
 * Financial precision
 */
export const CURRENCY_DECIMALS = 2;
export const PERCENTAGE_DECIMALS = 4;
export const RATIO_DECIMALS = 2;
export const BALANCE_TOLERANCE = 0.01; // SAR 0.01 tolerance for balance sheet

/**
 * Default values
 */
export const DEFAULT_DISCOUNT_RATE = 0.08; // 8%
export const DEFAULT_CPI_RATE = 0.025; // 2.5%
export const DEFAULT_ESCALATION_RATE = 0.03; // 3%

/**
 * Generate array of all model years
 */
export function getAllModelYears(): number[] {
  return Array.from(
    { length: MODEL_DURATION_YEARS },
    (_, i) => MODEL_START_YEAR + i
  );
}

/**
 * Check if year is in history period
 */
export function isHistoryYear(year: number): boolean {
  return HISTORY_YEARS.includes(year as (typeof HISTORY_YEARS)[number]);
}

/**
 * Check if year is in near-term period
 */
export function isNearTermYear(year: number): boolean {
  return NEAR_TERM_YEARS.includes(year as (typeof NEAR_TERM_YEARS)[number]);
}

/**
 * Check if year is in long-term period
 */
export function isLongTermYear(year: number): boolean {
  return LONG_TERM_YEARS.includes(year as (typeof LONG_TERM_YEARS)[number]);
}

/**
 * Check if year is a ramp year
 */
export function isRampYear(year: number): boolean {
  return RAMP_YEARS.includes(year as (typeof RAMP_YEARS)[number]);
}

/**
 * Check if year is frozen
 */
export function isFrozenYear(year: number): boolean {
  return FROZEN_YEARS.includes(year as (typeof FROZEN_YEARS)[number]);
}

