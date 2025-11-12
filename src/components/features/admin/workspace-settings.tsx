/**
 * Workspace settings component
 * Form to configure workspace settings
 */

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDebouncedCallback } from '@/lib/utils/debounce';

const workspaceSettingsSchema = z.object({
  name: z.string().min(1).max(200),
  baseCurrency: z.string().length(3),
  timezone: z.string(),
  discountRate: z.number().min(0).max(1),
  cpiMin: z.number().min(0).max(1),
  cpiMax: z.number().min(0).max(1),
});

type WorkspaceSettingsFormData = z.infer<typeof workspaceSettingsSchema>;

async function fetchWorkspaceSettings(): Promise<WorkspaceSettingsFormData> {
  const response = await fetch('/api/v1/admin/workspace');
  if (!response.ok) {
    throw new Error('Failed to fetch workspace settings');
  }
  const data = await response.json();
  return data.data;
}

async function updateWorkspaceSettings(
  data: Partial<WorkspaceSettingsFormData>
): Promise<WorkspaceSettingsFormData> {
  const response = await fetch('/api/v1/admin/workspace', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to update workspace settings');
  }
  const result = await response.json();
  return result.data;
}

export function WorkspaceSettings(): JSX.Element {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['workspace-settings'],
    queryFn: fetchWorkspaceSettings,
  });

  const updateMutation = useMutation({
    mutationFn: updateWorkspaceSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-settings'] });
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<WorkspaceSettingsFormData>({
    resolver: zodResolver(workspaceSettingsSchema),
    defaultValues: {
      name: '',
      baseCurrency: 'SAR',
      timezone: 'Asia/Riyadh',
      discountRate: 0.08,
      cpiMin: 0.02,
      cpiMax: 0.05,
    },
  });

  useEffect(() => {
    if (settings) {
      reset({
        name: settings.name,
        baseCurrency: settings.baseCurrency,
        timezone: settings.timezone,
        discountRate: Number(settings.discountRate),
        cpiMin: Number(settings.cpiMin),
        cpiMax: Number(settings.cpiMax),
      });
    }
  }, [settings, reset]);

  const debouncedSave = useDebouncedCallback((data: Partial<WorkspaceSettingsFormData>) => {
    updateMutation.mutate(data);
  }, 2000);

  const watchedValues = watch();

  useEffect(() => {
    if (settings && Object.keys(watchedValues).length > 0) {
      debouncedSave(watchedValues);
    }
  }, [watchedValues, debouncedSave, settings]);

  const onSubmit = async (data: WorkspaceSettingsFormData): Promise<void> => {
    await updateMutation.mutateAsync(data);
  };

  if (isLoading) {
    return <div>Loading settings...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Workspace Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label htmlFor="name">Workspace Name</Label>
            <Input id="name" {...register('name')} />
            {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
          </div>

          <div>
            <Label htmlFor="baseCurrency">Base Currency</Label>
            <Input id="baseCurrency" {...register('baseCurrency')} />
            {errors.baseCurrency ? (
              <p className="text-sm text-destructive">{errors.baseCurrency.message}</p>
            ) : null}
          </div>

          <div>
            <Label htmlFor="timezone">Timezone</Label>
            <Input id="timezone" {...register('timezone')} />
            {errors.timezone ? (
              <p className="text-sm text-destructive">{errors.timezone.message}</p>
            ) : null}
          </div>

          <div>
            <Label htmlFor="discountRate">Discount Rate (%)</Label>
            <Input
              id="discountRate"
              type="number"
              step="0.001"
              {...register('discountRate', { valueAsNumber: true })}
            />
            {errors.discountRate ? (
              <p className="text-sm text-destructive">{errors.discountRate.message}</p>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cpiMin">CPI Min (%)</Label>
              <Input
                id="cpiMin"
                type="number"
                step="0.001"
                {...register('cpiMin', { valueAsNumber: true })}
              />
              {errors.cpiMin ? (
                <p className="text-sm text-destructive">{errors.cpiMin.message}</p>
              ) : null}
            </div>

            <div>
              <Label htmlFor="cpiMax">CPI Max (%)</Label>
              <Input
                id="cpiMax"
                type="number"
                step="0.001"
                {...register('cpiMax', { valueAsNumber: true })}
              />
              {errors.cpiMax ? (
                <p className="text-sm text-destructive">{errors.cpiMax.message}</p>
              ) : null}
            </div>
          </div>

          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? 'Saving...' : 'Save Settings'}
          </Button>
          {updateMutation.isSuccess ? (
            <div role="status" aria-live="polite" className="text-sm text-green-600">
              Settings saved successfully
            </div>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}
