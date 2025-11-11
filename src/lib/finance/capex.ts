/**
 * Capex (Capital Expenditures) calculations
 * Category-based rules: Cycle-based, Utilization-based, Custom date
 */

import { MODEL_START_YEAR, MODEL_END_YEAR } from './constants';
import { Decimal, roundCurrency } from './decimal';
import { calculateEscalatedAmount } from './escalation';

export type CapexRuleType = 'CYCLE' | 'UTILIZATION' | 'CUSTOM_DATE';

export interface CycleBasedRule {
  type: 'CYCLE';
  categoryId: string;
  categoryName: string;
  startYear: number;
  cycleYears: number; // Reinvest every N years (e.g., 3)
  baseCost: number;
  costPerStudent?: number; // Optional cost per student
  escalationRate: number;
  baseYear: number;
}

export interface UtilizationBasedRule {
  type: 'UTILIZATION';
  categoryId: string;
  categoryName: string;
  threshold: number; // Utilization threshold (e.g., 0.85 for 85%)
  baseCost: number;
  costPerStudent?: number; // Cost per additional student
  escalationRate: number;
  baseYear: number;
}

export interface CustomDateRule {
  type: 'CUSTOM_DATE';
  categoryId: string;
  categoryName: string;
  triggerYears: number[]; // Specific years (e.g., [2030, 2035, 2040])
  baseCost: number;
  escalationRate: number;
  baseYear: number;
}

export type CapexRule = CycleBasedRule | UtilizationBasedRule | CustomDateRule;

export interface CapexResult {
  year: number;
  categoryId: string;
  categoryName: string;
  amount: number;
  triggerDetail: string;
  isOverride: boolean;
  overrideReason?: string;
}

/**
 * Check if cycle-based capex should trigger in a given year
 */
function shouldTriggerCycle(
  rule: CycleBasedRule,
  year: number
): { trigger: boolean; periodsElapsed: number } {
  if (year < rule.startYear) {
    return { trigger: false, periodsElapsed: 0 };
  }

  const yearsSinceStart = year - rule.startYear;
  const periodsElapsed = Math.floor(yearsSinceStart / rule.cycleYears);
  const trigger = yearsSinceStart % rule.cycleYears === 0;

  return { trigger, periodsElapsed };
}

/**
 * Check if utilization-based capex should trigger
 */
function shouldTriggerUtilization(
  rule: UtilizationBasedRule,
  year: number,
  utilization: number
): boolean {
  return utilization >= rule.threshold;
}

/**
 * Check if custom date capex should trigger
 */
function shouldTriggerCustomDate(
  rule: CustomDateRule,
  year: number
): boolean {
  return rule.triggerYears.includes(year);
}

/**
 * Calculate cycle-based capex amount
 */
function calculateCycleCapex(
  rule: CycleBasedRule,
  year: number,
  students: number
): number {
  const { periodsElapsed } = shouldTriggerCycle(rule, year);

  let baseAmount = rule.baseCost;
  if (rule.costPerStudent) {
    baseAmount += rule.costPerStudent * students;
  }

  const yearsFromBase = year - rule.baseYear;
  return roundCurrency(
    calculateEscalatedAmount(
      baseAmount,
      rule.escalationRate,
      yearsFromBase,
      'ANNUAL'
    )
  );
}

/**
 * Calculate utilization-based capex amount
 */
function calculateUtilizationCapex(
  rule: UtilizationBasedRule,
  year: number,
  students: number,
  capacity: number
): number {
  let baseAmount = rule.baseCost;
  if (rule.costPerStudent) {
    // Calculate additional capacity needed
    const currentUtilization = students / capacity;
    if (currentUtilization > rule.threshold) {
      const targetCapacity = students / rule.threshold;
      const additionalCapacity = targetCapacity - capacity;
      baseAmount += rule.costPerStudent * additionalCapacity;
    }
  }

  const yearsFromBase = year - rule.baseYear;
  return roundCurrency(
    calculateEscalatedAmount(
      baseAmount,
      rule.escalationRate,
      yearsFromBase,
      'ANNUAL'
    )
  );
}

/**
 * Calculate custom date capex amount
 */
function calculateCustomDateCapex(
  rule: CustomDateRule,
  year: number
): number {
  const yearsFromBase = year - rule.baseYear;
  return roundCurrency(
    calculateEscalatedAmount(
      rule.baseCost,
      rule.escalationRate,
      yearsFromBase,
      'ANNUAL'
    )
  );
}

/**
 * Calculate capex for a rule in a given year
 */
export function calculateCapex(
  rule: CapexRule,
  year: number,
  students?: number,
  capacity?: number,
  utilization?: number
): CapexResult | null {
  let shouldTrigger = false;
  let amount = 0;
  let triggerDetail = '';

  switch (rule.type) {
    case 'CYCLE': {
      const result = shouldTriggerCycle(rule, year);
      shouldTrigger = result.trigger;
      if (shouldTrigger) {
        amount = calculateCycleCapex(rule, year, students || 0);
        triggerDetail = `Cycle-based reinvestment (every ${rule.cycleYears} years)`;
      }
      break;
    }

    case 'UTILIZATION': {
      if (utilization === undefined) {
        return null; // Need utilization to check
      }
      shouldTrigger = shouldTriggerUtilization(rule, year, utilization);
      if (shouldTrigger) {
        amount = calculateUtilizationCapex(
          rule,
          year,
          students || 0,
          capacity || 0
        );
        triggerDetail = `Utilization-based reinvestment (threshold: ${rule.threshold * 100}%)`;
      }
      break;
    }

    case 'CUSTOM_DATE': {
      shouldTrigger = shouldTriggerCustomDate(rule, year);
      if (shouldTrigger) {
        amount = calculateCustomDateCapex(rule, year);
        triggerDetail = `Custom date reinvestment`;
      }
      break;
    }
  }

  if (!shouldTrigger) {
    return null;
  }

  return {
    year,
    categoryId: rule.categoryId,
    categoryName: rule.categoryName,
    amount,
    triggerDetail,
    isOverride: false,
  };
}

/**
 * Generate capex schedule from rules
 */
export function generateCapexSchedule(
  rules: CapexRule[],
  studentSchedule: number[],
  capacitySchedule: number[],
  utilizationSchedule: number[],
  startYear: number = MODEL_START_YEAR,
  endYear: number = MODEL_END_YEAR,
  overrides?: Map<number, { categoryId: string; amount: number; reason: string }>
): CapexResult[] {
  const schedule: CapexResult[] = [];
  const totalYears = endYear - startYear + 1;

  for (let i = 0; i < totalYears; i++) {
    const year = startYear + i;
    const students = studentSchedule[i] || 0;
    const capacity = capacitySchedule[i] || 0;
    const utilization = utilizationSchedule[i] || 0;

    // Check for override first
    const override = overrides?.get(year);
    if (override) {
      const rule = rules.find((r) => r.categoryId === override.categoryId);
      schedule.push({
        year,
        categoryId: override.categoryId,
        categoryName: rule?.categoryName || 'Unknown',
        amount: override.amount,
        triggerDetail: 'Manual override',
        isOverride: true,
        overrideReason: override.reason,
      });
      continue;
    }

    // Check each rule
    for (const rule of rules) {
      const result = calculateCapex(
        rule,
        year,
        students,
        capacity,
        utilization
      );

      if (result) {
        schedule.push(result);
      }
    }
  }

  return schedule;
}

