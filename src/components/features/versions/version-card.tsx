/**
 * Version card component
 * Displays version summary in list view
 */

import type { VersionStatus } from '@prisma/client';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface VersionCardProps {
  id: string;
  name: string;
  description?: string | null;
  status: VersionStatus;
  ownerName?: string;
  createdAt: Date;
  updatedAt: Date;
  lockedAt?: Date | null;
}

function getStatusBadgeVariant(status: VersionStatus): 'default' | 'fluent' | 'muted' {
  switch (status) {
    case 'READY':
      return 'fluent';
    case 'LOCKED':
      return 'default';
    case 'ARCHIVED':
      return 'muted';
    default:
      return 'default';
  }
}

export function VersionCard({
  id,
  name,
  description,
  status,
  ownerName,
  createdAt: _createdAt,
  updatedAt,
  lockedAt,
}: VersionCardProps): JSX.Element {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">
            <Link href={`/versions/${id}`} className="hover:underline">
              {name}
            </Link>
          </CardTitle>
          <Badge variant={getStatusBadgeVariant(status)}>{status}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {description ? (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{description}</p>
        ) : null}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div>{ownerName ? <span>Owner: {ownerName}</span> : null}</div>
          <div>Updated {formatDistanceToNow(updatedAt, { addSuffix: true })}</div>
        </div>
        {lockedAt ? (
          <div className="mt-2 text-xs text-muted-foreground">
            Locked {formatDistanceToNow(lockedAt, { addSuffix: true })}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
