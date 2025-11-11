/**
 * Capex schedule preview component
 * Shows capex schedule by category and year
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MODEL_START_YEAR, MODEL_END_YEAR } from '@/lib/finance/constants';

interface CapexSchedulePreviewProps {
  versionId: string;
}

export function CapexSchedulePreview({ versionId }: CapexSchedulePreviewProps): JSX.Element {
  // TODO: Fetch capex rules and generate schedule
  const years = Array.from(
    { length: MODEL_END_YEAR - MODEL_START_YEAR + 1 },
    (_, i) => MODEL_START_YEAR + i
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Capex Schedule Preview (2023-2052)</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Configure capex rules above to see schedule preview.
        </p>
      </CardContent>
    </Card>
  );
}

