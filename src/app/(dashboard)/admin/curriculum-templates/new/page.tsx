/**
 * Create curriculum template page
 * Admin-only page for creating new curriculum templates
 */

import { redirect } from 'next/navigation';
import type { JSX } from 'react';

import { CreateCurriculumTemplateForm } from '@/components/features/admin/create-curriculum-template-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { requireRole } from '@/lib/auth/session';

export default async function NewCurriculumTemplatePage(): Promise<JSX.Element> {
  try {
    await requireRole('ADMIN');
  } catch {
    redirect('/unauthorized');
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create Curriculum Template</h1>
        <p className="text-muted-foreground">
          Define a new curriculum template with capacity, ramp, and tuition settings
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Template Details</CardTitle>
          <CardDescription>
            Configure the curriculum template that will be available for version creation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateCurriculumTemplateForm />
        </CardContent>
      </Card>
    </div>
  );
}

