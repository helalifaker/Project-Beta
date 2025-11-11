/**
 * Audit log page
 * View system activity and changes
 */

import type { JSX } from 'react';
import { Suspense } from 'react';

import { AuditLogViewer } from '@/components/features/admin/audit-log-viewer';

export default function AuditLogPage(): JSX.Element {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Audit Log</h1>
        <p className="text-muted-foreground">
          View system activity and changes
        </p>
      </div>
      <Suspense fallback={<div>Loading audit log...</div>}>
        <AuditLogViewer />
      </Suspense>
    </div>
  );
}

