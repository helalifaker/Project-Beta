/**
 * Version overview tab
 * Displays version summary and metadata
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface OverviewTabProps {
  versionId: string;
}

export function OverviewTab({ versionId: _versionId }: OverviewTabProps): JSX.Element {
  // TODO: Fetch version details and display summary
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Version Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Version details and summary will be displayed here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
