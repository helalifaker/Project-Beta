/**
 * Version list page
 * Displays all versions with filtering and sorting
 */

import type { JSX } from 'react';
import { Suspense } from 'react';

import { VersionList } from '@/components/features/versions/version-list';

export default function VersionsPage(): JSX.Element {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Versions</h1>
        <p className="text-muted-foreground">
          Manage and compare financial planning scenarios
        </p>
      </div>
      <Suspense fallback={<div>Loading versions...</div>}>
        <VersionList />
      </Suspense>
    </div>
  );
}

