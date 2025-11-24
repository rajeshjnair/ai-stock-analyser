import { useEffect, useRef, useState, useCallback } from 'react';
import type { TradeData } from '../types';

interface UseWebSocketOptions {
  url?: string;
  onTrade?: (trade: TradeData) => void;
  autoConnect?: boolean;
}

interface UseWebSocketReturn {
  isConnected: boolean;
  subscribe: (symbol: string) => void;
  unsubscribe: (symbol: string) => void;
  connect: () => void;
  disconnect: () => void;
}

const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';

export const useWebSocket = (options: UseWebSocketOptions = {}): UseWebSocketReturn => {
  const { url = `${WS_BASE_URL}/ws`, onTrade, autoConnect = true } = options;
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const subscribedSymbolsRef = useRef<Set<string>>(new Set());

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const socket = new WebSocket(url);
      wsRef.current = socket;

      socket.onopen = () => {
        console.log('WebSocket connected to backend');
        setIsConnected(true);

        // Re-subscribe to all previously subscribed symbols
        subscribedSymbolsRef.current.forEach((symbol) => {
          socket.send(JSON.stringify({ type: 'subscribe', symbol }));
        });
      };

      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          if (message.type === 'trade' && onTrade) {
            // Backend sends individual trade data
            const trade: TradeData = {
              s: message.symbol,
              p: message.price,
              v: message.volume,
              t: message.timestamp,
            };
            onTrade(trade);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };

      socket.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        wsRef.current = null;

        // Auto-reconnect after 5 seconds
        if (autoConnect) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('Attempting to reconnect...');
            connect();
          }, 5000);
        }
      };
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
    }
  }, [url, onTrade, autoConnect]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    subscribedSymbolsRef.current.clear();
    setIsConnected(false);
  }, []);

  const subscribe = useCallback((symbol: string) => {
    subscribedSymbolsRef.current.add(symbol);

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'subscribe', symbol }));
    }
  }, []);

  const unsubscribe = useCallback((symbol: string) => {
    subscribedSymbolsRef.current.delete(symbol);

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'unsubscribe', symbol }));
    }
  }, []);

  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    isConnected,
    subscribe,
    unsubscribe,
    connect,
    disconnect,
  };
};
