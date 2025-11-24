import { connectDatabase, disconnectDatabase } from './config/database.js';
import { redisClient, disconnectRedis } from './config/redis.js';
import { startWorker, stopWorker } from './queues/analysis.processor.js';
import { env } from './config/env.js';

/**
 * Analysis Worker Entry Point
 *
 * This is a standalone worker process that processes stock analysis jobs
 * from the BullMQ queue. It runs independently from the main API server.
 */

console.log('='.repeat(60));
console.log('AI Stock Analyser - Analysis Worker');
console.log('='.repeat(60));
console.log(`Environment: ${env.NODE_ENV}`);
console.log(`Starting at: ${new Date().toISOString()}`);
console.log('='.repeat(60));

/**
 * Initialize all connections and start the worker
 */
async function initialize() {
  try {
    // Connect to MongoDB
    console.log('[Init] Connecting to MongoDB...');
    await connectDatabase();
    console.log('[Init] MongoDB connected successfully');

    // Verify Redis connection
    console.log('[Init] Verifying Redis connection...');
    await redisClient.ping();
    console.log('[Init] Redis connected successfully');

    // Start the BullMQ worker
    console.log('[Init] Starting analysis worker...');
    const worker = startWorker();
    console.log('[Init] Analysis worker started successfully');

    console.log('='.repeat(60));
    console.log('Worker Status: RUNNING');
    console.log('Queue: stock-analysis');
    console.log(`Concurrency: 5 jobs`);
    console.log(`Rate limit: 10 jobs per 60 seconds`);
    console.log('='.repeat(60));

    return worker;
  } catch (error) {
    console.error('[Init] Failed to initialize worker:', error);
    throw error;
  }
}

/**
 * Graceful shutdown handler
 */
async function shutdown(signal: string) {
  console.log('='.repeat(60));
  console.log(`[Shutdown] Received ${signal} signal`);
  console.log('[Shutdown] Starting graceful shutdown...');
  console.log('='.repeat(60));

  try {
    // Stop accepting new jobs and wait for current jobs to complete
    console.log('[Shutdown] Stopping worker...');
    await stopWorker();
    console.log('[Shutdown] Worker stopped successfully');

    // Disconnect from MongoDB
    console.log('[Shutdown] Disconnecting from MongoDB...');
    await disconnectDatabase();
    console.log('[Shutdown] MongoDB disconnected');

    // Disconnect from Redis
    console.log('[Shutdown] Disconnecting from Redis...');
    await disconnectRedis();
    console.log('[Shutdown] Redis disconnected');

    console.log('='.repeat(60));
    console.log('[Shutdown] Graceful shutdown completed');
    console.log('='.repeat(60));

    process.exit(0);
  } catch (error) {
    console.error('[Shutdown] Error during graceful shutdown:', error);
    process.exit(1);
  }
}

/**
 * Handle uncaught errors
 */
process.on('uncaughtException', (error) => {
  console.error('='.repeat(60));
  console.error('[Error] Uncaught Exception:', error);
  console.error('='.repeat(60));
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('='.repeat(60));
  console.error('[Error] Unhandled Rejection at:', promise);
  console.error('[Error] Reason:', reason);
  console.error('='.repeat(60));
  process.exit(1);
});

/**
 * Handle shutdown signals
 */
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

/**
 * Start the worker
 */
initialize().catch((error) => {
  console.error('[Fatal] Failed to start worker:', error);
  process.exit(1);
});
