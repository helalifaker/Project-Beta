/**
import type { JSX } from 'react';
 * Version list component
 * Displays versions with filtering and sorting
 */

'use client';

import type { VersionStatus } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDebounce } from '@/lib/hooks/use-debounce';

import { VersionCard } from './version-card';

async function fetchVersions(params: { status?: string; search?: string }): Promise<
  Array<{
    id: string;
    name: string;
    description?: string | null;
    status: VersionStatus;
    ownerName?: string;
    createdAt: string;
    updatedAt: string;
    lockedAt?: string | null;
  }>
> {
  const queryParams = new URLSearchParams();
  if (params.status) queryParams.set('status', params.status);
  if (params.search) queryParams.set('search', params.search);

  const response = await fetch(`/api/v1/versions?${queryParams.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch versions');
  }

  const data = await response.json();
  return data.data || [];
}

export function VersionList(): JSX.Element {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Debounce search query to reduce API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const { data: versions = [], isLoading } = useQuery({
    queryKey: [
      'versions',
      {
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: debouncedSearchQuery || undefined,
      },
    ],
    queryFn: () =>
      fetchVersions({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: debouncedSearchQuery || undefined,
      }),
  });

  return (
    <div className="space-y-6">
      {/* Filters and Actions */}
      <div className="flex items-center gap-4">
        <Input
          placeholder="Search versions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="READY">Ready</SelectItem>
            <SelectItem value="LOCKED">Locked</SelectItem>
            <SelectItem value="ARCHIVED">Archived</SelectItem>
          </SelectContent>
        </Select>
        <Button asChild className="ml-auto">
          <Link href="/versions/new">
            <Plus className="mr-2 h-4 w-4" />
            New Version
          </Link>
        </Button>
      </div>

      {/* Version Grid */}
      {isLoading ? (
        <div>Loading...</div>
      ) : versions.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No versions found. Create your first version to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {versions.map((version) => (
            <VersionCard
              key={version.id}
              {...version}
              createdAt={new Date(version.createdAt)}
              updatedAt={new Date(version.updatedAt)}
              lockedAt={version.lockedAt ? new Date(version.lockedAt) : null}
            />
          ))}
        </div>
      )}
    </div>
  );
}
