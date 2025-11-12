/**
 * Admin dashboard page
 * Main admin page with navigation to all admin features
 */

import { redirect } from 'next/navigation';
import type { JSX } from 'react';
import { Suspense } from 'react';

import { AdminDashboard } from '@/components/features/admin/admin-dashboard';
import { requireRole } from '@/lib/auth/session';

export default async function AdminPage(): Promise<JSX.Element> {
  try {
    await requireRole('ADMIN');
  } catch {
    redirect('/unauthorized');
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage workspace settings, templates, and users</p>
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <AdminDashboard />
      </Suspense>
    </div>
  );
}
