/**
 * Overview dashboard page
 * Displays KPIs, recent versions, and quick actions
 */

import { Plus, BarChart3, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import type { JSX } from 'react';
import { Suspense } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

async function fetchRecentVersions(): Promise<unknown[]> {
  // TODO: Fetch from API when ready
  return [];
}

async function fetchKPIs(): Promise<{
  totalVersions: number;
  activeVersions: number;
  averageMargin: number;
}> {
  // TODO: Fetch from API when ready
  return {
    totalVersions: 0,
    activeVersions: 0,
    averageMargin: 0,
  };
}

export default function OverviewPage(): JSX.Element {
  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your financial planning scenarios
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/versions/new">
              <Plus className="mr-2 h-4 w-4" />
              New Version
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/compare">
              <BarChart3 className="mr-2 h-4 w-4" />
              Compare
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <Suspense fallback={<div>Loading KPIs...</div>}>
        <KPICards />
      </Suspense>

      {/* Recent Versions */}
      <Suspense fallback={<div>Loading recent versions...</div>}>
        <RecentVersions />
      </Suspense>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Button variant="outline" className="h-auto flex-col items-start p-4" asChild>
              <Link href="/versions/new">
                <Plus className="mb-2 h-6 w-6" />
                <span className="font-semibold">Create Version</span>
                <span className="text-sm text-muted-foreground">
                  Start a new financial scenario
                </span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto flex-col items-start p-4" asChild>
              <Link href="/compare">
                <BarChart3 className="mb-2 h-6 w-6" />
                <span className="font-semibold">Compare Versions</span>
                <span className="text-sm text-muted-foreground">
                  Side-by-side analysis
                </span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto flex-col items-start p-4" asChild>
              <Link href="/reports">
                <TrendingUp className="mb-2 h-6 w-6" />
                <span className="font-semibold">Generate Report</span>
                <span className="text-sm text-muted-foreground">
                  Export PDF or Excel
                </span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

async function KPICards(): Promise<JSX.Element> {
  const kpis = await fetchKPIs();

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Versions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{kpis.totalVersions}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Active Versions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{kpis.activeVersions}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Average Margin
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {kpis.averageMargin.toFixed(1)}%
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

async function RecentVersions(): Promise<JSX.Element> {
  const versions = await fetchRecentVersions();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Versions</CardTitle>
        <CardDescription>Your latest financial scenarios</CardDescription>
      </CardHeader>
      <CardContent>
        {versions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No versions yet</p>
            <Button asChild className="mt-4">
              <Link href="/versions/new">Create your first version</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {/* TODO: Render version list */}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

