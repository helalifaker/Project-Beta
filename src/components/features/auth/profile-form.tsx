/**
 * Profile form component
 * Allows users to view and update their profile
 */

'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { User } from '@/types/auth';

interface ProfileFormProps {
  user: User;
}

export function ProfileForm({ user }: ProfileFormProps): JSX.Element {
  const router = useRouter();

  const [email] = useState(user.email);
  const [role] = useState(user.role);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const getRoleBadgeVariant = (userRole: User['role']) => {
    switch (userRole) {
      case 'ADMIN':
        return 'destructive';
      case 'ANALYST':
        return 'default';
      case 'VIEWER':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-6">
      {error ? <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert> : null}

      {success ? <Alert>
          <AlertDescription>Profile updated successfully</AlertDescription>
        </Alert> : null}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} disabled />
          <p className="text-sm text-[--color-muted-foreground]">
            Email cannot be changed. Contact an administrator if you need to update your email.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <div className="flex items-center gap-2">
            <Badge variant={getRoleBadgeVariant(role)}>{role}</Badge>
          </div>
          <p className="text-sm text-[--color-muted-foreground]">
            Your role determines what actions you can perform. Contact an administrator to change your role.
          </p>
        </div>

        <div className="space-y-2">
          <Label>Account Created</Label>
          <p className="text-sm text-[--color-muted-foreground]">
            {new Date(user.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={() => router.push('/auth/reset-password')}
        >
          Change Password
        </Button>
      </div>
    </div>
  );
}

