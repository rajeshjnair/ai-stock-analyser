import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-brand-500 text-white',
        secondary:
          'border-transparent bg-surface-50 text-foreground',
        destructive:
          'border-transparent bg-error text-white',
        outline: 'border-border text-foreground',
        success:
          'border-transparent bg-success/20 text-success',
        warning:
          'border-transparent bg-warning/20 text-warning',
        error:
          'border-transparent bg-error/20 text-error',
        buy:
          'border-transparent bg-success/20 text-success shadow-[0_0_10px_rgba(34,197,94,0.3)]',
        sell:
          'border-transparent bg-error/20 text-error shadow-[0_0_10px_rgba(239,68,68,0.3)]',
        hold:
          'border-transparent bg-neutral/20 text-neutral',
        accent:
          'border-transparent bg-accent-500/20 text-accent-400',
      },
      size: {
        default: 'px-2.5 py-0.5 text-xs',
        sm: 'px-2 py-0.5 text-[10px]',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
