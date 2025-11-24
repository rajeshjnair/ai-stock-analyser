# WebSocket Gateway - Quick Start Guide

This guide will help you get the WebSocket Gateway up and running quickly.

## Architecture Overview

```
Client Browser/App
       |
       v
WebSocket Gateway (port 8080)
       |
       v
Redis Pub/Sub (channel:trade:*)
       ^
       |
Stock Data Workers (publish trade data)
```

## Prerequisites

- Node.js 20+
- Redis running (locally or via Docker)
- Environment variables configured (see `.env.example`)

## Files Created

```
apps/backend-api/
├── src/
│   ├── ws-gateway.ts                    # Main entry point
│   └── websocket/
│       ├── gateway.ts                   # Core gateway logic
│       ├── client-connection.ts         # Connection wrapper
│       ├── handlers.ts                  # Message handlers
│       ├── client-example.ts           # Example client
│       ├── test-publisher.ts           # Test data publisher
│       └── README.md                   # Detailed documentation
├── Dockerfile.ws                        # Docker build file
├── docker-compose.ws.yml               # Docker Compose config
└── package.json                        # Updated with WS scripts
```

## Quick Start

### 1. Install Dependencies

```bash
cd apps/backend-api
npm install
```

This will install the required `ws` package (already included via `@fastify/websocket`) and `@types/ws`.

### 2. Set Environment Variables

Make sure your `.env` file has:

```bash
REDIS_URL=redis://localhost:6379
WS_PORT=8080  # Optional, defaults to 8080
```

### 3. Start Redis (if not running)

```bash
# Using Docker
docker run -d -p 6379:6379 redis:7-alpine

# Or using docker-compose
docker-compose -f docker-compose.ws.yml up redis -d
```

### 4. Start WebSocket Gateway

#### Development Mode (with auto-reload)
```bash
npm run dev:ws
```

#### Production Mode
```bash
npm run build
npm run start:ws
```

You should see output like:
```
========================================
  WebSocket Gateway Server
========================================
  Server ID: ws-gateway-abc12345
  Port: 8080
  Node Environment: development
  Redis URL: redis://localhost:6379
========================================

[ws-gateway-abc12345] Subscribed to 1 Redis channel pattern(s)
[ws-gateway-abc12345] WebSocket server listening on port 8080
[ws-gateway-abc12345] Heartbeat started with 30000ms interval
[ws-gateway-abc12345] WebSocket Gateway initialized and ready
```

## Testing the Gateway

### Option 1: Using the Test Client

In a new terminal, run the example client:

```bash
tsx src/websocket/client-example.ts
```

This will:
- Connect to the WebSocket Gateway
- Subscribe to AAPL, GOOGL, MSFT
- Display incoming trade data
- After 10 seconds, unsubscribe from MSFT and subscribe to TSLA

### Option 2: Using wscat

Install wscat globally:
```bash
npm install -g wscat
```

Connect and interact:
```bash
wscat -c ws://localhost:8080

# After connecting, send:
> {"action": "subscribe", "symbols": ["AAPL", "GOOGL"]}

# You'll receive:
< {"type": "success", "message": "Successfully subscribed to 2 symbol(s)", ...}

# Send ping:
> {"action": "ping"}
< {"type": "pong", "timestamp": 1234567890}
```

### Option 3: Test with Browser

```javascript
const ws = new WebSocket('ws://localhost:8080');

ws.onopen = () => {
  console.log('Connected!');
  ws.send(JSON.stringify({
    action: 'subscribe',
    symbols: ['AAPL', 'TSLA']
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
};
```

## Publishing Test Data

To test with real data flow, run the test publisher in another terminal:

```bash
tsx src/websocket/test-publisher.ts
```

This will:
- Connect to Redis
- Publish fake trade data every 1-3 seconds
- Send trades for AAPL, GOOGL, MSFT, TSLA, AMZN
- All connected clients subscribed to these symbols will receive the data

Expected flow:
1. Test publisher sends: `channel:trade:AAPL` → Redis
2. Gateway receives from Redis pattern subscription
3. Gateway broadcasts to all clients subscribed to AAPL

## Message Protocol

### Client to Server

**Subscribe:**
```json
{
  "action": "subscribe",
  "symbols": ["AAPL", "GOOGL"]
}
```

**Unsubscribe:**
```json
{
  "action": "unsubscribe",
  "symbols": ["AAPL"]
}
```

**Ping:**
```json
{
  "action": "ping"
}
```

### Server to Client

**Trade Data:**
```json
{
  "type": "trade",
  "data": {
    "symbol": "AAPL",
    "price": 150.25,
    "volume": 100,
    "timestamp": 1234567890,
    "exchange": "NASDAQ"
  },
  "timestamp": 1234567890
}
```

**Success:**
```json
{
  "type": "success",
  "message": "Successfully subscribed to 2 symbol(s)",
  "data": {
    "subscribed": ["AAPL", "GOOGL"],
    "currentSubscriptions": ["AAPL", "GOOGL"]
  },
  "timestamp": 1234567890
}
```

**Error:**
```json
{
  "type": "error",
  "message": "Cannot subscribe: would exceed maximum of 5 symbols",
  "timestamp": 1234567890
}
```

## Docker Deployment

### Build Docker Image

```bash
docker build -f Dockerfile.ws -t ws-gateway:latest .
```

### Run with Docker Compose

```bash
docker-compose -f docker-compose.ws.yml up -d
```

This starts:
- Redis on port 6379
- WebSocket Gateway on port 8080

### Run Standalone Container

```bash
docker run -d \
  --name ws-gateway \
  -p 8080:8080 \
  -e REDIS_URL=redis://host.docker.internal:6379 \
  -e WS_PORT=8080 \
  -e NODE_ENV=production \
  ws-gateway:latest
```

## Monitoring

### Check Logs

```bash
# Development
# Logs appear in terminal

# Docker
docker logs -f ws-gateway
```

### Connection Stats

The gateway logs statistics every minute:
```
[ws-gateway-abc12345] Stats: {
  activeConnections: 5,
  totalSymbolSubscriptions: 12,
  messagesSent: 1523,
  messagesReceived: 45,
  uptimeSeconds: 3600
}
```

### Health Check

```bash
# Check if WebSocket server is responding
node -e "require('net').connect(8080, 'localhost').on('connect', () => console.log('OK')).on('error', (e) => console.error('FAIL'))"
```

## Scaling

### Horizontal Scaling

You can run multiple WebSocket Gateway instances:

```bash
# Instance 1
WS_PORT=8080 npm run start:ws

# Instance 2
WS_PORT=8081 npm run start:ws

# Instance 3
WS_PORT=8082 npm run start:ws
```

Each instance:
- Gets a unique `SERVER_ID`
- Subscribes to the same Redis channels
- Handles its own set of client connections
- All instances receive all trade data from Redis

Use a load balancer (Nginx, HAProxy) to distribute connections across instances.

### Load Balancer Example (Nginx)

```nginx
upstream ws_backends {
    least_conn;
    server localhost:8080;
    server localhost:8081;
    server localhost:8082;
}

server {
    listen 80;

    location /ws {
        proxy_pass http://ws_backends;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Troubleshooting

### Can't connect to WebSocket

1. Check if server is running: `lsof -i :8080`
2. Check Redis connection: `redis-cli ping`
3. Check logs for errors
4. Verify environment variables

### Not receiving trade data

1. Make sure test publisher is running: `tsx src/websocket/test-publisher.ts`
2. Check Redis pub/sub: `redis-cli PSUBSCRIBE "channel:trade:*"`
3. Verify client is subscribed: send subscribe message
4. Check gateway logs for broadcast messages

### Connection drops frequently

1. Check heartbeat interval (default 30s)
2. Ensure client responds to ping/pong
3. Check network stability
4. Review connection timeout settings

### Memory issues

1. Monitor active connections: check stats logs
2. Ensure dead connections are cleaned up
3. Check for memory leaks in gateway
4. Consider connection limits per IP

## Next Steps

1. **Add Authentication**: Validate JWT tokens from query params
2. **Add Rate Limiting**: Limit connections per IP/user
3. **Add Monitoring**: Export metrics to Prometheus
4. **Add Persistence**: Queue messages for offline clients
5. **Add More Data Types**: Support candles, quotes, news

## Additional Resources

- Detailed documentation: `src/websocket/README.md`
- WebSocket RFC: https://datatracker.ietf.org/doc/html/rfc6455
- ws library docs: https://github.com/websockets/ws
- Redis Pub/Sub: https://redis.io/docs/manual/pubsub/
