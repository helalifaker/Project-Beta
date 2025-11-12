/**
 * Curriculum form
 * Configure curriculum capacity, ramp, and enrollment
 */

'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import type { JSX } from 'react';
import { useState, useEffect } from 'react';

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

import { EnrollmentProjectionsTable } from './enrollment-projections-table';

interface CurriculumFormProps {
  versionId: string;
}

async function fetchCurriculumTemplates(): Promise<
  Array<{
    id: string;
    name: string;
    capacity: number;
    launchYear: number;
  }>
> {
  try {
    const response = await fetch('/api/v1/admin/curriculum-templates', {
      credentials: 'include', // Include cookies for authentication
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Failed to fetch curriculum templates:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      });
      throw new Error(
        `Failed to fetch curriculum templates: ${response.status} ${response.statusText}`
      );
    }

    const result = await response.json();

    // Handle both { data: [...] } and direct array responses
    const templates = result.data || result || [];

    // Transform Prisma Decimal fields to numbers if needed
    return templates.map(
      (template: {
        id: string;
        name: string;
        capacity: number | string;
        launchYear: number | string;
      }) => ({
        id: template.id,
        name: template.name,
        capacity:
          typeof template.capacity === 'number' ? template.capacity : Number(template.capacity),
        launchYear:
          typeof template.launchYear === 'number'
            ? template.launchYear
            : Number(template.launchYear),
      })
    );
  } catch (error) {
    console.error('Error fetching curriculum templates:', error);
    throw error;
  }
}

async function saveCurriculumConfig(
  versionId: string,
  curriculumId: string,
  config: {
    customCapacity?: number;
    rampOverrides?: Array<{ year: number; utilisation: number }>;
  }
): Promise<void> {
  const response = await fetch(`/api/v1/versions/${versionId}/assumptions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      section: 'CURRICULUM',
      curriculumId,
      data: config,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to save curriculum config');
  }
}

export function CurriculumForm({ versionId }: CurriculumFormProps): JSX.Element {
  const [selectedCurriculum, setSelectedCurriculum] = useState<string>('');
  const [customCapacity, setCustomCapacity] = useState<number | undefined>();

  const {
    data: templates = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['curriculum-templates'],
    queryFn: fetchCurriculumTemplates,
    retry: 2,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const saveMutation = useMutation({
    mutationFn: (config: { customCapacity?: number }) =>
      saveCurriculumConfig(versionId, selectedCurriculum, config),
  });

  const debouncedSave = useDebouncedCallback((config: { customCapacity?: number }) => {
    if (selectedCurriculum) {
      saveMutation.mutate(config);
    }
  }, 2000);

  useEffect(() => {
    if (customCapacity !== undefined && selectedCurriculum) {
      debouncedSave({ customCapacity });
    }
  }, [customCapacity, selectedCurriculum, debouncedSave]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Curriculum Planning</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Curriculum Selection */}
          <div>
            <Label htmlFor="curriculum">Select Curriculum</Label>
            {isLoading ? (
              <div className="text-sm text-muted-foreground">Loading curricula...</div>
            ) : error ? (
              <div className="text-sm text-destructive">
                Error loading curricula: {error instanceof Error ? error.message : 'Unknown error'}
              </div>
            ) : templates.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No curriculum templates available. Please create templates in Admin → Curriculum
                Templates.
              </div>
            ) : (
              <Select value={selectedCurriculum} onValueChange={setSelectedCurriculum}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a curriculum" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name} (Capacity: {template.capacity})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Custom Capacity Override */}
          {selectedCurriculum ? (
            <>
              <div>
                <Label htmlFor="customCapacity">Custom Capacity (optional override)</Label>
                <Input
                  id="customCapacity"
                  type="number"
                  value={customCapacity || ''}
                  onChange={(e) =>
                    setCustomCapacity(e.target.value ? parseInt(e.target.value, 10) : undefined)
                  }
                  placeholder="Leave empty to use template default"
                />
              </div>

              {/* Enrollment Projections Table */}
              <EnrollmentProjectionsTable
                versionId={versionId}
                curriculumId={selectedCurriculum}
                {...(customCapacity !== undefined ? { customCapacity } : {})}
              />
            </>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
