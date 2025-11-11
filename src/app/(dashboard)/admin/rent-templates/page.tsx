/**
 * Rent templates page
 * Manage rent model templates
 */

import { Suspense } from 'react';

import { RentTemplatesList } from '@/components/features/admin/rent-templates-list';

export default function RentTemplatesPage(): JSX.Element {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Rent Templates</h1>
        <p className="text-muted-foreground">
          Manage reusable rent model templates
        </p>
      </div>
      <Suspense fallback={<div>Loading templates...</div>}>
        <RentTemplatesList />
      </Suspense>
    </div>
  );
}

