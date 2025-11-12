/**
import type { JSX } from 'react';
 * Staffing projections table
 * Shows headcount and costs by year
 */

'use client';

import { Card, CardContent } from '@/components/ui/card';
import { MODEL_START_YEAR, MODEL_END_YEAR } from '@/lib/finance/constants';

interface StaffingProjectionsTableProps {
  versionId: string;
  config: {
    teacherRatio?: number;
    nonTeacherRatio?: number;
    teacherAvgCost?: number;
    nonTeacherAvgCost?: number;
  };
}

export function StaffingProjectionsTable({
  versionId: _versionId,
  config: _config,
}: StaffingProjectionsTableProps): JSX.Element {
  // TODO: Calculate and display actual staffing projections
  const years = Array.from(
    { length: MODEL_END_YEAR - MODEL_START_YEAR + 1 },
    (_, i) => MODEL_START_YEAR + i
  );

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                <th className="text-left p-2 border-b sticky left-0 bg-background">Metric</th>
                {years.slice(0, 10).map((year) => (
                  <th key={year} className="text-right p-2 border-b min-w-[100px]">
                    {year}
                  </th>
                ))}
                <th className="text-right p-2 border-b">...</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2 font-medium border-b sticky left-0 bg-background">
                  Teacher Headcount
                </td>
                {years.slice(0, 10).map((year) => (
                  <td key={year} className="text-right p-2 border-b">
                    -
                  </td>
                ))}
                <td className="text-right p-2 border-b text-muted-foreground">...</td>
              </tr>
              <tr>
                <td className="p-2 font-medium border-b sticky left-0 bg-background">
                  Non-Teacher Headcount
                </td>
                {years.slice(0, 10).map((year) => (
                  <td key={year} className="text-right p-2 border-b">
                    -
                  </td>
                ))}
                <td className="text-right p-2 border-b text-muted-foreground">...</td>
              </tr>
              <tr>
                <td className="p-2 font-medium border-b sticky left-0 bg-background">
                  Total Staff Cost (SAR)
                </td>
                {years.slice(0, 10).map((year) => (
                  <td key={year} className="text-right p-2 border-b">
                    -
                  </td>
                ))}
                <td className="text-right p-2 border-b text-muted-foreground">...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
