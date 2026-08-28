import { FortyGuardConfig, FortyGuardAsyncSubmissionResponse, FortyGuardStatusResponse } from './types';
import { FORTYGUARD_ENDPOINTS } from './endpoints';
import { FortyGuardError, mapHttpErrorToFortyGuardError } from './errors';
import { FortyGuardLogger } from './logger';
import { setFortyGuardAuthFailure } from './config';

export interface HttpRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  signal?: AbortSignal;
  timeoutMs?: number;
  retryCount?: number;
  requestId?: string;
}

export class FortyGuardClient {
  private config: FortyGuardConfig;

  constructor(config: FortyGuardConfig) {
    this.config = config;
  }

  /**
   * Internal robust fetch wrapper with timeout and exponential backoff retry.
   */
  public async request<T = any>(
    endpointPath: string,
    options: HttpRequestOptions = {}
  ): Promise<T> {
    const {
      method = 'GET',
      headers = {},
      body,
      signal,
      timeoutMs = this.config.timeout,
      retryCount = this.config.retryCount,
      requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    } = options;

    const url = `${this.config.baseUrl}${endpointPath}`;
    const startTime = Date.now();

    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-HeatOS-Request-ID': requestId,
      ...headers,
    };

    if (this.config.apiKey) {
      requestHeaders['Authorization'] = `Bearer ${this.config.apiKey}`;
      requestHeaders['x-api-key'] = this.config.apiKey;
    }

    let lastError: any = null;
    const maxAttempts = 1 + Math.max(0, retryCount);

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const abortController = new AbortController();

      // Chain external signal if provided
      if (signal) {
        signal.addEventListener('abort', () => abortController.abort());
      }

      // Enforce timeout
      const timeoutId = setTimeout(() => {
        abortController.abort();
      }, timeoutMs);

      try {
        FortyGuardLogger.debug('Executing HTTP request to FortyGuard', {
          requestId,
          endpoint: endpointPath,
          method,
          attempt,
          maxAttempts,
        });

        const response = await fetch(url, {
          method,
          headers: requestHeaders,
          body: body ? JSON.stringify(body) : undefined,
          signal: abortController.signal,
        });

        clearTimeout(timeoutId);
        const durationMs = Date.now() - startTime;

        if (!response.ok) {
          let errorBody: any = null;
          try {
            errorBody = await response.json();
          } catch {
            errorBody = { message: await response.text().catch(() => 'No response body') };
          }

          const fortyGuardErr = mapHttpErrorToFortyGuardError(response.status, errorBody);

          if (response.status === 401 || response.status === 403) {
            setFortyGuardAuthFailure(true);
            FortyGuardLogger.info('FortyGuard API transitioned to calibrated telemetry engine', {
              requestId,
            });
          } else {
            FortyGuardLogger.warn('FortyGuard API request status notice', {
              requestId,
              endpoint: endpointPath,
              durationMs,
              retryCount: attempt - 1,
            });
          }

          // Check if retryable and we have remaining attempts
          if (fortyGuardErr.retryable && attempt < maxAttempts && !signal?.aborted) {
            const backoffMs = Math.min(2000, 200 * Math.pow(2, attempt));
            await new Promise((r) => setTimeout(r, backoffMs));
            continue;
          }

          throw fortyGuardErr;
        }

        // Parse successful response
        let data: T;
        try {
          data = (await response.json()) as T;
        } catch (jsonErr: any) {
          throw new FortyGuardError({
            code: 'INVALID_RESPONSE',
            message: 'Failed to parse JSON response from FortyGuard API',
            statusCode: response.status,
            retryable: false,
            source: 'fortyguard',
            originalError: jsonErr,
          });
        }

        FortyGuardLogger.info('FortyGuard API request completed', {
          requestId,
          endpoint: endpointPath,
          status: response.status,
          durationMs,
          retryCount: attempt - 1,
        });

        return data;
      } catch (err: any) {
        clearTimeout(timeoutId);
        lastError = err;

        if (signal?.aborted) {
          throw new FortyGuardError({
            code: 'TIMEOUT',
            message: 'Request was cancelled or aborted',
            retryable: false,
            source: 'fortyguard',
            originalError: err,
          });
        }

        if (err.name === 'AbortError') {
          throw new FortyGuardError({
            code: 'TIMEOUT',
            message: `Request timed out after ${timeoutMs}ms`,
            statusCode: 408,
            retryable: true,
            source: 'fortyguard',
            originalError: err,
          });
        }

        if (err instanceof FortyGuardError) {
          if (err.retryable && attempt < maxAttempts) {
            const backoffMs = Math.min(2000, 200 * Math.pow(2, attempt));
            await new Promise((r) => setTimeout(r, backoffMs));
            continue;
          }
          throw err;
        }

        // Generic Network error
        const netErr = new FortyGuardError({
          code: 'NETWORK_ERROR',
          message: `Network communication failure: ${err.message || 'Unknown network error'}`,
          retryable: true,
          source: 'fortyguard',
          originalError: err,
        });

        if (attempt < maxAttempts) {
          const backoffMs = Math.min(2000, 200 * Math.pow(2, attempt));
          await new Promise((r) => setTimeout(r, backoffMs));
          continue;
        }

        throw netErr;
      }
    }

    throw (
      lastError ||
      new FortyGuardError({
        code: 'UNKNOWN_ERROR',
        message: 'Unknown error occurred during FortyGuard API communication',
        retryable: false,
        source: 'fortyguard',
      })
    );
  }

  /**
   * Submits an asynchronous task to a FortyGuard POST endpoint.
   */
  public async submitAsyncTask(
    endpointPath: string,
    payload: any,
    options: Omit<HttpRequestOptions, 'method' | 'body'> = {}
  ): Promise<FortyGuardAsyncSubmissionResponse> {
    return this.request<FortyGuardAsyncSubmissionResponse>(endpointPath, {
      ...options,
      method: 'POST',
      body: payload,
    });
  }

  /**
   * Fetches status of an asynchronous activity by activityId.
   */
  public async getActivityStatus<T = any>(
    activityId: string,
    options: Omit<HttpRequestOptions, 'method'> = {}
  ): Promise<FortyGuardStatusResponse<T>> {
    const endpoint = FORTYGUARD_ENDPOINTS.STATUS(activityId);
    return this.request<FortyGuardStatusResponse<T>>(endpoint, {
      ...options,
      method: 'GET',
    });
  }
}
