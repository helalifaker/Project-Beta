/**
 * User profile page
 * Displays and allows editing of user profile information
 */

import { getServerUser } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { ProfileForm } from '@/components/features/auth/profile-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { JSX } from 'react';

export default async function ProfilePage(): Promise<JSX.Element> {
  const user = await getServerUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Manage your account settings and preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm user={user} />
        </CardContent>
      </Card>
    </div>
  );
}

