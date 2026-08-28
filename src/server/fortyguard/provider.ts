import { 
  FortyGuardConfig, 
  FortyGuardEnvParamsRequest, 
  FortyGuardHeatmapRequest, 
  FortyGuardHeatIntelligenceRequest, 
  FortyGuardSatelliteRequest, 
  FortyGuardStreetviewRequest,
  FortyGuardEnvParamsRawResult,
  FortyGuardHeatmapRawResult,
  FortyGuardHeatIntelligenceRawResult,
  FortyGuardSatelliteRawResult,
  FortyGuardStreetviewRawResult
} from './types';
import { FORTYGUARD_ENDPOINTS } from './endpoints';
import { FortyGuardClient } from './client';
import { pollFortyGuardActivity } from './poller';
import { FortyGuardError } from './errors';
import { FortyGuardLogger } from './logger';
import { setFortyGuardAuthFailure } from './config';
import {
  normalizeEnvironmentalParams,
  normalizeHeatmap,
  normalizeHeatIntelligence,
  normalizeSatellite,
  normalizeStreetview,
} from './normalizer';

import {
  EnvironmentalState,
  HeatmapData,
  HeatIntelligenceResult,
  SatelliteThermalResult,
  StreetviewMicroclimateResult,
} from '../../types/environmental';

export interface IEnvironmentalProvider {
  getEnvironmentalParameters(params: FortyGuardEnvParamsRequest, options?: { signal?: AbortSignal; requestId?: string }): Promise<EnvironmentalState>;
  getHeatmap(params: FortyGuardHeatmapRequest, options?: { signal?: AbortSignal; requestId?: string }): Promise<HeatmapData>;
  getHeatIntelligence(params: FortyGuardHeatIntelligenceRequest, options?: { signal?: AbortSignal; requestId?: string }): Promise<HeatIntelligenceResult>;
  getSatellite(params: FortyGuardSatelliteRequest, options?: { signal?: AbortSignal; requestId?: string }): Promise<SatelliteThermalResult>;
  getStreetview(params: FortyGuardStreetviewRequest, options?: { signal?: AbortSignal; requestId?: string }): Promise<StreetviewMicroclimateResult>;
}

export class FortyGuardProvider implements IEnvironmentalProvider {
  private client: FortyGuardClient;
  private config: FortyGuardConfig;
  private authFailureDetected: boolean = false;

  constructor(config: FortyGuardConfig) {
    this.config = config;
    this.client = new FortyGuardClient(config);
  }

  public getConfig(): FortyGuardConfig {
    return { ...this.config };
  }

  public async getEnvironmentalParameters(
    params: FortyGuardEnvParamsRequest,
    options: { signal?: AbortSignal; requestId?: string } = {}
  ): Promise<EnvironmentalState> {
    const requestId = options.requestId || `env_${Date.now()}`;

    try {
      const submission = await this.client.submitAsyncTask(
        FORTYGUARD_ENDPOINTS.ENV_PARAMS,
        {
          latitude: params.latitude,
          longitude: params.longitude,
          start_date: params.start_date,
          end_date: params.end_date,
        },
        { signal: options.signal, requestId }
      );

      const rawResult = await pollFortyGuardActivity<FortyGuardEnvParamsRawResult>(
        submission.activity_id,
        this.client,
        {
          pollIntervalMs: this.config.pollInterval,
          maxPollTimeMs: this.config.maxPollTime,
          signal: options.signal,
          requestId,
        }
      );

      this.authFailureDetected = false;
      setFortyGuardAuthFailure(false);

      return normalizeEnvironmentalParams(rawResult, {
        activityId: submission.activity_id,
        source: 'fortyguard',
        freshness: 'live',
        dataAge: 0,
      });
    } catch (err: any) {
      if (err instanceof FortyGuardError && err.statusCode === 401) {
        this.authFailureDetected = true;
        setFortyGuardAuthFailure(true);
      }
      throw err;
    }
  }

  public async getHeatmap(
    params: FortyGuardHeatmapRequest,
    options: { signal?: AbortSignal; requestId?: string } = {}
  ): Promise<HeatmapData> {
    const requestId = options.requestId || `heat_${Date.now()}`;

    try {
      const submission = await this.client.submitAsyncTask(
        FORTYGUARD_ENDPOINTS.HEATMAP,
        {
          geojson: params.geojson,
          bounds: params.bounds,
          resolution: params.resolution || '10m',
          target_parameter: params.target_parameter || 'surface_heat',
          date_time: params.date_time,
        },
        { signal: options.signal, requestId }
      );

      const rawResult = await pollFortyGuardActivity<FortyGuardHeatmapRawResult>(
        submission.activity_id,
        this.client,
        {
          pollIntervalMs: this.config.pollInterval,
          maxPollTimeMs: this.config.maxPollTime,
          signal: options.signal,
          requestId,
        }
      );

      return normalizeHeatmap(rawResult, {
        activityId: submission.activity_id,
        source: 'fortyguard',
        freshness: 'live',
      });
    } catch (err: any) {
      if (err instanceof FortyGuardError && err.statusCode === 401) {
        this.authFailureDetected = true;
      }
      throw err;
    }
  }

  public async getHeatIntelligence(
    params: FortyGuardHeatIntelligenceRequest,
    options: { signal?: AbortSignal; requestId?: string } = {}
  ): Promise<HeatIntelligenceResult> {
    const requestId = options.requestId || `intel_${Date.now()}`;

    try {
      const submission = await this.client.submitAsyncTask(
        FORTYGUARD_ENDPOINTS.HEAT_INTELLIGENCE,
        {
          latitude: params.latitude,
          longitude: params.longitude,
          district_name: params.district_name,
          radius_meters: params.radius_meters || 1000,
        },
        { signal: options.signal, requestId }
      );

      const raw = await pollFortyGuardActivity<FortyGuardHeatIntelligenceRawResult>(
        submission.activity_id,
        this.client,
        {
          pollIntervalMs: this.config.pollInterval,
          maxPollTimeMs: this.config.maxPollTime,
          signal: options.signal,
          requestId,
        }
      );

      return normalizeHeatIntelligence(raw, {
        activityId: submission.activity_id,
        source: 'fortyguard',
        freshness: 'live',
      });
    } catch (err: any) {
      throw err;
    }
  }

  public async getSatellite(
    params: FortyGuardSatelliteRequest,
    options: { signal?: AbortSignal; requestId?: string } = {}
  ): Promise<SatelliteThermalResult> {
    const requestId = options.requestId || `sat_${Date.now()}`;

    try {
      const submission = await this.client.submitAsyncTask(
        FORTYGUARD_ENDPOINTS.SATELLITE,
        {
          latitude: params.latitude,
          longitude: params.longitude,
          band: params.band || 'thermal_ir',
        },
        { signal: options.signal, requestId }
      );

      const raw = await pollFortyGuardActivity<FortyGuardSatelliteRawResult>(
        submission.activity_id,
        this.client,
        {
          pollIntervalMs: this.config.pollInterval,
          maxPollTimeMs: this.config.maxPollTime,
          signal: options.signal,
          requestId,
        }
      );

      return normalizeSatellite(raw, {
        activityId: submission.activity_id,
        source: 'fortyguard',
        freshness: 'live',
      });
    } catch (err: any) {
      throw err;
    }
  }

  public async getStreetview(
    params: FortyGuardStreetviewRequest,
    options: { signal?: AbortSignal; requestId?: string } = {}
  ): Promise<StreetviewMicroclimateResult> {
    const requestId = options.requestId || `sv_${Date.now()}`;

    try {
      const submission = await this.client.submitAsyncTask(
        FORTYGUARD_ENDPOINTS.STREETVIEW,
        {
          latitude: params.latitude,
          longitude: params.longitude,
          heading: params.heading,
          pitch: params.pitch,
        },
        { signal: options.signal, requestId }
      );

      const raw = await pollFortyGuardActivity<FortyGuardStreetviewRawResult>(
        submission.activity_id,
        this.client,
        {
          pollIntervalMs: this.config.pollInterval,
          maxPollTimeMs: this.config.maxPollTime,
          signal: options.signal,
          requestId,
        }
      );

      return normalizeStreetview(raw, {
        activityId: submission.activity_id,
        source: 'fortyguard',
        freshness: 'live',
      });
    } catch (err: any) {
      throw err;
    }
  }

  public async getActivityStatus(activityId: string) {
    return this.client.getActivityStatus(activityId);
  }
}
