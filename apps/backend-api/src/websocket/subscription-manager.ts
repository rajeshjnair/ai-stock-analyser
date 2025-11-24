import { redisClient } from '../config/redis.js';

export interface SubscriptionCommand {
  action: 'subscribe' | 'unsubscribe';
  symbol: string;
  serverId: string;
  timestamp: number;
}

export class SubscriptionManager {
  private readonly REDIS_KEY_PREFIX = 'ws:symbols:';
  private readonly CONTROL_CHANNEL = 'finnhub:control';

  /**
   * Add a gateway server to the list of subscribers for a symbol
   * Returns true if this is the first subscriber for the symbol
   */
  async addSubscription(symbol: string, serverId: string): Promise<boolean> {
    const key = this.getRedisKey(symbol);

    // Add the server ID to the set of subscribers for this symbol
    await redisClient.sadd(key, serverId);

    // Set expiration to prevent stale data (24 hours)
    await redisClient.expire(key, 86400);

    // Get the count of subscribers
    const count = await redisClient.scard(key);

    // If this is the first subscriber, return true
    return count === 1;
  }

  /**
   * Remove a gateway server from the list of subscribers for a symbol
   * Returns true if this was the last subscriber for the symbol
   */
  async removeSubscription(symbol: string, serverId: string): Promise<boolean> {
    const key = this.getRedisKey(symbol);

    // Remove the server ID from the set
    await redisClient.srem(key, serverId);

    // Get the remaining count
    const count = await redisClient.scard(key);

    // If no subscribers left, clean up the key
    if (count === 0) {
      await redisClient.del(key);
      return true;
    }

    return false;
  }

  /**
   * Get the number of gateway servers subscribed to a symbol
   */
  async getSubscriberCount(symbol: string): Promise<number> {
    const key = this.getRedisKey(symbol);
    return await redisClient.scard(key);
  }

  /**
   * Check if a symbol has any subscribers
   */
  async hasSubscribers(symbol: string): Promise<boolean> {
    const count = await this.getSubscriberCount(symbol);
    return count > 0;
  }

  /**
   * Get all symbols that currently have subscribers
   */
  async getAllSubscribedSymbols(): Promise<string[]> {
    const pattern = `${this.REDIS_KEY_PREFIX}*`;
    const keys = await redisClient.keys(pattern);

    // Extract symbol names from keys
    return keys.map(key => key.replace(this.REDIS_KEY_PREFIX, ''));
  }

  /**
   * Get all gateway server IDs subscribed to a symbol
   */
  async getSubscribers(symbol: string): Promise<string[]> {
    const key = this.getRedisKey(symbol);
    return await redisClient.smembers(key);
  }

  /**
   * Publish a subscription command to the control channel
   */
  async publishSubscriptionCommand(
    action: 'subscribe' | 'unsubscribe',
    symbol: string
  ): Promise<void> {
    const command: SubscriptionCommand = {
      action,
      symbol,
      serverId: 'finnhub-manager',
      timestamp: Date.now(),
    };

    await redisClient.publish(this.CONTROL_CHANNEL, JSON.stringify(command));
    console.log(`Published ${action} command for ${symbol}`);
  }

  /**
   * Handle a subscription request from a gateway server
   * Returns true if Finnhub should subscribe to this symbol
   */
  async handleSubscriptionRequest(symbol: string, serverId: string): Promise<boolean> {
    const isFirstSubscriber = await this.addSubscription(symbol, serverId);

    if (isFirstSubscriber) {
      console.log(`First subscriber for ${symbol}, will subscribe to Finnhub`);
      return true;
    }

    console.log(`Additional subscriber for ${symbol} (total: ${await this.getSubscriberCount(symbol)})`);
    return false;
  }

  /**
   * Handle an unsubscription request from a gateway server
   * Returns true if Finnhub should unsubscribe from this symbol
   */
  async handleUnsubscriptionRequest(symbol: string, serverId: string): Promise<boolean> {
    const wasLastSubscriber = await this.removeSubscription(symbol, serverId);

    if (wasLastSubscriber) {
      console.log(`Last subscriber for ${symbol} removed, will unsubscribe from Finnhub`);
      return true;
    }

    const remaining = await this.getSubscriberCount(symbol);
    console.log(`Subscriber removed for ${symbol} (${remaining} remaining)`);
    return false;
  }

  /**
   * Clean up subscriptions for a gateway server that has disconnected
   * Returns the list of symbols that should be unsubscribed from Finnhub
   */
  async cleanupServerSubscriptions(serverId: string): Promise<string[]> {
    const allSymbols = await this.getAllSubscribedSymbols();
    const symbolsToUnsubscribe: string[] = [];

    for (const symbol of allSymbols) {
      const subscribers = await this.getSubscribers(symbol);

      if (subscribers.includes(serverId)) {
        const wasLastSubscriber = await this.removeSubscription(symbol, serverId);

        if (wasLastSubscriber) {
          symbolsToUnsubscribe.push(symbol);
        }
      }
    }

    if (symbolsToUnsubscribe.length > 0) {
      console.log(
        `Cleaned up ${symbolsToUnsubscribe.length} symbols for disconnected server ${serverId}`
      );
    }

    return symbolsToUnsubscribe;
  }

  /**
   * Get subscription statistics
   */
  async getStats(): Promise<{
    totalSymbols: number;
    symbolStats: Array<{ symbol: string; subscriberCount: number }>;
  }> {
    const symbols = await this.getAllSubscribedSymbols();

    const symbolStats = await Promise.all(
      symbols.map(async symbol => ({
        symbol,
        subscriberCount: await this.getSubscriberCount(symbol),
      }))
    );

    return {
      totalSymbols: symbols.length,
      symbolStats,
    };
  }

  /**
   * Remove all subscriptions for a symbol (admin/cleanup operation)
   */
  async removeAllSubscriptions(symbol: string): Promise<void> {
    const key = this.getRedisKey(symbol);
    await redisClient.del(key);
    console.log(`Removed all subscriptions for ${symbol}`);
  }

  /**
   * Clear all subscription data (admin/cleanup operation)
   */
  async clearAllSubscriptions(): Promise<void> {
    const pattern = `${this.REDIS_KEY_PREFIX}*`;
    const keys = await redisClient.keys(pattern);

    if (keys.length > 0) {
      await redisClient.del(...keys);
      console.log(`Cleared ${keys.length} subscription keys`);
    }
  }

  private getRedisKey(symbol: string): string {
    return `${this.REDIS_KEY_PREFIX}${symbol}`;
  }
}
