import { FortyGuardProvider, IEnvironmentalProvider } from './fortyguard/provider';
import { getFortyGuardConfig } from './fortyguard/config';
import { EnvironmentalCache, globalEnvironmentalCache } from './fortyguard/cache';
import { RequestDeduplicator, globalRequestDeduplicator } from './fortyguard/deduplicator';
import { FortyGuardLogger } from './fortyguard/logger';
import {
  FortyGuardEnvParamsRequest,
  FortyGuardHeatmapRequest,
  FortyGuardHeatIntelligenceRequest,
  FortyGuardSatelliteRequest,
  FortyGuardStreetviewRequest,
} from './fortyguard/types';
import {
  EnvironmentalState,
  HeatmapData,
  HeatIntelligenceResult,
  SatelliteThermalResult,
  StreetviewMicroclimateResult,
} from '../types/environmental';

export interface OrchestratorOptions {
  bypassCache?: boolean;
  signal?: AbortSignal;
  requestId?: string;
}

/**
 * HeatOS Data Orchestrator
 * Central fabric coordinating Environmental Data Providers, Caching, Deduplication, and Normalization.
 */
export class DataOrchestrator {
  private primaryProvider: IEnvironmentalProvider;
  private cache: EnvironmentalCache;
  private deduplicator: RequestDeduplicator;
  private cacheTtlMs: number;

  constructor(
    provider?: IEnvironmentalProvider,
    cache = globalEnvironmentalCache,
    deduplicator = globalRequestDeduplicator
  ) {
    const config = getFortyGuardConfig();
    this.primaryProvider = provider || new FortyGuardProvider(config);
    this.cache = cache;
    this.deduplicator = deduplicator;
    this.cacheTtlMs = config.cacheTtl;
  }

  /**
   * Retrieves Normalized Environmental State for a spatial coordinate and time context.
   */
  public async getEnvironmentalState(
    params: FortyGuardEnvParamsRequest,
    options: OrchestratorOptions = {}
  ): Promise<EnvironmentalState> {
    const requestId = options.requestId || `orch_env_${Date.now()}`;
    const cacheKey = EnvironmentalCache.generateKey({
      provider: 'fortyguard',
      latitude: params.latitude,
      longitude: params.longitude,
      analysisType: 'env_params',
      dateTime: params.start_date,
      extraParams: {
        filter_type: params.filter_type,
        time_series: params.time_series,
        temperature: params.temperature,
      },
    });

    // 1. Check Cache
    if (!options.bypassCache) {
      const cached = this.cache.get<EnvironmentalState>(cacheKey);
      if (cached) {
        FortyGuardLogger.info('Cache hit for environmental state', {
          requestId,
          cacheHit: true,
          dataAgeMs: cached.dataAgeMs,
          lat: params.latitude,
          lng: params.longitude,
        });

        return {
          ...cached.data,
          freshness: 'cached',
          dataAge: cached.dataAgeMs,
        };
      }
    }

    // 2. In-flight Deduplication & Execution
    const { result, wasDeduplicated } = await this.deduplicator.execute(cacheKey, async () => {
      return this.primaryProvider.getEnvironmentalParameters(params, {
        signal: options.signal,
        requestId,
      });
    });

    if (wasDeduplicated) {
      FortyGuardLogger.info('Deduplicated concurrent environmental state request', {
        requestId,
        cacheKey,
      });
    }

    // 3. Cache the normalized result
    this.cache.set({
      key: cacheKey,
      data: result,
      ttlMs: this.cacheTtlMs,
      locationKey: `${params.latitude.toFixed(4)}_${params.longitude.toFixed(4)}`,
      analysisType: 'env_params',
    });

    return result;
  }

  /**
   * Retrieves Normalized Heatmap Data for a bounding box or GeoJSON geometry.
   */
  public async getHeatmap(
    params: FortyGuardHeatmapRequest,
    options: OrchestratorOptions = {}
  ): Promise<HeatmapData> {
    const requestId = options.requestId || `orch_heat_${Date.now()}`;
    const lat = params.bounds ? (params.bounds.north + params.bounds.south) / 2 : 0;
    const lng = params.bounds ? (params.bounds.east + params.bounds.west) / 2 : 0;

    const cacheKey = EnvironmentalCache.generateKey({
      provider: 'fortyguard',
      latitude: lat,
      longitude: lng,
      analysisType: 'heatmap',
      dateTime: params.date_time,
      extraParams: {
        resolution: params.resolution,
        bounds: params.bounds,
        target: params.target_parameter,
      },
    });

    // 1. Check Cache
    if (!options.bypassCache) {
      const cached = this.cache.get<HeatmapData>(cacheKey);
      if (cached) {
        FortyGuardLogger.info('Cache hit for heatmap data', {
          requestId,
          cacheHit: true,
          dataAgeMs: cached.dataAgeMs,
        });
        return {
          ...cached.data,
          freshness: 'cached',
        };
      }
    }

    // 2. In-flight Deduplication & Execution
    const { result, wasDeduplicated } = await this.deduplicator.execute(cacheKey, async () => {
      return this.primaryProvider.getHeatmap(params, {
        signal: options.signal,
        requestId,
      });
    });

    if (wasDeduplicated) {
      FortyGuardLogger.info('Deduplicated concurrent heatmap request', { requestId, cacheKey });
    }

    // 3. Store in Cache
    this.cache.set({
      key: cacheKey,
      data: result,
      ttlMs: this.cacheTtlMs,
      locationKey: `${lat.toFixed(4)}_${lng.toFixed(4)}`,
      analysisType: 'heatmap',
    });

    return result;
  }

  /**
   * Optional Premium: Heat Intelligence
   */
  public async getHeatIntelligence(
    params: FortyGuardHeatIntelligenceRequest,
    options: OrchestratorOptions = {}
  ): Promise<HeatIntelligenceResult> {
    if (!this.primaryProvider.getHeatIntelligence) {
      throw new Error('Heat Intelligence capability is not implemented by current provider');
    }
    return this.primaryProvider.getHeatIntelligence(params, options);
  }

  /**
   * Optional Premium: Satellite
   */
  public async getSatellite(
    params: FortyGuardSatelliteRequest,
    options: OrchestratorOptions = {}
  ): Promise<SatelliteThermalResult> {
    if (!this.primaryProvider.getSatellite) {
      throw new Error('Satellite capability is not implemented by current provider');
    }
    return this.primaryProvider.getSatellite(params, options);
  }

  /**
   * Optional Premium: Streetview
   */
  public async getStreetview(
    params: FortyGuardStreetviewRequest,
    options: OrchestratorOptions = {}
  ): Promise<StreetviewMicroclimateResult> {
    if (!this.primaryProvider.getStreetview) {
      throw new Error('Streetview capability is not implemented by current provider');
    }
    return this.primaryProvider.getStreetview(params, options);
  }

  public getCacheStats() {
    return {
      entriesCount: this.cache.size(),
      inFlightCount: this.deduplicator.inFlightCount(),
    };
  }

  public clearCache() {
    this.cache.clear();
  }
}

export const globalDataOrchestrator = new DataOrchestrator();
