/**
 * Tests for formatting utilities
 */

import { describe, expect, it } from 'vitest';
import Decimal from 'decimal.js';

import { formatCurrency, formatPercentage, formatNumber } from './format';

describe('formatCurrency', () => {
  it('should format number as currency', () => {
    // Intl.NumberFormat uses non-breaking space (U+00A0) instead of regular space
    expect(formatCurrency(1000000)).toBe('SAR\u00A01,000,000');
    expect(formatCurrency(500000)).toBe('SAR\u00A0500,000');
  });

  it('should format Decimal as currency', () => {
    expect(formatCurrency(new Decimal(1000000))).toBe('SAR\u00A01,000,000');
    expect(formatCurrency(new Decimal(500000))).toBe('SAR\u00A0500,000');
  });

  it('should use custom currency', () => {
    // USD uses $ prefix, EUR uses € symbol
    expect(formatCurrency(1000, 'USD')).toBe('$1,000');
    expect(formatCurrency(1000, 'EUR')).toBe('€1,000');
  });

  it('should handle zero', () => {
    expect(formatCurrency(0)).toBe('SAR\u00A00');
    expect(formatCurrency(new Decimal(0))).toBe('SAR\u00A00');
  });

  it('should handle negative values', () => {
    expect(formatCurrency(-1000)).toBe('-SAR\u00A01,000');
    expect(formatCurrency(new Decimal(-1000))).toBe('-SAR\u00A01,000');
  });
});

describe('formatPercentage', () => {
  it('should format number as percentage', () => {
    expect(formatPercentage(0.03)).toBe('3.00%');
    expect(formatPercentage(0.15)).toBe('15.00%');
    expect(formatPercentage(1)).toBe('100.00%');
  });

  it('should format Decimal as percentage', () => {
    expect(formatPercentage(new Decimal(0.03))).toBe('3.00%');
    expect(formatPercentage(new Decimal(0.15))).toBe('15.00%');
  });

  it('should use custom decimal places', () => {
    expect(formatPercentage(0.03333, 1)).toBe('3.3%');
    expect(formatPercentage(0.03333, 3)).toBe('3.333%');
  });

  it('should handle zero', () => {
    expect(formatPercentage(0)).toBe('0.00%');
    expect(formatPercentage(new Decimal(0))).toBe('0.00%');
  });
});

describe('formatNumber', () => {
  it('should format number with thousand separators', () => {
    expect(formatNumber(1000000)).toBe('1,000,000');
    expect(formatNumber(500000)).toBe('500,000');
  });

  it('should format Decimal with thousand separators', () => {
    expect(formatNumber(new Decimal(1000000))).toBe('1,000,000');
    expect(formatNumber(new Decimal(500000))).toBe('500,000');
  });

  it('should use custom decimal places', () => {
    expect(formatNumber(1000.5, 1)).toBe('1,000.5');
    expect(formatNumber(1000.55, 2)).toBe('1,000.55');
    expect(formatNumber(new Decimal(1000.555), 3)).toBe('1,000.555');
  });

  it('should handle zero', () => {
    expect(formatNumber(0)).toBe('0');
    expect(formatNumber(new Decimal(0))).toBe('0');
  });

  it('should handle negative values', () => {
    expect(formatNumber(-1000)).toBe('-1,000');
    expect(formatNumber(new Decimal(-1000))).toBe('-1,000');
  });
});

