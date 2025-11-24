/**
 * Central export for all services
 */

// Auth service
export {
  verifyIdToken,
  getOrCreateUser,
  updateLastLogin,
  getUserById,
  getUserByFirebaseUid,
  updateUserTier,
  incrementAnalysisCount,
  addToWatchlist,
  removeFromWatchlist,
  getWatchlist,
  updateUserSettings,
} from './auth.service';

export type { FirebaseUserInfo } from './auth.service';

// Cache service
export {
  CacheService,
  cacheService,
  createCacheService,
} from './cache.service';

// Stock service
export {
  StockService,
  stockService,
} from './stock.service';

export type {
  StockInfo,
  StockQuote,
  HistoricalDataPoint,
  HistoricalPeriod,
} from './stock.service';

// Gemini service
export {
  GeminiService,
  geminiService,
} from './gemini.service';

// Analysis service
export {
  AnalysisService,
  analysisService,
} from './analysis.service';
