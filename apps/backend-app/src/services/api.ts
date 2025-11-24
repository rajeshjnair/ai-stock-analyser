import axios from 'axios';
import { auth } from './firebase';
import type { StockAnalysis, WatchlistItem } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getAnalysis = async (ticker: string): Promise<StockAnalysis> => {
  const response = await apiClient.get(`/api/analysis/${ticker}`);
  return response.data;
};

export const requestAnalysis = async (ticker: string): Promise<{ jobId: string }> => {
  const response = await apiClient.post('/api/analysis/request', { ticker });
  return response.data;
};

export const getWatchlist = async (): Promise<WatchlistItem[]> => {
  const response = await apiClient.get('/api/watchlist');
  return response.data;
};

export const addToWatchlist = async (ticker: string, companyName: string): Promise<void> => {
  await apiClient.post('/api/watchlist', { ticker, companyName });
};

export const removeFromWatchlist = async (ticker: string): Promise<void> => {
  await apiClient.delete(`/api/watchlist/${ticker}`);
};

export const getRecentAnalyses = async (): Promise<StockAnalysis[]> => {
  const response = await apiClient.get('/api/analysis/recent');
  return response.data;
};

export default apiClient;
