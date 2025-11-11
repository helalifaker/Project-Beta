/**
 * Assumptions tab
 * Displays assumptions configuration UI
 */

'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { CapexForm } from './assumptions/capex-form';
import { CurriculumForm } from './assumptions/curriculum-form';
import { LeaseTermsForm } from './assumptions/lease-terms-form';
import { OpExForm } from './assumptions/opex-form';
import { StaffingForm } from './assumptions/staffing-form';

interface AssumptionsTabProps {
  versionId: string;
}

export function AssumptionsTab({ versionId }: AssumptionsTabProps): JSX.Element {
  return (
    <Tabs defaultValue="lease" className="w-full">
      <TabsList>
        <TabsTrigger value="lease">Lease Terms</TabsTrigger>
        <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
        <TabsTrigger value="staffing">Staffing</TabsTrigger>
        <TabsTrigger value="opex">OpEx</TabsTrigger>
        <TabsTrigger value="capex">Capex</TabsTrigger>
      </TabsList>

      <TabsContent value="lease">
        <LeaseTermsForm versionId={versionId} />
      </TabsContent>

      <TabsContent value="curriculum">
        <CurriculumForm versionId={versionId} />
      </TabsContent>

      <TabsContent value="staffing">
        <StaffingForm versionId={versionId} />
      </TabsContent>

      <TabsContent value="opex">
        <OpExForm versionId={versionId} />
      </TabsContent>

      <TabsContent value="capex">
        <CapexForm versionId={versionId} />
      </TabsContent>
    </Tabs>
  );
}

