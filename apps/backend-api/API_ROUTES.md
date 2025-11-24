# AI Stock Analyser - REST API Routes

## Overview

This document describes all available REST API routes in the AI Stock Analyser backend application.

**Base URL**: `http://localhost:3000` (development)

**API Prefix**: `/api`

---

## Authentication Routes

**Prefix**: `/api/auth`

### 1. Verify Token

Verify Firebase ID token, create/update user in MongoDB, and establish session.

- **Endpoint**: `POST /api/auth/verify`
- **Authentication**: None required
- **Request Body**:
  ```json
  {
    "token": "firebase-id-token"
  }
  ```
- **Success Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "user-mongo-id",
        "firebaseUid": "firebase-uid",
        "email": "user@example.com",
        "displayName": "John Doe",
        "photoURL": "https://...",
        "tier": "FREE",
        "watchlist": [],
        "settings": { ... },
        "createdAt": 1234567890,
        "updatedAt": 1234567890
      },
      "session": {
        "expiresAt": 1234567890
      }
    },
    "timestamp": 1234567890
  }
  ```
- **Error Responses**:
  - 401: Invalid/expired/revoked token
  - 400: Validation error

### 2. Logout

Invalidate user session and clear from Redis.

- **Endpoint**: `POST /api/auth/logout`
- **Authentication**: Required (Bearer token)
- **Success Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "message": "Successfully logged out"
    },
    "timestamp": 1234567890
  }
  ```

### 3. Get Current User

Get the current authenticated user's profile.

- **Endpoint**: `GET /api/auth/me`
- **Authentication**: Required (Bearer token)
- **Success Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "user": { ... }
    },
    "timestamp": 1234567890
  }
  ```

---

## Stock Routes

**Prefix**: `/api/stocks`

### 1. Get Trending Stocks

Get list of trending stocks (cached).

- **Endpoint**: `GET /api/stocks/trending`
- **Authentication**: Optional (for tracking)
- **Success Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "trending": [
        {
          "ticker": "AAPL",
          "name": "Apple Inc.",
          "change": 2.5,
          "volume": 75000000
        }
      ],
      "updatedAt": 1234567890
    },
    "timestamp": 1234567890
  }
  ```

### 2. Search Stocks

Search for stocks by ticker symbol or company name.

- **Endpoint**: `GET /api/stocks/search?q=:query`
- **Authentication**: Optional (for tracking)
- **Query Parameters**:
  - `q` (required): Search query string
- **Success Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "results": [
        {
          "symbol": "AAPL",
          "name": "Apple Inc.",
          "exchange": "NASDAQ",
          "currency": "USD",
          "country": "US",
          "type": "Common Stock"
        }
      ],
      "query": "apple"
    },
    "timestamp": 1234567890
  }
  ```

### 3. Get Stock Info

Get detailed information and current quote for a specific stock.

- **Endpoint**: `GET /api/stocks/:ticker`
- **Authentication**: Optional (for tracking)
- **Parameters**:
  - `ticker`: Stock ticker symbol (e.g., AAPL)
- **Success Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "info": {
        "symbol": "AAPL",
        "name": "Apple Inc.",
        "exchange": "NASDAQ",
        "currency": "USD"
      },
      "quote": {
        "symbol": "AAPL",
        "current": 150.25,
        "high": 152.00,
        "low": 149.50,
        "open": 150.00,
        "previousClose": 149.75,
        "change": 0.50,
        "changePercent": 0.33,
        "timestamp": 1234567890
      },
      "ticker": "AAPL"
    },
    "timestamp": 1234567890
  }
  ```
- **Error Responses**:
  - 404: Stock not found

### 4. Get Stock History

Get historical price data for a stock.

- **Endpoint**: `GET /api/stocks/:ticker/history?period=:period`
- **Authentication**: Optional (for tracking)
- **Parameters**:
  - `ticker`: Stock ticker symbol
- **Query Parameters**:
  - `period` (optional): Time period (1D, 1W, 1M, 3M, 6M, 1Y, 5Y) - default: 1M
- **Success Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "ticker": "AAPL",
      "period": "1M",
      "history": [
        {
          "timestamp": 1234567890,
          "open": 150.00,
          "high": 152.00,
          "low": 149.00,
          "close": 151.00,
          "volume": 75000000
        }
      ],
      "count": 30
    },
    "timestamp": 1234567890
  }
  ```

---

## Analysis Routes

**Prefix**: `/api/analysis`

### 1. Request Analysis

Request a new AI-powered stock analysis.

- **Endpoint**: `POST /api/analysis/:ticker`
- **Authentication**: Required (Bearer token)
- **Rate Limiting**: Yes (FREE: 5/day, PRO: 100/day, ENTERPRISE: 1000/day)
- **Parameters**:
  - `ticker`: Stock ticker symbol
- **Request Body**:
  ```json
  {
    "includeNews": true,
    "includePredictions": true
  }
  ```
- **Success Response** (202 - Accepted):
  ```json
  {
    "success": true,
    "data": {
      "jobId": "analysis-AAPL-1234567890",
      "ticker": "AAPL",
      "status": "pending",
      "message": "Analysis request queued",
      "estimatedTime": 30
    },
    "timestamp": 1234567890
  }
  ```
- **Cached Response** (200 - if recent analysis exists):
  ```json
  {
    "success": true,
    "data": {
      "analysis": { ... },
      "cached": true,
      "message": "Recent analysis found"
    },
    "timestamp": 1234567890
  }
  ```
- **Error Responses**:
  - 429: Rate limit exceeded

### 2. Get Analysis

Get cached analysis for a stock.

- **Endpoint**: `GET /api/analysis/:ticker`
- **Authentication**: Optional (for tracking)
- **Parameters**:
  - `ticker`: Stock ticker symbol
- **Success Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "analysis": {
        "ticker": "AAPL",
        "companyName": "Apple Inc.",
        "currentPrice": "$150.25",
        "prediction": "Bullish",
        "recommendation": "Buy",
        "confidenceScore": 0.85,
        "analysisSummary": "...",
        "keyNews": [...],
        "historicalPrices": {...},
        "futurePredictions": {...},
        "dailyStats": {...}
      },
      "expired": false,
      "age": 3600000
    },
    "timestamp": 1234567890
  }
  ```
- **Error Responses**:
  - 404: Analysis not found

### 3. Get Analysis History

Get user's analysis history with pagination.

- **Endpoint**: `GET /api/analysis/history?page=:page&limit=:limit`
- **Authentication**: Required (Bearer token)
- **Query Parameters**:
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (1-100, default: 20)
- **Success Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "data": [
        {
          "id": "...",
          "ticker": "AAPL",
          "analysis": { ... },
          "generatedAt": "2024-01-01T00:00:00.000Z",
          "expiresAt": "2024-01-02T00:00:00.000Z"
        }
      ],
      "pagination": {
        "total": 50,
        "page": 1,
        "limit": 20,
        "hasMore": true
      }
    },
    "timestamp": 1234567890
  }
  ```

---

## User Routes

**Prefix**: `/api/user`

### 1. Get Watchlist

Get user's watchlist.

- **Endpoint**: `GET /api/user/watchlist`
- **Authentication**: Required (Bearer token)
- **Success Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "watchlist": ["AAPL", "GOOGL", "MSFT"],
      "count": 3,
      "maxAllowed": 10
    },
    "timestamp": 1234567890
  }
  ```

### 2. Update Watchlist

Update user's watchlist (add, remove, or replace symbols).

- **Endpoint**: `PUT /api/user/watchlist`
- **Authentication**: Required (Bearer token)
- **Request Body**:
  ```json
  {
    "symbols": ["AAPL", "GOOGL"],
    "action": "add"
  }
  ```
- **Actions**:
  - `add`: Add symbols to watchlist (max 10 total)
  - `remove`: Remove symbols from watchlist
  - `replace`: Replace entire watchlist
- **Success Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "watchlist": ["AAPL", "GOOGL", "MSFT", "TSLA"],
      "count": 4,
      "maxAllowed": 10
    },
    "timestamp": 1234567890
  }
  ```
- **Error Responses**:
  - 400: Validation error (e.g., exceeds 10 symbols)

### 3. Get Usage Statistics

Get user's current usage and rate limits.

- **Endpoint**: `GET /api/user/usage`
- **Authentication**: Required (Bearer token)
- **Success Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "tier": "FREE",
      "analysis": {
        "current": 3,
        "limit": 5,
        "remaining": 2,
        "resetAt": "2024-01-02T00:00:00.000Z"
      },
      "stockInfo": {
        "current": 25,
        "limit": 50,
        "remaining": 25,
        "resetAt": "2024-01-02T00:00:00.000Z"
      }
    },
    "timestamp": 1234567890
  }
  ```

### 4. Get Settings

Get user's settings.

- **Endpoint**: `GET /api/user/settings`
- **Authentication**: Required (Bearer token)
- **Success Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "settings": {
        "notifications": {
          "email": true,
          "push": false,
          "priceAlerts": true,
          "newsAlerts": true
        },
        "preferences": {
          "defaultView": "grid",
          "theme": "auto",
          "currency": "USD",
          "timezone": "UTC"
        },
        "privacy": {
          "shareWatchlist": false,
          "shareActivity": false
        }
      }
    },
    "timestamp": 1234567890
  }
  ```

### 5. Update Settings

Update user's settings.

- **Endpoint**: `PUT /api/user/settings`
- **Authentication**: Required (Bearer token)
- **Request Body** (all fields optional):
  ```json
  {
    "notifications": {
      "email": true,
      "push": true,
      "priceAlerts": true,
      "newsAlerts": false
    },
    "preferences": {
      "defaultView": "list",
      "theme": "dark",
      "currency": "USD",
      "timezone": "America/New_York"
    },
    "privacy": {
      "shareWatchlist": true,
      "shareActivity": false
    }
  }
  ```
- **Success Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "settings": { ... }
    },
    "timestamp": 1234567890
  }
  ```

---

## Rate Limiting

Rate limits are applied per user per resource type:

| Tier       | Analysis Requests | Stock Info Requests |
|------------|------------------|---------------------|
| FREE       | 5/day            | 50/day              |
| PRO        | 100/day          | 1000/day            |
| ENTERPRISE | 1000/day         | 10000/day           |

Rate limit headers are included in responses:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Timestamp when limit resets

---

## Error Response Format

All error responses follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { ... }
  },
  "timestamp": 1234567890
}
```

Common error codes:
- `UNAUTHORIZED`: Missing or invalid authentication
- `VALIDATION_ERROR`: Request validation failed
- `NOT_FOUND`: Resource not found
- `RATE_LIMIT_EXCEEDED`: Rate limit exceeded
- `INTERNAL_ERROR`: Server error

---

## Authentication

Most endpoints require authentication using Firebase ID tokens:

```
Authorization: Bearer <firebase-id-token>
```

To obtain a Firebase ID token:
1. Authenticate with Firebase on the client side
2. Get the ID token using `user.getIdToken()`
3. Include it in the Authorization header

---

## Health Check

- **Endpoint**: `GET /health`
- **Authentication**: None
- **Response**:
  ```json
  {
    "status": "ok",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "uptime": 3600
  }
  ```
