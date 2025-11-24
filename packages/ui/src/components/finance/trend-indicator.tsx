import * as React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const trendVariants = cva(
  'inline-flex items-center gap-1 font-medium',
  {
    variants: {
      direction: {
        up: 'text-bullish',
        down: 'text-bearish',
        neutral: 'text-neutral',
      },
      size: {
        sm: 'text-xs [&_svg]:size-3',
        md: 'text-sm [&_svg]:size-4',
        lg: 'text-base [&_svg]:size-5',
      },
    },
    defaultVariants: {
      direction: 'neutral',
      size: 'md',
    },
  }
);

export interface TrendIndicatorProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof trendVariants> {
  value?: number;
  showLabel?: boolean;
  showIcon?: boolean;
  labelMap?: {
    up?: string;
    down?: string;
    neutral?: string;
  };
}

const defaultLabels = {
  up: 'Bullish',
  down: 'Bearish',
  neutral: 'Neutral',
};

export function TrendIndicator({
  direction,
  value,
  size,
  showLabel = false,
  showIcon = true,
  labelMap = defaultLabels,
  className,
  ...props
}: TrendIndicatorProps) {
  // Auto-detect direction from value if not provided
  const actualDirection = direction ?? (
    value !== undefined
      ? value > 0 ? 'up' : value < 0 ? 'down' : 'neutral'
      : 'neutral'
  );

  const Icon = actualDirection === 'up'
    ? TrendingUp
    : actualDirection === 'down'
    ? TrendingDown
    : Minus;

  const label = labelMap[actualDirection] || defaultLabels[actualDirection];

  return (
    <div
      className={cn(trendVariants({ direction: actualDirection, size }), className)}
      {...props}
    >
      {showIcon && <Icon />}
      {showLabel && <span>{label}</span>}
    </div>
  );
}
