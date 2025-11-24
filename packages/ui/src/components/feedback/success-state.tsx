import * as React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, type LucideIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

export interface SuccessStateProps {
  title?: string;
  message?: string;
  icon?: LucideIcon;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  variant?: 'inline' | 'card' | 'full';
  className?: string;
}

export function SuccessState({
  title = 'Success!',
  message = 'Your action was completed successfully.',
  icon: Icon = CheckCircle2,
  action,
  secondaryAction,
  variant = 'card',
  className,
}: SuccessStateProps) {
  if (variant === 'inline') {
    return (
      <div className={cn('flex items-center gap-2 text-success', className)}>
        <Icon className="h-4 w-4 shrink-0" />
        <span className="text-sm">{message}</span>
      </div>
    );
  }

  if (variant === 'full') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className={cn(
          'flex min-h-[400px] flex-col items-center justify-center py-12 px-6 text-center',
          className
        )}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          className="mb-6 rounded-full bg-success/10 p-4"
        >
          <Icon className="h-12 w-12 text-success" />
        </motion.div>
        <h2 className="mb-2 text-2xl font-bold text-foreground">{title}</h2>
        <p className="mb-8 max-w-md text-muted-foreground">{message}</p>
        <div className="flex items-center gap-3">
          {action && (
            <Button variant="default" onClick={action.onClick}>
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button variant="outline" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
        </div>
      </motion.div>
    );
  }

  // Card variant (default)
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-xl border border-success/30 bg-success/5 p-6',
        className
      )}
    >
      <div className="flex flex-col items-center text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="mb-4 rounded-full bg-success/10 p-3"
        >
          <Icon className="h-6 w-6 text-success" />
        </motion.div>
        <h3 className="mb-2 text-lg font-semibold text-foreground">{title}</h3>
        <p className="mb-4 text-sm text-muted-foreground max-w-sm">{message}</p>
        <div className="flex items-center gap-3">
          {action && (
            <Button variant="default" size="sm" onClick={action.onClick}>
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button variant="ghost" size="sm" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
