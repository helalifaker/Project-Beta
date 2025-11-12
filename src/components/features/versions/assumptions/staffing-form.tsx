/**
 * Staffing form
 * Configure staffing ratios and costs
 */

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDebouncedCallback } from '@/lib/utils/debounce';

import { StaffingProjectionsTable } from './staffing-projections-table';

const staffingSchema = z.object({
  teacherRatio: z.number().positive(),
  nonTeacherRatio: z.number().positive(),
  teacherAvgCost: z.number().positive(),
  nonTeacherAvgCost: z.number().positive(),
  teacherEscalationRate: z.number().min(0).max(0.2),
  nonTeacherEscalationRate: z.number().min(0).max(0.2),
});

type StaffingFormData = z.infer<typeof staffingSchema>;

interface StaffingFormProps {
  versionId: string;
}

async function saveStaffingConfig(versionId: string, data: StaffingFormData): Promise<void> {
  const response = await fetch(`/api/v1/versions/${versionId}/assumptions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      section: 'STAFFING',
      data,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to save staffing config');
  }
}

export function StaffingForm({ versionId }: StaffingFormProps): JSX.Element {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<StaffingFormData>({
    resolver: zodResolver(staffingSchema),
    defaultValues: {
      teacherRatio: 20,
      nonTeacherRatio: 50,
      teacherAvgCost: 120_000,
      nonTeacherAvgCost: 80_000,
      teacherEscalationRate: 0.03,
      nonTeacherEscalationRate: 0.025,
    },
  });

  const saveMutation = useMutation({
    mutationFn: (data: StaffingFormData) => saveStaffingConfig(versionId, data),
  });

  const debouncedSave = useDebouncedCallback((data: StaffingFormData) => {
    saveMutation.mutate(data);
  }, 2000);

  const watchedValues = watch();

  useEffect(() => {
    if (Object.keys(watchedValues).length > 0) {
      debouncedSave(watchedValues);
    }
  }, [watchedValues, debouncedSave]);

  const onSubmit = async (data: StaffingFormData): Promise<void> => {
    await saveMutation.mutateAsync(data);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Staffing Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              {/* Teacher Configuration */}
              <div className="space-y-4">
                <h3 className="font-semibold">Teachers</h3>
                <div>
                  <Label htmlFor="teacherRatio">Student:Teacher Ratio</Label>
                  <Input
                    id="teacherRatio"
                    type="number"
                    {...register('teacherRatio', { valueAsNumber: true })}
                  />
                  {errors.teacherRatio ? (
                    <p className="text-sm text-destructive">{errors.teacherRatio.message}</p>
                  ) : null}
                </div>

                <div>
                  <Label htmlFor="teacherAvgCost">Average Cost (SAR)</Label>
                  <Input
                    id="teacherAvgCost"
                    type="number"
                    {...register('teacherAvgCost', { valueAsNumber: true })}
                  />
                </div>

                <div>
                  <Label htmlFor="teacherEscalationRate">Escalation Rate (%)</Label>
                  <Input
                    id="teacherEscalationRate"
                    type="number"
                    step="0.01"
                    {...register('teacherEscalationRate', { valueAsNumber: true })}
                  />
                </div>
              </div>

              {/* Non-Teacher Configuration */}
              <div className="space-y-4">
                <h3 className="font-semibold">Non-Teachers</h3>
                <div>
                  <Label htmlFor="nonTeacherRatio">Student:Non-Teacher Ratio</Label>
                  <Input
                    id="nonTeacherRatio"
                    type="number"
                    {...register('nonTeacherRatio', { valueAsNumber: true })}
                  />
                </div>

                <div>
                  <Label htmlFor="nonTeacherAvgCost">Average Cost (SAR)</Label>
                  <Input
                    id="nonTeacherAvgCost"
                    type="number"
                    {...register('nonTeacherAvgCost', { valueAsNumber: true })}
                  />
                </div>

                <div>
                  <Label htmlFor="nonTeacherEscalationRate">Escalation Rate (%)</Label>
                  <Input
                    id="nonTeacherEscalationRate"
                    type="number"
                    step="0.01"
                    {...register('nonTeacherEscalationRate', { valueAsNumber: true })}
                  />
                </div>
              </div>
            </div>

            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving...' : 'Save Staffing Config'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Staffing Projections Table */}
      <StaffingProjectionsTable versionId={versionId} config={watchedValues} />
    </div>
  );
}
