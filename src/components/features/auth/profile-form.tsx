/**
 * Profile form component
 * Allows users to view and update their profile
 */

'use client';

import type { JSX } from 'react';
import { useState } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updatePassword } from '@/lib/auth/utils';
import type { User } from '@/types/auth';

interface ProfileFormProps {
  user: User;
}

export function ProfileForm({ user }: ProfileFormProps): JSX.Element {
  const [email] = useState(user.email);
  const [role] = useState(user.role);

  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const getRoleBadgeVariant = (
    userRole: User['role']
  ): 'destructive' | 'default' | 'outline' | 'muted' | 'fluent' | null | undefined => {
    switch (userRole) {
      case 'ADMIN':
        return 'destructive';
      case 'ANALYST':
        return 'default';
      case 'VIEWER':
        return 'outline';
      default:
        return 'default';
    }
  };

  const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    // Validation
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }

    setIsUpdatingPassword(true);

    try {
      const { error: updateError } = await updatePassword(newPassword);

      if (updateError) {
        setPasswordError(updateError.message || 'Failed to update password');
        setIsUpdatingPassword(false);
        return;
      }

      setPasswordSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordForm(false);

      setTimeout(() => {
        setPasswordSuccess(false);
      }, 3000);
    } catch {
      setPasswordError('An unexpected error occurred. Please try again.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
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
            Your role determines what actions you can perform. Contact an administrator to change
            your role.
          </p>
        </div>

        <div className="space-y-2">
          <Label>Account Created</Label>
          <p className="text-sm text-[--color-muted-foreground]">
            {new Date(user.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Password Change Section */}
      <div className="border-t pt-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Password</Label>
              <p className="text-sm text-[--color-muted-foreground]">
                {showPasswordForm
                  ? 'Set a new password for your account'
                  : 'Change your account password'}
              </p>
            </div>
            {!showPasswordForm && (
              <Button variant="outline" onClick={() => setShowPasswordForm(true)}>
                Change Password
              </Button>
            )}
          </div>

          {passwordSuccess ? (
            <Alert>
              <AlertDescription>Password updated successfully!</AlertDescription>
            </Alert>
          ) : null}

          {passwordError ? (
            <Alert variant="destructive">
              <AlertDescription>{passwordError}</AlertDescription>
            </Alert>
          ) : null}

          {showPasswordForm ? (
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={isUpdatingPassword}
                  minLength={8}
                />
                <p className="text-xs text-[--color-muted-foreground]">
                  Must be at least 8 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isUpdatingPassword}
                  minLength={8}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isUpdatingPassword}>
                  {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowPasswordForm(false);
                    setPasswordError(null);
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                  disabled={isUpdatingPassword}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : null}
        </div>
      </div>
    </div>
  );
}
