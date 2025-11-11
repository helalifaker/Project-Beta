/**
 * Curriculum templates page
 * Manage curriculum templates
 */

import type { JSX } from 'react';
import { Suspense } from 'react';

import { CurriculumTemplatesList } from '@/components/features/admin/curriculum-templates-list';

export default function CurriculumTemplatesPage(): JSX.Element {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Curriculum Templates</h1>
        <p className="text-muted-foreground">
          Manage curriculum templates for version creation
        </p>
      </div>
      <Suspense fallback={<div>Loading templates...</div>}>
        <CurriculumTemplatesList />
      </Suspense>
    </div>
  );
}

