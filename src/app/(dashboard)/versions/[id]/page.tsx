/**
 * Version detail page
 * Displays version details with tabs for assumptions and statements
 */

import type { JSX } from 'react';
import { Suspense } from 'react';

import { VersionDetail } from '@/components/features/versions/version-detail';

export default function VersionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): JSX.Element {
  return (
    <Suspense fallback={<div>Loading version...</div>}>
      <VersionDetailWrapper params={params} />
    </Suspense>
  );
}

async function VersionDetailWrapper({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<JSX.Element> {
  const { id } = await params;

  return (
    <div className="container py-8">
      <VersionDetail versionId={id} />
    </div>
  );
}

