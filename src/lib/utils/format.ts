/**
 * Formatting utilities
 * Currency, percentage, and number formatting
 */

import Decimal from 'decimal.js';

/**
 * Format currency value
 */
export function formatCurrency(value: number | Decimal, currency: string = 'SAR'): string {
  const num = typeof value === 'number' ? value : value.toNumber();
  return new Intl.NumberFormat('en-SA', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

/**
 * Format percentage value
 */
export function formatPercentage(value: number | Decimal, decimals: number = 2): string {
  const num = typeof value === 'number' ? value : value.toNumber();
  return `${(num * 100).toFixed(decimals)}%`;
}

/**
 * Format number with thousand separators
 */
export function formatNumber(value: number | Decimal, decimals: number = 0): string {
  const num = typeof value === 'number' ? value : value.toNumber();
  return new Intl.NumberFormat('en-SA', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

