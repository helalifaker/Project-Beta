/**
 * Edit curriculum template page
 * Admin-only page for editing existing curriculum templates
 */

import { redirect } from 'next/navigation';
import type { JSX } from 'react';
import { Suspense } from 'react';

import { EditCurriculumTemplateForm } from '@/components/features/admin/edit-curriculum-template-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { requireRole } from '@/lib/auth/session';

export default async function EditCurriculumTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<JSX.Element> {
  try {
    await requireRole('ADMIN');
  } catch {
    redirect('/unauthorized');
  }

  const { id } = await params;

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Edit Curriculum Template</h1>
        <p className="text-muted-foreground">
          Update curriculum template settings
        </p>
      </div>

      <Suspense fallback={<div>Loading template...</div>}>
        <Card>
          <CardHeader>
            <CardTitle>Template Details</CardTitle>
            <CardDescription>
              Update the curriculum template configuration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EditCurriculumTemplateForm templateId={id} />
          </CardContent>
        </Card>
      </Suspense>
    </div>
  );
}

