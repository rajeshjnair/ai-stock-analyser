import WebSocket from 'ws';
import { env } from '../config/env.js';
import { redisClient } from '../config/redis.js';

interface FinnhubTrade {
  s: string;  // symbol
  p: number;  // price
  t: number;  // timestamp
  v: number;  // volume
}

interface FinnhubMessage {
  type: 'trade' | 'ping';
  data?: FinnhubTrade[];
}

export class FinnhubConnector {
  private ws: WebSocket | null = null;
  private subscribedSymbols = new Set<string>();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 1000; // Start with 1 second
  private maxReconnectDelay = 30000; // Max 30 seconds
  private isConnected = false;
  private isShuttingDown = false;
  private pingInterval: NodeJS.Timeout | null = null;
  private lastPongReceived = Date.now();
  private readonly PING_INTERVAL = 30000; // 30 seconds
  private readonly PONG_TIMEOUT = 10000; // 10 seconds

  constructor() {
    this.setupProcessHandlers();
  }

  private setupProcessHandlers(): void {
    process.on('SIGTERM', () => this.shutdown());
    process.on('SIGINT', () => this.shutdown());
  }

  async connect(): Promise<void> {
    if (this.isShuttingDown) {
      console.log('Cannot connect - service is shutting down');
      return;
    }

    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    return new Promise((resolve, reject) => {
      try {
        const wsUrl = `wss://ws.finnhub.io?token=${env.FINNHUB_API_KEY}`;
        this.ws = new WebSocket(wsUrl);

        this.ws.on('open', () => {
          console.log('Finnhub WebSocket connected');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.reconnectDelay = 1000;
          this.lastPongReceived = Date.now();

          // Resubscribe to all symbols if this is a reconnect
          if (this.subscribedSymbols.size > 0) {
            console.log(`Resubscribing to ${this.subscribedSymbols.size} symbols`);
            this.subscribedSymbols.forEach(symbol => {
              this.sendSubscribe(symbol);
            });
          }

          // Start ping/pong monitoring
          this.startPingMonitoring();

          resolve();
        });

        this.ws.on('message', (data: WebSocket.Data) => {
          this.handleMessage(data.toString());
        });

        this.ws.on('error', (error) => {
          console.error('Finnhub WebSocket error:', error);
          this.isConnected = false;
          if (this.reconnectAttempts === 0) {
            reject(error);
          }
        });

        this.ws.on('close', (code, reason) => {
          console.log(`Finnhub WebSocket closed. Code: ${code}, Reason: ${reason}`);
          this.isConnected = false;
          this.stopPingMonitoring();

          if (!this.isShuttingDown) {
            this.scheduleReconnect();
          }
        });

        this.ws.on('pong', () => {
          this.lastPongReceived = Date.now();
        });

      } catch (error) {
        console.error('Error creating WebSocket connection:', error);
        reject(error);
      }
    });
  }

  private handleMessage(data: string): void {
    try {
      const message: FinnhubMessage = JSON.parse(data);

      if (message.type === 'ping') {
        // Finnhub sends pings, we should respond with pong
        if (this.ws?.readyState === WebSocket.OPEN) {
          this.ws.pong();
        }
        return;
      }

      if (message.type === 'trade' && message.data) {
        this.publishTrades(message.data);
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
    }
  }

  private async publishTrades(trades: FinnhubTrade[]): Promise<void> {
    try {
      // Group trades by symbol for efficient publishing
      const tradesBySymbol = new Map<string, FinnhubTrade[]>();

      for (const trade of trades) {
        if (!tradesBySymbol.has(trade.s)) {
          tradesBySymbol.set(trade.s, []);
        }
        tradesBySymbol.get(trade.s)!.push(trade);
      }

      // Publish to Redis channels for each symbol
      const publishPromises = Array.from(tradesBySymbol.entries()).map(
        ([symbol, symbolTrades]) => {
          const channel = `trade:${symbol}`;
          const payload = JSON.stringify({
            type: 'trade',
            symbol,
            data: symbolTrades,
            timestamp: Date.now(),
          });
          return redisClient.publish(channel, payload);
        }
      );

      await Promise.all(publishPromises);
    } catch (error) {
      console.error('Error publishing trades to Redis:', error);
    }
  }

  private startPingMonitoring(): void {
    this.stopPingMonitoring();

    this.pingInterval = setInterval(() => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        return;
      }

      const timeSinceLastPong = Date.now() - this.lastPongReceived;

      if (timeSinceLastPong > this.PING_INTERVAL + this.PONG_TIMEOUT) {
        console.log('Connection appears stale, reconnecting...');
        this.ws.terminate();
        return;
      }

      // Send ping to Finnhub
      this.ws.ping();
    }, this.PING_INTERVAL);
  }

  private stopPingMonitoring(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private sendSubscribe(symbol: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn(`Cannot subscribe to ${symbol} - WebSocket not open`);
      return;
    }

    const message = JSON.stringify({ type: 'subscribe', symbol });
    this.ws.send(message);
    console.log(`Subscribed to ${symbol}`);
  }

  private sendUnsubscribe(symbol: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn(`Cannot unsubscribe from ${symbol} - WebSocket not open`);
      return;
    }

    const message = JSON.stringify({ type: 'unsubscribe', symbol });
    this.ws.send(message);
    console.log(`Unsubscribed from ${symbol}`);
  }

  subscribe(symbol: string): void {
    if (this.subscribedSymbols.has(symbol)) {
      console.log(`Already subscribed to ${symbol}`);
      return;
    }

    this.subscribedSymbols.add(symbol);
    this.sendSubscribe(symbol);
  }

  unsubscribe(symbol: string): void {
    if (!this.subscribedSymbols.has(symbol)) {
      console.log(`Not subscribed to ${symbol}`);
      return;
    }

    this.subscribedSymbols.delete(symbol);
    this.sendUnsubscribe(symbol);
  }

  private scheduleReconnect(): void {
    if (this.isShuttingDown) {
      return;
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached. Giving up.');
      process.exit(1);
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
      this.maxReconnectDelay
    );

    console.log(
      `Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`
    );

    setTimeout(() => {
      this.connect().catch(error => {
        console.error('Reconnection failed:', error);
      });
    }, delay);
  }

  async disconnect(): Promise<void> {
    this.stopPingMonitoring();

    if (this.ws) {
      // Unsubscribe from all symbols
      this.subscribedSymbols.forEach(symbol => {
        this.sendUnsubscribe(symbol);
      });

      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.close(1000, 'Normal closure');
      } else {
        this.ws.terminate();
      }

      this.ws = null;
    }

    this.subscribedSymbols.clear();
    this.isConnected = false;
  }

  async shutdown(): Promise<void> {
    console.log('Shutting down Finnhub connector...');
    this.isShuttingDown = true;
    await this.disconnect();
  }

  getConnectionStatus(): {
    connected: boolean;
    subscribedSymbols: string[];
    reconnectAttempts: number;
  } {
    return {
      connected: this.isConnected,
      subscribedSymbols: Array.from(this.subscribedSymbols),
      reconnectAttempts: this.reconnectAttempts,
    };
  }
}
