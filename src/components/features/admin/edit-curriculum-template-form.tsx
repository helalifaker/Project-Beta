/**
 * Edit curriculum template form
 * Form for editing existing curriculum templates
 */

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import type { JSX } from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const updateTemplateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200).optional(),
  capacity: z.number().int().positive('Capacity must be positive').optional(),
  tuitionBase: z.number().positive('Tuition base must be positive').optional(),
  cpiRate: z.number().min(0, 'CPI rate must be >= 0').max(1, 'CPI rate must be <= 1').optional(),
  cpiFrequency: z.enum(['ANNUAL', 'EVERY_2_YEARS', 'EVERY_3_YEARS']).optional(),
});

type UpdateTemplateFormData = z.infer<typeof updateTemplateSchema>;

async function fetchTemplate(id: string): Promise<{
  id: string;
  name: string;
  capacity: number;
  tuitionBase: number;
  cpiRate: number;
  cpiFrequency: 'ANNUAL' | 'EVERY_2_YEARS' | 'EVERY_3_YEARS';
}> {
  const response = await fetch(`/api/v1/admin/curriculum-templates/${id}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch template');
  }

  const result = await response.json();
  return result.data;
}

async function updateTemplate(id: string, data: UpdateTemplateFormData): Promise<void> {
  const response = await fetch(`/api/v1/admin/curriculum-templates/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to update template');
  }
}

interface EditCurriculumTemplateFormProps {
  templateId: string;
}

export function EditCurriculumTemplateForm({
  templateId,
}: EditCurriculumTemplateFormProps): JSX.Element {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: template, isLoading } = useQuery({
    queryKey: ['curriculum-template', templateId],
    queryFn: () => fetchTemplate(templateId),
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UpdateTemplateFormData>({
    resolver: zodResolver(updateTemplateSchema),
    ...(template
      ? {
          values: {
            name: template.name,
            capacity:
              typeof template.capacity === 'number' ? template.capacity : Number(template.capacity),
            tuitionBase:
              typeof template.tuitionBase === 'number'
                ? template.tuitionBase
                : Number(template.tuitionBase),
            cpiRate:
              typeof template.cpiRate === 'number' ? template.cpiRate : Number(template.cpiRate),
            cpiFrequency: template.cpiFrequency,
          },
        }
      : {}),
  });

  const cpiFrequency = watch('cpiFrequency');

  const mutation = useMutation({
    mutationFn: (data: UpdateTemplateFormData) => updateTemplate(templateId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['curriculum-templates'] });
      queryClient.invalidateQueries({ queryKey: ['curriculum-template', templateId] });
      router.push('/admin/curriculum-templates');
    },
    onError: (error) => {
      console.error('Failed to update template:', error);
      alert(error instanceof Error ? error.message : 'Failed to update template');
    },
  });

  const onSubmit = async (data: UpdateTemplateFormData): Promise<void> => {
    setIsSubmitting(true);
    try {
      await mutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div>Loading template...</div>;
  }

  if (!template) {
    return <div>Template not found</div>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          {...register('name')}
          className={errors.name ? 'border-destructive' : ''}
        />
        {errors.name ? (
          <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
        ) : null}
      </div>

      <div>
        <Label htmlFor="capacity">Capacity</Label>
        <Input
          id="capacity"
          type="number"
          {...register('capacity', { valueAsNumber: true })}
          className={errors.capacity ? 'border-destructive' : ''}
        />
        {errors.capacity ? (
          <p className="text-sm text-destructive mt-1">{errors.capacity.message}</p>
        ) : null}
      </div>

      <div>
        <Label htmlFor="tuitionBase">Tuition Base (SAR)</Label>
        <Input
          id="tuitionBase"
          type="number"
          step="0.01"
          {...register('tuitionBase', { valueAsNumber: true })}
          className={errors.tuitionBase ? 'border-destructive' : ''}
        />
        {errors.tuitionBase ? (
          <p className="text-sm text-destructive mt-1">{errors.tuitionBase.message}</p>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="cpiRate">CPI Rate</Label>
          <Input
            id="cpiRate"
            type="number"
            step="0.0001"
            {...register('cpiRate', { valueAsNumber: true })}
            placeholder="e.g., 0.025 (2.5%)"
            className={errors.cpiRate ? 'border-destructive' : ''}
          />
          {errors.cpiRate ? (
            <p className="text-sm text-destructive mt-1">{errors.cpiRate.message}</p>
          ) : null}
        </div>

        <div>
          <Label htmlFor="cpiFrequency">CPI Frequency</Label>
          <Select
            {...(cpiFrequency ? { value: cpiFrequency } : {})}
            onValueChange={(value) =>
              setValue('cpiFrequency', value as UpdateTemplateFormData['cpiFrequency'])
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ANNUAL">Annual</SelectItem>
              <SelectItem value="EVERY_2_YEARS">Every 2 Years</SelectItem>
              <SelectItem value="EVERY_3_YEARS">Every 3 Years</SelectItem>
            </SelectContent>
          </Select>
          {errors.cpiFrequency ? (
            <p className="text-sm text-destructive mt-1">{errors.cpiFrequency.message}</p>
          ) : null}
        </div>
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/curriculum-templates')}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
