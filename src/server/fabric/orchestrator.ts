import {
  EnrichedEnvironmentalState,
  GeoLocationQuery,
  ProviderRequestOptions,
  ThermalTelemetryBlock,
  WeatherTelemetryBlock,
  AirQualityTelemetryBlock,
  WildfireTelemetryBlock,
  VegetationTelemetryBlock,
  WaterTelemetryBlock,
  DataQualityMetrics,
} from './types';
import { EnvironmentalProviderRegistry, globalProviderRegistry } from './registry';
import { EnvironmentalCache, globalEnvironmentalCache } from '../fortyguard/cache';
import { RequestDeduplicator, globalRequestDeduplicator } from '../fortyguard/deduplicator';
import { FortyGuardLogger } from '../fortyguard/logger';

export class OpenEnvironmentalDataFabric {
  private registry: EnvironmentalProviderRegistry;
  private cache: EnvironmentalCache;
  private deduplicator: RequestDeduplicator;

  constructor(
    registry = globalProviderRegistry,
    cache = globalEnvironmentalCache,
    deduplicator = globalRequestDeduplicator
  ) {
    this.registry = registry;
    this.cache = cache;
    this.deduplicator = deduplicator;
  }

  /**
   * Retrieves enriched multi-layer environmental intelligence for a location.
   * Dispatches requests in parallel with full failure isolation across FortyGuard and Open Data providers.
   */
  public async getEnrichedState(
    location: GeoLocationQuery,
    options: ProviderRequestOptions = {}
  ): Promise<EnrichedEnvironmentalState> {
    const requestId = options.requestId || `fabric_enriched_${Date.now()}`;
    const startTime = Date.now();

    FortyGuardLogger.info('Initiating Open Environmental Data Fabric synthesis', {
      requestId,
      lat: location.latitude,
      lng: location.longitude,
    });

    // 1. Resolve active providers
    const fgProvider = this.registry.get('fortyguard');
    const noaaProvider = this.registry.get('noaa_nws');
    const epaProvider = this.registry.get('purple_air') || this.registry.get('epa_airnow');
    const firmsProvider = this.registry.get('nasa_eonet') || this.registry.get('nasa_firms');
    const satProvider = this.registry.get('satellite_vegetation');
    const usgsProvider = this.registry.get('usgs_water');

    const warnings: string[] = [];

    // 2. Query all providers in parallel using Promise.allSettled for complete failure isolation
    const [fgRes, noaaRes, epaRes, firmsRes, satRes, usgsRes, noaaForecastRes] = await Promise.allSettled([
      fgProvider ? this.fetchWithCache(fgProvider, location, options, 'thermal') : Promise.reject(new Error('FortyGuard provider disabled')),
      noaaProvider ? this.fetchWithCache(noaaProvider, location, options, 'weather') : Promise.reject(new Error('NOAA provider disabled')),
      epaProvider ? this.fetchWithCache(epaProvider, location, options, 'air_quality') : Promise.reject(new Error('EPA provider disabled')),
      firmsProvider ? this.fetchWithCache(firmsProvider, location, options, 'wildfire') : Promise.reject(new Error('NASA FIRMS provider disabled')),
      satProvider ? this.fetchWithCache(satProvider, location, options, 'satellite_vegetation') : Promise.reject(new Error('Satellite provider disabled')),
      usgsProvider ? this.fetchWithCache(usgsProvider, location, options, 'water') : Promise.reject(new Error('USGS provider disabled')),
      noaaProvider?.getForecastData ? noaaProvider.getForecastData(location, options) : Promise.resolve([]),
    ]);

    // 3. Process FortyGuard Thermal Layer
    let thermalData: ThermalTelemetryBlock;
    let thermalAttribution = fgProvider?.getAttribution() || {
      name: 'FortyGuard',
      license: 'FortyGuard Commercial License',
      credit: 'FortyGuard Inc.',
      url: 'https://fortyguard.com',
    };
    let thermalQuality: DataQualityMetrics;
    let isThermalFallback = false;

    if (fgRes.status === 'fulfilled') {
      thermalData = fgRes.value.data as ThermalTelemetryBlock;
      thermalAttribution = fgRes.value.attribution;
      thermalQuality = fgRes.value.quality;
      isThermalFallback = fgRes.value.quality.freshness === 'fallback';
      if (isThermalFallback) {
        warnings.push('Core FortyGuard thermal layer running in calibrated fallback mode.');
      }
    } else {
      isThermalFallback = true;
      warnings.push(`FortyGuard thermal layer unavailable: ${fgRes.reason?.message || 'Connection timeout'}. Application operational.`);
      thermalData = {
        ambientTempC: 24.5,
        apparentTempC: 26.0,
        surfaceTempC: 27.5,
        surfaceHeatAnomalyC: 1.5,
        thermalRiskScore: 40,
        thermalRiskLevel: 'moderate',
        urbanHeatIslandIntensityC: 1.5,
        thermalComfortIndex: 70,
      };
      thermalQuality = {
        freshness: 'fallback',
        confidence: 60,
        availability: 'offline',
        quality: 'estimated',
        lastUpdated: new Date().toISOString(),
      };
    }

    // 4. Process NOAA Weather Layer
    let weatherData: WeatherTelemetryBlock;
    let weatherAttribution = noaaProvider?.getAttribution() || {
      name: 'NOAA / NWS',
      license: 'Public Domain',
      credit: 'NOAA',
      url: 'https://weather.gov',
    };
    let weatherQuality: DataQualityMetrics;

    if (noaaRes.status === 'fulfilled') {
      weatherData = noaaRes.value.data as WeatherTelemetryBlock;
      weatherAttribution = noaaRes.value.attribution;
      weatherQuality = noaaRes.value.quality;
    } else {
      warnings.push(`NOAA weather context unavailable: ${noaaRes.reason?.message || 'Error'}`);
      weatherData = {
        ambientTempC: thermalData.ambientTempC,
        apparentTempC: thermalData.apparentTempC,
        dewPointC: 14.0,
        relativeHumidityPct: 54,
        barometricPressureHpa: 1013.25,
        windSpeedKmh: 12.0,
        windDirectionDeg: 180,
        cloudCoverPct: 30,
        precipitationChancePct: 10,
        weatherCondition: 'Clear & Stable (Model)',
      };
      weatherQuality = {
        freshness: 'fallback',
        confidence: 60,
        availability: 'offline',
        quality: 'estimated',
        lastUpdated: new Date().toISOString(),
      };
    }

    const forecast = noaaForecastRes.status === 'fulfilled' ? noaaForecastRes.value : [];

    // 5. Process EPA Air Quality Layer
    let airData: AirQualityTelemetryBlock;
    let airAttribution = epaProvider?.getAttribution() || {
      name: 'EPA AirNow',
      license: 'Public Domain',
      credit: 'EPA',
      url: 'https://airnow.gov',
    };
    let airQuality: DataQualityMetrics;

    if (epaRes.status === 'fulfilled') {
      airData = epaRes.value.data as AirQualityTelemetryBlock;
      airAttribution = epaRes.value.attribution;
      airQuality = epaRes.value.quality;
    } else {
      warnings.push(`EPA Air Quality context unavailable: ${epaRes.reason?.message || 'Error'}`);
      airData = {
        aqi: 38,
        aqiCategory: 'Good',
        pm25: 9.1,
        pm10: 16.0,
        primaryPollutant: 'PM2.5',
        healthGuideline: 'Air quality is satisfactory.',
      };
      airQuality = {
        freshness: 'fallback',
        confidence: 60,
        availability: 'offline',
        quality: 'estimated',
        lastUpdated: new Date().toISOString(),
      };
    }

    // 6. Process NASA FIRMS Wildfire Layer
    let wildfireData: WildfireTelemetryBlock;
    let wildfireAttribution = firmsProvider?.getAttribution() || {
      name: 'NASA FIRMS',
      license: 'Public Domain',
      credit: 'NASA',
      url: 'https://firms.modaps.eosdis.nasa.gov',
    };
    let wildfireQuality: DataQualityMetrics;

    if (firmsRes.status === 'fulfilled') {
      wildfireData = firmsRes.value.data as WildfireTelemetryBlock;
      wildfireAttribution = firmsRes.value.attribution;
      wildfireQuality = firmsRes.value.quality;
    } else {
      wildfireData = {
        activeFiresCountInRadius: 0,
        wildfireRiskLevel: 'low',
        smokePlumeRisk: 'clear',
        detectionSensor: 'NASA FIRMS (Standby)',
      };
      wildfireQuality = {
        freshness: 'fallback',
        confidence: 60,
        availability: 'offline',
        quality: 'estimated',
        lastUpdated: new Date().toISOString(),
      };
    }

    // 7. Process Open Satellite Vegetation Layer
    let vegData: VegetationTelemetryBlock;
    let vegAttribution = satProvider?.getAttribution() || {
      name: 'Copernicus Sentinel-2 & USGS Landsat',
      license: 'CC-BY',
      credit: 'ESA & USGS',
      url: 'https://sentinels.copernicus.eu',
    };
    let vegQuality: DataQualityMetrics;

    if (satRes.status === 'fulfilled') {
      vegData = satRes.value.data as VegetationTelemetryBlock;
      vegAttribution = satRes.value.attribution;
      vegQuality = satRes.value.quality;
    } else {
      vegData = {
        ndvi: 0.38,
        canopyCoveragePct: 22,
        coolingBufferFactor: 0.45,
        urbanGreeningStatus: 'moderate',
        sensorPlatform: 'Satellite Earth Observation (Standby)',
      };
      vegQuality = {
        freshness: 'fallback',
        confidence: 60,
        availability: 'offline',
        quality: 'estimated',
        lastUpdated: new Date().toISOString(),
      };
    }

    // 8. Process USGS Water Layer
    let waterData: WaterTelemetryBlock;
    let waterAttribution = usgsProvider?.getAttribution() || {
      name: 'USGS Water Services',
      license: 'Public Domain',
      credit: 'USGS',
      url: 'https://waterservices.usgs.gov',
    };
    let waterQuality: DataQualityMetrics;

    if (usgsRes.status === 'fulfilled') {
      waterData = usgsRes.value.data as WaterTelemetryBlock;
      waterAttribution = usgsRes.value.attribution;
      waterQuality = usgsRes.value.quality;
    } else {
      waterData = {
        droughtSeverityIndex: 'Normal',
        streamflowStatus: 'normal',
        relativeSoilMoisturePct: 50,
        evaporativeCoolingPotential: 'Moderate',
      };
      waterQuality = {
        freshness: 'fallback',
        confidence: 60,
        availability: 'offline',
        quality: 'estimated',
        lastUpdated: new Date().toISOString(),
      };
    }

    // 9. Composite Thermal Comfort Index Calculation
    // Multi-factor weighted synthesis:
    // 45% FortyGuard Thermal Anomaly + 25% NOAA Temp/Humidity Index + 15% EPA AQI Impact + 15% Satellite/USGS Cooling Buffer
    const thermalPenalty = thermalData.thermalRiskScore * 0.45;
    const humidityPenalty = Math.max(0, weatherData.relativeHumidityPct - 60) * 0.3;
    const aqiPenalty = Math.max(0, airData.aqi - 50) * 0.2;
    const coolingBonus = (vegData.coolingBufferFactor * 10) + (waterData.relativeSoilMoisturePct > 40 ? 5 : 0);

    const compositeScore = Math.max(
      10,
      Math.min(100, Math.round(100 - thermalPenalty - humidityPenalty - aqiPenalty + coolingBonus))
    );

    const overallStatus: 'optimal' | 'moderate' | 'warning' | 'critical' =
      compositeScore >= 75
        ? 'optimal'
        : compositeScore >= 55
        ? 'moderate'
        : compositeScore >= 35
        ? 'warning'
        : 'critical';

    // 10. Compile active providers array
    const activeProviders = [
      {
        id: fgProvider?.id || 'fortyguard',
        name: fgProvider?.name || 'FortyGuard Thermal Fabric',
        category: 'thermal' as const,
        status: thermalQuality.availability,
        freshness: thermalQuality.freshness,
        confidence: thermalQuality.confidence,
        attribution: thermalAttribution,
        latencyMs: thermalQuality.latencyMs || 0,
      },
      {
        id: noaaProvider?.id || 'noaa_nws',
        name: noaaProvider?.name || 'NOAA National Weather Service',
        category: 'weather' as const,
        status: weatherQuality.availability,
        freshness: weatherQuality.freshness,
        confidence: weatherQuality.confidence,
        attribution: weatherAttribution,
        latencyMs: weatherQuality.latencyMs || 0,
      },
      {
        id: epaProvider?.id || 'epa_airnow',
        name: epaProvider?.name || 'EPA AirNow',
        category: 'air_quality' as const,
        status: airQuality.availability,
        freshness: airQuality.freshness,
        confidence: airQuality.confidence,
        attribution: airAttribution,
        latencyMs: airQuality.latencyMs || 0,
      },
      {
        id: firmsProvider?.id || 'nasa_firms',
        name: firmsProvider?.name || 'NASA FIRMS Wildfire',
        category: 'wildfire' as const,
        status: wildfireQuality.availability,
        freshness: wildfireQuality.freshness,
        confidence: wildfireQuality.confidence,
        attribution: wildfireAttribution,
        latencyMs: wildfireQuality.latencyMs || 0,
      },
      {
        id: satProvider?.id || 'satellite_vegetation',
        name: satProvider?.name || 'Open Satellite Vegetation (NDVI)',
        category: 'satellite_vegetation' as const,
        status: vegQuality.availability,
        freshness: vegQuality.freshness,
        confidence: vegQuality.confidence,
        attribution: vegAttribution,
        latencyMs: vegQuality.latencyMs || 0,
      },
      {
        id: usgsProvider?.id || 'usgs_water',
        name: usgsProvider?.name || 'USGS Water Information',
        category: 'water' as const,
        status: waterQuality.availability,
        freshness: waterQuality.freshness,
        confidence: waterQuality.confidence,
        attribution: waterAttribution,
        latencyMs: waterQuality.latencyMs || 0,
      },
    ];

    const totalDuration = Date.now() - startTime;
    FortyGuardLogger.info('Synthesized Open Environmental Data Fabric successfully', {
      requestId,
      totalDurationMs: totalDuration,
      activeProviderCount: activeProviders.length,
      compositeScore,
      overallStatus,
    });

    return {
      location,
      timestamp: new Date().toISOString(),
      compositeThermalComfortIndex: compositeScore,
      overallStatus,
      thermal: {
        source: 'fortyguard',
        data: thermalData,
        attribution: thermalAttribution,
        quality: thermalQuality,
        isFallback: isThermalFallback,
      },
      weather: {
        source: 'noaa_nws',
        data: weatherData,
        forecast,
        attribution: weatherAttribution,
        quality: weatherQuality,
      },
      airQuality: {
        source: 'epa_airnow',
        data: airData,
        attribution: airAttribution,
        quality: airQuality,
      },
      wildfire: {
        source: 'nasa_firms',
        data: wildfireData,
        attribution: wildfireAttribution,
        quality: wildfireQuality,
      },
      vegetation: {
        source: 'satellite_vegetation',
        data: vegData,
        attribution: vegAttribution,
        quality: vegQuality,
      },
      water: {
        source: 'usgs_water',
        data: waterData,
        attribution: waterAttribution,
        quality: waterQuality,
      },
      activeProviders,
      fallbackWarnings: warnings,
    };
  }

  /**
   * Safe fetch with provider-specific caching and in-flight deduplication
   */
  private async fetchWithCache(
    provider: any,
    location: GeoLocationQuery,
    options: ProviderRequestOptions,
    analysisType: string
  ) {
    const cacheKey = EnvironmentalCache.generateKey({
      provider: provider.id,
      latitude: location.latitude,
      longitude: location.longitude,
      analysisType,
    });

    // 1. Cache Check
    if (!options.bypassCache) {
      const cached = this.cache.get<any>(cacheKey);
      if (cached) {
        return {
          ...cached.data,
          quality: {
            ...cached.data.quality,
            freshness: 'cached',
          },
        };
      }
    }

    // 2. In-flight Deduplication & Execution
    const { result } = await this.deduplicator.execute(cacheKey, async () => {
      return provider.getCurrentData(location, options);
    });

    // 3. Cache Result
    this.cache.set({
      key: cacheKey,
      data: result,
      ttlMs: provider.config.cachePolicy.defaultTtlMs,
      locationKey: `${location.latitude.toFixed(4)}_${location.longitude.toFixed(4)}`,
      analysisType,
    });

    return result;
  }
}

export const globalOpenDataFabric = new OpenEnvironmentalDataFabric();
