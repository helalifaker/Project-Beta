/**
 * Unauthorized page
 * Shown when user doesn't have required permissions
 */

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { JSX } from 'react';

export default function UnauthorizedPage(): JSX.Element {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[--color-background] p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>
            You don't have permission to access this page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-[--color-muted-foreground]">
            If you believe this is an error, please contact your administrator.
          </p>
          <div className="flex gap-4">
            <Link href="/overview">
              <Button variant="outline">Go to Dashboard</Button>
            </Link>
            <Link href="/profile">
              <Button>View Profile</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

