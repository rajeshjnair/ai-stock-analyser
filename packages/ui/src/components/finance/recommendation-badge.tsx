import * as React from 'react';
import { Badge, type BadgeProps } from '../ui/badge';
import { cn } from '../../lib/utils';

export type RecommendationType = 'buy' | 'sell' | 'hold' | 'strong-buy' | 'strong-sell';

export interface RecommendationBadgeProps extends Omit<BadgeProps, 'variant' | 'size'> {
  recommendation: RecommendationType;
  size?: 'sm' | 'md' | 'lg';
}

const recommendationConfig: Record<RecommendationType, { label: string; variant: BadgeProps['variant']; className?: string }> = {
  'strong-buy': {
    label: 'STRONG BUY',
    variant: 'buy',
    className: 'animate-pulse-glow',
  },
  buy: {
    label: 'BUY',
    variant: 'buy',
  },
  hold: {
    label: 'HOLD',
    variant: 'hold',
  },
  sell: {
    label: 'SELL',
    variant: 'sell',
  },
  'strong-sell': {
    label: 'STRONG SELL',
    variant: 'sell',
    className: 'animate-pulse',
  },
};

const sizeClasses = {
  sm: 'text-[10px] px-2 py-0.5',
  md: 'text-xs px-2.5 py-0.5',
  lg: 'text-sm px-3 py-1',
};

export function RecommendationBadge({
  recommendation,
  size = 'md',
  className,
  ...props
}: RecommendationBadgeProps) {
  const config = recommendationConfig[recommendation];

  return (
    <Badge
      variant={config.variant}
      className={cn(
        'font-bold uppercase tracking-wider',
        sizeClasses[size],
        config.className,
        className
      )}
      {...props}
    >
      {config.label}
    </Badge>
  );
}
