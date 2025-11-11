/**
 * Capex management page
 * Manage capex categories and rules
 */

import { Suspense } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CapexCategoriesList } from '@/components/features/admin/capex-categories-list';
import { CapexRulesList } from '@/components/features/admin/capex-rules-list';

export default function CapexManagementPage(): JSX.Element {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Capex Management</h1>
        <p className="text-muted-foreground">
          Configure capex categories and reinvestment rules
        </p>
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <Tabs defaultValue="categories" className="w-full">
          <TabsList>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="rules">Rules</TabsTrigger>
          </TabsList>

          <TabsContent value="categories">
            <CapexCategoriesList />
          </TabsContent>

          <TabsContent value="rules">
            <CapexRulesList />
          </TabsContent>
        </Tabs>
      </Suspense>
    </div>
  );
}

