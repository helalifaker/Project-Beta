import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes, JSX } from 'react';

import { cn } from '@/lib/utils/cn';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-[--color-primary]/15 text-[--color-primary] focus:ring-[--color-ring]',
        fluent:
          'border-transparent bg-[--color-secondary]/30 text-[--color-secondary-foreground]',
        muted:
          'border-transparent bg-[--color-muted] text-[--color-muted-foreground] focus:ring-[--color-ring]',
        outline: 'border-[--color-border] text-[--color-foreground]',
        destructive:
          'border-transparent bg-[--color-destructive]/10 text-[--color-destructive]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export type BadgeProps = HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: BadgeProps): JSX.Element {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}


