/**
 * Balance Sheet table component
 * Displays Balance Sheet in years-as-columns format (2023-2052)
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, CheckCircle2, XCircle } from 'lucide-react';
import { MODEL_START_YEAR, MODEL_END_YEAR, RAMP_YEARS, HISTORY_YEARS } from '@/lib/finance/constants';
import { formatCurrency } from '@/lib/utils/format';
import { exportToCsv, exportToExcel } from '@/lib/utils/export';

interface BalanceSheetTableProps {
  versionId: string;
}

interface BSLineItem {
  label: string;
  values: Record<number, number>;
  level: number;
  category: 'ASSET' | 'LIABILITY' | 'EQUITY';
  isSubtotal?: boolean;
  isTotal?: boolean;
}

interface ConvergenceInfo {
  balanced: boolean;
  passes: number;
  tolerance: number;
}

async function fetchBalanceSheet(versionId: string): Promise<{
  lineItems: BSLineItem[];
  convergence: ConvergenceInfo;
}> {
  const response = await fetch(`/api/v1/versions/${versionId}/statements/bs`);
  if (!response.ok) {
    throw new Error('Failed to fetch Balance Sheet');
  }
  const data = await response.json();
  return data.data || { lineItems: [], convergence: { balanced: false, passes: 0, tolerance: 0 } };
}

function isHistoryYear(year: number): boolean {
  return HISTORY_YEARS.includes(year as (typeof HISTORY_YEARS)[number]);
}

function isRampYear(year: number): boolean {
  return RAMP_YEARS.includes(year as (typeof RAMP_YEARS)[number]);
}

export function BalanceSheetTable({ versionId }: BalanceSheetTableProps): JSX.Element {
  const { data, isLoading } = useQuery({
    queryKey: ['bs-statement', versionId],
    queryFn: () => fetchBalanceSheet(versionId),
  });

  const lineItems = data?.lineItems || [];
  const convergence = data?.convergence || { balanced: false, passes: 0, tolerance: 0 };

  const years = Array.from(
    { length: MODEL_END_YEAR - MODEL_START_YEAR + 1 },
    (_, i) => MODEL_START_YEAR + i
  );

  const handleExportCsv = (): void => {
    exportToCsv(lineItems, `balance-sheet-${versionId}.csv`);
  };

  const handleExportExcel = (): void => {
    exportToExcel(lineItems, `balance-sheet-${versionId}.xlsx`);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div>Loading Balance Sheet...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Balance Sheet</CardTitle>
            <div className="flex items-center gap-2 mt-2">
              {convergence.balanced ? (
                <Badge variant="fluent" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Balanced
                </Badge>
              ) : (
                <Badge variant="destructive" className="gap-1">
                  <XCircle className="h-3 w-3" />
                  Not Balanced
                </Badge>
              )}
              <span className="text-sm text-muted-foreground">
                Passes: {convergence.passes} | Tolerance: {convergence.tolerance.toFixed(2)} SAR
              </span>
            </div>
          </div>
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
