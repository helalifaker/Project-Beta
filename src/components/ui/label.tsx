import type { LabelHTMLAttributes } from 'react';
import { forwardRef } from 'react';

import { cn } from '@/lib/utils/cn';

export type LabelProps = LabelHTMLAttributes<HTMLLabelElement>;

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn('text-sm font-medium leading-tight text-[--color-foreground]', className)}
      {...props}
    />
  ),
);

Label.displayName = 'Label';


