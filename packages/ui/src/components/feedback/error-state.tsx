import * as React from 'react';
import { AlertTriangle, RefreshCw, type LucideIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { cn } from '../../lib/utils';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  error?: Error | string;
  icon?: LucideIcon;
  onRetry?: () => void;
  retryLabel?: string;
  variant?: 'inline' | 'card' | 'full';
  className?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  error,
  icon: Icon = AlertTriangle,
  onRetry,
  retryLabel = 'Try again',
  variant = 'card',
  className,
}: ErrorStateProps) {
  const errorMessage = message || (error instanceof Error ? error.message : error) || 'An unexpected error occurred.';

  if (variant === 'inline') {
    return (
      <div className={cn('flex items-center gap-2 text-error', className)}>
        <Icon className="h-4 w-4 shrink-0" />
        <span className="text-sm">{errorMessage}</span>
        {onRetry && (
          <Button variant="ghost" size="sm" onClick={onRetry} className="ml-2">
            <RefreshCw className="h-3 w-3 mr-1" />
            Retry
          </Button>
        )}
      </div>
    );
  }

  if (variant === 'full') {
    return (
      <div
        className={cn(
          'flex min-h-[400px] flex-col items-center justify-center py-12 px-6 text-center',
          className
        )}
      >
        <div className="mb-4 rounded-full bg-error/10 p-4">
          <Icon className="h-10 w-10 text-error" />
        </div>
        <h2 className="mb-2 text-2xl font-bold text-foreground">{title}</h2>
        <p className="mb-6 max-w-md text-muted-foreground">{errorMessage}</p>
        {onRetry && (
          <Button variant="default" onClick={onRetry}>
            <RefreshCw className="h-4 w-4 mr-2" />
            {retryLabel}
          </Button>
        )}
      </div>
    );
  }

  // Card variant (default)
  return (
    <Card className={cn('p-6', className)}>
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 rounded-full bg-error/10 p-3">
          <Icon className="h-6 w-6 text-error" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-foreground">{title}</h3>
        <p className="mb-4 text-sm text-muted-foreground max-w-sm">
          {errorMessage}
        </p>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RefreshCw className="h-4 w-4 mr-2" />
            {retryLabel}
          </Button>
        )}
      </div>
    </Card>
  );
}
