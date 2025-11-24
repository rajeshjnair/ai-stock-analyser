import { Types } from 'mongoose';
import { AnalysisModel, IAnalysisDocument } from '../models/analysis.model.js';
import { CacheService } from './cache.service.js';
import {
  addAnalysisJob,
  getJob,
  getActiveJobForTicker,
} from '../queues/analysis.queue.js';
import type { StockAnalysis, GroundingChunk } from '@ai-stock-analyser/shared';

/**
 * Cache TTL for analysis results (15 minutes)
 */
const CACHE_TTL = 15 * 60; // 15 minutes in seconds

/**
 * Analysis cache validity period (15 minutes)
 * If cached analysis is older than this, generate new one
 */
const CACHE_VALIDITY_MS = 15 * 60 * 1000; // 15 minutes in milliseconds

/**
 * Maximum time to wait for a locked job to complete (30 seconds)
 */
const MAX_WAIT_TIME_MS = 30 * 1000;

/**
 * Poll interval when waiting for locked job (1 second)
 */
const POLL_INTERVAL_MS = 1000;

/**
 * Analysis service for orchestrating stock analysis requests
 */
export class AnalysisService {
  private cacheService: CacheService;

  constructor() {
    this.cacheService = new CacheService('analysis');
  }

  /**
   * Get cache key for ticker
   */
  private getCacheKey(ticker: string): string {
    return `stock:${ticker.toUpperCase()}`;
  }

  /**
   * Get lock key for ticker
   */
  private getLockKey(ticker: string): string {
    return `lock:${ticker.toUpperCase()}`;
  }

  /**
   * Check if cached analysis is still valid
   */
  private isAnalysisValid(analysis: IAnalysisDocument): boolean {
    const now = new Date();
    const generatedAt = new Date(analysis.generatedAt);
    const ageMs = now.getTime() - generatedAt.getTime();
    return ageMs < CACHE_VALIDITY_MS;
  }

  /**
   * Request stock analysis for a ticker
   * Returns cached result if available and valid, otherwise queues a new job
   *
   * @param ticker - Stock ticker symbol
   * @param userId - User ID requesting analysis
   * @returns Analysis result or job ID for polling
   */
  async requestAnalysis(
    ticker: string,
    userId: string
  ): Promise<
    | { status: 'cached'; data: IAnalysisDocument }
    | { status: 'pending'; jobId: string }
    | { status: 'processing'; jobId: string }
  > {
    const normalizedTicker = ticker.toUpperCase();
    const cacheKey = this.getCacheKey(normalizedTicker);

    // Step 1: Check cache first
    const cachedAnalysis = await this.cacheService.get<IAnalysisDocument>(
      cacheKey
    );

    if (cachedAnalysis && this.isAnalysisValid(cachedAnalysis)) {
      return {
        status: 'cached',
        data: cachedAnalysis,
      };
    }

    // Step 2: Check if there's already an active job for this ticker
    const activeJobId = await getActiveJobForTicker(normalizedTicker);

    if (activeJobId) {
      // Another request is already being processed
      return {
        status: 'processing',
        jobId: activeJobId,
      };
    }

    // Step 3: No cache and no active job, create new job
    const jobId = await addAnalysisJob(normalizedTicker, userId);

    return {
      status: 'pending',
      jobId,
    };
  }

  /**
   * Get cached analysis for a ticker
   * Returns null if not cached or expired
   *
   * @param ticker - Stock ticker symbol
   * @returns Cached analysis or null
   */
  async getAnalysis(ticker: string): Promise<IAnalysisDocument | null> {
    const normalizedTicker = ticker.toUpperCase();
    const cacheKey = this.getCacheKey(normalizedTicker);

    const cachedAnalysis = await this.cacheService.get<IAnalysisDocument>(
      cacheKey
    );

    if (cachedAnalysis && this.isAnalysisValid(cachedAnalysis)) {
      return cachedAnalysis;
    }

    // If not in cache or expired, try to get latest from database
    const dbAnalysis = await AnalysisModel.findLatestByTicker(normalizedTicker);

    if (dbAnalysis && this.isAnalysisValid(dbAnalysis)) {
      // Repopulate cache
      await this.cacheService.set(cacheKey, dbAnalysis, CACHE_TTL);
      return dbAnalysis;
    }

    return null;
  }

  /**
   * Get analysis job status
   *
   * @param jobId - BullMQ job ID
   * @returns Job status and result if completed
   */
  async getAnalysisStatus(jobId: string): Promise<
    | { status: 'waiting' | 'active' | 'delayed' }
    | { status: 'completed'; data: IAnalysisDocument }
    | { status: 'failed'; error: string }
    | { status: 'not_found' }
  > {
    const job = await getJob(jobId);

    if (!job) {
      return { status: 'not_found' };
    }

    const state = await job.getState();

    switch (state) {
      case 'completed':
        const result = job.returnvalue;
        if (result && result.analysisId) {
          // Fetch the analysis from database
          const analysis = await AnalysisModel.findById(result.analysisId);
          if (analysis) {
            return {
              status: 'completed',
              data: analysis,
            };
          }
        }
        return { status: 'failed', error: 'Analysis not found in database' };

      case 'failed':
        const error = job.failedReason || 'Unknown error occurred';
        return {
          status: 'failed',
          error,
        };

      case 'waiting':
        return { status: 'waiting' };

      case 'active':
        return { status: 'active' };

      case 'delayed':
        return { status: 'delayed' };

      default:
        return { status: 'not_found' };
    }
  }

  /**
   * Get user's analysis history
   *
   * @param userId - User ID
   * @param limit - Maximum number of analyses to return (default: 10)
   * @returns Array of user's past analyses
   */
  async getUserAnalysisHistory(
    userId: string,
    limit: number = 10
  ): Promise<IAnalysisDocument[]> {
    const userObjectId = new Types.ObjectId(userId);

    const analyses = await AnalysisModel.find({
      requestedBy: userObjectId,
    })
      .sort({ generatedAt: -1 })
      .limit(limit)
      .exec();

    return analyses;
  }

  /**
   * Store analysis result in cache and database
   * This is called by the job processor
   *
   * @param ticker - Stock ticker
   * @param analysis - Stock analysis data
   * @param sources - Grounding sources
   * @param userId - User ID who requested
   * @returns Created analysis document
   */
  async storeAnalysis(
    ticker: string,
    analysis: StockAnalysis,
    sources: GroundingChunk[],
    userId: string
  ): Promise<IAnalysisDocument> {
    const normalizedTicker = ticker.toUpperCase();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + CACHE_VALIDITY_MS);

    // Store in MongoDB
    const analysisDoc = await AnalysisModel.create({
      ticker: normalizedTicker,
      analysis,
      sources,
      generatedAt: now,
      expiresAt,
      requestedBy: new Types.ObjectId(userId),
    });

    // Store in Redis cache
    const cacheKey = this.getCacheKey(normalizedTicker);
    await this.cacheService.set(cacheKey, analysisDoc.toJSON(), CACHE_TTL);

    return analysisDoc;
  }

  /**
   * Clear cache for a specific ticker
   *
   * @param ticker - Stock ticker symbol
   */
  async clearCache(ticker: string): Promise<void> {
    const normalizedTicker = ticker.toUpperCase();
    const cacheKey = this.getCacheKey(normalizedTicker);
    await this.cacheService.del(cacheKey);
  }

  /**
   * Get analyses for a specific ticker within a time range
   *
   * @param ticker - Stock ticker symbol
   * @param startDate - Start date for range
   * @param endDate - End date for range
   * @returns Array of analyses in time range
   */
  async getAnalysisHistory(
    ticker: string,
    startDate: Date,
    endDate: Date
  ): Promise<IAnalysisDocument[]> {
    const normalizedTicker = ticker.toUpperCase();
    return AnalysisModel.findByTickerAndTimeRange(
      normalizedTicker,
      startDate,
      endDate
    );
  }
}

/**
 * Singleton instance of Analysis service
 */
export const analysisService = new AnalysisService();
