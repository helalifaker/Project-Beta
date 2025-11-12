/**
 * Create curriculum template form
 * Form for creating new curriculum templates
 */

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
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

const createTemplateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  slug: z.string().min(1, 'Slug is required').max(100).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens only'),
  capacity: z.number().int().positive('Capacity must be positive'),
  launchYear: z.number().int().min(2023).max(2052).optional(),
  tuitionBase: z.number().positive('Tuition base must be positive'),
  cpiRate: z.number().min(0, 'CPI rate must be >= 0').max(1, 'CPI rate must be <= 1'),
  cpiFrequency: z.enum(['ANNUAL', 'EVERY_2_YEARS', 'EVERY_3_YEARS']),
});

type CreateTemplateFormData = z.infer<typeof createTemplateSchema>;

async function createTemplate(data: CreateTemplateFormData): Promise<{ id: string }> {
  const response = await fetch('/api/v1/admin/curriculum-templates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      ...data,
      launchYear: data.launchYear || 2028,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to create template');
  }

  const result = await response.json();
  return result.data;
}

export function CreateCurriculumTemplateForm(): JSX.Element {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateTemplateFormData>({
    resolver: zodResolver(createTemplateSchema),
    defaultValues: {
      launchYear: 2028,
      cpiFrequency: 'ANNUAL',
    },
  });

  const cpiFrequency = watch('cpiFrequency');

  const mutation = useMutation({
    mutationFn: createTemplate,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['curriculum-templates'] });
      router.push(`/admin/curriculum-templates/${data.id}`);
    },
    onError: (error) => {
      console.error('Failed to create template:', error);
      alert(error instanceof Error ? error.message : 'Failed to create template');
    },
  });

  const onSubmit = async (data: CreateTemplateFormData): Promise<void> => {
    setIsSubmitting(true);
    try {
      await mutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const name = e.target.value;
    register('name').onChange(e);
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    setValue('slug', slug, { shouldValidate: true });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          {...register('name')}
          onChange={handleNameChange}
          placeholder="e.g., French Curriculum"
          className={errors.name ? 'border-destructive' : ''}
        />
        {errors.name ? <p className="text-sm text-destructive mt-1">{errors.name.message}</p> : null}
      </div>

      <div>
        <Label htmlFor="slug">Slug *</Label>
        <Input
          id="slug"
          {...register('slug')}
          placeholder="e.g., french-curriculum"
          className={errors.slug ? 'border-destructive' : ''}
        />
        {errors.slug ? <p className="text-sm text-destructive mt-1">{errors.slug.message}</p> : null}
        <p className="text-xs text-muted-foreground mt-1">
          URL-friendly identifier (auto-generated from name)
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="capacity">Capacity *</Label>
          <Input
            id="capacity"
            type="number"
            {...register('capacity', { valueAsNumber: true })}
            placeholder="e.g., 1200"
            className={errors.capacity ? 'border-destructive' : ''}
          />
          {errors.capacity ? <p className="text-sm text-destructive mt-1">{errors.capacity.message}</p> : null}
        </div>

        <div>
          <Label htmlFor="launchYear">Launch Year</Label>
          <Input
            id="launchYear"
            type="number"
            {...register('launchYear', { valueAsNumber: true })}
            placeholder="2028"
            className={errors.launchYear ? 'border-destructive' : ''}
          />
          {errors.launchYear ? <p className="text-sm text-destructive mt-1">{errors.launchYear.message}</p> : null}
        </div>
      </div>

      <div>
        <Label htmlFor="tuitionBase">Tuition Base (SAR) *</Label>
        <Input
          id="tuitionBase"
          type="number"
          step="0.01"
          {...register('tuitionBase', { valueAsNumber: true })}
          placeholder="e.g., 58000"
          className={errors.tuitionBase ? 'border-destructive' : ''}
        />
        {errors.tuitionBase ? <p className="text-sm text-destructive mt-1">{errors.tuitionBase.message}</p> : null}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="cpiRate">CPI Rate *</Label>
          <Input
            id="cpiRate"
            type="number"
            step="0.0001"
            {...register('cpiRate', { valueAsNumber: true })}
            placeholder="e.g., 0.025 (2.5%)"
            className={errors.cpiRate ? 'border-destructive' : ''}
          />
          {errors.cpiRate ? <p className="text-sm text-destructive mt-1">{errors.cpiRate.message}</p> : null}
        </div>

        <div>
          <Label htmlFor="cpiFrequency">CPI Frequency *</Label>
          <Select
            value={cpiFrequency}
            onValueChange={(value) => setValue('cpiFrequency', value as CreateTemplateFormData['cpiFrequency'])}
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
          {errors.cpiFrequency ? <p className="text-sm text-destructive mt-1">{errors.cpiFrequency.message}</p> : null}
        </div>
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Template'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

