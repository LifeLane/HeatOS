/**
 * Server-Side Environmental Cache
 * Implements granular TTL caching by Provider, Location, DateTime, Parameters, and Analysis Type.
 */

export interface CacheEntry<T> {
  key: string;
  data: T;
  createdAt: number;
  expiresAt: number;
  locationKey: string;
  analysisType: string;
}

export class EnvironmentalCache {
  private cache = new Map<string, CacheEntry<any>>();
  private maxEntries: number;

  constructor(maxEntries = 500) {
    this.maxEntries = maxEntries;
  }

  /**
   * Generates a deterministic, collision-resistant cache key.
   * Ensures that location, analysis type, date/time, and params are strictly partitioned.
   */
  public static generateKey(params: {
    provider: string;
    latitude: number;
    longitude: number;
    analysisType: string;
    dateTime?: string;
    extraParams?: Record<string, any>;
  }): string {
    // Quantize lat/lng to 4 decimal places (~11m spatial resolution) to allow efficient local spatial caching
    const latQ = params.latitude.toFixed(4);
    const lngQ = params.longitude.toFixed(4);
    const dt = params.dateTime || 'latest';
    const extra = params.extraParams ? JSON.stringify(Object.keys(params.extraParams).sort().reduce((acc, k) => {
      acc[k] = params.extraParams![k];
      return acc;
    }, {} as Record<string, any>)) : '';

    return `${params.provider}:${params.analysisType}:loc_${latQ}_${lngQ}:dt_${dt}:params_${extra}`;
  }

  public get<T>(key: string): { data: T; dataAgeMs: number } | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    const dataAgeMs = now - entry.createdAt;
    return {
      data: JSON.parse(JSON.stringify(entry.data)),
      dataAgeMs,
    };
  }

  public set<T>(params: {
    key: string;
    data: T;
    ttlMs: number;
    locationKey: string;
    analysisType: string;
  }): void {
    const now = Date.now();

    // Evict oldest entries if capacity reached
    if (this.cache.size >= this.maxEntries) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(params.key, {
      key: params.key,
      data: JSON.parse(JSON.stringify(params.data)),
      createdAt: now,
      expiresAt: now + params.ttlMs,
      locationKey: params.locationKey,
      analysisType: params.analysisType,
    });
  }

  public invalidate(key: string): void {
    this.cache.delete(key);
  }

  public clear(): void {
    this.cache.clear();
  }

  public size(): number {
    return this.cache.size;
  }
}

export const globalEnvironmentalCache = new EnvironmentalCache();
