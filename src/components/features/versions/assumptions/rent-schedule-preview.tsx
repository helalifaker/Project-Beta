/**
 * Rent schedule preview component
 * Shows 30-year rent schedule preview
 */

'use client';

import { useMemo } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MODEL_START_YEAR, MODEL_END_YEAR } from '@/lib/finance/constants';
import {
  generateFixedEscRentSchedule,
  generateRevenueShareRentSchedule,
  generatePartnerRentSchedule,
  type RentModelType,
} from '@/lib/finance/rent';

interface RentSchedulePreviewProps {
  versionId: string;
  rentModelType: RentModelType;
  formData?: Record<string, unknown>;
}

export function RentSchedulePreview({
  versionId,
  rentModelType,
  formData,
}: RentSchedulePreviewProps): JSX.Element {
  const schedule = useMemo(() => {
    if (!formData) {
      return [];
    }

    try {
      switch (rentModelType) {
        case 'FIXED_ESC': {
          const baseAmount = (formData.baseAmount as number) || 0;
          const escalationRate = (formData.escalationRate as number) || 0;
          const indexationRate = (formData.indexationRate as number) || 0;
          const indexationFrequency = (formData.indexationFrequency as string) || 'ANNUAL';

          if (baseAmount === 0) {
            return [];
          }

          return generateFixedEscRentSchedule(
            {
              baseAmount,
              escalationRate,
              indexationRate: indexationRate > 0 ? indexationRate : undefined,
              indexationFrequency: indexationFrequency as 'ANNUAL' | 'EVERY_2_YEARS' | 'EVERY_3_YEARS',
              startYear: 2028,
            },
            MODEL_START_YEAR,
            MODEL_END_YEAR
          );
        }

        case 'REV_SHARE': {
          // Revenue Share requires revenue schedule - placeholder for now
          const revenueSchedule = Array(30).fill(10_000_000); // Placeholder
          return generateRevenueShareRentSchedule(
            {
              revenuePercentage: (formData.revenuePercentage as number) || 0.15,
              floor: (formData.floor as number) || undefined,
              cap: (formData.cap as number) || undefined,
            },
            revenueSchedule,
            MODEL_START_YEAR,
            MODEL_END_YEAR
          );
        }

        case 'PARTNER': {
          const landSqm = (formData.landSqm as number) || 0;
          const landCostPerSqm = (formData.landCostPerSqm as number) || 0;
          const buaSqm = (formData.buaSqm as number) || 0;
          const buaCostPerSqm = (formData.buaCostPerSqm as number) || 0;
          const yieldRate = (formData.yield as number) || 0;

          if (landSqm === 0 || buaSqm === 0) {
            return [];
          }

          return generatePartnerRentSchedule(
            {
              landSqm,
              landCostPerSqm,
              buaSqm,
              buaCostPerSqm,
              yield: yieldRate,
              yieldIndexationRate: (formData.yieldIndexationRate as number) || undefined,
              yieldIndexationFrequency: (formData.yieldIndexationFrequency as string) as 'ANNUAL' | 'EVERY_2_YEARS' | 'EVERY_3_YEARS' | undefined,
              startYear: 2028,
              currentYear: 2028,
            },
            MODEL_START_YEAR,
            MODEL_END_YEAR
          );
        }

        default:
          return [];
      }
    } catch {
      return [];
    }
  }, [rentModelType, formData]);

  if (schedule.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Rent Schedule Preview (2023-2052)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Configure lease terms above to see rent schedule preview.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rent Schedule Preview (2023-2052)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left p-2">Year</th>
                {schedule.slice(0, 10).map((_, i) => (
                  <th key={i} className="text-right p-2">
                    {MODEL_START_YEAR + i}
                  </th>
                ))}
                <th className="text-right p-2">...</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2 font-medium">Rent (SAR)</td>
                {schedule.slice(0, 10).map((amount, i) => (
                  <td key={i} className="text-right p-2">
                    {amount.toLocaleString('en-SA', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                  </td>
                ))}
                <td className="text-right p-2 text-muted-foreground">...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
