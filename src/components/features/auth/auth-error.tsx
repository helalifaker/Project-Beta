/**
 * Auth error handling component
 * Displays user-friendly error messages for auth failures
 */

import { Alert, AlertDescription } from '@/components/ui/alert';
import type { JSX } from 'react';

interface AuthErrorProps {
  error: string | Error | null;
  className?: string;
}

export function AuthError({ error, className }: AuthErrorProps): JSX.Element | null {
  if (!error) {
    return null;
  }

  const errorMessage =
    typeof error === 'string' ? error : error.message || 'An error occurred';

  // Map common error codes to user-friendly messages
  const friendlyMessages: Record<string, string> = {
    'Invalid login credentials': 'Invalid email or password. Please try again.',
    'Email not confirmed': 'Please check your email and confirm your account.',
    'User already registered': 'An account with this email already exists.',
    'Password should be at least 8 characters':
      'Password must be at least 8 characters long.',
    'UNAUTHORIZED': 'You must be signed in to access this page.',
    'FORBIDDEN': 'You do not have permission to perform this action.',
  };

  const displayMessage =
    friendlyMessages[errorMessage] || errorMessage;

  return (
    <Alert variant="destructive" className={className}>
      <AlertDescription>{displayMessage}</AlertDescription>
    </Alert>
  );
}

