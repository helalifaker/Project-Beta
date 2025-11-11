/**
 * Comparison page
 * Compare multiple versions side-by-side
 */

import { Suspense } from 'react';

import { ComparisonView } from '@/components/features/compare/comparison-view';

export default function ComparePage(): JSX.Element {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Compare Versions</h1>
        <p className="text-muted-foreground">
          Compare financial scenarios side-by-side
        </p>
      </div>
      <Suspense fallback={<div>Loading comparison...</div>}>
        <ComparisonView />
      </Suspense>
    </div>
  );
}

