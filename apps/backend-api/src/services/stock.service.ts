import { cacheService } from './cache.service';

/**
 * Stock information from Finnhub
 */
export interface StockInfo {
  symbol: string;
  name: string;
  exchange: string;
  currency: string;
  country: string;
  type: string;
  mic: string;
}

/**
 * Stock quote data
 */
export interface StockQuote {
  symbol: string;
  current: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  change: number;
  changePercent: number;
  timestamp: number;
}

/**
 * Historical price data point
 */
export interface HistoricalDataPoint {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/**
 * Time period for historical data
 */
export type HistoricalPeriod = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | '5Y';

/**
 * Stock service for fetching and caching stock data
 */
export class StockService {
  private finnhubApiKey: string;
  private baseUrl: string = 'https://finnhub.io/api/v1';

  constructor() {
    this.finnhubApiKey = process.env.FINNHUB_API_KEY || '';

    if (!this.finnhubApiKey) {
      console.warn('FINNHUB_API_KEY not set. Stock service will not work.');
    }
  }

  /**
   * Get stock information with caching
   * @param ticker - Stock ticker symbol
   * @returns Stock information
   */
  async getStockInfo(ticker: string): Promise<StockInfo | null> {
    const normalizedTicker = ticker.toUpperCase();
    const cacheKey = `stock:info:${normalizedTicker}`;

    // Try cache first (24 hour TTL)
    const cached = await cacheService.get<StockInfo>(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch from Finnhub
    const info = await this.fetchStockInfoFromFinnhub(normalizedTicker);

    if (info) {
      // Cache for 24 hours
      await cacheService.set(cacheKey, info, 86400);
    }

    return info;
  }

  /**
   * Get current stock quote with caching
   * @param ticker - Stock ticker symbol
   * @returns Current stock quote
   */
  async getStockQuote(ticker: string): Promise<StockQuote | null> {
    const normalizedTicker = ticker.toUpperCase();
    const cacheKey = `stock:quote:${normalizedTicker}`;

    // Try cache first (1 minute TTL during market hours)
    const cached = await cacheService.get<StockQuote>(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch from Finnhub
    const quote = await this.fetchStockQuoteFromFinnhub(normalizedTicker);

    if (quote) {
      // Cache for 1 minute
      await cacheService.set(cacheKey, quote, 60);
    }

    return quote;
  }

  /**
   * Get historical stock data with caching
   * @param ticker - Stock ticker symbol
   * @param period - Time period for historical data
   * @returns Array of historical data points
   */
  async getStockHistory(
    ticker: string,
    period: HistoricalPeriod = '1M'
  ): Promise<HistoricalDataPoint[]> {
    const normalizedTicker = ticker.toUpperCase();
    const cacheKey = `stock:history:${normalizedTicker}:${period}`;

    // Try cache first (cache TTL varies by period)
    const cacheTtl = this.getHistoryCacheTtl(period);
    const cached = await cacheService.get<HistoricalDataPoint[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch from Finnhub
    const history = await this.fetchStockHistoryFromFinnhub(normalizedTicker, period);

    if (history && history.length > 0) {
      // Cache with appropriate TTL
      await cacheService.set(cacheKey, history, cacheTtl);
    }

    return history || [];
  }

  /**
   * Search for stocks by query
   * @param query - Search query (ticker or company name)
   * @returns Array of matching stocks
   */
  async searchStocks(query: string): Promise<StockInfo[]> {
    const cacheKey = `stock:search:${query.toLowerCase()}`;

    // Try cache first (1 hour TTL)
    const cached = await cacheService.get<StockInfo[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch from Finnhub
    const results = await this.searchStocksFromFinnhub(query);

    if (results && results.length > 0) {
      // Cache for 1 hour
      await cacheService.set(cacheKey, results, 3600);
    }

    return results || [];
  }

  /**
   * Placeholder: Fetch stock info from Finnhub API
   * TODO: Implement actual Finnhub integration
   */
  private async fetchStockInfoFromFinnhub(ticker: string): Promise<StockInfo | null> {
    // TODO: Implement Finnhub API call
    // const url = `${this.baseUrl}/stock/profile2?symbol=${ticker}&token=${this.finnhubApiKey}`;
    // const response = await fetch(url);
    // const data = await response.json();

    console.log(`TODO: Fetch stock info for ${ticker} from Finnhub`);
    return null;
  }

  /**
   * Placeholder: Fetch stock quote from Finnhub API
   * TODO: Implement actual Finnhub integration
   */
  private async fetchStockQuoteFromFinnhub(ticker: string): Promise<StockQuote | null> {
    // TODO: Implement Finnhub API call
    // const url = `${this.baseUrl}/quote?symbol=${ticker}&token=${this.finnhubApiKey}`;
    // const response = await fetch(url);
    // const data = await response.json();

    console.log(`TODO: Fetch stock quote for ${ticker} from Finnhub`);
    return null;
  }

  /**
   * Placeholder: Fetch historical data from Finnhub API
   * TODO: Implement actual Finnhub integration
   */
  private async fetchStockHistoryFromFinnhub(
    ticker: string,
    period: HistoricalPeriod
  ): Promise<HistoricalDataPoint[] | null> {
    // TODO: Implement Finnhub API call
    // const { from, to } = this.getHistoryDateRange(period);
    // const url = `${this.baseUrl}/stock/candle?symbol=${ticker}&resolution=D&from=${from}&to=${to}&token=${this.finnhubApiKey}`;
    // const response = await fetch(url);
    // const data = await response.json();

    console.log(`TODO: Fetch stock history for ${ticker} (${period}) from Finnhub`);
    return null;
  }

  /**
   * Placeholder: Search stocks from Finnhub API
   * TODO: Implement actual Finnhub integration
   */
  private async searchStocksFromFinnhub(query: string): Promise<StockInfo[] | null> {
    // TODO: Implement Finnhub API call
    // const url = `${this.baseUrl}/search?q=${encodeURIComponent(query)}&token=${this.finnhubApiKey}`;
    // const response = await fetch(url);
    // const data = await response.json();

    console.log(`TODO: Search stocks for query "${query}" from Finnhub`);
    return null;
  }

  /**
   * Get cache TTL based on historical period
   */
  private getHistoryCacheTtl(period: HistoricalPeriod): number {
    switch (period) {
      case '1D':
        return 300; // 5 minutes
      case '1W':
        return 900; // 15 minutes
      case '1M':
        return 3600; // 1 hour
      case '3M':
      case '6M':
        return 7200; // 2 hours
      case '1Y':
      case '5Y':
        return 14400; // 4 hours
      default:
        return 3600; // 1 hour default
    }
  }

  /**
   * Get date range for historical data period
   */
  private getHistoryDateRange(period: HistoricalPeriod): { from: number; to: number } {
    const to = Math.floor(Date.now() / 1000); // Current time in seconds
    const day = 86400; // 1 day in seconds

    let from: number;

    switch (period) {
      case '1D':
        from = to - day;
        break;
      case '1W':
        from = to - 7 * day;
        break;
      case '1M':
        from = to - 30 * day;
        break;
      case '3M':
        from = to - 90 * day;
        break;
      case '6M':
        from = to - 180 * day;
        break;
      case '1Y':
        from = to - 365 * day;
        break;
      case '5Y':
        from = to - 5 * 365 * day;
        break;
      default:
        from = to - 30 * day;
    }

    return { from, to };
  }
}

/**
 * Default stock service instance
 */
export const stockService = new StockService();
