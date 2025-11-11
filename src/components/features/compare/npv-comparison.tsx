/**
 * NPV comparison component
 * Compare rent NPV across versions
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { BarChart } from '@tremor/react';
import type React from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils/format';

interface NPVComparisonProps {
  versionIds: string[];
}

interface NPVData {
  versionId: string;
  versionName: string;
  npv: number;
}

async function fetchNPVComparison(versionIds: string[]): Promise<NPVData[]> {
  const response = await fetch('/api/v1/compare/npv', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ versionIds }),
  });
  if (!response.ok) {
    throw new Error('Failed to fetch NPV comparison');
  }
  const data = await response.json();
  return data.data || [];
}

export function NPVComparison({ versionIds }: NPVComparisonProps): React.JSX.Element {
  const { data = [], isLoading } = useQuery<NPVData[]>({
    queryKey: ['npv-comparison', versionIds],
    queryFn: () => fetchNPVComparison(versionIds),
    enabled: versionIds.length >= 2,
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div>Loading NPV comparison...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rent NPV Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* NPV Values */}
          <div className="grid grid-cols-3 gap-4">
            {data.map((item: NPVData) => (
              <div key={item.versionId} className="p-4 border rounded-lg">
                <div className="text-sm text-muted-foreground">{item.versionName}</div>
                <div className="text-2xl font-bold">{formatCurrency(item.npv)}</div>
              </div>
            ))}
          </div>

          {/* NPV Chart */}
          <BarChart
            data={data.map((item: NPVData) => ({
              version: item.versionName,
              npv: item.npv,
            }))}
            index="version"
            categories={['npv']}
            colors={['blue']}
            valueFormatter={(value: number) => formatCurrency(value)}
            className="h-80"
          />
        </div>
      </CardContent>
    </Card>
  );
}

