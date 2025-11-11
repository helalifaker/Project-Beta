/**
 * Version detail component
 * Displays version information with tabs
 */

'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AssumptionsTab } from './assumptions-tab';
import { StatementsTab } from './statements-tab';
import { OverviewTab } from './overview-tab';
import type { VersionStatus } from '@prisma/client';

async function fetchVersion(id: string): Promise<{
  id: string;
  name: string;
  description?: string | null;
  status: VersionStatus;
  ownerName?: string;
  createdAt: string;
  updatedAt: string;
  lockedAt?: string | null;
}> {
  const response = await fetch(`/api/v1/versions/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch version');
  }

  const data = await response.json();
  return data.data;
}

interface VersionDetailProps {
  versionId: string;
}

export function VersionDetail({ versionId }: VersionDetailProps): JSX.Element {
  const [activeTab, setActiveTab] = useState('overview');

  const { data: version, isLoading } = useQuery({
    queryKey: ['version', versionId],
    queryFn: () => fetchVersion(versionId),
  });

  if (isLoading) {
    return <div>Loading version...</div>;
  }

  if (!version) {
    return <div>Version not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">{version.name}</h1>
          {version.description && (
            <p className="text-muted-foreground">{version.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge>{version.status}</Badge>
          {version.lockedAt && (
            <Badge variant="muted">Locked</Badge>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="assumptions">Assumptions</TabsTrigger>
          <TabsTrigger value="statements">Financial Statements</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab versionId={versionId} />
        </TabsContent>

        <TabsContent value="assumptions">
          <AssumptionsTab versionId={versionId} />
        </TabsContent>

        <TabsContent value="statements">
          <StatementsTab versionId={versionId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

