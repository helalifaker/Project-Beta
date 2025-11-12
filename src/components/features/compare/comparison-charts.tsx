/**
 * Comparison charts component
 * Tremor charts comparing multiple versions
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { LineChart } from '@tremor/react';
import type { JSX } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ComparisonChartsProps {
  versionIds: string[];
}

async function fetchComparisonChartData(versionIds: string[]): Promise<
  Array<{
    year: number;
    [key: string]: number;
  }>
> {
  const response = await fetch('/api/v1/compare/charts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ versionIds }),
  });
  if (!response.ok) {
    throw new Error('Failed to fetch comparison chart data');
  }
  const data = await response.json();
  return data.data || [];
}

export function ComparisonCharts({ versionIds }: ComparisonChartsProps): JSX.Element {
  const { data = [], isLoading } = useQuery({
    queryKey: ['comparison-charts', versionIds],
    queryFn: () => fetchComparisonChartData(versionIds),
    enabled: versionIds.length >= 2,
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div>Loading charts...</div>
        </CardContent>
      </Card>
    );
  }

  const categories = versionIds.map((_, index) => `version${index + 1}`);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparison Charts</CardTitle>
      </CardHeader>
      <CardContent>
        <LineChart
          data={data}
          index="year"
          categories={categories}
          colors={['blue', 'green', 'red']}
          valueFormatter={(value) => `${(value / 1_000_000).toFixed(1)}M SAR`}
          className="h-80"
        />
      </CardContent>
    </Card>
  );
}
