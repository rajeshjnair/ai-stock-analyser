# @stock-analyser/shared

Shared TypeScript types and utilities for the AI Stock Analyser application.

## Overview

This package provides common types used across all services in the monorepo, including:

- **Stock Types**: Stock analysis, trade data, quotes, and time series
- **User Types**: User profiles, settings, subscriptions, and activity
- **API Types**: API responses, errors, WebSocket messages, and request/response types

## Installation

Within the monorepo:

```bash
npm install @stock-analyser/shared
```

## Usage

```typescript
import {
  StockAnalysis,
  User,
  UserTier,
  ApiResponse,
  WebSocketMessageType
} from '@stock-analyser/shared';

// Use types in your application
const analysis: StockAnalysis = {
  ticker: 'AAPL',
  companyName: 'Apple Inc.',
  // ... other properties
};

const user: User = {
  id: '123',
  firebaseUid: 'firebase-uid',
  email: 'user@example.com',
  tier: UserTier.PRO,
  watchlist: ['AAPL', 'GOOGL'],
  // ... other properties
};
```

## Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm run typecheck` - Type check without emitting files
- `npm run clean` - Remove build artifacts

## Structure

```
src/
├── types/
│   ├── stock.ts    # Stock-related types
│   ├── user.ts     # User-related types
│   └── api.ts      # API and WebSocket types
└── index.ts        # Main export file
```

## Type Categories

### Stock Types
- `StockAnalysis` - Complete stock analysis with predictions
- `TradeData` - Real-time trade data from WebSocket
- `GroundingChunk` - News source references
- `StockQuote` - Current stock quote
- `StockTimeSeries` - Historical price data
- `PriceAlert` - User price alerts

### User Types
- `User` - User profile and settings
- `UserTier` - Subscription tiers (FREE, PRO, ENTERPRISE)
- `UserSettings` - User preferences and notifications
- `UserSubscription` - Subscription details
- `UserActivity` - User activity tracking

### API Types
- `ApiResponse<T>` - Generic API response wrapper
- `ApiError` - Standardized error format
- `WebSocketMessage` - WebSocket message types
- `PaginatedResponse<T>` - Paginated data responses
- Request/Response types for common operations

## Development

This package uses TypeScript project references and compiles to the `dist/` directory with full type declarations.
