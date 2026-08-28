import { FortyGuardClient } from './client';
import { FortyGuardStatusResponse } from './types';
import { FortyGuardError } from './errors';
import { FortyGuardLogger } from './logger';

export interface PollingOptions {
  pollIntervalMs?: number;
  maxPollTimeMs?: number;
  signal?: AbortSignal;
  requestId?: string;
  onProgress?: (progressPercent: number, status: string) => void;
}

/**
 * Reusable polling mechanism for asynchronous FortyGuard activities.
 * Polls GET /v1/status/{activity_id} until completion, failure, timeout, or cancellation.
 */
export async function pollFortyGuardActivity<T = any>(
  activityId: string,
  client: FortyGuardClient,
  options: PollingOptions = {}
): Promise<T> {
  const {
    pollIntervalMs = 1000,
    maxPollTimeMs = 30000,
    signal,
    requestId = `poll_${Date.now()}`,
    onProgress,
  } = options;

  const startTime = Date.now();
  let attempts = 0;

  FortyGuardLogger.info('Starting asynchronous FortyGuard activity polling', {
    requestId,
    activityId,
    pollIntervalMs,
    maxPollTimeMs,
  });

  while (true) {
    attempts++;

    // 1. Check if AbortSignal was triggered
    if (signal?.aborted) {
      FortyGuardLogger.warn('Activity polling cancelled by client abort signal', {
        requestId,
        activityId,
        attempts,
      });
      throw new FortyGuardError({
        code: 'TIMEOUT',
        message: `Activity polling aborted for ${activityId}`,
        activityId,
        retryable: false,
        source: 'fortyguard',
      });
    }

    // 2. Check if maximum polling duration exceeded
    const elapsedTime = Date.now() - startTime;
    if (elapsedTime >= maxPollTimeMs) {
      FortyGuardLogger.error('FortyGuard activity polling timed out', {
        requestId,
        activityId,
        elapsedTimeMs: elapsedTime,
        maxPollTimeMs,
        attempts,
      });
      throw new FortyGuardError({
        code: 'TIMEOUT',
        message: `Activity ${activityId} did not complete within max polling threshold of ${maxPollTimeMs}ms`,
        activityId,
        statusCode: 408,
        retryable: true,
        source: 'fortyguard',
      });
    }

    try {
      // 3. Query status endpoint
      const statusResponse: FortyGuardStatusResponse<T> = await client.getActivityStatus<T>(
        activityId,
        {
          signal,
          requestId: `${requestId}_chk_${attempts}`,
        }
      );

      const { status, progress_percent, result, error } = statusResponse;

      if (onProgress && progress_percent !== undefined) {
        onProgress(progress_percent, status);
      }

      // 4. Handle Terminal States
      if (status === 'COMPLETED') {
        FortyGuardLogger.info('FortyGuard activity completed successfully', {
          requestId,
          activityId,
          durationMs: Date.now() - startTime,
          attempts,
        });

        if (result === undefined || result === null) {
          throw new FortyGuardError({
            code: 'INVALID_RESPONSE',
            message: `Activity ${activityId} completed but returned empty result payload`,
            activityId,
            retryable: false,
            source: 'fortyguard',
          });
        }

        return result;
      }

      if (status === 'FAILED') {
        const errMsg = error?.message || 'Activity processing failed in FortyGuard compute engine';
        FortyGuardLogger.error('FortyGuard activity failed during computation', {
          requestId,
          activityId,
          error: errMsg,
          details: error,
        });

        throw new FortyGuardError({
          code: 'PROCESSING_ERROR',
          message: `FortyGuard activity failed: ${errMsg}`,
          activityId,
          retryable: false,
          source: 'fortyguard',
          originalError: error,
        });
      }

      if (status === 'TIMEOUT') {
        throw new FortyGuardError({
          code: 'TIMEOUT',
          message: `FortyGuard server flagged activity ${activityId} as timed out`,
          activityId,
          retryable: true,
          source: 'fortyguard',
        });
      }

      // 5. In-flight status (QUEUED / PROCESSING) -> Wait for next interval
      FortyGuardLogger.debug('Activity still in progress, waiting for next poll cycle', {
        requestId,
        activityId,
        status,
        progress: progress_percent,
        attempts,
        elapsedTimeMs: elapsedTime,
      });

      // Sleep for pollIntervalMs or remaining time, whichever is smaller
      const sleepTime = Math.min(pollIntervalMs, Math.max(50, maxPollTimeMs - elapsedTime));
      await new Promise((resolve) => setTimeout(resolve, sleepTime));
    } catch (err: any) {
      if (err instanceof FortyGuardError) {
        // If it's a transient network error during status check, keep trying until maxPollTime unless fatal
        if (err.retryable && Date.now() - startTime < maxPollTimeMs) {
          FortyGuardLogger.warn('Transient error during status poll check, retrying...', {
            requestId,
            activityId,
            error: err.message,
          });
          await new Promise((r) => setTimeout(r, pollIntervalMs));
          continue;
        }
        throw err;
      }

      throw err;
    }
  }
}
