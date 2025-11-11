import type { JSX } from 'react';

import { cn } from '@/lib/utils/cn';

export interface AppFooterProps {
  className?: string;
}

export function AppFooter({ className }: AppFooterProps): JSX.Element {
  return (
    <footer
      className={cn(
        'border-t border-[--color-border] bg-[--color-background] text-sm text-[--color-muted-foreground]',
        className,
      )}
    >
      <div className="container flex flex-col items-center justify-between gap-2 py-4 text-center sm:flex-row sm:text-left">
        <p>
          © {new Date().getFullYear()} School Relocation Planner. All rights reserved.
        </p>
        <div className="flex items-center gap-4">
          <a className="hover:text-[--color-foreground]" href="/docs/accessibility">
            Accessibility
          </a>
          <a className="hover:text-[--color-foreground]" href="/docs/support">
            Support
          </a>
          <a className="hover:text-[--color-foreground]" href="/docs/privacy">
            Privacy
          </a>
        </div>
      </div>
    </footer>
  );
}


