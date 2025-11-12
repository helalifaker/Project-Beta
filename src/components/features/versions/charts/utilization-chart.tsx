/**
import type { JSX } from 'react';
 * Utilization chart component
 * Tremor AreaChart showing capacity utilization
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { AreaChart } from '@tremor/react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface UtilizationChartProps {
  versionId: string;
}

async function fetchUtilizationData(versionId: string): Promise<
  Array<{
    year: number;
    utilization: number;
  }>
> {
  const response = await fetch(`/api/v1/versions/${versionId}/metrics/utilization`);
  if (!response.ok) {
    throw new Error('Failed to fetch utilization data');
  }
  const data = await response.json();
  return data.data || [];
}

export function UtilizationChart({ versionId }: UtilizationChartProps): JSX.Element {
  const { data = [], isLoading } = useQuery({
    queryKey: ['utilization-chart', versionId],
    queryFn: () => fetchUtilizationData(versionId),
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div>Loading chart...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Capacity Utilization</CardTitle>
      </CardHeader>
      <CardContent>
        <AreaChart
          data={data}
          index="year"
          categories={['utilization']}
          colors={['blue']}
          valueFormatter={(value) => `${(value * 100).toFixed(1)}%`}
          className="h-80"
        />
      </CardContent>
    </Card>
  );
}
