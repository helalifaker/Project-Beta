/**
 * Enrollment projections table
 * Years-as-columns table showing enrollment by curriculum
 */

'use client';

import type { JSX } from 'react';
import { useMemo } from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { MODEL_START_YEAR, MODEL_END_YEAR, RAMP_YEARS } from '@/lib/finance/constants';

interface EnrollmentProjectionsTableProps {
  versionId: string;
  curriculumId: string;
  customCapacity?: number;
}

export function EnrollmentProjectionsTable({
  versionId: _versionId,
  curriculumId: _curriculumId,
  customCapacity,
}: EnrollmentProjectionsTableProps): JSX.Element {
  // TODO: Fetch actual enrollment projections from API
  // For now, show placeholder structure
  const years = useMemo(() => {
    return Array.from(
      { length: MODEL_END_YEAR - MODEL_START_YEAR + 1 },
      (_, i) => MODEL_START_YEAR + i
    );
  }, []);

  const isRampYear = (year: number): boolean => {
    return RAMP_YEARS.includes(year as (typeof RAMP_YEARS)[number]);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                <th className="text-left p-2 border-b sticky left-0 bg-background">Year</th>
                {years.map((year) => (
                  <th
                    key={year}
                    className={`text-right p-2 border-b min-w-[100px] ${
                      isRampYear(year) ? 'bg-muted' : ''
                    }`}
                  >
                    {year}
                    {isRampYear(year) && (
                      <Badge variant="muted" className="ml-1 text-xs">
                        Ramp
                      </Badge>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2 font-medium border-b sticky left-0 bg-background">Enrollment</td>
                {years.map((year) => (
                  <td
                    key={year}
                    className={`text-right p-2 border-b ${isRampYear(year) ? 'bg-muted' : ''}`}
                  >
                    -
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-2 font-medium border-b sticky left-0 bg-background">Capacity</td>
                {years.map((year) => (
                  <td
                    key={year}
                    className={`text-right p-2 border-b ${isRampYear(year) ? 'bg-muted' : ''}`}
                  >
                    {customCapacity || '-'}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-2 font-medium border-b sticky left-0 bg-background">
                  Utilization
                </td>
                {years.map((year) => (
                  <td
                    key={year}
                    className={`text-right p-2 border-b ${isRampYear(year) ? 'bg-muted' : ''}`}
                  >
                    -
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
