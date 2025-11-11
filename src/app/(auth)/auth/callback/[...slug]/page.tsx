/**
 * Catch-all route for auth callback
 * Handles cases where Supabase redirects with wildcards like /auth/callback/**
 * Redirects to the main callback page
 */

'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import type { JSX } from 'react';

export default function AuthCallbackCatchAll(): JSX.Element {
  const router = useRouter();

  useEffect(() => {
    // Preserve hash and search params
    const hash = window.location.hash;
    const search = window.location.search;
    
    // Redirect to clean callback URL
    const newUrl = `/auth/callback${search}${hash}`;
    router.replace(newUrl);
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[--color-background]">
      <div className="text-center">
        <div className="mb-4 text-lg font-medium">Redirecting...</div>
      </div>
    </div>
  );
}

