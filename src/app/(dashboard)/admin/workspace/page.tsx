/**
 * Workspace settings page
 * Configure workspace-level settings
 */

import { redirect } from 'next/navigation';
import type { JSX } from 'react';
import { Suspense } from 'react';

import { WorkspaceSettings } from '@/components/features/admin/workspace-settings';
import { requireRole } from '@/lib/auth/session';

export default async function WorkspaceSettingsPage(): Promise<JSX.Element> {
  try {
    await requireRole('ADMIN');
  } catch {
    redirect('/unauthorized');
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Workspace Settings</h1>
        <p className="text-muted-foreground">Configure global workspace settings</p>
      </div>
      <Suspense fallback={<div>Loading settings...</div>}>
        <WorkspaceSettings />
      </Suspense>
    </div>
  );
}
