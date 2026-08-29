/**
 * HeatOS: Centralized AI Response Cache with Configurable TTLs
 * 
 * TTL defaults:
 * - Simple metric explanation: 30 minutes (1800s)
 * - Contextual environmental analysis: 10 minutes (600s)
 * - Advanced multi-vector analysis: 5 minutes (300s)
 */

import { AICacheEntry, AIRouterResponse } from './providerTypes';
import { FortyGuardLogger } from '../fortyguard/logger';

export class AICacheService {
  private static cache: Map<string, AICacheEntry> = new Map();
  private static readonly MAX_ENTRIES = 500;

  // TTL Defaults (in milliseconds)
  public static readonly TTL_SIMPLE_MS = 30 * 60 * 1000; // 30 minutes
  public static readonly TTL_CONTEXTUAL_MS = 10 * 60 * 1000; // 10 minutes
  public static readonly TTL_ADVANCED_MS = 5 * 60 * 1000; // 5 minutes

  /**
   * Generates deterministic cache key: operation + location + relevant data
   * e.g., "heatIsland:new-york:2.8" or "analyze_environment:25.2048,55.2708:temp=38,uhi=3.8"
   */
  public static buildKey(params: {
    operation: string;
    location: string;
    targetedDataKey?: string;
    persona?: string;
    prompt?: string;
  }): string {
    const op = params.operation.toLowerCase().trim();
    const loc = params.location.toLowerCase().replace(/[^a-z0-9]/g, '-').trim();
    const dataKey = params.targetedDataKey ? `:${params.targetedDataKey}` : '';
    const persona = params.persona ? `:${params.persona}` : '';
    const promptSnippet = params.prompt ? `:${params.prompt.substring(0, 32).toLowerCase().replace(/[^a-z0-9]/g, '')}` : '';

    return `${op}:${loc}${dataKey}${persona}${promptSnippet}`;
  }

  /**
   * Look up cache entry
   */
  public static get(key: string): AIRouterResponse | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    entry.hitCount++;
    // Return clone marked as cacheHit: true
    return {
      ...entry.response,
      cacheHit: true,
    };
  }

  /**
   * Save response to cache with appropriate TTL
   */
  public static set(key: string, response: AIRouterResponse, customTtlMs?: number): void {
    const now = Date.now();
    const ttl = customTtlMs ?? this.resolveTTL(response.data.skill, response.data.structure);

    // Evict oldest if full
    if (this.cache.size >= this.MAX_ENTRIES) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      response: {
        ...response,
        cacheHit: false,
      },
      createdAt: now,
      expiresAt: now + ttl,
      hitCount: 0,
    });
  }

  /**
   * Resolve appropriate TTL based on operation
   */
  private static resolveTTL(skill?: string, structure?: any): number {
    if (skill === 'explain_metric' || skill === 'summarize_location') {
      return this.TTL_SIMPLE_MS; // 30 minutes
    }
    if (skill === 'analyze_forecast' || skill === 'compare_periods') {
      return this.TTL_ADVANCED_MS; // 5 minutes
    }
    return this.TTL_CONTEXTUAL_MS; // 10 minutes default
  }

  /**
   * Delete specific cache entry
   */
  public static delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Flush cache
   */
  public static clear(): void {
    this.cache.clear();
  }

  /**
   * Statistics
   */
  public static getStats() {
    const now = Date.now();
    let validCount = 0;
    for (const [_, entry] of this.cache.entries()) {
      if (now <= entry.expiresAt) validCount++;
    }
    return {
      totalEntries: this.cache.size,
      activeEntries: validCount,
      maxEntries: this.MAX_ENTRIES,
    };
  }
}
