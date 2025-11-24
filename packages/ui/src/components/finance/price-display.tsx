import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, formatCurrency, formatPercentage } from '../../lib/utils';

export interface PriceDisplayProps {
  price: number;
  previousPrice?: number;
  change?: number;
  changePercent?: number;
  currency?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showChange?: boolean;
  animate?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-3xl',
  xl: 'text-4xl',
};

const changeSizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-lg',
};

export function PriceDisplay({
  price,
  previousPrice,
  change,
  changePercent,
  currency = 'USD',
  size = 'md',
  showChange = true,
  animate = true,
  className,
}: PriceDisplayProps) {
  const [flashClass, setFlashClass] = React.useState<string | null>(null);
  const prevPriceRef = React.useRef(price);

  // Determine if price went up or down
  const priceDirection = React.useMemo(() => {
    if (change !== undefined) {
      return change > 0 ? 'up' : change < 0 ? 'down' : 'neutral';
    }
    if (previousPrice !== undefined) {
      return price > previousPrice ? 'up' : price < previousPrice ? 'down' : 'neutral';
    }
    return 'neutral';
  }, [price, previousPrice, change]);

  // Flash effect on price change
  React.useEffect(() => {
    if (animate && prevPriceRef.current !== price) {
      const direction = price > prevPriceRef.current ? 'up' : 'down';
      setFlashClass(direction === 'up' ? 'price-up' : 'price-down');
      const timer = setTimeout(() => setFlashClass(null), 500);
      prevPriceRef.current = price;
      return () => clearTimeout(timer);
    }
  }, [price, animate]);

  const formattedPrice = formatCurrency(price, currency);
  const formattedChange = change !== undefined ? formatCurrency(Math.abs(change), currency) : null;
  const formattedPercent = changePercent !== undefined ? formatPercentage(changePercent) : null;

  const changeColor =
    priceDirection === 'up'
      ? 'text-bullish'
      : priceDirection === 'down'
      ? 'text-bearish'
      : 'text-neutral';

  return (
    <div className={cn('flex flex-col', className)}>
      <AnimatePresence mode="wait">
        <motion.span
          key={price}
          initial={animate ? { opacity: 0, y: -10 } : false}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.15 }}
          className={cn(
            'font-mono font-semibold text-foreground',
            sizeClasses[size],
            flashClass
          )}
        >
          {formattedPrice}
        </motion.span>
      </AnimatePresence>

      {showChange && (formattedChange || formattedPercent) && (
        <div className={cn('flex items-center gap-1', changeSizeClasses[size], changeColor)}>
          {priceDirection === 'up' && <span>+</span>}
          {priceDirection === 'down' && <span>-</span>}
          {formattedChange && <span>{formattedChange.replace('-', '')}</span>}
          {formattedPercent && (
            <span className="opacity-80">({formattedPercent})</span>
          )}
        </div>
      )}
    </div>
  );
}
