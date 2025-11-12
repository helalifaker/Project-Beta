/**
 * Audit log page
 * View system activity and changes
 */

import { redirect } from 'next/navigation';
import type { JSX } from 'react';
import { Suspense } from 'react';

import { AuditLogViewer } from '@/components/features/admin/audit-log-viewer';
import { requireRole } from '@/lib/auth/session';

export default async function AuditLogPage(): Promise<JSX.Element> {
  try {
    await requireRole('ADMIN');
  } catch {
    redirect('/unauthorized');
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Audit Log</h1>
        <p className="text-muted-foreground">View system activity and changes</p>
      </div>
      <Suspense fallback={<div>Loading audit log...</div>}>
        <AuditLogViewer />
      </Suspense>
    </div>
  );
}
