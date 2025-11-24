import React, { useState, useEffect, useRef } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import type { TradeData } from '../types';
import { SignalIcon } from './icons';

const MAX_TRADES_DISPLAYED = 15;

interface RealtimeTradesProps {
  ticker: string;
}

const RealtimeTrades: React.FC<RealtimeTradesProps> = ({ ticker }) => {
  const [trades, setTrades] = useState<TradeData[]>([]);
  const lastPriceRef = useRef<number | null>(null);
  const { isConnected, subscribe, unsubscribe } = useWebSocket({
    onTrade: (trade: TradeData) => {
      if (trade.s === ticker) {
        setTrades((prevTrades) => {
          const updatedTrades = [trade, ...prevTrades];
          return updatedTrades.slice(0, MAX_TRADES_DISPLAYED);
        });
      }
    },
  });

  useEffect(() => {
    if (!ticker) return;

    // Reset trades when ticker changes
    setTrades([]);
    lastPriceRef.current = null;

    // Subscribe to the ticker
    subscribe(ticker);

    // Cleanup: unsubscribe when ticker changes or component unmounts
    return () => {
      unsubscribe(ticker);
    };
  }, [ticker, subscribe, unsubscribe]);

  const renderTradeRow = (trade: TradeData, index: number) => {
    const priceColor =
      lastPriceRef.current === null || trade.p === lastPriceRef.current
        ? 'text-gray-300'
        : trade.p > lastPriceRef.current
        ? 'text-green-400'
        : 'text-red-400';

    // Update last price after determining color
    if (index === 0) {
        lastPriceRef.current = trade.p;
    }

    return (
      <div key={trade.t + index} className="grid grid-cols-3 gap-4 p-2 text-sm border-b border-gray-700/50 animate-fade-in">
        <span className={`font-mono font-semibold ${priceColor}`}>
          {trade.p.toFixed(2)}
        </span>
        <span className="font-mono text-gray-400 text-right">{trade.v.toFixed(4)}</span>
        <span className="font-mono text-gray-500 text-right">
          {new Date(trade.t).toLocaleTimeString()}
        </span>
      </div>
    );
  };

  return (
    <section className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
            <SignalIcon className="w-6 h-6 text-blue-400" />
            <h3 className="text-xl font-bold text-white">Real-Time Trades</h3>
        </div>
        <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-400">{isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
      </div>
      <div className="h-64 overflow-y-auto pr-2">
        {trades.length > 0 ? (
          <div>
            <div className="grid grid-cols-3 gap-4 p-2 text-xs font-bold text-gray-500 border-b border-gray-600">
              <span>Price (USD)</span>
              <span className="text-right">Volume</span>
              <span className="text-right">Time</span>
            </div>
            {trades.map(renderTradeRow)}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>Waiting for trade data...</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default RealtimeTrades;
