/**
 * Curriculum templates list component
 * Display and manage curriculum templates
 */

'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';


async function fetchCurriculumTemplates(): Promise<Array<{
  id: string;
  name: string;
  slug: string;
  capacity: number;
  tuitionBase: number;
  cpiRate: number;
}>> {
  const response = await fetch('/api/v1/admin/curriculum-templates');
  if (!response.ok) {
    throw new Error('Failed to fetch curriculum templates');
  }
  const data = await response.json();
  return data.data || [];
}

export function CurriculumTemplatesList(): JSX.Element {
  const queryClient = useQueryClient();

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['curriculum-templates'],
    queryFn: fetchCurriculumTemplates,
  });

  if (isLoading) {
    return <div>Loading templates...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Templates</h2>
          <p className="text-sm text-muted-foreground">
            {templates.length} template{templates.length !== 1 ? 's' : ''} configured
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/curriculum-templates/new">
            <Plus className="mr-2 h-4 w-4" />
            New Template
          </Link>
        </Button>
      </div>

      {templates.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12 text-muted-foreground">
              No curriculum templates found. Create your first template to get started.
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>{template.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Capacity: </span>
                    <span className="font-medium">{template.capacity}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Tuition Base: </span>
                    <span className="font-medium">
                      {template.tuitionBase.toLocaleString('en-SA')} SAR
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">CPI Rate: </span>
                    <span className="font-medium">{(Number(template.cpiRate) * 100).toFixed(2)}%</span>
                  </div>
                </div>
                <Button asChild variant="outline" className="mt-4 w-full">
                  <Link href={`/admin/curriculum-templates/${template.id}`}>Edit</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

