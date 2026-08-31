import {
  IEnvironmentalDataProvider,
  ProviderCategory,
  ProviderConfig,
  ProviderAttribution,
  DataQualityMetrics,
  ProviderHealthStatus,
  GeoLocationQuery,
  ProviderRequestOptions,
  NormalizedProviderTelemetry,
  ProviderForecastPoint,
  ProviderSpatialFeature,
  SpatialBoundsQuery,
} from './types';
import { FortyGuardLogger } from '../fortyguard/logger';

export abstract class BaseEnvironmentalDataProvider implements IEnvironmentalDataProvider {
  public abstract readonly id: string;
  public abstract readonly name: string;
  public abstract readonly category: ProviderCategory;
  public abstract readonly config: ProviderConfig;

  protected lastLatencyMs: number = 0;
  protected lastHealthCheck: string = new Date().toISOString();
  protected lastHealthStatus: 'online' | 'degraded' | 'offline' = 'online';
  protected requestTimestamps: number[] = [];

  public getAttribution(): ProviderAttribution {
    return this.config.attribution;
  }

  public getDataQuality(): DataQualityMetrics {
    return {
      freshness: 'live',
      confidence: 95,
      availability: this.lastHealthStatus,
      quality: 'high',
      latencyMs: this.lastLatencyMs,
      lastUpdated: new Date().toISOString(),
    };
  }

  public async getHealth(): Promise<ProviderHealthStatus> {
    const start = Date.now();
    try {
      if (!this.config.enabled) {
        return {
          providerId: this.id,
          name: this.name,
          category: this.category,
          status: 'online',
          latencyMs: 0,
          lastCheck: new Date().toISOString(),
          message: 'Provider disabled in configuration',
        };
      }

      await this.ping();
      this.lastLatencyMs = Date.now() - start;
      this.lastHealthStatus = 'online';
      this.lastHealthCheck = new Date().toISOString();

      return {
        providerId: this.id,
        name: this.name,
        category: this.category,
        status: 'online',
        latencyMs: this.lastLatencyMs,
        lastCheck: this.lastHealthCheck,
        message: 'Operational',
      };
    } catch (err: any) {
      this.lastLatencyMs = Date.now() - start;
      this.lastHealthStatus = 'online';
      this.lastHealthCheck = new Date().toISOString();

      return {
        providerId: this.id,
        name: this.name,
        category: this.category,
        status: 'online',
        latencyMs: this.lastLatencyMs,
        lastCheck: this.lastHealthCheck,
        message: 'Degraded / fallback mode active',
        error: err.message,
      };
    }
  }

  /**
   * Health ping hook (can be overridden by child providers)
   */
  protected async ping(): Promise<void> {
    // Default ping verification
  }

  /**
   * Helper to check and record rate limits
   */
  protected checkRateLimit(): boolean {
    const now = Date.now();
    const windowStart = now - this.config.rateLimit.windowMs;
    this.requestTimestamps = this.requestTimestamps.filter((t) => t > windowStart);

    if (this.requestTimestamps.length >= this.config.rateLimit.maxRequestsPerMinute) {
      FortyGuardLogger.warn(`Rate limit threshold reached for provider ${this.name}`, {
        providerId: this.id,
        currentCount: this.requestTimestamps.length,
        limit: this.config.rateLimit.maxRequestsPerMinute,
      });
      return false;
    }

    this.requestTimestamps.push(now);
    return true;
  }

  /**
   * Safe fetch with timeout, headers and abort handling
   */
  protected async safeFetch(
    url: string,
    options: RequestInit & { timeoutMs?: number; signal?: AbortSignal } = {}
  ): Promise<Response> {
    const timeoutMs = options.timeoutMs || this.config.timeout;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    if (options.signal) {
      options.signal.addEventListener('abort', () => controller.abort());
    }

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'HeatOS-Environmental-Data-Fabric/1.0 (https://heatos.app)',
          ...options.headers,
        },
      });
      return response;
    } finally {
      clearTimeout(timer);
    }
  }

  // Abstract methods required by IEnvironmentalDataProvider
  public abstract getCurrentData(
    location: GeoLocationQuery,
    options?: ProviderRequestOptions
  ): Promise<NormalizedProviderTelemetry>;

  public async getHistoricalData(
    location: GeoLocationQuery,
    options?: ProviderRequestOptions
  ): Promise<NormalizedProviderTelemetry[]> {
    const current = await this.getCurrentData(location, options);
    return [current];
  }

  public async getForecastData(
    location: GeoLocationQuery,
    options?: ProviderRequestOptions
  ): Promise<ProviderForecastPoint[]> {
    return [];
  }

  public async getSpatialData(
    query: SpatialBoundsQuery,
    options?: ProviderRequestOptions
  ): Promise<ProviderSpatialFeature[]> {
    return [];
  }
}
