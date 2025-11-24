import { randomUUID } from 'crypto';
import { WebSocketServer } from 'ws';
import { env } from './config/env.js';
import { WebSocketGateway } from './websocket/gateway.js';

// Generate unique server ID for this instance
const SERVER_ID = `ws-gateway-${randomUUID().slice(0, 8)}`;
const WS_PORT = process.env.WS_PORT ? parseInt(process.env.WS_PORT, 10) : 8080;

console.log(`
========================================
  WebSocket Gateway Server
========================================
  Server ID: ${SERVER_ID}
  Port: ${WS_PORT}
  Node Environment: ${env.NODE_ENV}
  Redis URL: ${env.REDIS_URL}
========================================
`);

// Create WebSocket server
const wss = new WebSocketServer({
  port: WS_PORT,
  perMessageDeflate: {
    zlibDeflateOptions: {
      chunkSize: 1024,
      memLevel: 7,
      level: 3,
    },
    zlibInflateOptions: {
      chunkSize: 10 * 1024,
    },
    clientNoContextTakeover: true,
    serverNoContextTakeover: true,
    serverMaxWindowBits: 10,
    concurrencyLimit: 10,
    threshold: 1024,
  },
  clientTracking: true,
  maxPayload: 100 * 1024, // 100KB max message size
});

// Create WebSocket Gateway
const gateway = new WebSocketGateway({
  redisUrl: env.REDIS_URL,
  serverId: SERVER_ID,
  maxSymbolsPerConnection: 5,
  heartbeatInterval: 30000, // 30 seconds
});

// Handle new connections
wss.on('connection', (ws, req) => {
  gateway.handleConnection(ws, req);
});

// WebSocket server error handling
wss.on('error', (error) => {
  console.error(`[${SERVER_ID}] WebSocket server error:`, error);
});

// WebSocket server listening
wss.on('listening', () => {
  console.log(`[${SERVER_ID}] WebSocket server listening on port ${WS_PORT}`);

  // Start heartbeat
  gateway.startHeartbeat();

  // Log stats periodically
  setInterval(() => {
    const stats = gateway.getStats();
    console.log(`[${SERVER_ID}] Stats:`, {
      activeConnections: stats.activeConnections,
      totalSymbolSubscriptions: stats.totalSymbolSubscriptions,
      messagesSent: stats.messagesSent,
      messagesReceived: stats.messagesReceived,
      uptimeSeconds: stats.uptime,
    });
  }, 60000); // Every minute
});

// Graceful shutdown handling
const shutdown = async (signal: string) => {
  console.log(`\n[${SERVER_ID}] Received ${signal}, shutting down gracefully...`);

  // Stop accepting new connections
  wss.close((err) => {
    if (err) {
      console.error(`[${SERVER_ID}] Error closing WebSocket server:`, err);
    }
  });

  try {
    // Shutdown gateway (closes all connections and Redis)
    await gateway.shutdown();

    console.log(`[${SERVER_ID}] Shutdown complete`);
    process.exit(0);
  } catch (error) {
    console.error(`[${SERVER_ID}] Error during shutdown:`, error);
    process.exit(1);
  }
};

// Register shutdown handlers
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error(`[${SERVER_ID}] Uncaught exception:`, error);
  shutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(`[${SERVER_ID}] Unhandled rejection at:`, promise, 'reason:', reason);
  shutdown('unhandledRejection');
});

console.log(`[${SERVER_ID}] WebSocket Gateway initialized and ready`);
