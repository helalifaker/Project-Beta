/**
 * Financial statements API route
 * GET: Generate and return financial statements for a version
 */

import { NextRequest } from 'next/server';

import { NotFoundError } from '@/lib/api/errors';
import { applyApiMiddleware, withErrorHandling } from '@/lib/api/middleware';
import { successResponse } from '@/lib/api/response';
import { idParamSchema } from '@/lib/api/schemas';
import { getOrSetCached } from '@/lib/cache/kv';
import { prisma } from '@/lib/db/prisma';
import { versionRepository } from '@/lib/db/repositories/version-repository';
import { MODEL_START_YEAR, MODEL_END_YEAR } from '@/lib/finance/constants';
import { generateFinancialStatements, type StatementInputs } from '@/lib/finance/statements';

// Note: Cannot use edge runtime with Prisma (requires Node.js)
// Using caching instead for performance
export const revalidate = 60; // Cache for 60 seconds

/**
 * GET /api/v1/versions/[id]/statements
 * Generate financial statements for a version
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  return withErrorHandling(async () => {
    await applyApiMiddleware(request, {
      requireAuth: true,
    });

    const { id } = await params;
    const validated = idParamSchema.parse({ id });

    // Check version exists
    const version = await versionRepository.findUnique({
      id: validated.id,
    });

    if (!version) {
      throw new NotFoundError('Version', validated.id);
    }

    // Fetch version data with assumptions
    const versionData = await prisma.version.findUnique({
      where: { id: validated.id },
      include: {
        curricula: {
          include: {
            curriculumTemplate: {
              include: {
                rampSteps: {
                  orderBy: { sortOrder: 'asc' },
                },
                tuitionAdjustments: true,
              },
            },
            rampOverrides: true,
            tuitionOverrides: true,
          },
        },
      },
    });

    if (!versionData) {
      throw new NotFoundError('Version', validated.id);
    }

    // TODO: Fetch rent, staffing, opex, capex assumptions when data model is complete
    // For now, use default/placeholder values

    const years = MODEL_END_YEAR - MODEL_START_YEAR + 1;
    const yearArray = Array.from({ length: years }, (_, i) => MODEL_START_YEAR + i);

    // TODO: Calculate revenue from curriculum properly
    // For now, use placeholder revenue calculation
    // This needs to be implemented with proper curriculum enrollment projections
    const revenue = yearArray.map(() => 10_000_000); // Placeholder: 10M SAR per year

    // TODO: Calculate rent from rent assumptions (placeholder for now)
    const rent = yearArray.map(() => 5_000_000); // Placeholder

    // TODO: Calculate staffing from staffing assumptions (placeholder for now)
    const staffCosts = yearArray.map(() => 10_000_000); // Placeholder

    // TODO: Calculate OpEx from OpEx assumptions (placeholder for now)
    const opex = yearArray.map((_, i) => (revenue[i] ?? 0) * 0.1); // 10% of revenue placeholder

    // TODO: Calculate capex from capex rules (placeholder for now)
    const capex = yearArray.map(() => 0); // Placeholder

    // TODO: Calculate depreciation from capex (placeholder for now)
    const depreciation = yearArray.map(() => 0); // Placeholder

    // Prepare statement inputs
    const inputs: StatementInputs = {
      revenue,
      staffCosts,
      rent,
      opex,
      capex,
      depreciation,
      beginningCash: 0, // TODO: Get from workspace settings or version
    };

    // Cache key for statements (include version updatedAt for cache invalidation)
    const cacheKey = `statements:${validated.id}:${version.updatedAt.getTime()}`;

    // Generate statements with caching
    const result = await getOrSetCached(
      cacheKey,
      async () => generateFinancialStatements(inputs),
      { ttl: 300 } // Cache for 5 minutes (statements are expensive to compute)
    );

    // Transform to API response format
    const statements = {
      PL: result.pl.reduce(
        (acc, s) => {
          acc[s.year] = {
            revenue: s.revenue,
            cogs: s.cogs,
            grossProfit: s.grossProfit,
            operatingExpenses: s.operatingExpenses,
            ebitda: s.ebitda,
            depreciation: s.depreciation,
            ebit: s.ebit,
            interest: s.interest,
            taxes: s.taxes,
            netIncome: s.netIncome,
          };
          return acc;
        },
        {} as Record<number, unknown>
      ),
      BS: result.bs.reduce(
        (acc, s) => {
          acc[s.year] = {
            cash: s.cash,
            fixedAssets: s.fixedAssets,
            totalAssets: s.totalAssets,
            deferredRevenue: s.deferredRevenue,
            totalLiabilities: s.totalLiabilities,
            retainedEarnings: s.retainedEarnings,
            totalEquity: s.totalEquity,
            totalLiabilitiesAndEquity: s.totalLiabilitiesAndEquity,
            isBalanced: s.isBalanced,
            balanceDifference: s.balanceDifference,
          };
          return acc;
        },
        {} as Record<number, unknown>
      ),
      CF: result.cf.reduce(
        (acc, s) => {
          acc[s.year] = {
            netIncome: s.netIncome,
            depreciation: s.depreciation,
            workingCapitalChange: s.workingCapitalChange,
            operatingCashFlow: s.operatingCashFlow,
            capex: s.capex,
            investingCashFlow: s.investingCashFlow,
            financingCashFlow: s.financingCashFlow,
            netCashChange: s.netCashChange,
            beginningCash: s.beginningCash,
            endingCash: s.endingCash,
          };
          return acc;
        },
        {} as Record<number, unknown>
      ),
    };

    return successResponse({
      convergence: {
        passes: result.convergence.passes,
        tolerance: 0.01,
        status: result.convergence.balanced ? 'OK' : 'FAILED',
      },
      statements,
      actuals: {
        years: [2023, 2024],
        source: null,
        checksum: null,
      },
    });
  })();
}
