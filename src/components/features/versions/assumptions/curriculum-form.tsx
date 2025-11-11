/**
 * Curriculum form
 * Configure curriculum capacity, ramp, and enrollment
 */

'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { EnrollmentProjectionsTable } from './enrollment-projections-table';
import { useDebouncedCallback } from '@/lib/utils/debounce';

interface CurriculumFormProps {
  versionId: string;
}

async function fetchCurriculumTemplates(): Promise<Array<{
  id: string;
  name: string;
  capacity: number;
  launchYear: number;
}>> {
  const response = await fetch('/api/v1/admin/curriculum-templates');
  if (!response.ok) {
    throw new Error('Failed to fetch curriculum templates');
  }
  const data = await response.json();
  return data.data || [];
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

  const { data: templates = [] } = useQuery({
    queryKey: ['curriculum-templates'],
    queryFn: fetchCurriculumTemplates,
  });

  const saveMutation = useMutation({
    mutationFn: (config: { customCapacity?: number }) =>
      saveCurriculumConfig(versionId, selectedCurriculum, config),
  });

  const debouncedSave = useDebouncedCallback(
    (config: { customCapacity?: number }) => {
      if (selectedCurriculum) {
        saveMutation.mutate(config);
      }
    },
    2000
  );

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
          </div>

          {/* Custom Capacity Override */}
          {selectedCurriculum && (
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
                customCapacity={customCapacity}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
