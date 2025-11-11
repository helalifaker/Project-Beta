/**
 * Statements tab
 * Displays financial statements (P&L, Balance Sheet, Cash Flow)
 */

'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { BalanceSheetTable } from './statements/balance-sheet-table';
import { CashFlowTable } from './statements/cash-flow-table';
import { ProfitLossTable } from './statements/profit-loss-table';

interface StatementsTabProps {
  versionId: string;
}

export function StatementsTab({ versionId }: StatementsTabProps): JSX.Element {
  return (
    <Tabs defaultValue="pl" className="w-full">
      <TabsList>
        <TabsTrigger value="pl">P&L</TabsTrigger>
        <TabsTrigger value="bs">Balance Sheet</TabsTrigger>
        <TabsTrigger value="cf">Cash Flow</TabsTrigger>
      </TabsList>

      <TabsContent value="pl">
        <ProfitLossTable versionId={versionId} />
      </TabsContent>

      <TabsContent value="bs">
        <BalanceSheetTable versionId={versionId} />
      </TabsContent>

      <TabsContent value="cf">
        <CashFlowTable versionId={versionId} />
      </TabsContent>
    </Tabs>
  );
}

