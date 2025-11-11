/**
 * Tests for financial calculation constants
 */

import { describe, expect, it } from 'vitest';

import {
  getAllModelYears,
  isHistoryYear,
  isNearTermYear,
  isLongTermYear,
  isRampYear,
  isFrozenYear,
  MODEL_START_YEAR,
  MODEL_END_YEAR,
  RELOCATION_YEAR,
} from './constants';

describe('getAllModelYears', () => {
  it('should generate all model years', () => {
    const years = getAllModelYears();

    expect(years).toHaveLength(30);
    expect(years[0]).toBe(2023);
    expect(years[29]).toBe(2052);
  });

  it('should include all years from start to end', () => {
    const years = getAllModelYears();

    for (let i = 0; i < years.length; i++) {
      expect(years[i]).toBe(MODEL_START_YEAR + i);
    }
  });
});

describe('isHistoryYear', () => {
  it('should return true for history years', () => {
    expect(isHistoryYear(2023)).toBe(true);
    expect(isHistoryYear(2024)).toBe(true);
  });

  it('should return false for non-history years', () => {
    expect(isHistoryYear(2025)).toBe(false);
    expect(isHistoryYear(2028)).toBe(false);
  });
});

describe('isNearTermYear', () => {
  it('should return true for near-term years', () => {
    expect(isNearTermYear(2025)).toBe(true);
    expect(isNearTermYear(2026)).toBe(true);
    expect(isNearTermYear(2027)).toBe(true);
  });

  it('should return false for non-near-term years', () => {
    expect(isNearTermYear(2024)).toBe(false);
    expect(isNearTermYear(2028)).toBe(false);
  });
});

describe('isLongTermYear', () => {
  it('should return true for long-term years', () => {
    expect(isLongTermYear(2028)).toBe(true);
    expect(isLongTermYear(2030)).toBe(true);
    expect(isLongTermYear(2052)).toBe(true);
  });

  it('should return false for non-long-term years', () => {
    expect(isLongTermYear(2027)).toBe(false);
    expect(isLongTermYear(2023)).toBe(false);
  });
});

describe('isRampYear', () => {
  it('should return true for ramp years', () => {
    expect(isRampYear(2028)).toBe(true);
    expect(isRampYear(2029)).toBe(true);
    expect(isRampYear(2030)).toBe(true);
    expect(isRampYear(2031)).toBe(true);
    expect(isRampYear(2032)).toBe(true);
  });

  it('should return false for non-ramp years', () => {
    expect(isRampYear(2027)).toBe(false);
    expect(isRampYear(2033)).toBe(false);
  });
});

describe('isFrozenYear', () => {
  it('should return true for frozen years', () => {
    expect(isFrozenYear(2033)).toBe(true);
    expect(isFrozenYear(2040)).toBe(true);
    expect(isFrozenYear(2052)).toBe(true);
  });

  it('should return false for non-frozen years', () => {
    expect(isFrozenYear(2028)).toBe(false);
    expect(isFrozenYear(2032)).toBe(false);
  });
});

