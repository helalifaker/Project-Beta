/**
 * Financial statement generation
 * P&L, Balance Sheet, and Cash Flow statements
 */

import { Decimal, roundCurrency, sum } from './decimal';
import { MODEL_START_YEAR, MODEL_END_YEAR, BALANCE_TOLERANCE } from './constants';

export interface ProfitLossStatement {
  year: number;
  revenue: number;
  cogs: number;
  grossProfit: number;
  operatingExpenses: number;
  ebitda: number;
  depreciation: number;
  ebit: number;
  interest: number;
  taxes: number;
  netIncome: number;
}

export interface BalanceSheet {
  year: number;
  // Assets
  cash: number;
  fixedAssets: number;
  totalAssets: number;
  // Liabilities
  deferredRevenue: number;
  totalLiabilities: number;
  // Equity
  retainedEarnings: number;
  totalEquity: number;
  // Balance check
  totalLiabilitiesAndEquity: number;
  isBalanced: boolean;
  balanceDifference: number;
}

export interface CashFlowStatement {
  year: number;
  // Operating Activities
  netIncome: number;
  depreciation: number;
  workingCapitalChange: number;
  operatingCashFlow: number;
  // Investing Activities
  capex: number;
  investingCashFlow: number;
  // Financing Activities
  financingCashFlow: number;
  // Net Change
  netCashChange: number;
  beginningCash: number;
  endingCash: number;
}

export interface FinancialStatements {
  pl: ProfitLossStatement[];
  bs: BalanceSheet[];
  cf: CashFlowStatement[];
}

export interface StatementInputs {
  revenue: number[]; // By year
  staffCosts: number[]; // By year
  rent: number[]; // By year
  opex: number[]; // By year (total other operating expenses)
  capex: number[]; // By year
  depreciation: number[]; // By year
  interest?: number[]; // By year (optional)
  taxRate?: number; // Tax rate (default: 0)
  workingCapitalChange?: number[]; // By year (optional)
  beginningCash?: number; // Starting cash balance
}

/**
 * Generate P&L statement
 */
export function generateProfitLossStatement(
  inputs: StatementInputs
): ProfitLossStatement[] {
  const statements: ProfitLossStatement[] = [];
  const years = inputs.revenue.length;

  for (let i = 0; i < years; i++) {
    const year = MODEL_START_YEAR + i;
    const revenue = inputs.revenue[i] || 0;
    const staffCosts = inputs.staffCosts[i] || 0;
    const rent = inputs.rent[i] || 0;
    const opex = inputs.opex[i] || 0;

    // COGS = Staff Costs + Rent + OpEx
    const cogs = roundCurrency(
      sum([staffCosts, rent, opex])
    );

    // Gross Profit = Revenue - COGS
    const grossProfit = roundCurrency(
      new Decimal(revenue).minus(cogs)
    );

    // Operating Expenses (non-COGS items - for now, assume 0)
    const operatingExpenses = 0;

    // EBITDA = Gross Profit - Operating Expenses
    const ebitda = roundCurrency(
      new Decimal(grossProfit).minus(operatingExpenses)
    );

    // Depreciation
    const depreciation = inputs.depreciation[i] || 0;

    // EBIT = EBITDA - Depreciation
    const ebit = roundCurrency(
      new Decimal(ebitda).minus(depreciation)
    );

    // Interest
    const interest = inputs.interest?.[i] || 0;

    // EBT = EBIT - Interest
    const ebt = roundCurrency(
      new Decimal(ebit).minus(interest)
    );

    // Taxes
    const taxRate = inputs.taxRate || 0;
    const taxes = roundCurrency(
      new Decimal(ebt).times(taxRate)
    );

    // Net Income = EBT - Taxes
    const netIncome = roundCurrency(
      new Decimal(ebt).minus(taxes)
    );

    statements.push({
      year,
      revenue,
      cogs,
      grossProfit,
      operatingExpenses,
      ebitda,
      depreciation,
      ebit,
      interest,
      taxes,
      netIncome,
    });
  }

  return statements;
}

/**
 * Generate Balance Sheet
 */
export function generateBalanceSheet(
  inputs: StatementInputs,
  cashFlow: CashFlowStatement[]
): BalanceSheet[] {
  const statements: BalanceSheet[] = [];
  const years = inputs.revenue.length;

  let cumulativeRetainedEarnings = 0;
  let cumulativeFixedAssets = 0;
  let cumulativeDepreciation = 0;

  for (let i = 0; i < years; i++) {
    const year = MODEL_START_YEAR + i;
    const netIncome = cashFlow[i]?.netIncome || 0;
    const capex = inputs.capex[i] || 0;
    const depreciation = inputs.depreciation[i] || 0;
    const endingCash = cashFlow[i]?.endingCash || 0;

    // Update retained earnings
    cumulativeRetainedEarnings = roundCurrency(
      new Decimal(cumulativeRetainedEarnings).plus(netIncome)
    );

    // Update fixed assets
    cumulativeFixedAssets = roundCurrency(
      new Decimal(cumulativeFixedAssets).plus(capex).minus(depreciation)
    );
    cumulativeDepreciation = roundCurrency(
      new Decimal(cumulativeDepreciation).plus(depreciation)
    );

    // Assets
    const cash = endingCash;
    const fixedAssets = Math.max(0, cumulativeFixedAssets); // Can't be negative
    const totalAssets = roundCurrency(
      sum([cash, fixedAssets])
    );

    // Liabilities
    const deferredRevenue = 0; // TODO: Calculate deferred revenue if needed
    const totalLiabilities = deferredRevenue;

    // Equity
    const retainedEarnings = cumulativeRetainedEarnings;
    const totalEquity = retainedEarnings;

    // Balance check
    const totalLiabilitiesAndEquity = roundCurrency(
      sum([totalLiabilities, totalEquity])
    );

    const balanceDifference = Math.abs(
      totalAssets - totalLiabilitiesAndEquity
    );
    const isBalanced = balanceDifference <= BALANCE_TOLERANCE;

    statements.push({
      year,
      cash,
      fixedAssets,
      totalAssets,
      deferredRevenue,
      totalLiabilities,
      retainedEarnings,
      totalEquity,
      totalLiabilitiesAndEquity,
      isBalanced,
      balanceDifference,
    });
  }

  return statements;
}

/**
 * Generate Cash Flow statement
 */
export function generateCashFlowStatement(
  inputs: StatementInputs,
  pl: ProfitLossStatement[]
): CashFlowStatement[] {
  const statements: CashFlowStatement[] = [];
  const years = inputs.revenue.length;

  let beginningCash = inputs.beginningCash || 0;

  for (let i = 0; i < years; i++) {
    const year = MODEL_START_YEAR + i;
    const plStatement = pl[i];

    // Operating Activities
    const netIncome = plStatement.netIncome;
    const depreciation = plStatement.depreciation;
    const workingCapitalChange = inputs.workingCapitalChange?.[i] || 0;

    const operatingCashFlow = roundCurrency(
      sum([netIncome, depreciation]).minus(workingCapitalChange)
    );

    // Investing Activities
    const capex = inputs.capex[i] || 0;
    const investingCashFlow = roundCurrency(-capex); // Negative (outflow)

    // Financing Activities
    const financingCashFlow = 0; // TODO: Add financing if needed

    // Net Cash Change
    const netCashChange = roundCurrency(
      sum([operatingCashFlow, investingCashFlow, financingCashFlow])
    );

    // Ending Cash
    const endingCash = roundCurrency(
      new Decimal(beginningCash).plus(netCashChange)
    );

    statements.push({
      year,
      netIncome,
      depreciation,
      workingCapitalChange,
      operatingCashFlow,
      capex,
      investingCashFlow,
      financingCashFlow,
      netCashChange,
      beginningCash,
      endingCash,
    });

    // Update beginning cash for next year
    beginningCash = endingCash;
  }

  return statements;
}

/**
 * Generate all financial statements with iterative convergence
 * 
 * @param inputs - Statement inputs
 * @param maxPasses - Maximum number of convergence passes (default: 3)
 * @returns Financial statements with convergence info
 */
export function generateFinancialStatements(
  inputs: StatementInputs,
  maxPasses: number = 3
): FinancialStatements & { convergence: { passes: number; balanced: boolean } } {
  // Pass 1: Generate P&L, then Cash Flow, then Balance Sheet
  let pl = generateProfitLossStatement(inputs);
  let cf = generateCashFlowStatement(inputs, pl);
  let bs = generateBalanceSheet(inputs, cf);

  let passes = 1;
  let balanced = bs.every((s) => s.isBalanced);

  // Iterate until balanced or max passes reached
  while (!balanced && passes < maxPasses) {
    // Update inputs with cash from Balance Sheet
    const updatedInputs: StatementInputs = {
      ...inputs,
      beginningCash: bs[0]?.cash || inputs.beginningCash,
    };

    // Regenerate statements
    pl = generateProfitLossStatement(updatedInputs);
    cf = generateCashFlowStatement(updatedInputs, pl);
    bs = generateBalanceSheet(updatedInputs, cf);

    passes++;
    balanced = bs.every((s) => s.isBalanced);
  }

  return {
    pl,
    bs,
    cf,
    convergence: {
      passes,
      balanced,
    },
  };
}

