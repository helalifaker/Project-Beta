/**
 * Lease terms form
 * Configure rent model (Fixed+Esc, Revenue Share, Partner)
 */

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import type { JSX } from 'react';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDebouncedCallback } from '@/lib/utils/debounce';

import { RentSchedulePreview } from './rent-schedule-preview';

const leaseTermsSchema = z.object({
  rentModelType: z.enum(['FIXED_ESC', 'REV_SHARE', 'PARTNER']),
  baseAmount: z.number().positive().optional(),
  escalationRate: z.number().min(0).max(0.2).optional(),
  indexationRate: z.number().min(0).max(0.2).optional(),
  indexationFrequency: z.enum(['ANNUAL', 'EVERY_2_YEARS', 'EVERY_3_YEARS']).optional(),
  revenuePercentage: z.number().min(0).max(1).optional(),
  floor: z.number().positive().optional(),
  cap: z.number().positive().optional(),
  landSqm: z.number().positive().optional(),
  landCostPerSqm: z.number().positive().optional(),
  buaSqm: z.number().positive().optional(),
  buaCostPerSqm: z.number().positive().optional(),
  yield: z.number().min(0).max(1).optional(),
  yieldIndexationRate: z.number().min(0).max(0.2).optional(),
  yieldIndexationFrequency: z.enum(['ANNUAL', 'EVERY_2_YEARS', 'EVERY_3_YEARS']).optional(),
});

type LeaseTermsFormData = z.infer<typeof leaseTermsSchema>;

interface LeaseTermsFormProps {
  versionId: string;
}

async function saveLeaseTerms(versionId: string, data: LeaseTermsFormData): Promise<void> {
  const response = await fetch(`/api/v1/versions/${versionId}/assumptions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      section: 'LEASE',
      data,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to save lease terms');
  }
}

export function LeaseTermsForm({ versionId }: LeaseTermsFormProps): JSX.Element {
  const [rentModelType, setRentModelType] = useState<'FIXED_ESC' | 'REV_SHARE' | 'PARTNER'>(
    'FIXED_ESC'
  );

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LeaseTermsFormData>({
    resolver: zodResolver(leaseTermsSchema),
    defaultValues: {
      rentModelType: 'FIXED_ESC',
    },
  });

  const saveMutation = useMutation({
    mutationFn: (data: LeaseTermsFormData) => saveLeaseTerms(versionId, data),
  });

  // Autosave with debounce
  const debouncedSave = useDebouncedCallback(
    (data: LeaseTermsFormData) => {
      saveMutation.mutate(data);
    },
    2000 // 2 second debounce
  );

  const watchedValues = watch();

  useEffect(() => {
    if (Object.keys(watchedValues).length > 0) {
      debouncedSave(watchedValues);
    }
  }, [watchedValues, debouncedSave]);

  const onSubmit = async (data: LeaseTermsFormData): Promise<void> => {
    await saveMutation.mutateAsync(data);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Lease Terms</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Rent Model Type */}
            <div>
              <Label htmlFor="rentModelType">Rent Model</Label>
              <Select
                value={rentModelType}
                onValueChange={(value) => setRentModelType(value as typeof rentModelType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FIXED_ESC">Fixed + Escalation</SelectItem>
                  <SelectItem value="REV_SHARE">Revenue Share</SelectItem>
                  <SelectItem value="PARTNER">Partner Model</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Fixed+Escalation Fields */}
            {rentModelType === 'FIXED_ESC' && (
              <>
                <div>
                  <Label htmlFor="baseAmount">Base Amount (SAR)</Label>
                  <Input
                    id="baseAmount"
                    type="number"
                    {...register('baseAmount', { valueAsNumber: true })}
                  />
                  {errors.baseAmount ? (
                    <p className="text-sm text-destructive">{errors.baseAmount.message}</p>
                  ) : null}
                </div>

                <div>
                  <Label htmlFor="escalationRate">Escalation Rate (%)</Label>
                  <Input
                    id="escalationRate"
                    type="number"
                    step="0.01"
                    {...register('escalationRate', { valueAsNumber: true })}
                  />
                </div>

                <div>
                  <Label htmlFor="indexationRate">Indexation Rate (%)</Label>
                  <Input
                    id="indexationRate"
                    type="number"
                    step="0.01"
                    {...register('indexationRate', { valueAsNumber: true })}
                  />
                </div>

                <div>
                  <Label htmlFor="indexationFrequency">Indexation Frequency</Label>
                  <Select {...register('indexationFrequency')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ANNUAL">Annual</SelectItem>
                      <SelectItem value="EVERY_2_YEARS">Every 2 Years</SelectItem>
                      <SelectItem value="EVERY_3_YEARS">Every 3 Years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* Revenue Share Fields */}
            {rentModelType === 'REV_SHARE' && (
              <>
                <div>
                  <Label htmlFor="revenuePercentage">Revenue Percentage (%)</Label>
                  <Input
                    id="revenuePercentage"
                    type="number"
                    step="0.01"
                    {...register('revenuePercentage', { valueAsNumber: true })}
                  />
                </div>

                <div>
                  <Label htmlFor="floor">Floor (SAR)</Label>
                  <Input id="floor" type="number" {...register('floor', { valueAsNumber: true })} />
                </div>

                <div>
                  <Label htmlFor="cap">Cap (SAR)</Label>
                  <Input id="cap" type="number" {...register('cap', { valueAsNumber: true })} />
                </div>
              </>
            )}

            {/* Partner Model Fields */}
            {rentModelType === 'PARTNER' && (
              <>
                <div>
                  <Label htmlFor="landSqm">Land Area (sqm)</Label>
                  <Input
                    id="landSqm"
                    type="number"
                    {...register('landSqm', { valueAsNumber: true })}
                  />
                </div>

                <div>
                  <Label htmlFor="landCostPerSqm">Land Cost per sqm (SAR)</Label>
                  <Input
                    id="landCostPerSqm"
                    type="number"
                    {...register('landCostPerSqm', { valueAsNumber: true })}
                  />
                </div>

                <div>
                  <Label htmlFor="buaSqm">BUA Area (sqm)</Label>
                  <Input
                    id="buaSqm"
                    type="number"
                    {...register('buaSqm', { valueAsNumber: true })}
                  />
                </div>

                <div>
                  <Label htmlFor="buaCostPerSqm">BUA Cost per sqm (SAR)</Label>
                  <Input
                    id="buaCostPerSqm"
                    type="number"
                    {...register('buaCostPerSqm', { valueAsNumber: true })}
                  />
                </div>

                <div>
                  <Label htmlFor="yield">Yield (%)</Label>
                  <Input
                    id="yield"
                    type="number"
                    step="0.01"
                    {...register('yield', { valueAsNumber: true })}
                  />
                </div>

                <div>
                  <Label htmlFor="yieldIndexationRate">Yield Indexation Rate (%)</Label>
                  <Input
                    id="yieldIndexationRate"
                    type="number"
                    step="0.01"
                    {...register('yieldIndexationRate', { valueAsNumber: true })}
                  />
                </div>

                <div>
                  <Label htmlFor="yieldIndexationFrequency">Yield Indexation Frequency</Label>
                  <Select {...register('yieldIndexationFrequency')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ANNUAL">Annual</SelectItem>
                      <SelectItem value="EVERY_2_YEARS">Every 2 Years</SelectItem>
                      <SelectItem value="EVERY_3_YEARS">Every 3 Years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving...' : 'Save Lease Terms'}
            </Button>
            {saveMutation.isSuccess ? (
              <p className="text-sm text-green-600">Saved successfully</p>
            ) : null}
          </form>
        </CardContent>
      </Card>

      {/* Rent Schedule Preview */}
      <RentSchedulePreview
        versionId={versionId}
        rentModelType={rentModelType}
        formData={watchedValues}
      />
    </div>
  );
}
