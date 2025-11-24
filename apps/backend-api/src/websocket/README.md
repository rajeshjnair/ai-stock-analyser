# WebSocket Gateway

The WebSocket Gateway is a standalone service that handles real-time stock trade data streaming to connected clients.

## Architecture

```
[Stock Data Worker] --> [Redis Pub/Sub] --> [WebSocket Gateway] --> [Clients]
                        channel:trade:*
```

### Components

1. **ws-gateway.ts** - Entry point that creates the WebSocket server
2. **gateway.ts** - Core gateway logic managing connections and Redis subscriptions
3. **client-connection.ts** - Client connection wrapper with subscription tracking
4. **handlers.ts** - Message validation and formatting utilities

## How It Works

### Connection Flow

1. Client connects to WebSocket server (default port: 8080)
2. Gateway creates a `ClientConnection` instance with unique ID
3. Client sends welcome message with connection details
4. Client can subscribe/unsubscribe to stock symbols
5. Gateway tracks which clients are subscribed to which symbols

### Redis Integration

- Gateway uses **pattern subscription** on Redis: `PSUBSCRIBE channel:trade:*`
- When stock data workers publish to `channel:trade:AAPL`, gateway receives it
- Gateway parses the channel name to extract symbol
- Only forwards data to clients subscribed to that specific symbol

### Message Protocol

#### Client → Server

**Subscribe to symbols:**
```json
{
  "action": "subscribe",
  "symbols": ["AAPL", "GOOGL"]
}
```

**Unsubscribe from symbols:**
```json
{
  "action": "unsubscribe",
  "symbols": ["AAPL"]
}
```

**Ping (keep-alive):**
```json
{
  "action": "ping"
}
```

#### Server → Client

**Welcome message:**
```json
{
  "type": "success",
  "message": "Connected to WebSocket Gateway",
  "data": {
    "connectionId": "uuid",
    "serverId": "ws-gateway-abc123",
    "maxSymbolsPerConnection": 5
  },
  "timestamp": 1234567890
}
```

**Trade data:**
```json
{
  "type": "trade",
  "data": {
    "symbol": "AAPL",
    "price": 150.25,
    "volume": 100,
    "timestamp": 1234567890,
    "conditions": ["@", "T"],
    "exchange": "NASDAQ"
  },
  "timestamp": 1234567890
}
```

**Success response:**
```json
{
  "type": "success",
  "message": "Successfully subscribed to 2 symbol(s)",
  "data": {
    "subscribed": ["AAPL", "GOOGL"],
    "currentSubscriptions": ["AAPL", "GOOGL", "MSFT"]
  },
  "timestamp": 1234567890
}
```

**Error response:**
```json
{
  "type": "error",
  "message": "Cannot subscribe: would exceed maximum of 5 symbols per connection",
  "timestamp": 1234567890
}
```

**Pong response:**
```json
{
  "type": "pong",
  "timestamp": 1234567890
}
```

## Features

### Subscription Management

- Each connection can subscribe to up to 5 symbols (free tier limit)
- Symbols are automatically normalized to uppercase
- Duplicate subscriptions are ignored
- Clean unsubscribe when client disconnects

### Connection Health

- Automatic heartbeat every 30 seconds
- WebSocket ping/pong for connection monitoring
- Dead connections are automatically terminated
- Graceful shutdown closes all connections properly

### Scalability

- Multiple gateway instances can run simultaneously
- Each instance has unique server ID
- Redis pub/sub fan-out pattern supports horizontal scaling
- Efficient subscription tracking per connection

### Monitoring

- Connection statistics logged every minute
- Tracks active connections, subscriptions, messages sent/received
- Unique server ID for multi-instance debugging

## Running the Service

### Development
```bash
npm run dev:ws
```

### Production
```bash
npm run build
npm run start:ws
```

### Docker
```bash
docker build -f Dockerfile.ws -t ws-gateway .
docker run -p 8080:8080 \
  -e REDIS_URL=redis://localhost:6379 \
  -e NODE_ENV=production \
  ws-gateway
```

### Environment Variables

- `WS_PORT` - WebSocket server port (default: 8080)
- `REDIS_URL` - Redis connection URL (required)
- `NODE_ENV` - Node environment (development/production)

## Testing with wscat

Install wscat:
```bash
npm install -g wscat
```

Connect and test:
```bash
# Connect
wscat -c ws://localhost:8080

# Subscribe to symbols
> {"action": "subscribe", "symbols": ["AAPL", "GOOGL"]}

# Ping
> {"action": "ping"}

# Unsubscribe
> {"action": "unsubscribe", "symbols": ["AAPL"]}
```

## Security Considerations

1. **Rate Limiting**: Consider adding connection rate limiting
2. **Authentication**: Add JWT token validation via query params
3. **Max Connections**: Implement per-IP connection limits
4. **Message Size**: Limited to 100KB per message
5. **Compression**: Per-message deflate enabled for efficiency

## Future Enhancements

- [ ] Add authentication/authorization
- [ ] Implement user-based subscription limits
- [ ] Add Redis Sentinel support for HA
- [ ] Metrics export (Prometheus)
- [ ] Add reconnection logic in client library
- [ ] Support for aggregated candle data streams
- [ ] Add message queuing for offline clients
