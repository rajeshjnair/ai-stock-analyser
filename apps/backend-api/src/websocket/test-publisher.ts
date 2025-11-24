/**
 * Test Redis publisher for simulating trade data
 * This publishes fake trade data to Redis channels for testing the WebSocket Gateway
 *
 * Usage:
 * tsx src/websocket/test-publisher.ts
 */

import Redis from 'ioredis';
import { env } from '../config/env.js';

const redis = new Redis(env.REDIS_URL);

const SYMBOLS = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN'];

interface TradeData {
  symbol: string;
  price: number;
  volume: number;
  timestamp: number;
  conditions?: string[];
  exchange?: string;
}

// Base prices for symbols
const basePrices: Record<string, number> = {
  AAPL: 150.0,
  GOOGL: 140.0,
  MSFT: 380.0,
  TSLA: 250.0,
  AMZN: 175.0,
};

const exchanges = ['NASDAQ', 'NYSE', 'BATS', 'ARCA'];
const conditions = [['@', 'T'], ['@'], ['T'], ['I']];

/**
 * Generate random trade data
 */
function generateTrade(symbol: string): TradeData {
  const basePrice = basePrices[symbol] || 100.0;
  const priceVariation = basePrice * 0.02; // 2% variation
  const price = basePrice + (Math.random() - 0.5) * priceVariation;

  return {
    symbol,
    price: Math.round(price * 100) / 100,
    volume: Math.floor(Math.random() * 1000) + 100,
    timestamp: Date.now(),
    conditions: conditions[Math.floor(Math.random() * conditions.length)],
    exchange: exchanges[Math.floor(Math.random() * exchanges.length)],
  };
}

/**
 * Publish trade to Redis
 */
async function publishTrade(symbol: string): Promise<void> {
  const trade = generateTrade(symbol);
  const channel = `channel:trade:${symbol}`;

  try {
    await redis.publish(channel, JSON.stringify(trade));
    console.log(`📤 Published trade: ${symbol} @ $${trade.price} (vol: ${trade.volume})`);
  } catch (error) {
    console.error(`Error publishing trade for ${symbol}:`, error);
  }
}

/**
 * Start publishing random trades
 */
async function startPublishing(): Promise<void> {
  console.log('========================================');
  console.log('  Test Trade Data Publisher');
  console.log('========================================');
  console.log(`Redis URL: ${env.REDIS_URL}`);
  console.log(`Symbols: ${SYMBOLS.join(', ')}`);
  console.log('========================================\n');

  // Wait for Redis to be ready
  await redis.ping();
  console.log('✓ Connected to Redis\n');

  console.log('Publishing trades every 1-3 seconds...\n');
  console.log('Press Ctrl+C to stop\n');

  const publish = () => {
    // Pick a random symbol
    const symbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
    publishTrade(symbol);

    // Schedule next publish with random delay
    const delay = 1000 + Math.random() * 2000; // 1-3 seconds
    setTimeout(publish, delay);
  };

  // Start publishing
  publish();

  // Also publish a trade for each symbol every 5 seconds to ensure activity
  setInterval(() => {
    console.log('\n--- Publishing for all symbols ---');
    SYMBOLS.forEach((symbol) => publishTrade(symbol));
    console.log('');
  }, 5000);
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n\nShutting down...');
  await redis.quit();
  console.log('✓ Redis connection closed');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await redis.quit();
  process.exit(0);
});

// Handle errors
redis.on('error', (err) => {
  console.error('Redis error:', err);
});

// Start
startPublishing().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
