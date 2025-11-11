/**
 * Capex form
 * Configure capex rules and schedule
 */

'use client';

import { useState } from 'react';

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

import { CapexSchedulePreview } from './capex-schedule-preview';

interface CapexFormProps {
  versionId: string;
}

export function CapexForm({ versionId }: CapexFormProps): JSX.Element {
  const [ruleType, setRuleType] = useState<'CYCLE' | 'UTILIZATION' | 'CUSTOM_DATE'>('CYCLE');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Capital Expenditures</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="ruleType">Capex Rule Type</Label>
            <Select value={ruleType} onValueChange={(value) => setRuleType(value as typeof ruleType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CYCLE">Cycle-Based (Every N Years)</SelectItem>
                <SelectItem value="UTILIZATION">Utilization-Based (Threshold)</SelectItem>
                <SelectItem value="CUSTOM_DATE">Custom Date (Specific Years)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {ruleType === 'CYCLE' && (
            <>
              <div>
                <Label htmlFor="cycleYears">Cycle Years</Label>
                <Input id="cycleYears" type="number" placeholder="e.g., 3" />
              </div>
              <div>
                <Label htmlFor="baseCost">Base Cost (SAR)</Label>
                <Input id="baseCost" type="number" />
              </div>
              <div>
                <Label htmlFor="costPerStudent">Cost per Student (SAR, optional)</Label>
                <Input id="costPerStudent" type="number" />
              </div>
            </>
          )}

          {ruleType === 'UTILIZATION' && (
            <>
              <div>
                <Label htmlFor="threshold">Utilization Threshold (%)</Label>
                <Input id="threshold" type="number" step="0.01" placeholder="e.g., 85" />
              </div>
              <div>
                <Label htmlFor="baseCost">Base Cost (SAR)</Label>
                <Input id="baseCost" type="number" />
              </div>
            </>
          )}

          {ruleType === 'CUSTOM_DATE' && (
            <>
              <div>
                <Label htmlFor="triggerYears">Trigger Years (comma-separated)</Label>
                <Input id="triggerYears" placeholder="e.g., 2030, 2035, 2040" />
              </div>
              <div>
                <Label htmlFor="baseCost">Base Cost (SAR)</Label>
                <Input id="baseCost" type="number" />
              </div>
            </>
          )}

          <div>
            <Label htmlFor="escalationRate">Escalation Rate (%)</Label>
            <Input id="escalationRate" type="number" step="0.01" />
          </div>

          <Button>Save Capex Rule</Button>
        </CardContent>
      </Card>

      {/* Capex Schedule Preview */}
      <CapexSchedulePreview versionId={versionId} />
    </div>
  );
}
