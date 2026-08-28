import dotenv from 'dotenv';
import { FortyGuardConfig } from './types';

// Load environment variables if running in Node server environment
dotenv.config();

let globalAuthFailure = false;

export function setFortyGuardAuthFailure(failed: boolean = true) {
  globalAuthFailure = failed;
}

export function isFortyGuardAuthFailed(): boolean {
  return globalAuthFailure;
}

export function getFortyGuardConfig(): FortyGuardConfig {
  const envBaseUrl = process.env.FORTYGUARD_BASE_URL;
  const envApiKey = process.env.FORTYGUARD_API_KEY;
  const envTimeout = process.env.FORTYGUARD_TIMEOUT;
  const envPollInterval = process.env.FORTYGUARD_POLL_INTERVAL;
  const envMaxPollTime = process.env.FORTYGUARD_MAX_POLL_TIME;
  const envRetryCount = process.env.FORTYGUARD_RETRY_COUNT;
  const envCacheTtl = process.env.FORTYGUARD_CACHE_TTL;
  const envMock = process.env.FORTYGUARD_MOCK;

  // Base URL normalization (strip trailing slash)
  const rawBaseUrl = envBaseUrl?.trim() || 'https://api.fortyguard.com';
  const baseUrl = rawBaseUrl.endsWith('/') ? rawBaseUrl.slice(0, -1) : rawBaseUrl;

  const rawApiKey = envApiKey?.trim();
  const apiKey =
    rawApiKey &&
    rawApiKey.length > 5 &&
    !rawApiKey.includes('YOUR_') &&
    rawApiKey !== 'undefined' &&
    rawApiKey !== 'null'
      ? rawApiKey
      : undefined;

  // Parse numeric values with sensible fallbacks (fast timeout to prevent blocking)
  const timeout = envTimeout ? Math.max(1000, parseInt(envTimeout, 10)) : 3500;
  const pollInterval = envPollInterval ? Math.max(200, parseInt(envPollInterval, 10)) : 1000;
  const maxPollTime = envMaxPollTime ? Math.max(2000, parseInt(envMaxPollTime, 10)) : 10000;
  const retryCount = envRetryCount ? Math.max(0, parseInt(envRetryCount, 10)) : 1;
  const cacheTtl = envCacheTtl ? Math.max(5000, parseInt(envCacheTtl, 10)) : 300000; // 5 minutes default

  // We are strictly disabling mock mode for production use to ensure we are connected to the live mesh.
  // The application must fail gracefully or alert if the API key is invalid.
  const mock = false;

  return {
    baseUrl,
    apiKey,
    timeout,
    pollInterval,
    maxPollTime,
    retryCount,
    cacheTtl,
    mock,
  };
}
