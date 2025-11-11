/**
 * OpEx schedule preview component
 * Shows OpEx by category and year
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MODEL_START_YEAR, MODEL_END_YEAR } from '@/lib/finance/constants';

interface OpExSchedulePreviewProps {
  versionId: string;
  categories: Array<{ id: string; name: string; revenuePercentage: number }>;
}

export function OpExSchedulePreview({
  versionId,
  categories,
}: OpExSchedulePreviewProps): JSX.Element {
  // TODO: Fetch revenue schedule and calculate OpEx
  const years = Array.from(
    { length: MODEL_END_YEAR - MODEL_START_YEAR + 1 },
    (_, i) => MODEL_START_YEAR + i
  );

  if (categories.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>OpEx Schedule Preview (2023-2052)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Add OpEx categories above to see schedule preview.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>OpEx Schedule Preview (2023-2052)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left p-2">Category</th>
                {years.slice(0, 10).map((year) => (
                  <th key={year} className="text-right p-2">
                    {year}
                  </th>
                ))}
                <th className="text-right p-2">...</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id}>
                  <td className="p-2 font-medium">{category.name}</td>
                  {years.slice(0, 10).map((year) => (
                    <td key={year} className="text-right p-2">
                      -
                    </td>
                  ))}
                  <td className="text-right p-2 text-muted-foreground">...</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

