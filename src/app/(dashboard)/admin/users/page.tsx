/**
 * User management page (Admin only)
 * Lists all users and allows CRUD operations
 */

import { redirect } from 'next/navigation';
import type { JSX } from 'react';

import { UserManagement } from '@/components/features/admin/user-management';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getServerUser, requireRole } from '@/lib/auth/session';

export default async function AdminUsersPage(): Promise<JSX.Element> {
  try {
    await requireRole('ADMIN');
  } catch {
    redirect('/unauthorized');
  }

  const user = await getServerUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            Manage user accounts, roles, and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserManagement />
        </CardContent>
      </Card>
    </div>
  );
}

