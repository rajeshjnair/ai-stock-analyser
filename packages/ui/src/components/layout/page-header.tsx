import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  gradient?: boolean;
  className?: string;
}

export function PageHeader({
  title,
  description,
  badge,
  actions,
  gradient = false,
  className,
}: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn('space-y-4', className)}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          {badge && <div className="mb-2">{badge}</div>}
          <h1
            className={cn(
              'font-display text-3xl font-bold tracking-tight sm:text-4xl',
              gradient
                ? 'bg-gradient-to-r from-brand-400 to-accent-400 bg-clip-text text-transparent'
                : 'text-foreground'
            )}
          >
            {title}
          </h1>
          {description && (
            <p className="text-lg text-muted-foreground max-w-2xl">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </motion.div>
  );
}
