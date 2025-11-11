/**
 * Registration page (Admin only)
 * Allows admin to create new user accounts
 */

'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { JSX } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getSupabaseClient } from '@/lib/supabase/client';
import type { UserRole } from '@/types/auth';


export default function RegisterPage(): JSX.Element {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('ANALYST');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = getSupabaseClient();
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          router.push('/login?redirect=/register');
          return;
        }

        // Check if user has ADMIN role
        const { data: profile, error: profileError } = await supabase
          .from('profile')
          .select('role')
          .eq('external_id', session.user.id)
          .single();

        if (profileError || !profile) {
          setError('User profile not found. Please contact administrator.');
          setIsCheckingAuth(false);
          return;
        }

        if (profile.role !== 'ADMIN') {
          setError('Only administrators can create user accounts.');
          setIsCheckingAuth(false);
          return;
        }

        setIsAuthenticated(true);
      } catch (err) {
        setError('Failed to verify authentication. Please try again.');
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError(null);

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);

    try {
      // Get session token for API request
      const supabase = getSupabaseClient();
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (!currentSession) {
        setError('You must be logged in to create users. Please refresh the page.');
        setIsLoading(false);
        return;
      }

      // Call API endpoint with credentials
      const response = await fetch('/api/v1/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for session
        body: JSON.stringify({
          email,
          password,
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to create user. Please check your permissions.');
        setIsLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/admin/users');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[--color-background] p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-[--color-muted-foreground]">Verifying authentication...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[--color-background] p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>User created successfully</CardTitle>
            <CardDescription>
              Redirecting to user management...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[--color-background] p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              {error || 'You must be logged in as an administrator to create user accounts.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/login?redirect=/register')} fullWidth>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[--color-background] p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create new user</CardTitle>
          <CardDescription>
            Register a new user account (Admin only)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert> : null}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                minLength={8}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
                minLength={8}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                disabled={isLoading}
                className="flex h-10 w-full rounded-md border border-[--color-input] bg-[--color-background] px-3 py-2 text-sm ring-offset-[--color-background] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-ring] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="ANALYST">Analyst</option>
                <option value="VIEWER">Viewer</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            <Button type="submit" fullWidth disabled={isLoading}>
              {isLoading ? 'Creating user...' : 'Create user'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

