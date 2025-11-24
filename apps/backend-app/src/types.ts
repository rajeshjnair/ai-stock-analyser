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

export interface TradeData {
  s: string; // symbol
  p: number; // price
  v: number; // volume
  t: number; // timestamp
}

export interface WatchlistItem {
  ticker: string;
  companyName: string;
  addedAt: string;
}
