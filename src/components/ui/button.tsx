import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/utils/cn';

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'bg-[--color-primary] text-[--color-primary-foreground] shadow-sm hover:bg-[--color-primary]/90 focus-visible:ring-[--color-ring]',
        secondary:
          'bg-[--color-secondary] text-[--color-secondary-foreground] hover:bg-[--color-secondary]/90 focus-visible:ring-[--color-ring]',
        outline:
          'border border-[--color-border] bg-[--color-background] text-[--color-foreground] hover:bg-[--color-muted]/60 focus-visible:ring-[--color-ring]',
        ghost:
          'text-[--color-foreground] hover:bg-[--color-muted] hover:text-[--color-foreground] focus-visible:ring-[--color-ring]',
        destructive:
          'bg-[--color-destructive] text-[--color-destructive-foreground] hover:bg-[--color-destructive]/90 focus-visible:ring-[--color-destructive]',
        link: 'text-[--color-primary] underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 text-sm',
        lg: 'h-11 px-6 text-base',
        icon: 'h-10 w-10',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, fullWidth, leftIcon, rightIcon, asChild = false, children, ...props },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'button';
    const buttonClassName = cn(buttonVariants({ variant, size, fullWidth }), className);
    
    if (asChild) {
      // When asChild is true, Slot expects a single child element
      // The child should already contain the icons and content
      return (
        <Comp
          ref={ref as any}
          className={buttonClassName}
          {...props}
        >
          {children}
        </Comp>
      );
    }
    
    // Regular button rendering with icons
    return (
      <Comp
        ref={ref}
        className={buttonClassName}
        {...props}
      >
        {leftIcon}
        {children}
        {rightIcon}
      </Comp>
    );
  },
);

Button.displayName = 'Button';


