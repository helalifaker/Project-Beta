/**
 * Comparison table component
 * Side-by-side comparison with delta calculations
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import type { JSX } from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils/format';

interface ComparisonTableProps {
  versionIds: string[];
}

async function fetchComparisonData(versionIds: string[]): Promise<
  Array<{
    metric: string;
    values: Record<string, Record<number, number>>;
  }>
> {
  const response = await fetch('/api/v1/compare', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ versionIds }),
  });
  if (!response.ok) {
    throw new Error('Failed to fetch comparison data');
  }
  const data = await response.json();
  return data.data || [];
}

export function ComparisonTable({ versionIds }: ComparisonTableProps): JSX.Element {
  const { data: comparisonData = [], isLoading } = useQuery({
    queryKey: ['comparison', versionIds],
    queryFn: () => fetchComparisonData(versionIds),
    enabled: versionIds.length >= 2,
  });

  // Years array for table display (first 10 years)
  // const years = Array.from(
  //   { length: MODEL_END_YEAR - MODEL_START_YEAR + 1 },
  //   (_, i) => MODEL_START_YEAR + i
  // ).slice(0, 10);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div>Loading comparison...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparison Table</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                <th className="text-left p-2 border-b sticky left-0 bg-background z-10 min-w-[200px]">
                  Metric
                </th>
                {versionIds.map((versionId, index) => (
                  <th key={versionId} className="text-right p-2 border-b min-w-[120px]">
                    Version {index + 1}
                  </th>
                ))}
                {versionIds.length >= 2 && (
                  <th className="text-right p-2 border-b min-w-[120px]">Delta</th>
                )}
              </tr>
            </thead>
            <tbody>
              {comparisonData.map((item, index) => (
                <tr key={index}>
                  <td className="p-2 border-b sticky left-0 bg-background z-10 font-medium">
                    {item.metric}
                  </td>
                  {versionIds.map((versionId) => (
                    <td key={versionId} className="text-right p-2 border-b">
                      {formatCurrency(item.values[versionId]?.[2028] || 0)}
                    </td>
                  ))}
                  {versionIds.length >= 2 && (
                    <td className="text-right p-2 border-b">
                      <Badge variant="default">
                        {formatCurrency(
                          (item.values[versionIds[1]]?.[2028] || 0) -
                            (item.values[versionIds[0]]?.[2028] || 0)
                        )}
                      </Badge>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
