/**
 * Reports page
 * Generate and export financial reports
 */

import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import type { JSX } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ReportsPage(): JSX.Element {
  return (
    <div className="container py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Reports</h1>
        <p className="text-muted-foreground">
          Generate and export financial reports
        </p>
      </div>

      {/* Report Types */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Executive Summary</CardTitle>
            <CardDescription>High-level overview PDF report</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" disabled>
              <FileText className="mr-2 h-4 w-4" />
              Generate PDF
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              TODO: Implement PDF generation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Financial Statements</CardTitle>
            <CardDescription>P&L, Balance Sheet, Cash Flow Excel export</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" disabled>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Export Excel
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              TODO: Implement Excel export
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Comparison Report</CardTitle>
            <CardDescription>Side-by-side version comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" disabled>
              <Download className="mr-2 h-4 w-4" />
              Generate Report
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              TODO: Implement comparison export
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Export History */}
      <Card>
        <CardHeader>
          <CardTitle>Export History</CardTitle>
          <CardDescription>Previously generated reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No exports yet</p>
            <p className="text-sm mt-2">
              Export history will appear here once you generate reports
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

