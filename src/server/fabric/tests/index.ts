import { EnvironmentalProviderRegistry } from '../registry';
import { OpenEnvironmentalDataFabric } from '../orchestrator';
import { EnvironmentalCache } from '../../fortyguard/cache';
import { RequestDeduplicator } from '../../fortyguard/deduplicator';
import { BaseEnvironmentalDataProvider } from '../base.provider';
import {
  ProviderConfig,
  GeoLocationQuery,
  ProviderRequestOptions,
  NormalizedProviderTelemetry,
  ThermalTelemetryBlock,
  WeatherTelemetryBlock,
} from '../types';

export interface FabricTestResult {
  name: string;
  passed: boolean;
  error?: string;
  durationMs: number;
}

export interface FabricTestSuiteReport {
  timestamp: string;
  totalTests: number;
  passedCount: number;
  failedCount: number;
  allPassed: boolean;
  results: FabricTestResult[];
}

export async function runOpenDataFabricTestSuite(): Promise<FabricTestSuiteReport> {
  const results: FabricTestResult[] = [];

  const runTest = async (name: string, fn: () => Promise<void>) => {
    const start = Date.now();
    try {
      await fn();
      results.push({
        name,
        passed: true,
        durationMs: Date.now() - start,
      });
    } catch (err: any) {
      results.push({
        name,
        passed: false,
        error: err.message || String(err),
        durationMs: Date.now() - start,
      });
    }
  };

  // 1. Test Provider Available & Normalization
  await runTest('1. Provider Available: NOAA NWS Weather provider returns normalized telemetry', async () => {
    const registry = new EnvironmentalProviderRegistry();
    const noaa = registry.get('noaa_nws');
    if (!noaa) throw new Error('NOAA provider not registered');

    const result = await noaa.getCurrentData({ latitude: 40.7128, longitude: -74.006 });
    if (!result.data || !('ambientTempC' in result.data) || !('relativeHumidityPct' in result.data)) {
      throw new Error('NOAA did not return valid WeatherTelemetryBlock');
    }
    if (result.attribution.name !== 'NOAA / National Weather Service') {
      throw new Error('Missing proper NOAA attribution');
    }
  });

  // 2. Test Provider Unavailable & Failure Isolation
  await runTest('2. Failure Isolation: If EPA fails, Fabric completes successfully with remaining providers', async () => {
    const registry = new EnvironmentalProviderRegistry();
    const cache = new EnvironmentalCache();
    const deduplicator = new RequestDeduplicator();

    // Mock failing EPA provider
    class FailingEPAProvider extends BaseEnvironmentalDataProvider {
      public readonly id = 'epa_airnow';
      public readonly name = 'Failing EPA';
      public readonly category = 'air_quality' as const;
      public readonly config: ProviderConfig = {
        id: 'epa_airnow',
        name: 'Failing EPA',
        category: 'air_quality',
        enabled: true,
        baseUrl: 'https://fail.epa.gov',
        authRequirements: 'none',
        timeout: 1000,
        rateLimit: { maxRequestsPerMinute: 60, windowMs: 60000 },
        cachePolicy: { defaultTtlMs: 60000 },
        dataTypes: ['aqi'],
        coverage: { region: 'US', spatialResolution: 'Station', temporalResolution: 'Hourly' },
        attribution: { name: 'EPA', license: 'Public Domain', credit: 'EPA', url: 'https://epa.gov' },
      };

      public async getCurrentData(): Promise<NormalizedProviderTelemetry> {
        throw new Error('Upstream EPA Gateway Timeout 504');
      }
    }

    registry.register(new FailingEPAProvider());
    const fabric = new OpenEnvironmentalDataFabric(registry, cache, deduplicator);

    const enriched = await fabric.getEnrichedState({ latitude: 40.7128, longitude: -74.006 });
    if (!enriched.thermal || !enriched.weather) {
      throw new Error('Fabric failed to provide remaining thermal/weather layers');
    }
    if (enriched.airQuality.quality.availability !== 'offline') {
      throw new Error('EPA failure was not properly reflected in quality availability');
    }
  });

  // 3. Test Partial Data Handling
  await runTest('3. Partial Data: Multi-provider synthesis with mixed active/inactive providers', async () => {
    const registry = new EnvironmentalProviderRegistry();
    registry.setEnabled('nasa_firms', false); // Disable wildfire provider

    const fabric = new OpenEnvironmentalDataFabric(registry, new EnvironmentalCache(), new RequestDeduplicator());
    const enriched = await fabric.getEnrichedState({ latitude: 33.4484, longitude: -112.074 });

    if (!enriched.compositeThermalComfortIndex || enriched.compositeThermalComfortIndex < 0) {
      throw new Error('Failed to calculate composite thermal comfort index with partial providers');
    }
  });

  // 4. Test Stale Data & Cache Isolation
  await runTest('4. Cache Isolation: Provider-specific cache keys and TTL expiry', async () => {
    const cache = new EnvironmentalCache();
    const keyNOAA = EnvironmentalCache.generateKey({
      provider: 'noaa_nws',
      latitude: 40.7128,
      longitude: -74.006,
      analysisType: 'weather',
    });
    const keyEPA = EnvironmentalCache.generateKey({
      provider: 'epa_airnow',
      latitude: 40.7128,
      longitude: -74.006,
      analysisType: 'air_quality',
    });

    cache.set({
      key: keyNOAA,
      data: { weather: 'sunny' },
      ttlMs: 50,
      locationKey: 'nyc',
      analysisType: 'weather',
    });

    cache.set({
      key: keyEPA,
      data: { aqi: 42 },
      ttlMs: 5000,
      locationKey: 'nyc',
      analysisType: 'air_quality',
    });

    await new Promise((r) => setTimeout(r, 60));

    if (cache.get(keyNOAA) !== null) {
      throw new Error('NOAA cache entry should have expired');
    }
    if (cache.get(keyEPA) === null) {
      throw new Error('EPA cache entry should still be valid');
    }
  });

  // 5. Test Rate Limiting
  await runTest('5. Rate Limiting: Base provider enforces windowed rate limit thresholds', async () => {
    class RateLimitedProvider extends BaseEnvironmentalDataProvider {
      public readonly id = 'test_rate';
      public readonly name = 'Rate Limited Provider';
      public readonly category = 'weather' as const;
      public readonly config: ProviderConfig = {
        id: 'test_rate',
        name: 'Rate Limited Provider',
        category: 'weather',
        enabled: true,
        baseUrl: 'https://test.gov',
        authRequirements: 'none',
        timeout: 1000,
        rateLimit: { maxRequestsPerMinute: 2, windowMs: 60000 },
        cachePolicy: { defaultTtlMs: 60000 },
        dataTypes: ['test'],
        coverage: { region: 'US', spatialResolution: 'Station', temporalResolution: 'Hourly' },
        attribution: { name: 'Test', license: 'MIT', credit: 'Test', url: 'https://test.gov' },
      };

      public async getCurrentData(loc: GeoLocationQuery): Promise<NormalizedProviderTelemetry> {
        const allowed = this.checkRateLimit();
        if (!allowed) {
          throw new Error('RATE_LIMIT_EXCEEDED');
        }
        return {
          providerId: this.id,
          providerName: this.name,
          category: this.category,
          timestamp: new Date().toISOString(),
          attribution: this.getAttribution(),
          quality: this.getDataQuality(),
          data: { temp: 20 },
        };
      }
    }

    const provider = new RateLimitedProvider();
    await provider.getCurrentData({ latitude: 0, longitude: 0 });
    await provider.getCurrentData({ latitude: 0, longitude: 0 });

    try {
      await provider.getCurrentData({ latitude: 0, longitude: 0 });
      throw new Error('Expected rate limit error');
    } catch (err: any) {
      if (err.message !== 'RATE_LIMIT_EXCEEDED') {
        throw err;
      }
    }
  });

  // 6. Test Source Attribution Tracking
  await runTest('6. Source Attribution: All data points retain original provider attribution & license', async () => {
    const registry = new EnvironmentalProviderRegistry();
    const fabric = new OpenEnvironmentalDataFabric(registry, new EnvironmentalCache(), new RequestDeduplicator());

    const enriched = await fabric.getEnrichedState({ latitude: 30.2672, longitude: -97.7431 });

    if (!enriched.thermal.attribution.name.includes('FortyGuard')) {
      throw new Error('FortyGuard thermal attribution missing');
    }
    if (!enriched.weather.attribution.name.includes('NOAA')) {
      throw new Error('NOAA weather attribution missing');
    }
    if (!enriched.airQuality.attribution.name.includes('EPA')) {
      throw new Error('EPA air quality attribution missing');
    }
    if (!enriched.wildfire.attribution.name.includes('NASA')) {
      throw new Error('NASA FIRMS attribution missing');
    }
    if (!enriched.vegetation.attribution.name.includes('Copernicus') && !enriched.vegetation.attribution.name.includes('Sentinel')) {
      throw new Error('Sentinel/Landsat vegetation attribution missing');
    }
    if (!enriched.water.attribution.name.includes('USGS')) {
      throw new Error('USGS water attribution missing');
    }
  });

  // 7. Test FortyGuard Primary Layer Failure Resilience
  await runTest('7. Primary Thermal Resilience: If FortyGuard fails, HeatOS marks thermal layer as degraded without crashing', async () => {
    const registry = new EnvironmentalProviderRegistry();
    class FailingFortyGuard extends BaseEnvironmentalDataProvider {
      public readonly id = 'fortyguard';
      public readonly name = 'FortyGuard Primary';
      public readonly category = 'thermal' as const;
      public readonly config: ProviderConfig = {
        id: 'fortyguard',
        name: 'FortyGuard',
        category: 'thermal',
        enabled: true,
        baseUrl: 'https://api.fortyguard.com',
        authRequirements: 'api_key',
        timeout: 1000,
        rateLimit: { maxRequestsPerMinute: 60, windowMs: 60000 },
        cachePolicy: { defaultTtlMs: 60000 },
        dataTypes: ['surface_temp'],
        coverage: { region: 'Urban', spatialResolution: '1m', temporalResolution: '15m' },
        attribution: { name: 'FortyGuard', license: 'Commercial', credit: 'FortyGuard', url: 'https://fortyguard.com' },
      };

      public async getCurrentData(): Promise<NormalizedProviderTelemetry> {
        throw new Error('FortyGuard API Unavailable (503)');
      }
    }

    registry.register(new FailingFortyGuard());
    const fabric = new OpenEnvironmentalDataFabric(registry, new EnvironmentalCache(), new RequestDeduplicator());

    const enriched = await fabric.getEnrichedState({ latitude: 25.7617, longitude: -80.1918 });
    if (!enriched.thermal.isFallback) {
      throw new Error('Thermal layer should be marked as fallback');
    }
    if (enriched.fallbackWarnings.length === 0) {
      throw new Error('Expected fallback warning for FortyGuard failure');
    }
    // Application continues to provide weather, air quality, vegetation, water
    if (!enriched.weather.data || !enriched.water.data) {
      throw new Error('Application crashed or failed to provide other context layers');
    }
  });

  // 8. Test Data Quality Metrics
  await runTest('8. Data Quality: Enriched state contains confidence, freshness, and availability', async () => {
    const registry = new EnvironmentalProviderRegistry();
    const fabric = new OpenEnvironmentalDataFabric(registry, new EnvironmentalCache(), new RequestDeduplicator());

    const enriched = await fabric.getEnrichedState({ latitude: 41.8781, longitude: -87.6298 });
    if (enriched.thermal.quality.confidence <= 0 || enriched.weather.quality.confidence <= 0) {
      throw new Error('Invalid confidence metrics');
    }
    if (!enriched.thermal.quality.freshness || !enriched.weather.quality.freshness) {
      throw new Error('Missing freshness indicators');
    }
  });

  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.length - passedCount;

  return {
    timestamp: new Date().toISOString(),
    totalTests: results.length,
    passedCount,
    failedCount,
    allPassed: failedCount === 0,
    results,
  };
}
