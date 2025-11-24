import * as React from 'react';
import { cn } from '../../lib/utils';

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  variant?: 'default' | 'muted' | 'gradient';
  padding?: 'sm' | 'md' | 'lg' | 'xl';
}

const paddingClasses = {
  sm: 'py-8 md:py-12',
  md: 'py-12 md:py-16',
  lg: 'py-16 md:py-24',
  xl: 'py-24 md:py-32',
};

const variantClasses = {
  default: '',
  muted: 'bg-surface-200',
  gradient: 'bg-gradient-mesh',
};

export function Section({
  variant = 'default',
  padding = 'lg',
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <section
      className={cn(
        paddingClasses[padding],
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </section>
  );
}
