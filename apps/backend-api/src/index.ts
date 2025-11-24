import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import websocket from '@fastify/websocket';
import { env } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { redisClient, disconnectRedis } from './config/redis.js';
import { registerRoutes } from './routes/index.js';

// Create Fastify instance with logging
const fastify = Fastify({
  logger: {
    level: env.NODE_ENV === 'production' ? 'info' : 'debug',
    transport:
      env.NODE_ENV === 'development'
        ? {
            target: 'pino-pretty',
            options: {
              translateTime: 'HH:MM:ss Z',
              ignore: 'pid,hostname',
            },
          }
        : undefined,
  },
});

// Register plugins
async function registerPlugins() {
  // CORS
  await fastify.register(cors, {
    origin: env.NODE_ENV === 'production' ? ['https://yourdomain.com'] : true,
    credentials: true,
  });

  // Security headers
  await fastify.register(helmet, {
    contentSecurityPolicy: env.NODE_ENV === 'production' ? undefined : false,
  });

  // Rate limiting
  await fastify.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
    redis: redisClient,
  });

  // WebSocket support
  await fastify.register(websocket);
}

// Root endpoint
fastify.get('/', async () => {
  return {
    name: '@stock-analyser/api',
    version: '1.0.0',
    message: 'AI Stock Analyser API',
    documentation: '/api',
  };
});

// Graceful shutdown handler
async function closeGracefully(signal: string) {
  fastify.log.info(`Received signal ${signal}, closing gracefully...`);

  try {
    // Close Fastify server
    await fastify.close();
    fastify.log.info('Fastify server closed');

    // Disconnect from databases
    await disconnectDatabase();
    await disconnectRedis();

    process.exit(0);
  } catch (error) {
    fastify.log.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
}

// Handle shutdown signals
process.on('SIGINT', () => closeGracefully('SIGINT'));
process.on('SIGTERM', () => closeGracefully('SIGTERM'));

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  fastify.log.error('Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  fastify.log.error('Unhandled rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start server
async function start() {
  try {
    // Connect to databases
    await connectDatabase();
    fastify.log.info('Database connected');

    // Verify Redis connection
    await redisClient.ping();
    fastify.log.info('Redis connected');

    // Register plugins
    await registerPlugins();
    fastify.log.info('Plugins registered');

    // Register routes
    await registerRoutes(fastify);
    fastify.log.info('Routes registered');

    // Start listening
    await fastify.listen({
      port: env.PORT,
      host: '0.0.0.0',
    });

    fastify.log.info(`Server listening on port ${env.PORT}`);
    fastify.log.info(`Environment: ${env.NODE_ENV}`);
  } catch (error) {
    fastify.log.error('Error starting server:', error);
    process.exit(1);
  }
}

start();
