import React, { useState, useEffect } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { ChartBarIcon } from './icons';
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
  dir: 'up' | 'down' | 'neutral';
}

const MajorStocksTicker: React.FC<MajorStocksTickerProps> = ({ stocks, onSelectStock }) => {
  const [prices, setPrices] = useState<Record<string, PriceData>>({});

  const { isConnected, subscribe, unsubscribe } = useWebSocket({
    onTrade: (trade: TradeData) => {
      setPrices(prevPrices => {
        const oldPrice = prevPrices[trade.s]?.p || 0;
        const newDir = oldPrice === 0 ? 'neutral' : trade.p > oldPrice ? 'up' : trade.p < oldPrice ? 'down' : prevPrices[trade.s]?.dir || 'neutral';

        return {
          ...prevPrices,
          [trade.s]: { p: trade.p, dir: newDir },
        };
      });
    },
  });

  useEffect(() => {
    // Initialize prices
    const initialPrices: Record<string, PriceData> = {};
    stocks.forEach(stock => {
      initialPrices[stock.ticker] = { p: 0, dir: 'neutral' };
    });
    setPrices(initialPrices);

    // Subscribe to all major stocks
    stocks.forEach(stock => {
      subscribe(stock.ticker);
    });

    // Cleanup: unsubscribe when component unmounts
    return () => {
      stocks.forEach(stock => {
        unsubscribe(stock.ticker);
      });
    };
  }, [stocks, subscribe, unsubscribe]);

  const getPriceColor = (dir: PriceData['dir']) => {
    switch (dir) {
      case 'up': return 'text-green-400';
      case 'down': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <ChartBarIcon className="w-6 h-6 text-cyan-400" />
          <h3 className="text-xl font-bold text-white">Major Stocks Live</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
          <span className="text-sm text-gray-400">{isConnected ? 'Live' : 'Disconnected'}</span>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {stocks.map(stock => (
          <button
            key={stock.ticker}
            onClick={() => onSelectStock(stock.ticker)}
            className="w-full text-left p-3 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-blue-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="font-bold text-white">{stock.ticker}</p>
                <p className="text-xs text-gray-400 truncate">{stock.name}</p>
              </div>
              <div className={`font-mono text-lg font-semibold ${getPriceColor(prices[stock.ticker]?.dir)}`}>
                {prices[stock.ticker]?.p > 0 ? prices[stock.ticker].p.toFixed(2) : '...'}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MajorStocksTicker;
