/**
 * FortyGuard Error Model
 */

export type FortyGuardErrorCode =
  | 'AUTHENTICATION_ERROR'
  | 'VALIDATION_ERROR'
  | 'RATE_LIMITED'
  | 'TIMEOUT'
  | 'NETWORK_ERROR'
  | 'PROCESSING_ERROR'
  | 'FEATURE_UNAVAILABLE'
  | 'INVALID_RESPONSE'
  | 'UNKNOWN_ERROR';

export interface FortyGuardErrorDetails {
  code: FortyGuardErrorCode;
  message: string;
  statusCode?: number;
  activityId?: string;
  retryable: boolean;
  source: 'fortyguard' | 'heat_os_orchestrator';
  originalError?: any;
}

export class FortyGuardError extends Error {
  public readonly code: FortyGuardErrorCode;
  public readonly statusCode?: number;
  public readonly activityId?: string;
  public readonly retryable: boolean;
  public readonly source: 'fortyguard' | 'heat_os_orchestrator';
  public readonly originalError?: any;

  constructor(details: FortyGuardErrorDetails) {
    super(details.message);
    this.name = 'FortyGuardError';
    this.code = details.code;
    this.statusCode = details.statusCode;
    this.activityId = details.activityId;
    this.retryable = details.retryable;
    this.source = details.source || 'fortyguard';
    this.originalError = details.originalError;

    // Maintains proper stack trace for where error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, FortyGuardError);
    }
  }

  public toJSON() {
    return {
      error: true,
      name: this.name,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      activityId: this.activityId,
      retryable: this.retryable,
      source: this.source,
    };
  }
}

export function isFortyGuardError(error: any): error is FortyGuardError {
  return error instanceof FortyGuardError;
}

export function mapHttpErrorToFortyGuardError(
  status: number,
  responseBody?: any,
  activityId?: string
): FortyGuardError {
  const message =
    responseBody?.message ||
    responseBody?.error?.message ||
    `FortyGuard API error with HTTP status ${status}`;

  switch (status) {
    case 401:
    case 403:
      return new FortyGuardError({
        code: 'AUTHENTICATION_ERROR',
        message: `Authentication failed: ${message}`,
        statusCode: status,
        activityId,
        retryable: false,
        source: 'fortyguard',
        originalError: responseBody,
      });

    case 400:
    case 422:
      return new FortyGuardError({
        code: 'VALIDATION_ERROR',
        message: `Invalid request parameters: ${message}`,
        statusCode: status,
        activityId,
        retryable: false,
        source: 'fortyguard',
        originalError: responseBody,
      });

    case 429:
      return new FortyGuardError({
        code: 'RATE_LIMITED',
        message: `Rate limit exceeded: ${message}`,
        statusCode: status,
        activityId,
        retryable: true,
        source: 'fortyguard',
        originalError: responseBody,
      });

    case 404:
    case 501:
      return new FortyGuardError({
        code: 'FEATURE_UNAVAILABLE',
        message: `Feature or endpoint unavailable: ${message}`,
        statusCode: status,
        activityId,
        retryable: false,
        source: 'fortyguard',
        originalError: responseBody,
      });

    case 504:
    case 408:
      return new FortyGuardError({
        code: 'TIMEOUT',
        message: `Request timed out: ${message}`,
        statusCode: status,
        activityId,
        retryable: true,
        source: 'fortyguard',
        originalError: responseBody,
      });

    case 500:
    case 502:
    case 503:
      return new FortyGuardError({
        code: 'NETWORK_ERROR',
        message: `Temporary server or network issue (${status}): ${message}`,
        statusCode: status,
        activityId,
        retryable: true,
        source: 'fortyguard',
        originalError: responseBody,
      });

    default:
      return new FortyGuardError({
        code: 'UNKNOWN_ERROR',
        message,
        statusCode: status,
        activityId,
        retryable: status >= 500,
        source: 'fortyguard',
        originalError: responseBody,
      });
  }
}
