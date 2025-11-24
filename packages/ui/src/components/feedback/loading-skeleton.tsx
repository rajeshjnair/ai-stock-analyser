import * as React from 'react';
import { Skeleton } from '../ui/skeleton';
import { Card } from '../ui/card';
import { cn } from '../../lib/utils';

export interface LoadingSkeletonProps {
  variant?: 'stock-card' | 'analysis' | 'table-row' | 'list-item' | 'page';
  count?: number;
  className?: string;
}

export function LoadingSkeleton({
  variant = 'stock-card',
  count = 1,
  className,
}: LoadingSkeletonProps) {
  const skeletons = Array.from({ length: count }, (_, i) => i);

  switch (variant) {
    case 'stock-card':
      return (
        <div className={cn('grid gap-4', className)}>
          {skeletons.map((i) => (
            <StockCardSkeleton key={i} />
          ))}
        </div>
      );
    case 'analysis':
      return <AnalysisSkeleton className={className} />;
    case 'table-row':
      return (
        <div className={cn('space-y-2', className)}>
          {skeletons.map((i) => (
            <TableRowSkeleton key={i} />
          ))}
        </div>
      );
    case 'list-item':
      return (
        <div className={cn('space-y-3', className)}>
          {skeletons.map((i) => (
            <ListItemSkeleton key={i} />
          ))}
        </div>
      );
    case 'page':
      return <PageSkeleton className={className} />;
    default:
      return <Skeleton className={className} />;
  }
}

function StockCardSkeleton() {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <Skeleton className="h-6 w-16 mb-1" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-5 w-12 rounded-full" />
      </div>
      <div className="flex items-end justify-between mb-3">
        <div>
          <Skeleton className="h-8 w-24 mb-1" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-8 w-20" />
      </div>
      <Skeleton className="h-2 w-full" />
    </Card>
  );
}

function AnalysisSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-20 mb-2" />
          <Skeleton className="h-5 w-40" />
        </div>
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>

      {/* Price section */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-10 w-32 mb-2" />
            <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="h-8 w-20 rounded-full" />
        </div>
      </Card>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-4">
            <Skeleton className="h-4 w-16 mb-2" />
            <Skeleton className="h-6 w-24" />
          </Card>
        ))}
      </div>

      {/* Content */}
      <Card className="p-6">
        <Skeleton className="h-6 w-40 mb-4" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </Card>
    </div>
  );
}

function TableRowSkeleton() {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-surface-100">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div>
          <Skeleton className="h-4 w-16 mb-1" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <div className="text-right">
        <Skeleton className="h-4 w-20 mb-1" />
        <Skeleton className="h-3 w-12" />
      </div>
    </div>
  );
}

function ListItemSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 rounded-lg bg-surface-100">
      <Skeleton className="h-12 w-12 rounded-lg" />
      <div className="flex-1">
        <Skeleton className="h-5 w-32 mb-2" />
        <Skeleton className="h-4 w-48" />
      </div>
      <Skeleton className="h-8 w-16 rounded" />
    </div>
  );
}

function PageSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-8 p-6', className)}>
      {/* Page header */}
      <div>
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-5 w-96" />
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <StockCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
