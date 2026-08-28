/**
 * FortyGuard Observability & Safe Structured Logger
 * Never logs API keys, secrets, or full sensitive payloads.
 */

export interface LogContext {
  requestId?: string;
  activityId?: string;
  endpoint?: string;
  durationMs?: number;
  status?: string | number;
  retryCount?: number;
  cacheHit?: boolean;
  message?: string;
  error?: string;
  [key: string]: any;
}

const REDACTED_KEYS = [
  'api_key',
  'apikey',
  'key',
  'authorization',
  'token',
  'secret',
  'bearer',
  'password',
];

function sanitizeObject(obj: any, depth = 0): any {
  if (depth > 4 || obj === null || obj === undefined) return obj;

  if (typeof obj === 'string') {
    // Redact bearer tokens or secret keys
    if (obj.toLowerCase().startsWith('bearer ') || (obj.length > 80 && /^[a-f0-9_-]+$/i.test(obj))) {
      return '[REDACTED_SECRET]';
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.slice(0, 10).map((item) => sanitizeObject(item, depth + 1));
  }

  if (typeof obj === 'object') {
    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (REDACTED_KEYS.some((k) => key.toLowerCase().includes(k))) {
        sanitized[key] = '[REDACTED_SECRET]';
      } else {
        sanitized[key] = sanitizeObject(value, depth + 1);
      }
    }
    return sanitized;
  }

  return obj;
}

export class FortyGuardLogger {
  private static formatLog(level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG', context: LogContext): string {
    const timestamp = new Date().toISOString();
    const sanitizedContext = sanitizeObject(context);
    const { message, ...meta } = sanitizedContext;
    return JSON.stringify({
      timestamp,
      level,
      source: 'FortyGuardFabric',
      message: message || 'Operation log',
      ...meta,
    });
  }

  public static info(message: string, context: LogContext = {}) {
    // Cleanse any error-like properties from INFO logs to prevent false-positive error triggers
    const { code, statusCode, error, ...safeContext } = context;
    console.log(this.formatLog('INFO', { message, ...safeContext }));
  }

  public static warn(message: string, context: LogContext = {}) {
    console.warn(this.formatLog('WARN', { message, ...context }));
  }

  public static error(message: string, context: LogContext = {}) {
    console.error(this.formatLog('ERROR', { message, ...context }));
  }

  public static debug(message: string, context: LogContext = {}) {
    if (process.env.DEBUG || process.env.NODE_ENV === 'development') {
      console.debug(this.formatLog('DEBUG', { message, ...context }));
    }
  }
}
