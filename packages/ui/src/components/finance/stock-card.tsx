import * as React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui/card';
import { PriceDisplay } from './price-display';
import { TrendIndicator } from './trend-indicator';
import { RecommendationBadge, type RecommendationType } from './recommendation-badge';
import { ConfidenceScore } from './confidence-score';
import { SparklineChart } from './sparkline-chart';
import { cn } from '../../lib/utils';

export interface StockCardProps {
  ticker: string;
  companyName?: string;
  price: number;
  change?: number;
  changePercent?: number;
  recommendation?: RecommendationType;
  confidenceScore?: number;
  sparklineData?: number[];
  onClick?: () => void;
  className?: string;
  isLoading?: boolean;
}

export function StockCard({
  ticker,
  companyName,
  price,
  change,
  changePercent,
  recommendation,
  confidenceScore,
  sparklineData,
  onClick,
  className,
  isLoading = false,
}: StockCardProps) {
  if (isLoading) {
    return <StockCardSkeleton className={className} />;
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        hover
        className={cn(
          'cursor-pointer p-4 transition-all duration-200',
          'hover:shadow-card-hover hover:border-brand-500/30',
          className
        )}
        onClick={onClick}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-display font-bold text-lg text-foreground">
              {ticker}
            </h3>
            {companyName && (
              <p className="text-sm text-muted-foreground truncate max-w-[120px]">
                {companyName}
              </p>
            )}
          </div>
          {recommendation && (
            <RecommendationBadge recommendation={recommendation} size="sm" />
          )}
        </div>

        {/* Price and Chart */}
        <div className="flex items-end justify-between mb-3">
          <PriceDisplay
            price={price}
            change={change}
            changePercent={changePercent}
            size="md"
          />
          {sparklineData && sparklineData.length > 0 && (
            <div className="w-20 h-8">
              <SparklineChart data={sparklineData} width={80} height={32} />
            </div>
          )}
        </div>

        {/* Confidence Score */}
        {confidenceScore !== undefined && (
          <ConfidenceScore score={confidenceScore} size="sm" />
        )}
      </Card>
    </motion.div>
  );
}

function StockCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn('p-4', className)}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="h-6 w-16 skeleton rounded mb-1" />
          <div className="h-4 w-24 skeleton rounded" />
        </div>
        <div className="h-5 w-12 skeleton rounded-full" />
      </div>
      <div className="flex items-end justify-between mb-3">
        <div>
          <div className="h-8 w-24 skeleton rounded mb-1" />
          <div className="h-4 w-16 skeleton rounded" />
        </div>
        <div className="h-8 w-20 skeleton rounded" />
      </div>
      <div className="h-2 w-full skeleton rounded" />
    </Card>
  );
}

export { StockCardSkeleton };
