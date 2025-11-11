/**
 * Client-side auth callback page
 * Handles magic link redirects with hash fragments (#access_token=...)
 * Hash fragments are client-side only and cannot be read server-side
 */

'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { JSX } from 'react';

import { getSupabaseClient } from '@/lib/supabase/client';

export default function AuthCallbackPage(): JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function handleCallback(): Promise<void> {
      try {
        const supabase = getSupabaseClient();
        const redirect = searchParams.get('redirect') || '/';

        // Clean up the pathname if it has wildcards (Supabase sometimes adds /**)
        const cleanPathname = window.location.pathname.replace(/\/\*\*$/, '').replace(/\/\*$/, '');
        if (cleanPathname !== window.location.pathname) {
          // Redirect to clean URL if pathname was modified
          const newUrl = new URL(window.location.href);
          newUrl.pathname = cleanPathname;
          window.history.replaceState({}, '', newUrl.toString());
        }

        // Check for hash fragment (magic link format: #access_token=...&type=magiclink)
        const hash = window.location.hash.substring(1); // Remove the #
        const hashParams = new URLSearchParams(hash);

        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');
        const errorParam = hashParams.get('error');
        const errorDescription = hashParams.get('error_description');

        // Check for errors in hash fragment
        if (errorParam) {
          console.error('Auth error in hash:', errorParam, errorDescription);
          setError(errorDescription || errorParam || 'Authentication failed');
          setIsLoading(false);
          setTimeout(() => {
            router.push(`/login?error=${encodeURIComponent(errorParam)}&redirect=${encodeURIComponent(redirect)}`);
          }, 2000);
          return;
        }

        // If we have tokens in hash, set the session
        if (accessToken && refreshToken) {
          const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            console.error('Session error:', sessionError);
            setError(sessionError.message || 'Failed to create session. Please try again.');
            setIsLoading(false);
            setTimeout(() => {
              router.push(`/login?error=session&redirect=${encodeURIComponent(redirect)}`);
            }, 2000);
            return;
          }

          if (!sessionData.session) {
            console.error('No session returned after setSession');
            setError('Failed to create session. Please try again.');
            setIsLoading(false);
            setTimeout(() => {
              router.push(`/login?error=session&redirect=${encodeURIComponent(redirect)}`);
            }, 2000);
            return;
          }

          // Get the user to ensure profile exists
          const {
            data: { user },
            error: userError,
          } = await supabase.auth.getUser();

          if (userError || !user) {
            console.error('User error:', userError);
            setError('Failed to get user information.');
            setIsLoading(false);
            setTimeout(() => {
              router.push(`/login?error=user&redirect=${encodeURIComponent(redirect)}`);
            }, 2000);
            return;
          }

          // Ensure profile exists by calling API endpoint
          try {
            const profileResponse = await fetch('/api/auth/ensure-profile', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
            });

            if (!profileResponse.ok) {
              console.error('Failed to ensure profile exists');
              // Continue anyway - profile might be created on next request
            }
          } catch (profileError) {
            console.error('Profile creation error:', profileError);
            // Continue anyway - profile might be created on next request
          }

          // Redirect to intended page
          router.push(redirect);
          router.refresh();
          return;
        }

        // Check for query params (PKCE flow: ?code=... or ?token_hash=...)
        const code = searchParams.get('code');
        const tokenHash = searchParams.get('token_hash');
        const tokenType = searchParams.get('type');

        // If we have a code, call server-side API handler
        if (code) {
          const apiResponse = await fetch('/api/auth/callback', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code }),
          });

          if (!apiResponse.ok) {
            const errorData = await apiResponse.json();
            setError(errorData.error || 'Authentication failed.');
            setIsLoading(false);
            setTimeout(() => {
              router.push(`/login?error=exchange&redirect=${encodeURIComponent(redirect)}`);
            }, 2000);
            return;
          }

          // Get the user to ensure profile exists
          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (user) {
            // Ensure profile exists
            try {
              await fetch('/api/auth/ensure-profile', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
              });
            } catch (profileError) {
              console.error('Profile creation error:', profileError);
            }

            router.push(redirect);
            router.refresh();
            return;
          }
        }

        // If we have token_hash, verify it via API
        if (tokenHash && tokenType) {
          const apiResponse = await fetch('/api/auth/callback', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              token_hash: tokenHash,
              type: tokenType,
            }),
          });

          if (!apiResponse.ok) {
            const errorData = await apiResponse.json();
            setError(errorData.error || 'Invalid or expired link.');
            setIsLoading(false);
            setTimeout(() => {
              router.push(`/login?error=verification&redirect=${encodeURIComponent(redirect)}`);
            }, 2000);
            return;
          }

          // Get the user to ensure profile exists
          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (user) {
            // Ensure profile exists
            try {
              await fetch('/api/auth/ensure-profile', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
              });
            } catch (profileError) {
              console.error('Profile creation error:', profileError);
            }

            router.push(redirect);
            router.refresh();
            return;
          }
        }

        // No valid auth parameters found
        setError('Invalid authentication link. Please request a new magic link.');
        setIsLoading(false);
        setTimeout(() => {
          router.push(`/login?error=invalid&redirect=${encodeURIComponent(redirect)}`);
        }, 3000);
      } catch (err) {
        console.error('Callback error:', err);
        setError('An unexpected error occurred.');
        setIsLoading(false);
        setTimeout(() => {
          router.push('/login?error=unknown');
        }, 2000);
      }
    }

    handleCallback();
  }, [router, searchParams]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[--color-background]">
        <div className="text-center">
          <div className="mb-4 text-lg font-medium">Signing you in...</div>
          <div className="text-sm text-[--color-muted-foreground]">
            Please wait while we complete your authentication.
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[--color-background] p-4">
        <div className="text-center">
          <div className="mb-4 text-lg font-medium text-[--color-destructive]">
            Authentication Error
          </div>
          <div className="mb-4 text-sm text-[--color-muted-foreground]">{error}</div>
          <div className="text-xs text-[--color-muted-foreground]">
            Redirecting to login...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[--color-background]">
      <div className="text-center">
        <div className="mb-4 text-lg font-medium">Redirecting...</div>
      </div>
    </div>
  );
}
