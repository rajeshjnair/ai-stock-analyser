/**
 * User Types
 */

export enum UserTier {
  FREE = 'free',
  PRO = 'pro',
  ENTERPRISE = 'enterprise'
}

export interface User {
  id: string;
  firebaseUid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  tier: UserTier;
  watchlist: string[];
  createdAt: number;
  updatedAt: number;
  settings: UserSettings;
  subscription?: UserSubscription;
}

export interface UserSettings {
  notifications: {
    email: boolean;
    push: boolean;
    priceAlerts: boolean;
    newsAlerts: boolean;
  };
  preferences: {
    defaultView: 'grid' | 'list';
    theme: 'light' | 'dark' | 'auto';
    currency: string;
    timezone: string;
  };
  privacy: {
    shareWatchlist: boolean;
    shareActivity: boolean;
  };
}

export interface UserSubscription {
  id: string;
  tier: UserTier;
  status: 'active' | 'cancelled' | 'past_due' | 'expired';
  currentPeriodStart: number;
  currentPeriodEnd: number;
  cancelAtPeriodEnd: boolean;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

export interface UserStats {
  userId: string;
  totalAnalyses: number;
  watchlistCount: number;
  alertsCount: number;
  lastActive: number;
}

export interface UserActivity {
  id: string;
  userId: string;
  type: 'analysis' | 'watchlist_add' | 'watchlist_remove' | 'alert_created' | 'alert_triggered';
  symbol?: string;
  metadata?: Record<string, any>;
  timestamp: number;
}
