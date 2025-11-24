/**
 * Example WebSocket client for testing the Gateway
 *
 * Usage:
 * tsx src/websocket/client-example.ts
 */

import WebSocket from 'ws';

const WS_URL = process.env.WS_URL || 'ws://localhost:8080';
const SYMBOLS_TO_SUBSCRIBE = ['AAPL', 'GOOGL', 'MSFT'];

console.log(`Connecting to WebSocket Gateway at ${WS_URL}...`);

const ws = new WebSocket(WS_URL);

ws.on('open', () => {
  console.log('Connected to WebSocket Gateway!');

  // Subscribe to symbols
  console.log(`Subscribing to symbols: ${SYMBOLS_TO_SUBSCRIBE.join(', ')}`);
  ws.send(JSON.stringify({
    action: 'subscribe',
    symbols: SYMBOLS_TO_SUBSCRIBE,
  }));

  // Setup ping interval
  const pingInterval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ action: 'ping' }));
    }
  }, 30000);

  // Cleanup on close
  ws.on('close', () => {
    clearInterval(pingInterval);
  });
});

ws.on('message', (data) => {
  try {
    const message = JSON.parse(data.toString());

    switch (message.type) {
      case 'success':
        console.log('✓ Success:', message.message);
        if (message.data) {
          console.log('  Data:', JSON.stringify(message.data, null, 2));
        }
        break;

      case 'error':
        console.error('✗ Error:', message.message);
        break;

      case 'trade':
        console.log('📊 Trade:', {
          symbol: message.data.symbol,
          price: message.data.price,
          volume: message.data.volume,
          timestamp: new Date(message.data.timestamp).toISOString(),
        });
        break;

      case 'pong':
        console.log('🏓 Pong received');
        break;

      default:
        console.log('Unknown message type:', message);
    }
  } catch (error) {
    console.error('Error parsing message:', error);
    console.log('Raw message:', data.toString());
  }
});

ws.on('error', (error) => {
  console.error('WebSocket error:', error);
});

ws.on('close', (code, reason) => {
  console.log(`WebSocket closed with code ${code}${reason ? `: ${reason}` : ''}`);
  process.exit(0);
});

ws.on('ping', () => {
  console.log('Received ping from server');
});

ws.on('pong', () => {
  console.log('Received pong from server');
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nReceived SIGINT, closing connection...');

  // Unsubscribe before closing
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      action: 'unsubscribe',
      symbols: SYMBOLS_TO_SUBSCRIBE,
    }));

    // Wait a bit for unsubscribe to process, then close
    setTimeout(() => {
      ws.close(1000, 'Client shutdown');
    }, 100);
  } else {
    ws.close();
  }
});

// Example: Change subscriptions after 10 seconds
setTimeout(() => {
  if (ws.readyState === WebSocket.OPEN) {
    console.log('\nUnsubscribing from MSFT...');
    ws.send(JSON.stringify({
      action: 'unsubscribe',
      symbols: ['MSFT'],
    }));

    console.log('Subscribing to TSLA...');
    ws.send(JSON.stringify({
      action: 'subscribe',
      symbols: ['TSLA'],
    }));
  }
}, 10000);

console.log('\nPress Ctrl+C to disconnect\n');
