/**
 * Rent templates list component
 * Display and manage rent templates
 */

'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2 } from 'lucide-react';

async function fetchRentTemplates(): Promise<Array<{
  id: string;
  name: string;
  type: string;
  params: Record<string, unknown>;
}>> {
  const response = await fetch('/api/v1/admin/rent-templates');
  if (!response.ok) {
    throw new Error('Failed to fetch rent templates');
  }
  const data = await response.json();
  return data.data || [];
}

async function deleteRentTemplate(id: string): Promise<void> {
  const response = await fetch(`/api/v1/admin/rent-templates/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete rent template');
  }
}

export function RentTemplatesList(): JSX.Element {
  const queryClient = useQueryClient();

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['rent-templates'],
    queryFn: fetchRentTemplates,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRentTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rent-templates'] });
    },
  });

  const getTypeBadgeVariant = (type: string): 'default' | 'outline' | 'fluent' => {
    switch (type) {
      case 'FIXED_ESC':
        return 'default';
      case 'REV_SHARE':
        return 'outline';
      case 'PARTNER':
        return 'fluent';
      default:
        return 'default';
    }
  };

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
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Template
        </Button>
      </div>

      {templates.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12 text-muted-foreground">
              No rent templates found. Create your first template to get started.
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{template.name}</CardTitle>
                  <Badge variant={getTypeBadgeVariant(template.type)}>
                    {template.type.replace('_', ' ')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground mb-4">
                  {Object.keys(template.params).length} parameter
                  {Object.keys(template.params).length !== 1 ? 's' : ''}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteMutation.mutate(template.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

