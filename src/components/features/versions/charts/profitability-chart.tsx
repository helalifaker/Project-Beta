/**
 * Profitability chart component
 * Tremor AreaChart showing EBITDA and Net Income
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { AreaChart } from '@tremor/react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ProfitabilityChartProps {
  versionId: string;
}

async function fetchProfitabilityData(versionId: string): Promise<Array<{
  year: number;
  ebitda: number;
  netIncome: number;
}>> {
  const response = await fetch(`/api/v1/versions/${versionId}/statements/pl`);
  if (!response.ok) {
    throw new Error('Failed to fetch profitability data');
  }
  const data = await response.json();
  // TODO: Extract EBITDA and Net Income from P&L data
  return [];
}

export function ProfitabilityChart({ versionId }: ProfitabilityChartProps): JSX.Element {
  const { data = [], isLoading } = useQuery({
    queryKey: ['profitability-chart', versionId],
    queryFn: () => fetchProfitabilityData(versionId),
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
        <CardTitle>Profitability</CardTitle>
      </CardHeader>
      <CardContent>
        <AreaChart
          data={data}
          index="year"
          categories={['ebitda', 'netIncome']}
          colors={['green', 'blue']}
          valueFormatter={(value) => `${(value / 1_000_000).toFixed(1)}M SAR`}
          className="h-80"
        />
      </CardContent>
    </Card>
  );
}

