import { randomUUID } from 'crypto';
import type { WebSocket } from 'ws';
import type { IncomingMessage } from 'http';
import Redis from 'ioredis';
import { ClientConnection } from './client-connection.js';
import {
  validateMessage,
  handleSubscribe,
  handleUnsubscribe,
  formatTradeMessage,
  formatErrorMessage,
  formatSuccessMessage,
  formatPongMessage,
  type TradeData,
  type ClientMessage,
} from './handlers.js';

export interface GatewayConfig {
  redisUrl: string;
  serverId: string;
  maxSymbolsPerConnection?: number;
  heartbeatInterval?: number;
}

export interface GatewayStats {
  serverId: string;
  totalConnections: number;
  activeConnections: number;
  totalSymbolSubscriptions: number;
  uptime: number;
  messagesSent: number;
  messagesReceived: number;
}

export class WebSocketGateway {
  private readonly serverId: string;
  private readonly maxSymbolsPerConnection: number;
  private readonly heartbeatInterval: number;
  private readonly connections: Map<string, ClientConnection>;
  private readonly subscribedSymbols: Map<string, Set<string>>; // symbol -> Set<connectionId>
  private redisPub: Redis;
  private redisSub: Redis;
  private heartbeatTimer?: NodeJS.Timeout;
  private startTime: Date;
  private stats = {
    messagesSent: 0,
    messagesReceived: 0,
  };

  constructor(config: GatewayConfig) {
    this.serverId = config.serverId;
    this.maxSymbolsPerConnection = config.maxSymbolsPerConnection ?? 5;
    this.heartbeatInterval = config.heartbeatInterval ?? 30000; // 30 seconds
    this.connections = new Map();
    this.subscribedSymbols = new Map();
    this.startTime = new Date();

    // Create separate Redis clients for pub/sub
    this.redisPub = new Redis(config.redisUrl);
    this.redisSub = new Redis(config.redisUrl);

    this.setupRedisSubscription();
  }

  /**
   * Setup Redis pub/sub subscription
   */
  private setupRedisSubscription(): void {
    // Subscribe to all trade channels using pattern subscription
    this.redisSub.psubscribe('channel:trade:*', (err, count) => {
      if (err) {
        console.error('Failed to subscribe to Redis channels:', err);
        return;
      }
      console.log(`[${this.serverId}] Subscribed to ${count} Redis channel pattern(s)`);
    });

    // Handle incoming messages from Redis
    this.redisSub.on('pmessage', (pattern, channel, message) => {
      try {
        // Parse channel name to extract symbol
        // Format: channel:trade:SYMBOL
        const parts = channel.split(':');
        if (parts.length !== 3 || parts[0] !== 'channel' || parts[1] !== 'trade') {
          console.warn(`[${this.serverId}] Invalid channel format: ${channel}`);
          return;
        }

        const symbol = parts[2];
        const tradeData: TradeData = JSON.parse(message);

        // Broadcast to subscribed clients
        this.broadcastToSubscribers(symbol, tradeData);
      } catch (error) {
        console.error(`[${this.serverId}] Error processing Redis message:`, error);
      }
    });

    this.redisSub.on('error', (err) => {
      console.error(`[${this.serverId}] Redis subscriber error:`, err);
    });

    this.redisPub.on('error', (err) => {
      console.error(`[${this.serverId}] Redis publisher error:`, err);
    });
  }

  /**
   * Start heartbeat interval
   */
  startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      this.connections.forEach((connection) => {
        if (!connection.isAlive()) {
          console.log(`[${this.serverId}] Terminating dead connection: ${connection.id}`);
          connection.close(1000, 'Heartbeat timeout');
          this.handleDisconnect(connection.ws);
          return;
        }

        // Mark as potentially dead, will be marked alive if pong is received
        connection.markDead();

        // Send ping
        if (connection.ws.readyState === 1) { // WebSocket.OPEN
          try {
            connection.ws.ping();
          } catch (error) {
            console.error(`[${this.serverId}] Error sending ping to ${connection.id}:`, error);
          }
        }
      });
    }, this.heartbeatInterval);

    console.log(`[${this.serverId}] Heartbeat started with ${this.heartbeatInterval}ms interval`);
  }

  /**
   * Stop heartbeat interval
   */
  stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = undefined;
      console.log(`[${this.serverId}] Heartbeat stopped`);
    }
  }

  /**
   * Handle new WebSocket connection
   */
  handleConnection(ws: WebSocket, req: IncomingMessage): void {
    const connectionId = randomUUID();

    // Extract userId from query params if available (for authenticated connections)
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const userId = url.searchParams.get('userId') || undefined;

    const connection = new ClientConnection({
      id: connectionId,
      ws,
      userId,
    });

    this.connections.set(connectionId, connection);

    console.log(`[${this.serverId}] New connection: ${connectionId} (total: ${this.connections.size})`);

    // Send welcome message
    connection.send(formatSuccessMessage('Connected to WebSocket Gateway', {
      connectionId,
      serverId: this.serverId,
      maxSymbolsPerConnection: this.maxSymbolsPerConnection,
    }));

    // Setup WebSocket event handlers
    ws.on('message', (data) => this.handleMessage(connection, data));
    ws.on('pong', () => connection.markAlive());
    ws.on('close', () => this.handleDisconnect(ws));
    ws.on('error', (error) => {
      console.error(`[${this.serverId}] WebSocket error for ${connectionId}:`, error);
    });
  }

  /**
   * Handle incoming message from client
   */
  private handleMessage(connection: ClientConnection, data: unknown): void {
    this.stats.messagesReceived++;

    try {
      const rawMessage = data.toString();
      const validation = validateMessage(rawMessage);

      if (!validation.valid) {
        connection.send(formatErrorMessage(validation.error || 'Invalid message format'));
        return;
      }

      const message = validation.data as ClientMessage;

      switch (message.action) {
        case 'subscribe':
          this.handleSubscribeMessage(connection, message.symbols);
          break;

        case 'unsubscribe':
          this.handleUnsubscribeMessage(connection, message.symbols);
          break;

        case 'ping':
          connection.send(formatPongMessage());
          break;

        default:
          connection.send(formatErrorMessage('Unknown action'));
      }
    } catch (error) {
      console.error(`[${this.serverId}] Error handling message from ${connection.id}:`, error);
      connection.send(formatErrorMessage('Internal server error'));
    }
  }

  /**
   * Handle subscribe message
   */
  private handleSubscribeMessage(connection: ClientConnection, symbols: string[]): void {
    const result = handleSubscribe(connection, symbols, this.maxSymbolsPerConnection);

    if (result.success && result.subscribed && result.subscribed.length > 0) {
      // Update symbol -> connection mapping
      result.subscribed.forEach((symbol) => {
        if (!this.subscribedSymbols.has(symbol)) {
          this.subscribedSymbols.set(symbol, new Set());
        }
        this.subscribedSymbols.get(symbol)!.add(connection.id);
      });

      console.log(
        `[${this.serverId}] Connection ${connection.id} subscribed to: ${result.subscribed.join(', ')}`
      );
    }

    connection.send(
      result.success
        ? formatSuccessMessage(result.message, {
            subscribed: result.subscribed,
            currentSubscriptions: connection.getSubscribedSymbols(),
          })
        : formatErrorMessage(result.message)
    );
  }

  /**
   * Handle unsubscribe message
   */
  private handleUnsubscribeMessage(connection: ClientConnection, symbols: string[]): void {
    const result = handleUnsubscribe(connection, symbols);

    if (result.success && result.unsubscribed && result.unsubscribed.length > 0) {
      // Update symbol -> connection mapping
      result.unsubscribed.forEach((symbol) => {
        const connectionSet = this.subscribedSymbols.get(symbol);
        if (connectionSet) {
          connectionSet.delete(connection.id);
          // Clean up empty sets
          if (connectionSet.size === 0) {
            this.subscribedSymbols.delete(symbol);
          }
        }
      });

      console.log(
        `[${this.serverId}] Connection ${connection.id} unsubscribed from: ${result.unsubscribed.join(', ')}`
      );
    }

    connection.send(
      formatSuccessMessage(result.message, {
        unsubscribed: result.unsubscribed,
        currentSubscriptions: connection.getSubscribedSymbols(),
      })
    );
  }

  /**
   * Handle WebSocket disconnect
   */
  handleDisconnect(ws: WebSocket): void {
    // Find connection by WebSocket instance
    let connectionId: string | undefined;
    this.connections.forEach((conn, id) => {
      if (conn.ws === ws) {
        connectionId = id;
      }
    });

    if (!connectionId) {
      return;
    }

    const connection = this.connections.get(connectionId);
    if (!connection) {
      return;
    }

    // Remove connection from all symbol subscriptions
    connection.getSubscribedSymbols().forEach((symbol) => {
      const connectionSet = this.subscribedSymbols.get(symbol);
      if (connectionSet) {
        connectionSet.delete(connectionId);
        if (connectionSet.size === 0) {
          this.subscribedSymbols.delete(symbol);
        }
      }
    });

    // Remove connection
    this.connections.delete(connectionId);

    console.log(
      `[${this.serverId}] Connection closed: ${connectionId} (total: ${this.connections.size})`
    );
  }

  /**
   * Broadcast trade data to all subscribed clients
   */
  broadcastToSubscribers(symbol: string, tradeData: TradeData): void {
    const connectionIds = this.subscribedSymbols.get(symbol);
    if (!connectionIds || connectionIds.size === 0) {
      return;
    }

    const message = formatTradeMessage(tradeData);
    let sentCount = 0;

    connectionIds.forEach((connectionId) => {
      const connection = this.connections.get(connectionId);
      if (connection && connection.isSubscribedTo(symbol)) {
        connection.send(message);
        sentCount++;
        this.stats.messagesSent++;
      }
    });

    if (sentCount > 0) {
      console.log(`[${this.serverId}] Broadcast ${symbol} trade to ${sentCount} client(s)`);
    }
  }

  /**
   * Get gateway statistics
   */
  getStats(): GatewayStats {
    let totalSymbolSubscriptions = 0;
    let activeConnections = 0;

    this.connections.forEach((conn) => {
      totalSymbolSubscriptions += conn.subscribedSymbols.size;
      if (conn.isAlive()) {
        activeConnections++;
      }
    });

    return {
      serverId: this.serverId,
      totalConnections: this.connections.size,
      activeConnections,
      totalSymbolSubscriptions,
      uptime: Math.floor((Date.now() - this.startTime.getTime()) / 1000),
      messagesSent: this.stats.messagesSent,
      messagesReceived: this.stats.messagesReceived,
    };
  }

  /**
   * Shutdown gateway gracefully
   */
  async shutdown(): Promise<void> {
    console.log(`[${this.serverId}] Shutting down WebSocket Gateway...`);

    this.stopHeartbeat();

    // Close all connections
    const closePromises: Promise<void>[] = [];
    this.connections.forEach((connection) => {
      closePromises.push(
        new Promise((resolve) => {
          connection.ws.once('close', () => resolve());
          connection.close(1001, 'Server shutting down');
          // Force close after timeout
          setTimeout(() => {
            connection.ws.terminate();
            resolve();
          }, 5000);
        })
      );
    });

    await Promise.all(closePromises);
    this.connections.clear();
    this.subscribedSymbols.clear();

    // Disconnect Redis clients
    await this.redisSub.quit();
    await this.redisPub.quit();

    console.log(`[${this.serverId}] WebSocket Gateway shutdown complete`);
  }
}
