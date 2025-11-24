import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  LiveIndicator,
  PriceDisplay,
  BarChart3,
} from '@stock-analyser/ui';
import { useWebSocket } from '../hooks/useWebSocket';
import type { TradeData } from '../types';

interface Stock {
  ticker: string;
  name: string;
}

interface MajorStocksTickerProps {
  stocks: Stock[];
  onSelectStock: (ticker: string) => void;
}

interface PriceData {
  p: number; // price
  prevP: number; // previous price for change calculation
  dir: 'up' | 'down' | 'neutral';
}

const MajorStocksTicker: React.FC<MajorStocksTickerProps> = ({
  stocks,
  onSelectStock,
}) => {
  const [prices, setPrices] = useState<Record<string, PriceData>>({});

  const { isConnected, subscribe, unsubscribe } = useWebSocket({
    onTrade: (trade: TradeData) => {
      setPrices((prevPrices) => {
        const oldPrice = prevPrices[trade.s]?.p || 0;
        const newDir =
          oldPrice === 0
            ? 'neutral'
            : trade.p > oldPrice
            ? 'up'
            : trade.p < oldPrice
            ? 'down'
            : prevPrices[trade.s]?.dir || 'neutral';

        return {
          ...prevPrices,
          [trade.s]: { p: trade.p, prevP: oldPrice, dir: newDir },
        };
      });
    },
  });

  useEffect(() => {
    // Initialize prices
    const initialPrices: Record<string, PriceData> = {};
    stocks.forEach((stock) => {
      initialPrices[stock.ticker] = { p: 0, prevP: 0, dir: 'neutral' };
    });
    setPrices(initialPrices);

    // Subscribe to all major stocks
    stocks.forEach((stock) => {
      subscribe(stock.ticker);
    });

    // Cleanup: unsubscribe when component unmounts
    return () => {
      stocks.forEach((stock) => {
        unsubscribe(stock.ticker);
      });
    };
  }, [stocks, subscribe, unsubscribe]);

  return (
    <Card className="border-border bg-card/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-brand-500/10 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-brand-400" />
            </div>
            <CardTitle className="text-lg">Major Stocks</CardTitle>
          </div>
          <LiveIndicator isLive={isConnected} size="sm" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {stocks.map((stock, index) => {
            const priceData = prices[stock.ticker];
            const hasPrice = priceData?.p > 0;
            const change = hasPrice && priceData.prevP > 0
              ? priceData.p - priceData.prevP
              : 0;
            const changePercent = hasPrice && priceData.prevP > 0
              ? ((priceData.p - priceData.prevP) / priceData.prevP) * 100
              : 0;

            return (
              <motion.button
                key={stock.ticker}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onSelectStock(stock.ticker)}
                className="group text-left p-3 rounded-xl bg-surface-100 border border-border hover:border-brand-500/50 hover:bg-surface-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground group-hover:text-brand-400 transition-colors">
                      {stock.ticker}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {stock.name}
                  </p>
                  <div
                    className={`font-mono text-sm font-semibold ${
                      priceData?.dir === 'up'
                        ? 'text-bullish'
                        : priceData?.dir === 'down'
                        ? 'text-bearish'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {hasPrice ? `$${priceData.p.toFixed(2)}` : '—'}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default MajorStocksTicker;
