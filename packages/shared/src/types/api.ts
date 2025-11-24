/**
 * API Types
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  statusCode?: number;
}

export enum ApiErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  BAD_REQUEST = 'BAD_REQUEST',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  INVALID_INPUT = 'INVALID_INPUT',
  TIER_LIMIT_EXCEEDED = 'TIER_LIMIT_EXCEEDED'
}

/**
 * WebSocket Message Types
 */

export enum WebSocketMessageType {
  SUBSCRIBE = 'subscribe',
  UNSUBSCRIBE = 'unsubscribe',
  TRADE = 'trade',
  QUOTE = 'quote',
  ERROR = 'error',
  PING = 'ping',
  PONG = 'pong'
}

export interface WebSocketMessage {
  type: WebSocketMessageType;
  timestamp: number;
}

export interface SubscribeMessage extends WebSocketMessage {
  type: WebSocketMessageType.SUBSCRIBE;
  symbols: string[];
}

export interface UnsubscribeMessage extends WebSocketMessage {
  type: WebSocketMessageType.UNSUBSCRIBE;
  symbols: string[];
}

export interface TradeMessage extends WebSocketMessage {
  type: WebSocketMessageType.TRADE;
  data: {
    symbol: string;
    price: number;
    volume: number;
    timestamp: number;
  };
}

export interface QuoteMessage extends WebSocketMessage {
  type: WebSocketMessageType.QUOTE;
  data: {
    symbol: string;
    bid: number;
    ask: number;
    last: number;
    volume: number;
    timestamp: number;
  };
}

export interface ErrorMessage extends WebSocketMessage {
  type: WebSocketMessageType.ERROR;
  error: ApiError;
}

export type WSMessage =
  | SubscribeMessage
  | UnsubscribeMessage
  | TradeMessage
  | QuoteMessage
  | ErrorMessage
  | WebSocketMessage;

/**
 * Request/Response Types
 */

export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
}

export interface StockAnalysisRequest {
  ticker: string;
  includeNews?: boolean;
  includePredictions?: boolean;
}

export interface WatchlistUpdateRequest {
  symbols: string[];
  action: 'add' | 'remove' | 'replace';
}

export interface PriceAlertRequest {
  symbol: string;
  condition: 'above' | 'below';
  targetPrice: number;
}
