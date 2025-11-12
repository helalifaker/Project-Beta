/**
import type { JSX } from 'react';
 * Rent load chart component
 * Tremor LineChart showing rent as % of revenue
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { LineChart } from '@tremor/react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RentLoadChartProps {
  versionId: string;
}

async function fetchRentLoadData(versionId: string): Promise<
  Array<{
    year: number;
    rentLoad: number;
  }>
> {
  const response = await fetch(`/api/v1/versions/${versionId}/metrics/rent-load`);
  if (!response.ok) {
    throw new Error('Failed to fetch rent load data');
  }
  const data = await response.json();
  return data.data || [];
}

export function RentLoadChart({ versionId }: RentLoadChartProps): JSX.Element {
  const { data = [], isLoading } = useQuery({
    queryKey: ['rent-load-chart', versionId],
    queryFn: () => fetchRentLoadData(versionId),
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
        <CardTitle>Rent Load (% of Revenue)</CardTitle>
      </CardHeader>
      <CardContent>
        <LineChart
          data={data}
          index="year"
          categories={['rentLoad']}
          colors={['red']}
          valueFormatter={(value) => `${value.toFixed(1)}%`}
          className="h-80"
        />
      </CardContent>
    </Card>
  );
}
