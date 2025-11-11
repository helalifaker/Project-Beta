/**
 * Capex rules list component
 * Display and manage capex rules
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

async function fetchCapexRules(): Promise<Array<{
  id: string;
  name: string;
  triggerType: string;
  category: {
    name: string;
  };
}>> {
  const response = await fetch('/api/v1/admin/capex-rules');
  if (!response.ok) {
    throw new Error('Failed to fetch capex rules');
  }
  const data = await response.json();
  return data.data || [];
}

export function CapexRulesList(): JSX.Element {
  const { data: rules = [], isLoading } = useQuery({
    queryKey: ['capex-rules'],
    queryFn: fetchCapexRules,
  });

  if (isLoading) {
    return <div>Loading rules...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Capex Rules</h2>
          <p className="text-sm text-muted-foreground">
            {rules.length} rule{rules.length !== 1 ? 's' : ''} configured
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Rule
        </Button>
      </div>

      {rules.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12 text-muted-foreground">
              No capex rules found. Create your first rule to get started.
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {rules.map((rule) => (
            <Card key={rule.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{rule.name}</CardTitle>
                  <Badge>{rule.triggerType}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  Category: {rule.category.name}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

