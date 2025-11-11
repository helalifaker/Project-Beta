/**
 * Profit & Loss table component
 * Displays P&L statement in years-as-columns format (2023-2052)
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { MODEL_START_YEAR, MODEL_END_YEAR, RAMP_YEARS, HISTORY_YEARS } from '@/lib/finance/constants';
import { formatCurrency } from '@/lib/utils/format';
import { exportToCsv, exportToExcel } from '@/lib/utils/export';

interface ProfitLossTableProps {
  versionId: string;
}

interface PnLLineItem {
  label: string;
  values: Record<number, number>;
  level: number;
  isSubtotal?: boolean;
  isTotal?: boolean;
}

async function fetchPnLStatement(versionId: string): Promise<PnLLineItem[]> {
  const response = await fetch(`/api/v1/versions/${versionId}/statements/pl`);
  if (!response.ok) {
    throw new Error('Failed to fetch P&L statement');
  }
  const data = await response.json();
  return data.data || [];
}

function isHistoryYear(year: number): boolean {
  return HISTORY_YEARS.includes(year as (typeof HISTORY_YEARS)[number]);
}

function isRampYear(year: number): boolean {
  return RAMP_YEARS.includes(year as (typeof RAMP_YEARS)[number]);
}

export function ProfitLossTable({ versionId }: ProfitLossTableProps): JSX.Element {
  const { data: lineItems = [], isLoading } = useQuery({
    queryKey: ['pl-statement', versionId],
    queryFn: () => fetchPnLStatement(versionId),
  });

  const years = Array.from(
    { length: MODEL_END_YEAR - MODEL_START_YEAR + 1 },
    (_, i) => MODEL_START_YEAR + i
  );

  const handleExportCsv = (): void => {
    exportToCsv(lineItems, `pl-statement-${versionId}.csv`);
  };

  const handleExportExcel = (): void => {
    exportToExcel(lineItems, `pl-statement-${versionId}.xlsx`);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div>Loading P&L statement...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Profit & Loss Statement</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCsv}>
              <Download className="mr-2 h-4 w-4" />
              CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportExcel}>
              <Download className="mr-2 h-4 w-4" />
              Excel
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                <th className="text-left p-2 border-b sticky left-0 bg-background z-10 min-w-[200px]">
                  Line Item
                </th>
                {years.map((year) => (
                  <th
                    key={year}
                    className={`text-right p-2 border-b min-w-[100px] ${
                      isRampYear(year) ? 'bg-muted' : ''
                    }`}
                  >
                    <div className="flex flex-col items-end gap-1">
                      <span>{year}</span>
                      {isHistoryYear(year) && (
                        <Badge variant="muted" className="text-xs">
                          Actual
                        </Badge>
                      )}
                      {isRampYear(year) && (
                        <Badge variant="default" className="text-xs">
                          Ramp
                        </Badge>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item, index) => (
                <tr
                  key={index}
                  className={item.isTotal ? 'font-bold border-t-2' : item.isSubtotal ? 'font-semibold' : ''}
                >
                  <td
                    className={`p-2 border-b sticky left-0 bg-background z-10 ${
                      item.level > 0 ? `pl-${item.level * 4}` : ''
                    }`}
                  >
                    {item.label}
                  </td>
                  {years.map((year) => (
                    <td
                      key={year}
                      className={`text-right p-2 border-b ${
                        isRampYear(year) ? 'bg-muted' : ''
                      }`}
                    >
                      {formatCurrency(item.values[year] || 0)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
