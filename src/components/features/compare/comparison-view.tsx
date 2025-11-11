/**
 * Comparison view component
 * Side-by-side comparison of multiple versions
 */

'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ComparisonTable } from './comparison-table';
import { ComparisonCharts } from './comparison-charts';
import { NPVComparison } from './npv-comparison';

async function fetchVersions(): Promise<Array<{
  id: string;
  name: string;
  status: string;
}>> {
  const response = await fetch('/api/v1/versions');
  if (!response.ok) {
    throw new Error('Failed to fetch versions');
  }
  const data = await response.json();
  return data.data || [];
}

export function ComparisonView(): JSX.Element {
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);

  const { data: versions = [] } = useQuery({
    queryKey: ['versions'],
    queryFn: fetchVersions,
  });

  const handleVersionSelect = (versionId: string, index: number): void => {
    const newSelected = [...selectedVersions];
    newSelected[index] = versionId;
    setSelectedVersions(newSelected);
  };

  return (
    <div className="space-y-6">
      {/* Version Selectors */}
      <Card>
        <CardHeader>
          <CardTitle>Select Versions to Compare</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {[0, 1, 2].map((index) => (
              <div key={index}>
                <Select
                  value={selectedVersions[index] || ''}
                  onValueChange={(value) => handleVersionSelect(value, index)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`Version ${index + 1}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {versions.map((version) => (
                      <SelectItem key={version.id} value={version.id}>
                        {version.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Comparison Tables */}
      {selectedVersions.filter(Boolean).length >= 2 && (
        <>
          <ComparisonTable versionIds={selectedVersions.filter(Boolean)} />
          <ComparisonCharts versionIds={selectedVersions.filter(Boolean)} />
          <NPVComparison versionIds={selectedVersions.filter(Boolean)} />
        </>
      )}
    </div>
  );
}

