import * as React from 'react';
import { cn } from '../../lib/utils';

export interface LiveIndicatorProps {
  isLive?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: {
    dot: 'h-1.5 w-1.5',
    text: 'text-[10px]',
    gap: 'gap-1',
  },
  md: {
    dot: 'h-2 w-2',
    text: 'text-xs',
    gap: 'gap-1.5',
  },
  lg: {
    dot: 'h-2.5 w-2.5',
    text: 'text-sm',
    gap: 'gap-2',
  },
};

export function LiveIndicator({
  isLive = true,
  size = 'md',
  showLabel = true,
  className,
}: LiveIndicatorProps) {
  const classes = sizeClasses[size];

  return (
    <div
      className={cn(
        'inline-flex items-center',
        classes.gap,
        className
      )}
    >
      <span className="relative flex">
        <span
          className={cn(
            'rounded-full',
            classes.dot,
            isLive ? 'bg-success' : 'bg-error'
          )}
        />
        {isLive && (
          <span
            className={cn(
              'absolute inline-flex h-full w-full animate-ping rounded-full opacity-75',
              'bg-success'
            )}
          />
        )}
      </span>
      {showLabel && (
        <span
          className={cn(
            'font-semibold uppercase tracking-wider',
            classes.text,
            isLive ? 'text-success' : 'text-error'
          )}
        >
          {isLive ? 'LIVE' : 'OFFLINE'}
        </span>
      )}
    </div>
  );
}
