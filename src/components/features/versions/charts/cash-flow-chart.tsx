/**
 * Cash flow chart component
 * Tremor BarChart showing operating, investing, financing cash flows
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { BarChart } from '@tremor/react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CashFlowChartProps {
  versionId: string;
}

async function fetchCashFlowData(versionId: string): Promise<Array<{
  year: number;
  operating: number;
  investing: number;
  financing: number;
}>> {
  const response = await fetch(`/api/v1/versions/${versionId}/statements/cf`);
  if (!response.ok) {
    throw new Error('Failed to fetch cash flow data');
  }
  const data = await response.json();
  // TODO: Extract cash flow categories from CF data
  return [];
}

export function CashFlowChart({ versionId }: CashFlowChartProps): JSX.Element {
  const { data = [], isLoading } = useQuery({
    queryKey: ['cash-flow-chart', versionId],
    queryFn: () => fetchCashFlowData(versionId),
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
        <CardTitle>Cash Flow</CardTitle>
      </CardHeader>
      <CardContent>
        <BarChart
          data={data}
          index="year"
          categories={['operating', 'investing', 'financing']}
          colors={['green', 'red', 'blue']}
          valueFormatter={(value) => `${(value / 1_000_000).toFixed(1)}M SAR`}
          className="h-80"
        />
      </CardContent>
    </Card>
  );
}

