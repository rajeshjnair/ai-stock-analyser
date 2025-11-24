/**
 * Stock Analysis Types
 */

export interface StockAnalysis {
  ticker: string;
  companyName: string;
  currentPrice: string;
  prediction: 'Bullish' | 'Bearish' | 'Neutral';
  recommendation: 'Buy' | 'Sell' | 'Hold';
  confidenceScore: number;
  analysisSummary: string;
  keyNews: {
    title: string;
    summary: string;
  }[];
  historicalPrices: {
    yesterday: string;
    week_ago: string;
    month_ago: string;
  };
  futurePredictions: {
    tomorrow: string;
    month_after: string;
  };
  dailyStats: {
    todaysOpen: string;
    todaysHigh: string;
  };
}

export interface GroundingChunk {
  web: {
    uri: string;
    title: string;
  };
}

export interface TradeData {
  p: number; // Price
  s: string; // Symbol
  t: number; // UNIX MS Timestamp
  v: number; // Volume
}

/**
 * Additional stock-related types
 */

export interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  lastUpdated: number;
}

export interface StockTimeSeries {
  symbol: string;
  data: {
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }[];
}

export type TimeInterval = '1m' | '5m' | '15m' | '30m' | '1h' | '1d' | '1w' | '1M';

export interface PriceAlert {
  id: string;
  userId: string;
  symbol: string;
  condition: 'above' | 'below';
  targetPrice: number;
  triggered: boolean;
  createdAt: number;
  triggeredAt?: number;
}
