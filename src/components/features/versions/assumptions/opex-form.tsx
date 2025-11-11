/**
 * OpEx form
 * Configure operating expenses (revenue-based percentages)
 */

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDebouncedCallback } from '@/lib/utils/debounce';


import { OpExSchedulePreview } from './opex-schedule-preview';

const opExCategorySchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  revenuePercentage: z.number().min(0).max(1),
});

const opExSchema = z.object({
  categories: z.array(opExCategorySchema),
});

type OpExFormData = z.infer<typeof opExSchema>;

interface OpExFormProps {
  versionId: string;
}

async function saveOpExConfig(
  versionId: string,
  data: OpExFormData
): Promise<void> {
  const response = await fetch(`/api/v1/versions/${versionId}/assumptions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      section: 'OPEX',
      data,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to save OpEx config');
  }
}

export function OpExForm({ versionId }: OpExFormProps): JSX.Element {
  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<OpExFormData>({
    resolver: zodResolver(opExSchema),
    defaultValues: {
      categories: [
        { id: 'utilities', name: 'Utilities', revenuePercentage: 0.025 },
        { id: 'maintenance', name: 'Maintenance', revenuePercentage: 0.015 },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'categories',
  });

  const saveMutation = useMutation({
    mutationFn: (data: OpExFormData) => saveOpExConfig(versionId, data),
  });

  const debouncedSave = useDebouncedCallback(
    (data: OpExFormData) => {
      saveMutation.mutate(data);
    },
    2000
  );

  const watchedValues = watch();

  useEffect(() => {
    if (watchedValues.categories && watchedValues.categories.length > 0) {
      debouncedSave(watchedValues);
    }
  }, [watchedValues, debouncedSave]);

  const onSubmit = async (data: OpExFormData): Promise<void> => {
    await saveMutation.mutateAsync(data);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Operating Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-end gap-4 p-4 border rounded-lg">
                  <div className="flex-1">
                    <Label htmlFor={`categories.${index}.name`}>Category Name</Label>
                    <Input
                      {...register(`categories.${index}.name`)}
                      placeholder="e.g., Utilities"
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor={`categories.${index}.revenuePercentage`}>
                      Revenue Percentage (%)
                    </Label>
                    <Input
                      type="number"
                      step="0.001"
                      {...register(`categories.${index}.revenuePercentage`, {
                        valueAsNumber: true,
                      })}
                      placeholder="2.5"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => append({ id: '', name: '', revenuePercentage: 0 })}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>

            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving...' : 'Save OpEx Config'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* OpEx Schedule Preview */}
      <OpExSchedulePreview versionId={versionId} categories={watchedValues.categories || []} />
    </div>
  );
}
