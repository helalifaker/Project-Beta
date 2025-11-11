/**
 * Revenue chart component
 * Tremor LineChart showing revenue trends
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { LineChart } from '@tremor/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RevenueChartProps {
  versionId: string;
}

async function fetchRevenueData(versionId: string): Promise<Array<{
  year: number;
  revenue: number;
}>> {
  const response = await fetch(`/api/v1/versions/${versionId}/statements/pl`);
  if (!response.ok) {
    throw new Error('Failed to fetch revenue data');
  }
  const data = await response.json();
  // TODO: Extract revenue from P&L data
  return [];
}

export function RevenueChart({ versionId }: RevenueChartProps): JSX.Element {
  const { data = [], isLoading } = useQuery({
    queryKey: ['revenue-chart', versionId],
    queryFn: () => fetchRevenueData(versionId),
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
        <CardTitle>Revenue Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <LineChart
          data={data}
          index="year"
          categories={['revenue']}
          colors={['blue']}
          valueFormatter={(value) => `${(value / 1_000_000).toFixed(1)}M SAR`}
          className="h-80"
        />
      </CardContent>
    </Card>
  );
}

