import { Menu, Settings2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import type { JSX, ReactNode } from 'react';

export interface AppHeaderProps {
  title: string;
  description?: string;
  onMenuToggle?: () => void;
  actions?: ReactNode;
  environment?: 'production' | 'staging' | 'development';
  className?: string;
}

export function AppHeader({
  title,
  description,
  onMenuToggle,
  actions,
  environment = 'development',
  className,
}: AppHeaderProps): JSX.Element {
  const environmentLabel = environment === 'production' ? 'Production' : 'Workspace';
  const environmentVariant =
    environment === 'production'
      ? ('destructive' as const)
      : environment === 'staging'
        ? ('fluent' as const)
        : ('muted' as const);

  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b border-[--color-border] bg-[--color-background]/85 backdrop-blur supports-[backdrop-filter]:bg-[--color-background]/75',
        className,
      )}
    >
      <div className="container flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Toggle navigation"
            onClick={onMenuToggle}
            className="lg:hidden"
          >
            <Menu className="size-5" aria-hidden />
          </Button>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-[--color-foreground] md:text-xl">
                {title}
              </h1>
              <Badge variant={environmentVariant}>{environmentLabel}</Badge>
            </div>
            {description ? (
              <p className="text-sm text-[--color-muted-foreground]">{description}</p>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {actions}
          <Button type="button" variant="ghost" size="icon" aria-label="Settings">
            <Settings2 className="size-5" aria-hidden />
          </Button>
        </div>
      </div>
    </header>
  );
}


