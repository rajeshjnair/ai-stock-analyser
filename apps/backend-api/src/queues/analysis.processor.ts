import { Worker, Job } from 'bullmq';
import { redisClient } from '../config/redis.js';
import { geminiService } from '../services/gemini.service.js';
import { analysisService } from '../services/analysis.service.js';
import type {
  AnalysisJobData,
  AnalysisJobResult,
} from './analysis.queue.js';

/**
 * Process a stock analysis job
 *
 * @param job - BullMQ job containing ticker and user ID
 * @returns Job result with analysis ID
 */
async function processAnalysisJob(
  job: Job<AnalysisJobData, AnalysisJobResult>
): Promise<AnalysisJobResult> {
  const { ticker, userId, requestedAt } = job.data;

  console.log(
    `[Job ${job.id}] Processing analysis for ${ticker} requested by user ${userId} at ${requestedAt}`
  );

  try {
    // Step 1: Call Gemini service to generate analysis
    console.log(`[Job ${job.id}] Calling Gemini API for ${ticker}...`);
    const { analysis, sources } = await geminiService.generateStockAnalysis(
      ticker
    );

    console.log(
      `[Job ${job.id}] Received analysis for ${ticker} with ${sources.length} sources`
    );

    // Step 2: Store in cache and database
    console.log(`[Job ${job.id}] Storing analysis for ${ticker}...`);
    const analysisDoc = await analysisService.storeAnalysis(
      ticker,
      analysis,
      sources,
      userId
    );

    console.log(
      `[Job ${job.id}] Analysis stored successfully with ID: ${analysisDoc._id}`
    );

    // Step 3: Return result
    const result: AnalysisJobResult = {
      ticker,
      analysisId: analysisDoc._id.toString(),
      completedAt: new Date().toISOString(),
    };

    return result;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';

    console.error(`[Job ${job.id}] Failed to process analysis:`, errorMessage);
    console.error(`[Job ${job.id}] Error details:`, error);

    // Re-throw to mark job as failed
    throw new Error(`Analysis failed for ${ticker}: ${errorMessage}`);
  }
}

/**
 * Create and start the BullMQ worker for processing analysis jobs
 *
 * @returns Worker instance
 */
export function createAnalysisWorker(): Worker<
  AnalysisJobData,
  AnalysisJobResult
> {
  const worker = new Worker<AnalysisJobData, AnalysisJobResult>(
    'stock-analysis',
    processAnalysisJob,
    {
      connection: redisClient,
      concurrency: 5, // Process up to 5 jobs concurrently
      limiter: {
        max: 10, // Maximum 10 jobs
        duration: 60000, // Per 60 seconds (rate limiting)
      },
    }
  );

  // Worker event handlers
  worker.on('completed', (job, result) => {
    console.log(
      `[Worker] Job ${job.id} completed successfully for ${result.ticker}`
    );
    console.log(`[Worker] Analysis ID: ${result.analysisId}`);
  });

  worker.on('failed', (job, error) => {
    console.error(
      `[Worker] Job ${job?.id} failed for ${job?.data.ticker}:`,
      error.message
    );
  });

  worker.on('error', (error) => {
    console.error('[Worker] Worker error:', error);
  });

  worker.on('stalled', (jobId) => {
    console.warn(`[Worker] Job ${jobId} stalled`);
  });

  worker.on('active', (job) => {
    console.log(`[Worker] Job ${job.id} is now active (${job.data.ticker})`);
  });

  console.log('[Worker] Analysis worker started and listening for jobs');

  return worker;
}

/**
 * Global worker instance
 */
let workerInstance: Worker<AnalysisJobData, AnalysisJobResult> | null = null;

/**
 * Start the analysis worker
 * @returns Worker instance
 */
export function startWorker(): Worker<AnalysisJobData, AnalysisJobResult> {
  if (workerInstance) {
    console.warn('[Worker] Worker already running');
    return workerInstance;
  }

  workerInstance = createAnalysisWorker();
  return workerInstance;
}

/**
 * Stop the analysis worker gracefully
 */
export async function stopWorker(): Promise<void> {
  if (!workerInstance) {
    console.warn('[Worker] No worker instance to stop');
    return;
  }

  console.log('[Worker] Stopping worker gracefully...');
  await workerInstance.close();
  workerInstance = null;
  console.log('[Worker] Worker stopped');
}

/**
 * Get worker instance
 */
export function getWorker(): Worker<
  AnalysisJobData,
  AnalysisJobResult
> | null {
  return workerInstance;
}
