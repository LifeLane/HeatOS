import {
  EnvironmentalState,
  HeatmapData,
  HeatIntelligenceResult,
  SatelliteThermalResult,
  StreetviewMicroclimateResult,
} from '../../types/environmental';
import {
  FortyGuardEnvParamsRawResult,
  FortyGuardHeatmapRawResult,
  FortyGuardHeatIntelligenceRawResult,
  FortyGuardSatelliteRawResult,
  FortyGuardStreetviewRawResult,
} from './types';

/**
 * Normalizes raw FortyGuard env_params response into standard HeatOS EnvironmentalState
 */
export function normalizeEnvironmentalParams(
  raw: FortyGuardEnvParamsRawResult,
  meta: {
    activityId?: string;
    source?: 'fortyguard' | 'fortyguard_mock';
    freshness?: 'live' | 'cached' | 'demo';
    dataAge?: number;
  } = {}
): EnvironmentalState {
  const source = meta.source || 'fortyguard';
  const freshness = meta.freshness || 'live';
  const dataAge = meta.dataAge || 0;

  // Preserve forecast timeseries timestamps accurately
  const forecast = raw.time_series_data
    ? raw.time_series_data.map((point) => ({
        timestamp: point.timestamp,
        temperature: point.ambient_temp_c,
        surfaceTemp: point.surface_temp_c,
        heatIndex: point.heat_index_c,
        humidity: point.humidity_percent,
        aqi: point.aqi,
        solarIrradiance: point.solar_wm2,
      }))
    : null;

  // Determine thermal risk score and level
  const anomaly = raw.urban_heat_island_anomaly_c ?? 0;
  const temp = raw.ambient_temperature_c;
  const thermalScore = Math.min(
    100,
    Math.max(0, Math.round((Math.max(0, anomaly) / 8) * 50 + (Math.max(0, temp - 15) / 30) * 50))
  );
  const thermalLevel: 'low' | 'moderate' | 'high' | 'extreme' =
    thermalScore > 75 ? 'extreme' : thermalScore > 55 ? 'high' : thermalScore > 35 ? 'moderate' : 'low';

  return {
    location: {
      lat: raw.location.lat,
      lng: raw.location.lng,
    },
    timestamp: raw.timestamp || new Date().toISOString(),
    temperature: {
      ambient: raw.ambient_temperature_c,
      apparent: raw.apparent_temperature_c,
      surface: raw.surface_temperature_c,
      unit: 'C',
    },
    feelsLike: raw.apparent_temperature_c,
    heatIndex: raw.heat_index_c,
    wetBulbTemperature: raw.wet_bulb_temperature_c,
    humidity: raw.relative_humidity_percent,
    precipitation: {
      probability: raw.precipitation_probability_percent,
      intensityMmPerHour: raw.precipitation_mm_hr,
    },
    cloudCover: raw.cloud_cover_percent,
    wind: {
      speedKmh: raw.wind_speed_kmh,
      directionDeg: raw.wind_direction_deg,
      gustKmh: raw.wind_gust_kmh,
    },
    airQuality: {
      aqi: raw.aqi,
      pm25: raw.pm25_ugm3,
      pm10: raw.pm10_ugm3,
    },
    greenhouseGases: raw.co2_ppm !== undefined ? { co2Ppm: raw.co2_ppm } : undefined,
    solar: {
      irradianceWm2: raw.solar_irradiance_wm2,
      uvIndex: raw.uv_index,
    },
    thermalRisk: {
      score: thermalScore,
      level: thermalLevel,
      anomalyDeltaC: anomaly,
    },
    canopy:
      raw.canopy_cover_percent !== undefined
        ? { coveragePercentage: raw.canopy_cover_percent }
        : undefined,
    forecast,
    source,
    freshness,
    dataAge,
    activityId: meta.activityId,
  };
}

/**
 * Normalizes raw FortyGuard heatmap response
 */
export function normalizeHeatmap(
  raw: FortyGuardHeatmapRawResult,
  meta: {
    activityId?: string;
    source?: 'fortyguard' | 'fortyguard_mock';
    freshness?: 'live' | 'cached' | 'demo';
  } = {}
): HeatmapData {
  return {
    bounds: raw.bounds,
    resolution: raw.resolution || '10m',
    grid: raw.grid.map((p) => ({
      lat: p.lat,
      lng: p.lng,
      surfaceTemp: p.surface_temp_c,
      heatAnomaly: p.heat_anomaly_c,
      canopyCover: p.canopy_percent,
      elevationMeters: p.elevation_m,
    })),
    statistics: {
      min: raw.statistics.min,
      max: raw.statistics.max,
      mean: raw.statistics.mean,
      stdDev: raw.statistics.std_dev,
      unit: 'C',
    },
    source: meta.source || 'fortyguard',
    freshness: meta.freshness || 'live',
    timestamp: raw.timestamp || new Date().toISOString(),
    activityId: meta.activityId,
  };
}

/**
 * Normalizes raw FortyGuard heat intelligence response
 */
export function normalizeHeatIntelligence(
  raw: FortyGuardHeatIntelligenceRawResult,
  meta: {
    activityId?: string;
    source?: 'fortyguard' | 'fortyguard_mock';
    freshness?: 'live' | 'cached' | 'demo';
  } = {}
): HeatIntelligenceResult {
  return {
    activityId: meta.activityId || '',
    location: { lat: raw.latitude, lng: raw.longitude },
    urbanHeatIslandScore: raw.uhi_index,
    albedoIndex: raw.surface_albedo,
    thermalStorageCapacity: raw.thermal_mass_rating,
    vulnerabilityIndex: raw.vulnerability_score,
    mitigationImpactScore: raw.mitigation_potential,
    coolingCapacityEstimateKW: raw.cooling_capacity_kw,
    recommendedInterventions: raw.prescribed_actions || [],
    timestamp: raw.analyzed_at || new Date().toISOString(),
    source: meta.source || 'fortyguard',
    freshness: meta.freshness || 'live',
  };
}

/**
 * Normalizes raw FortyGuard satellite response
 */
export function normalizeSatellite(
  raw: FortyGuardSatelliteRawResult,
  meta: {
    activityId?: string;
    source?: 'fortyguard' | 'fortyguard_mock';
    freshness?: 'live' | 'cached' | 'demo';
  } = {}
): SatelliteThermalResult {
  return {
    activityId: meta.activityId || '',
    location: { lat: raw.latitude, lng: raw.longitude },
    bandType: raw.band,
    resolutionMeters: raw.resolution_meters,
    radianceWm2Sr: raw.radiance,
    surfaceEmissivity: raw.emissivity,
    landSurfaceTemperature: raw.lst_c,
    cloudFreePercentage: raw.cloud_free_pct,
    imageryTimestamp: raw.captured_at || new Date().toISOString(),
    source: meta.source || 'fortyguard',
    freshness: meta.freshness || 'live',
  };
}

/**
 * Normalizes raw FortyGuard streetview response
 */
export function normalizeStreetview(
  raw: FortyGuardStreetviewRawResult,
  meta: {
    activityId?: string;
    source?: 'fortyguard' | 'fortyguard_mock';
    freshness?: 'live' | 'cached' | 'demo';
  } = {}
): StreetviewMicroclimateResult {
  return {
    activityId: meta.activityId || '',
    location: { lat: raw.latitude, lng: raw.longitude },
    skyViewFactor: raw.svf,
    meanRadiantTemperature: raw.mrt_c,
    pedestrianComfortZone: raw.pedestrian_stress,
    solarShadingPercentage: raw.shading_pct,
    asphaltFraction: raw.asphalt_pct,
    vegetationFraction: raw.vegetation_pct,
    timestamp: raw.measured_at || new Date().toISOString(),
    source: meta.source || 'fortyguard',
    freshness: meta.freshness || 'live',
  };
}
