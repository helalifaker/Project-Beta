/**
 * Audit log viewer component
 * Display audit log entries with filtering
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import type { JSX } from 'react';
import { useState } from 'react';

import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AuditLogEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  actor: {
    email: string;
    role: string;
  };
}

async function fetchAuditLog(params: {
  page?: number;
  limit?: number;
  entityType?: string;
  action?: string;
}): Promise<{
  data: AuditLogEntry[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}> {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.set('page', params.page.toString());
  if (params.limit) queryParams.set('limit', params.limit.toString());
  if (params.entityType) queryParams.set('entityType', params.entityType);
  if (params.action) queryParams.set('action', params.action);

  const response = await fetch(`/api/v1/admin/audit-log?${queryParams.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch audit log');
  }
  const data = await response.json();
  return data;
}

export function AuditLogViewer(): JSX.Element {
  const [page] = useState(1);
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const entityTypeLabelId = 'audit-log-entity-type-label';
  const actionLabelId = 'audit-log-action-label';

  // Build params object, filtering out undefined values for exactOptionalPropertyTypes
  const fetchParams: {
    page: number;
    limit: number;
    entityType?: string;
    action?: string;
  } = {
    page,
    limit: 50,
  };

  if (entityTypeFilter !== 'all') {
    fetchParams.entityType = entityTypeFilter;
  }

  if (actionFilter !== 'all') {
    fetchParams.action = actionFilter;
  }

  const { data, isLoading } = useQuery({
    queryKey: ['audit-log', page, entityTypeFilter, actionFilter],
    queryFn: () => fetchAuditLog(fetchParams),
  });

  if (isLoading) {
    return <div>Loading audit log...</div>;
  }

  const entries = data?.data || [];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label id={entityTypeLabelId}>Entity Type</Label>
              <Select value={entityTypeFilter} onValueChange={setEntityTypeFilter}>
                <SelectTrigger id="entityType" aria-labelledby={entityTypeLabelId}>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="version">Version</SelectItem>
                  <SelectItem value="template">Template</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label id={actionLabelId}>Action</Label>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger id="action" aria-labelledby={actionLabelId}>
                  <SelectValue placeholder="All Actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="CREATE">Create</SelectItem>
                  <SelectItem value="UPDATE">Update</SelectItem>
                  <SelectItem value="DELETE">Delete</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Entries */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {entries.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No audit log entries found.
              </div>
            ) : (
              entries.map((entry) => (
                <div key={entry.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium">
                        {entry.action} {entry.entityType}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        by {entry.actor.email} ({entry.actor.role})
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(entry.createdAt), {
                        addSuffix: true,
                      })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
