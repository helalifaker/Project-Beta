/**
 * Admin dashboard page
 * Main admin page with navigation to all admin features
 */

import { Suspense } from 'react';
import { AdminDashboard } from '@/components/features/admin/admin-dashboard';

export default function AdminPage(): JSX.Element {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage workspace settings, templates, and users
        </p>
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <AdminDashboard />
      </Suspense>
    </div>
  );
}

