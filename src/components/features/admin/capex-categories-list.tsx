/**
 * Capex categories list component
 * Display and manage capex categories
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import type { JSX } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

async function fetchCapexCategories(): Promise<
  Array<{
    id: string;
    name: string;
    description?: string | null;
  }>
> {
  const response = await fetch('/api/v1/admin/capex-categories');
  if (!response.ok) {
    throw new Error('Failed to fetch capex categories');
  }
  const data = await response.json();
  return data.data || [];
}

async function deleteCapexCategory(id: string): Promise<void> {
  const response = await fetch(`/api/v1/admin/capex-categories/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete capex category');
  }
}

export function CapexCategoriesList(): JSX.Element {
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['capex-categories'],
    queryFn: fetchCapexCategories,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCapexCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['capex-categories'] });
    },
  });

  if (isLoading) {
    return <div>Loading categories...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Capex Categories</h2>
          <p className="text-sm text-muted-foreground">
            {categories.length} categor{categories.length !== 1 ? 'ies' : 'y'} configured
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Category
        </Button>
      </div>

      {categories.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12 text-muted-foreground">
              No capex categories found. Create your first category to get started.
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Card key={category.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>{category.name}</CardTitle>
              </CardHeader>
              <CardContent>
                {category.description ? (
                  <p className="text-sm text-muted-foreground mb-4">{category.description}</p>
                ) : null}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteMutation.mutate(category.id)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
