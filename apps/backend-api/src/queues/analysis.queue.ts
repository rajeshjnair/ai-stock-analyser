import { Queue, QueueOptions, JobsOptions } from 'bullmq';
import { redisClient } from '../config/redis.js';

/**
 * BullMQ queue configuration for stock analysis jobs
 */

// Queue connection configuration
const connection = redisClient;

// Default job options
const defaultJobOptions: JobsOptions = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 2000, // Start with 2 seconds
  },
  removeOnComplete: {
    age: 3600, // Keep completed jobs for 1 hour
    count: 100, // Keep last 100 completed jobs
  },
  removeOnFail: {
    age: 86400, // Keep failed jobs for 24 hours
    count: 500, // Keep last 500 failed jobs
  },
};

// Queue options
const queueOptions: QueueOptions = {
  connection,
  defaultJobOptions,
};

/**
 * Analysis queue for processing stock analysis requests
 */
export const analysisQueue = new Queue('stock-analysis', queueOptions);

/**
 * Job data interface for analysis jobs
 */
export interface AnalysisJobData {
  ticker: string;
  userId: string;
  requestedAt: string; // ISO timestamp
}

/**
 * Job result interface for completed analysis jobs
 */
export interface AnalysisJobResult {
  ticker: string;
  analysisId: string;
  completedAt: string; // ISO timestamp
}

/**
 * Add a stock analysis job to the queue
 * @param ticker - Stock ticker symbol
 * @param userId - ID of user requesting analysis
 * @returns Job ID
 */
export async function addAnalysisJob(
  ticker: string,
  userId: string
): Promise<string> {
  const jobData: AnalysisJobData = {
    ticker: ticker.toUpperCase(),
    userId,
    requestedAt: new Date().toISOString(),
  };

  // Use ticker as job ID to prevent duplicate processing
  // If a job with same ticker already exists, it won't be added again
  const job = await analysisQueue.add(
    'analyze-stock',
    jobData,
    {
      jobId: `analysis:${ticker.toUpperCase()}:${Date.now()}`,
      // Delay can be added here if needed
      // delay: 0,
    }
  );

  return job.id!;
}

/**
 * Get job by ID
 */
export async function getJob(jobId: string) {
  return analysisQueue.getJob(jobId);
}

/**
 * Check if there's an active job for a ticker
 * @param ticker - Stock ticker symbol
 * @returns Job ID if active job exists, null otherwise
 */
export async function getActiveJobForTicker(
  ticker: string
): Promise<string | null> {
  const normalizedTicker = ticker.toUpperCase();

  // Check waiting jobs
  const waitingJobs = await analysisQueue.getWaiting();
  for (const job of waitingJobs) {
    if (job.data.ticker === normalizedTicker) {
      return job.id!;
    }
  }

  // Check active jobs
  const activeJobs = await analysisQueue.getActive();
  for (const job of activeJobs) {
    if (job.data.ticker === normalizedTicker) {
      return job.id!;
    }
  }

  return null;
}

/**
 * Clean up old jobs
 */
export async function cleanQueue() {
  await analysisQueue.clean(3600000, 100, 'completed'); // Clean completed jobs older than 1 hour
  await analysisQueue.clean(86400000, 500, 'failed'); // Clean failed jobs older than 24 hours
}

/**
 * Gracefully close queue connections
 */
export async function closeQueue() {
  await analysisQueue.close();
}

/**
 * Get queue metrics
 */
export async function getQueueMetrics() {
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    analysisQueue.getWaitingCount(),
    analysisQueue.getActiveCount(),
    analysisQueue.getCompletedCount(),
    analysisQueue.getFailedCount(),
    analysisQueue.getDelayedCount(),
  ]);

  return {
    waiting,
    active,
    completed,
    failed,
    delayed,
    total: waiting + active + completed + failed + delayed,
  };
}
