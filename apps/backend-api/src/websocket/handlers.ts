import { z } from 'zod';
import type { ClientConnection } from './client-connection.js';

// Message schemas
const baseMessageSchema = z.object({
  action: z.string(),
});

const subscribeMessageSchema = z.object({
  action: z.literal('subscribe'),
  symbols: z.array(z.string().min(1).max(10)).min(1).max(5),
});

const unsubscribeMessageSchema = z.object({
  action: z.literal('unsubscribe'),
  symbols: z.array(z.string().min(1).max(10)).min(1),
});

const pingMessageSchema = z.object({
  action: z.literal('ping'),
});

export type SubscribeMessage = z.infer<typeof subscribeMessageSchema>;
export type UnsubscribeMessage = z.infer<typeof unsubscribeMessageSchema>;
export type PingMessage = z.infer<typeof pingMessageSchema>;

export type ClientMessage = SubscribeMessage | UnsubscribeMessage | PingMessage;

export interface ValidationResult {
  valid: boolean;
  data?: ClientMessage;
  error?: string;
}

/**
 * Validate incoming WebSocket message format
 */
export function validateMessage(rawMessage: string): ValidationResult {
  try {
    const parsed = JSON.parse(rawMessage);

    // First check if it has an action field
    const baseResult = baseMessageSchema.safeParse(parsed);
    if (!baseResult.success) {
      return {
        valid: false,
        error: 'Invalid message format: missing action field',
      };
    }

    // Validate based on action type
    switch (parsed.action) {
      case 'subscribe': {
        const result = subscribeMessageSchema.safeParse(parsed);
        if (!result.success) {
          return {
            valid: false,
            error: `Invalid subscribe message: ${result.error.message}`,
          };
        }
        return { valid: true, data: result.data };
      }

      case 'unsubscribe': {
        const result = unsubscribeMessageSchema.safeParse(parsed);
        if (!result.success) {
          return {
            valid: false,
            error: `Invalid unsubscribe message: ${result.error.message}`,
          };
        }
        return { valid: true, data: result.data };
      }

      case 'ping': {
        const result = pingMessageSchema.safeParse(parsed);
        if (!result.success) {
          return {
            valid: false,
            error: `Invalid ping message: ${result.error.message}`,
          };
        }
        return { valid: true, data: result.data };
      }

      default:
        return {
          valid: false,
          error: `Unknown action: ${parsed.action}`,
        };
    }
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Failed to parse message',
    };
  }
}

/**
 * Handle subscribe request
 */
export function handleSubscribe(
  connection: ClientConnection,
  symbols: string[],
  maxSymbolsPerConnection: number = 5
): { success: boolean; message: string; subscribed?: string[] } {
  // Normalize symbols to uppercase
  const normalizedSymbols = symbols.map(s => s.toUpperCase());

  // Check if adding these symbols would exceed the limit
  const currentCount = connection.subscribedSymbols.size;
  const newSymbols = normalizedSymbols.filter(s => !connection.isSubscribedTo(s));
  const wouldExceedLimit = currentCount + newSymbols.length > maxSymbolsPerConnection;

  if (wouldExceedLimit) {
    return {
      success: false,
      message: `Cannot subscribe: would exceed maximum of ${maxSymbolsPerConnection} symbols per connection. Currently subscribed to ${currentCount} symbols.`,
    };
  }

  // Add symbols to connection
  const subscribed: string[] = [];
  for (const symbol of normalizedSymbols) {
    if (!connection.isSubscribedTo(symbol)) {
      connection.addSymbol(symbol);
      subscribed.push(symbol);
    }
  }

  if (subscribed.length === 0) {
    return {
      success: true,
      message: 'Already subscribed to all requested symbols',
      subscribed: [],
    };
  }

  return {
    success: true,
    message: `Successfully subscribed to ${subscribed.length} symbol(s)`,
    subscribed,
  };
}

/**
 * Handle unsubscribe request
 */
export function handleUnsubscribe(
  connection: ClientConnection,
  symbols: string[]
): { success: boolean; message: string; unsubscribed?: string[] } {
  // Normalize symbols to uppercase
  const normalizedSymbols = symbols.map(s => s.toUpperCase());

  // Remove symbols from connection
  const unsubscribed: string[] = [];
  for (const symbol of normalizedSymbols) {
    if (connection.isSubscribedTo(symbol)) {
      connection.removeSymbol(symbol);
      unsubscribed.push(symbol);
    }
  }

  if (unsubscribed.length === 0) {
    return {
      success: true,
      message: 'Not subscribed to any of the requested symbols',
      unsubscribed: [],
    };
  }

  return {
    success: true,
    message: `Successfully unsubscribed from ${unsubscribed.length} symbol(s)`,
    unsubscribed,
  };
}

/**
 * Format trade data for sending to client
 */
export interface TradeData {
  symbol: string;
  price: number;
  volume: number;
  timestamp: number;
  conditions?: string[];
  exchange?: string;
}

export interface FormattedTradeMessage {
  type: 'trade';
  data: TradeData;
  timestamp: number;
}

export function formatTradeMessage(trade: TradeData): FormattedTradeMessage {
  return {
    type: 'trade',
    data: {
      symbol: trade.symbol,
      price: trade.price,
      volume: trade.volume,
      timestamp: trade.timestamp,
      conditions: trade.conditions,
      exchange: trade.exchange,
    },
    timestamp: Date.now(),
  };
}

/**
 * Format error message for client
 */
export interface ErrorMessage {
  type: 'error';
  message: string;
  timestamp: number;
}

export function formatErrorMessage(message: string): ErrorMessage {
  return {
    type: 'error',
    message,
    timestamp: Date.now(),
  };
}

/**
 * Format success message for client
 */
export interface SuccessMessage {
  type: 'success';
  message: string;
  data?: unknown;
  timestamp: number;
}

export function formatSuccessMessage(message: string, data?: unknown): SuccessMessage {
  return {
    type: 'success',
    message,
    data,
    timestamp: Date.now(),
  };
}

/**
 * Format pong message for client
 */
export interface PongMessage {
  type: 'pong';
  timestamp: number;
}

export function formatPongMessage(): PongMessage {
  return {
    type: 'pong',
    timestamp: Date.now(),
  };
}
