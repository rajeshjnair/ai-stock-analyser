import * as React from 'react';
import { Progress } from '../ui/progress';
import { cn } from '../../lib/utils';

export interface ConfidenceScoreProps {
  score: number; // 0-100 or 0-10
  maxScore?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  showPercentage?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: {
    container: 'gap-1',
    progress: 'h-1.5',
    label: 'text-xs',
    score: 'text-xs',
  },
  md: {
    container: 'gap-2',
    progress: 'h-2',
    label: 'text-sm',
    score: 'text-sm',
  },
  lg: {
    container: 'gap-2',
    progress: 'h-3',
    label: 'text-base',
    score: 'text-base',
  },
};

function getScoreColor(percentage: number): string {
  if (percentage >= 80) return 'bg-success';
  if (percentage >= 60) return 'bg-brand-500';
  if (percentage >= 40) return 'bg-warning';
  return 'bg-error';
}

function getGradientClass(percentage: number): string {
  if (percentage >= 80) return 'bg-gradient-to-r from-success to-emerald-400';
  if (percentage >= 60) return 'bg-gradient-to-r from-brand-600 to-brand-400';
  if (percentage >= 40) return 'bg-gradient-to-r from-warning to-amber-400';
  return 'bg-gradient-to-r from-error to-red-400';
}

export function ConfidenceScore({
  score,
  maxScore = 10,
  size = 'md',
  showLabel = true,
  showPercentage = true,
  className,
}: ConfidenceScoreProps) {
  const percentage = (score / maxScore) * 100;
  const displayScore = maxScore === 100 ? `${score}%` : `${score}/${maxScore}`;
  const classes = sizeClasses[size];

  return (
    <div className={cn('flex flex-col', classes.container, className)}>
      {showLabel && (
        <div className="flex items-center justify-between">
          <span className={cn('text-muted-foreground', classes.label)}>
            Confidence
          </span>
          {showPercentage && (
            <span className={cn('font-mono font-semibold', classes.score)}>
              {displayScore}
            </span>
          )}
        </div>
      )}
      <Progress
        value={percentage}
        className={cn(classes.progress)}
        indicatorClassName={getGradientClass(percentage)}
      />
    </div>
  );
}
