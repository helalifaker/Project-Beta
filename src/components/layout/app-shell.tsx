import type { JSX, ReactNode } from 'react';

import { cn } from '@/lib/utils/cn';

export interface AppShellProps {
  header?: ReactNode;
  sidebar?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
  mainId?: string;
}

export function AppShell({
  header,
  sidebar,
  footer,
  children,
  className,
  mainId = 'main-content',
}: AppShellProps): JSX.Element {
  return (
    <div className={cn('flex min-h-screen bg-[--color-muted]', className)}>
      {sidebar}
      <div className="flex min-h-screen flex-1 flex-col">
        {header}
        <main id={mainId} className="flex-1 bg-[--color-background]">
          <div className="container py-8">{children}</div>
        </main>
        {footer}
      </div>
    </div>
  );
}


