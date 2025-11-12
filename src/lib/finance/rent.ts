/**
 * Rent calculation utilities
 * Implements all 3 rent models: Fixed+Escalation, Revenue Share, Partner
 */

import { MODEL_START_YEAR, MODEL_END_YEAR } from './constants';
import { Decimal, roundCurrency } from './decimal';
import { calculateEscalatedAmount, type EscalationFrequency } from './escalation';
import { calculateNPV } from './npv';

export type RentModelType = 'FIXED_ESC' | 'REV_SHARE' | 'PARTNER';

export interface FixedEscRentParams {
  baseAmount: number;
  escalationRate: number;
  indexationRate?: number;
  indexationFrequency?: EscalationFrequency;
  startYear: number;
}

export interface RevenueShareRentParams {
  revenuePercentage: number;
  floor?: number;
  cap?: number;
  revenue: number; // Annual revenue
}

export interface PartnerRentParams {
  landSqm: number;
  landCostPerSqm: number;
  buaSqm: number;
  buaCostPerSqm: number;
  yield: number;
  yieldIndexationRate?: number;
  yieldIndexationFrequency?: EscalationFrequency;
  startYear: number;
  currentYear: number;
}

/**
 * Calculate Fixed+Escalation rent
 *
 * Formula: baseAmount × (1 + escalationRate)^years × indexation
 *
 * @param params - Fixed+Escalation rent parameters
 * @param year - Target year
 * @returns Rent amount rounded to 2 decimal places
 */
export function calculateFixedEscRent(params: FixedEscRentParams, year: number): number {
  const { baseAmount, escalationRate, startYear } = params;
  const yearsFromStart = year - startYear;

  if (yearsFromStart < 0) {
    throw new Error('Year must be >= start year');
  }

  // Calculate base escalation
  let amount = calculateEscalatedAmount(baseAmount, escalationRate, yearsFromStart, 'ANNUAL');

  // Apply indexation if provided
  if (params.indexationRate && params.indexationFrequency) {
    const indexationYears = yearsFromStart;
    const indexationAmount = calculateEscalatedAmount(
      baseAmount,
      params.indexationRate,
      indexationYears,
      params.indexationFrequency
    );

    // Indexation is applied on top of base escalation
    // Formula: baseEscalated × (indexationFactor)
    const indexationFactor = new Decimal(indexationAmount).dividedBy(baseAmount);
    amount = roundCurrency(new Decimal(amount).times(indexationFactor));
  }

  return amount;
}

/**
 * Calculate Revenue Share rent
 *
 * Formula: max(floor, min(cap, revenue × percentage))
 *
 * @param params - Revenue Share rent parameters
 * @returns Rent amount rounded to 2 decimal places
 */
export function calculateRevenueShareRent(params: RevenueShareRentParams): number {
  const { revenuePercentage, revenue, floor, cap } = params;

  if (revenuePercentage < 0 || revenuePercentage > 1) {
    throw new Error('Revenue percentage must be between 0 and 1');
  }

  // Calculate base amount: revenue × percentage
  let amount = new Decimal(revenue).times(revenuePercentage);

  // Apply floor if provided
  if (floor !== undefined) {
    amount = Decimal.max(amount, new Decimal(floor));
  }

  // Apply cap if provided
  if (cap !== undefined) {
    amount = Decimal.min(amount, new Decimal(cap));
  }

  return roundCurrency(amount);
}

/**
 * Calculate Partner model rent
 *
 * Formula: ((land_sqm × land_cost) + (bua_sqm × bua_cost)) × yield × indexation
 *
 * @param params - Partner model rent parameters
 * @returns Rent amount rounded to 2 decimal places
 */
export function calculatePartnerRent(params: PartnerRentParams): number {
  const {
    landSqm,
    landCostPerSqm,
    buaSqm,
    buaCostPerSqm,
    yield: yieldRate,
    startYear,
    currentYear,
  } = params;

  // Calculate investment base
  const landInvestment = new Decimal(landSqm).times(landCostPerSqm);
  const buaInvestment = new Decimal(buaSqm).times(buaCostPerSqm);
  const totalInvestment = landInvestment.plus(buaInvestment);

  // Calculate base yield amount
  let yieldAmount = totalInvestment.times(yieldRate);

  // Apply yield indexation if provided
  if (params.yieldIndexationRate && params.yieldIndexationFrequency) {
    const yearsFromStart = currentYear - startYear;
    const indexationFactor = calculateEscalatedAmount(
      1, // Base factor
      params.yieldIndexationRate,
      yearsFromStart,
      params.yieldIndexationFrequency
    );

    yieldAmount = yieldAmount.times(indexationFactor);
  }

  return roundCurrency(yieldAmount);
}

/**
 * Generate rent schedule for Fixed+Escalation model
 *
 * @param params - Fixed+Escalation rent parameters
 * @param startYear - Start year for schedule
 * @param endYear - End year for schedule (inclusive)
 * @returns Array of rent amounts by year
 */
export function generateFixedEscRentSchedule(
  params: FixedEscRentParams,
  startYear: number = MODEL_START_YEAR,
  endYear: number = MODEL_END_YEAR
): number[] {
  const schedule: number[] = [];

  for (let year = startYear; year <= endYear; year++) {
    if (year < params.startYear) {
      schedule.push(0); // No rent before start year
    } else {
      const amount = calculateFixedEscRent(params, year);
      schedule.push(amount);
    }
  }

  return schedule;
}

/**
 * Generate rent schedule for Revenue Share model
 *
 * @param params - Revenue Share rent parameters (without revenue)
 * @param revenueSchedule - Array of annual revenues by year
 * @param startYear - Start year for schedule
 * @param endYear - End year for schedule (inclusive)
 * @returns Array of rent amounts by year
 */
export function generateRevenueShareRentSchedule(
  params: Omit<RevenueShareRentParams, 'revenue'>,
  revenueSchedule: number[],
  startYear: number = MODEL_START_YEAR,
  endYear: number = MODEL_END_YEAR
): number[] {
  const schedule: number[] = [];
  const totalYears = endYear - startYear + 1;

  for (let i = 0; i < totalYears; i++) {
    const revenue = revenueSchedule[i] || 0;
    const amount = calculateRevenueShareRent({
      ...params,
      revenue,
    });
    schedule.push(amount);
  }

  return schedule;
}

/**
 * Generate rent schedule for Partner model
 *
 * @param params - Partner model rent parameters
 * @param startYear - Start year for schedule
 * @param endYear - End year for schedule (inclusive)
 * @returns Array of rent amounts by year
 */
export function generatePartnerRentSchedule(
  params: PartnerRentParams,
  startYear: number = MODEL_START_YEAR,
  endYear: number = MODEL_END_YEAR
): number[] {
  const schedule: number[] = [];

  for (let year = startYear; year <= endYear; year++) {
    if (year < params.startYear) {
      schedule.push(0); // No rent before start year
    } else {
      const amount = calculatePartnerRent({
        ...params,
        currentYear: year,
      });
      schedule.push(amount);
    }
  }

  return schedule;
}

/**
 * Calculate rent NPV
 *
 * @param rentSchedule - Array of annual rent amounts
 * @param discountRate - Annual discount rate
 * @param startYear - First year of schedule
 * @returns NPV rounded to 2 decimal places
 */
export function calculateRentNPV(
  rentSchedule: number[],
  discountRate: number,
  startYear: number
): number {
  // Filter out zero values (years before rent starts)
  const nonZeroSchedule = rentSchedule.filter((amount) => amount > 0);

  if (nonZeroSchedule.length === 0) {
    return 0;
  }

  // Find first non-zero year
  const firstNonZeroIndex = rentSchedule.findIndex((amount) => amount > 0);
  const actualStartYear = startYear + firstNonZeroIndex;

  return calculateNPV(nonZeroSchedule, discountRate, actualStartYear);
}
