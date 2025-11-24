import Redis from 'ioredis';
import { env } from './config/env.js';
import { FinnhubConnector } from './websocket/finnhub-connector.js';
import { SubscriptionManager, SubscriptionCommand } from './websocket/subscription-manager.js';

class FinnhubManager {
  private redisClient: Redis;
  private redisSubscriber: Redis;
  private finnhubConnector: FinnhubConnector;
  private subscriptionManager: SubscriptionManager;
  private isShuttingDown = false;
  private readonly CONTROL_CHANNEL = 'finnhub:control';
  private readonly HEARTBEAT_INTERVAL = 10000; // 10 seconds
  private heartbeatTimer: NodeJS.Timeout | null = null;

  constructor() {
    // Create Redis clients
    this.redisClient = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    // Separate Redis client for pub/sub (required by ioredis)
    this.redisSubscriber = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    this.finnhubConnector = new FinnhubConnector();
    this.subscriptionManager = new SubscriptionManager();

    this.setupRedisEventHandlers();
    this.setupProcessHandlers();
  }

  private setupRedisEventHandlers(): void {
    this.redisClient.on('connect', () => {
      console.log('Redis client connected');
    });

    this.redisClient.on('error', (err) => {
      console.error('Redis client error:', err);
    });

    this.redisSubscriber.on('connect', () => {
      console.log('Redis subscriber connected');
    });

    this.redisSubscriber.on('error', (err) => {
      console.error('Redis subscriber error:', err);
    });

    this.redisSubscriber.on('message', (channel, message) => {
      this.handleControlMessage(message);
    });
  }

  private setupProcessHandlers(): void {
    process.on('SIGTERM', () => this.shutdown());
    process.on('SIGINT', () => this.shutdown());
    process.on('uncaughtException', (error) => {
      console.error('Uncaught exception:', error);
      this.shutdown();
    });
    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled rejection at:', promise, 'reason:', reason);
    });
  }

  private async handleControlMessage(message: string): Promise<void> {
    try {
      const command: SubscriptionCommand = JSON.parse(message);

      console.log(
        `Received ${command.action} command for ${command.symbol} from ${command.serverId}`
      );

      if (command.action === 'subscribe') {
        const shouldSubscribe = await this.subscriptionManager.handleSubscriptionRequest(
          command.symbol,
          command.serverId
        );

        if (shouldSubscribe) {
          this.finnhubConnector.subscribe(command.symbol);
        }
      } else if (command.action === 'unsubscribe') {
        const shouldUnsubscribe = await this.subscriptionManager.handleUnsubscriptionRequest(
          command.symbol,
          command.serverId
        );

        if (shouldUnsubscribe) {
          this.finnhubConnector.unsubscribe(command.symbol);
        }
      }
    } catch (error) {
      console.error('Error handling control message:', error);
    }
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(async () => {
      try {
        const stats = await this.subscriptionManager.getStats();
        const status = this.finnhubConnector.getConnectionStatus();

        console.log('Heartbeat:', {
          connected: status.connected,
          subscribedToFinnhub: status.subscribedSymbols.length,
          totalSymbolsWithSubscribers: stats.totalSymbols,
          reconnectAttempts: status.reconnectAttempts,
        });

        // Store heartbeat in Redis for monitoring
        await this.redisClient.setex(
          'finnhub:manager:heartbeat',
          30, // 30 second TTL
          JSON.stringify({
            timestamp: Date.now(),
            status,
            stats,
          })
        );
      } catch (error) {
        console.error('Error in heartbeat:', error);
      }
    }, this.HEARTBEAT_INTERVAL);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  async start(): Promise<void> {
    console.log('Starting Finnhub Manager...');
    console.log('Environment:', {
      nodeEnv: env.NODE_ENV,
      redisUrl: env.REDIS_URL.replace(/:[^:]*@/, ':****@'), // Hide password
      finnhubKeyPresent: !!env.FINNHUB_API_KEY,
    });

    try {
      // Wait for Redis connections
      await Promise.all([
        this.waitForRedis(this.redisClient, 'client'),
        this.waitForRedis(this.redisSubscriber, 'subscriber'),
      ]);

      // Subscribe to control channel
      console.log(`Subscribing to control channel: ${this.CONTROL_CHANNEL}`);
      await this.redisSubscriber.subscribe(this.CONTROL_CHANNEL);

      // Connect to Finnhub
      console.log('Connecting to Finnhub WebSocket...');
      await this.finnhubConnector.connect();

      // Restore any existing subscriptions from Redis
      await this.restoreSubscriptions();

      // Start heartbeat
      this.startHeartbeat();

      console.log('Finnhub Manager started successfully');
    } catch (error) {
      console.error('Error starting Finnhub Manager:', error);
      await this.shutdown();
      process.exit(1);
    }
  }

  private async waitForRedis(client: Redis, name: string): Promise<void> {
    if (client.status === 'ready') {
      return;
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Redis ${name} connection timeout`));
      }, 10000);

      client.once('ready', () => {
        clearTimeout(timeout);
        resolve();
      });

      client.once('error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });
  }

  private async restoreSubscriptions(): Promise<void> {
    try {
      const subscribedSymbols = await this.subscriptionManager.getAllSubscribedSymbols();

      if (subscribedSymbols.length === 0) {
        console.log('No existing subscriptions to restore');
        return;
      }

      console.log(`Restoring ${subscribedSymbols.length} subscriptions from Redis`);

      // Only subscribe to symbols that have active subscribers
      for (const symbol of subscribedSymbols) {
        const hasSubscribers = await this.subscriptionManager.hasSubscribers(symbol);

        if (hasSubscribers) {
          this.finnhubConnector.subscribe(symbol);
        } else {
          // Clean up stale data
          await this.subscriptionManager.removeAllSubscriptions(symbol);
        }
      }

      console.log('Subscription restoration complete');
    } catch (error) {
      console.error('Error restoring subscriptions:', error);
    }
  }

  async shutdown(): Promise<void> {
    if (this.isShuttingDown) {
      return;
    }

    console.log('Shutting down Finnhub Manager...');
    this.isShuttingDown = true;

    // Stop heartbeat
    this.stopHeartbeat();

    // Unsubscribe from control channel
    try {
      await this.redisSubscriber.unsubscribe(this.CONTROL_CHANNEL);
    } catch (error) {
      console.error('Error unsubscribing from control channel:', error);
    }

    // Disconnect from Finnhub
    try {
      await this.finnhubConnector.shutdown();
    } catch (error) {
      console.error('Error shutting down Finnhub connector:', error);
    }

    // Close Redis connections
    try {
      await Promise.all([
        this.redisClient.quit(),
        this.redisSubscriber.quit(),
      ]);
      console.log('Redis connections closed');
    } catch (error) {
      console.error('Error closing Redis connections:', error);
    }

    console.log('Finnhub Manager shutdown complete');
    process.exit(0);
  }

  async getStatus(): Promise<object> {
    const finnhubStatus = this.finnhubConnector.getConnectionStatus();
    const subscriptionStats = await this.subscriptionManager.getStats();

    return {
      finnhub: finnhubStatus,
      subscriptions: subscriptionStats,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };
  }
}

// Main execution
async function main() {
  console.log('=== Finnhub Connection Manager ===');
  console.log(`Started at: ${new Date().toISOString()}`);
  console.log(`Node version: ${process.version}`);
  console.log(`Process ID: ${process.pid}`);

  const manager = new FinnhubManager();

  try {
    await manager.start();
  } catch (error) {
    console.error('Failed to start Finnhub Manager:', error);
    process.exit(1);
  }

  // Health check endpoint simulation (in production, you might want a minimal HTTP server)
  setInterval(async () => {
    try {
      const status = await manager.getStatus();
      // You could expose this via HTTP, store in Redis, etc.
      // For now, we just log it periodically for debugging
      if (process.env.DEBUG === 'true') {
        console.log('Status:', JSON.stringify(status, null, 2));
      }
    } catch (error) {
      console.error('Error getting status:', error);
    }
  }, 60000); // Every minute
}

// Run the manager
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
