/**
 * HeatOS Open Environmental Data Fabric
 * Core Type Definitions & Provider Interfaces
 */

export type ProviderCategory =
  | 'thermal'
  | 'weather'
  | 'air_quality'
  | 'wildfire'
  | 'satellite_vegetation'
  | 'water';

export type AuthRequirement = 'none' | 'api_key' | 'bearer_token' | 'user_agent';

export type DataFreshness = 'live' | 'cached' | 'demo' | 'fallback';

export type DataQualityLevel = 'high' | 'medium' | 'estimated' | 'synthetic';

export type ProviderAvailability = 'online' | 'degraded' | 'offline';

export interface GeoLocationQuery {
  latitude: number;
  longitude: number;
  locationName?: string;
  stateCode?: string;
  countryCode?: string;
}

export interface SpatialBoundsQuery {
  north: number;
  south: number;
  east: number;
  west: number;
  resolutionMeters?: number;
}

export interface ProviderRequestOptions {
  bypassCache?: boolean;
  signal?: AbortSignal;
  requestId?: string;
  startDate?: string;
  endDate?: string;
}

export interface ProviderAttribution {
  name: string;
  license: string;
  credit: string;
  url: string;
  requiredNotice?: string;
}

export interface ProviderCoverage {
  region: string; // e.g. "US National", "Global", "Urban Mesh"
  spatialResolution: string; // e.g. "1m - 10m", "1km", "Station / Point"
  temporalResolution: string; // e.g. "Hourly", "Real-time / 15m", "Daily"
}

export interface ProviderRateLimitConfig {
  maxRequestsPerMinute: number;
  windowMs: number;
}

export interface ProviderCachePolicy {
  defaultTtlMs: number;
  staleWhileRevalidateMs?: number;
}

export interface ProviderConfig {
  id: string;
  name: string;
  category: ProviderCategory;
  enabled: boolean;
  baseUrl: string;
  authRequirements: AuthRequirement;
  timeout: number;
  rateLimit: ProviderRateLimitConfig;
  cachePolicy: ProviderCachePolicy;
  dataTypes: string[];
  coverage: ProviderCoverage;
  attribution: ProviderAttribution;
}

export interface DataQualityMetrics {
  freshness: DataFreshness;
  confidence: number; // 0 - 100
  availability: ProviderAvailability;
  quality: DataQualityLevel;
  latencyMs?: number;
  lastUpdated: string; // ISO-8601
}

export interface ProviderHealthStatus {
  providerId: string;
  name: string;
  category: ProviderCategory;
  status: ProviderAvailability;
  latencyMs: number;
  lastCheck: string;
  message?: string;
  error?: string;
}

/**
 * Normalized Telemetry Blocks from specific provider categories
 */

export interface ThermalTelemetryBlock {
  ambientTempC: number;
  apparentTempC: number;
  surfaceTempC: number;
  surfaceHeatAnomalyC: number;
  thermalRiskScore: number; // 0 - 100
  thermalRiskLevel: 'low' | 'moderate' | 'high' | 'extreme';
  urbanHeatIslandIntensityC: number;
  thermalComfortIndex: number; // 0 - 100
}

export interface WeatherTelemetryBlock {
  ambientTempC: number;
  apparentTempC: number;
  dewPointC: number;
  relativeHumidityPct: number;
  barometricPressureHpa: number;
  windSpeedKmh: number;
  windDirectionDeg: number;
  windGustKmh?: number;
  cloudCoverPct: number;
  precipitationChancePct: number;
  weatherCondition: string;
  weatherIcon?: string;
  activeAlerts?: Array<{
    event: string;
    severity: string;
    description: string;
  }>;
}

export interface AirQualityTelemetryBlock {
  aqi: number;
  aqiCategory: 'Good' | 'Moderate' | 'Unhealthy for Sensitive Groups' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous';
  pm25: number; // µg/m³
  pm10?: number; // µg/m³
  ozonePpb?: number;
  no2Ppb?: number;
  coPpm?: number;
  primaryPollutant: string;
  healthGuideline: string;
}

export interface WildfireTelemetryBlock {
  activeFiresCountInRadius: number; // e.g. within 50km
  nearestFireDistanceKm?: number;
  fireRadiativePowerMw?: number;
  wildfireRiskLevel: 'low' | 'moderate' | 'high' | 'extreme';
  smokePlumeRisk: 'clear' | 'light' | 'moderate' | 'heavy';
  detectionSensor: string;
}

export interface VegetationTelemetryBlock {
  ndvi: number; // -1.0 to 1.0 (vegetation density)
  evi?: number; // Enhanced Vegetation Index
  canopyCoveragePct: number;
  coolingBufferFactor: number; // 0.0 - 1.0
  urbanGreeningStatus: 'sparse' | 'moderate' | 'dense' | 'canopy_rich';
  sensorPlatform: string;
}

export interface WaterTelemetryBlock {
  droughtSeverityIndex: string; // e.g. "Normal", "D0", "D1", "D2", "D3", "D4"
  streamflowStatus: 'low' | 'normal' | 'high' | 'flood_warning';
  relativeSoilMoisturePct: number;
  evaporativeCoolingPotential: 'High' | 'Moderate' | 'Constrained';
  gageLocation?: string;
}

export interface NormalizedProviderTelemetry {
  providerId: string;
  providerName: string;
  category: ProviderCategory;
  timestamp: string;
  attribution: ProviderAttribution;
  quality: DataQualityMetrics;
  data:
    | ThermalTelemetryBlock
    | WeatherTelemetryBlock
    | AirQualityTelemetryBlock
    | WildfireTelemetryBlock
    | VegetationTelemetryBlock
    | WaterTelemetryBlock
    | Record<string, any>;
  raw?: any;
}

export interface ProviderForecastPoint {
  timestamp: string;
  temperatureC?: number;
  apparentTempC?: number;
  humidityPct?: number;
  windSpeedKmh?: number;
  precipitationChancePct?: number;
  aqi?: number;
  summary?: string;
}

export interface ProviderSpatialFeature {
  id: string;
  lat: number;
  lng: number;
  value: number;
  properties: Record<string, any>;
}

/**
 * The Master Environmental Data Provider Interface
 * All HeatOS environmental sources (FortyGuard + Open Data) implement this interface.
 */
export interface IEnvironmentalDataProvider {
  readonly id: string;
  readonly name: string;
  readonly category: ProviderCategory;
  readonly config: ProviderConfig;

  getCurrentData(
    location: GeoLocationQuery,
    options?: ProviderRequestOptions
  ): Promise<NormalizedProviderTelemetry>;

  getHistoricalData?(
    location: GeoLocationQuery,
    options?: ProviderRequestOptions
  ): Promise<NormalizedProviderTelemetry[]>;

  getForecastData?(
    location: GeoLocationQuery,
    options?: ProviderRequestOptions
  ): Promise<ProviderForecastPoint[]>;

  getSpatialData?(
    query: SpatialBoundsQuery,
    options?: ProviderRequestOptions
  ): Promise<ProviderSpatialFeature[]>;

  getHealth(): Promise<ProviderHealthStatus>;
  getAttribution(): ProviderAttribution;
  getDataQuality(): DataQualityMetrics;
}

/**
 * Enriched Environmental State Model
 * Produced by the Open Environmental Data Fabric combining FortyGuard + Open Data
 */
export interface EnrichedEnvironmentalState {
  location: GeoLocationQuery;
  timestamp: string;
  compositeThermalComfortIndex: number; // Holistic score (0-100)
  overallStatus: 'optimal' | 'moderate' | 'warning' | 'critical';
  
  // Core Thermal Intelligence (FortyGuard)
  thermal: {
    source: string;
    data: ThermalTelemetryBlock;
    attribution: ProviderAttribution;
    quality: DataQualityMetrics;
    isFallback?: boolean;
  };

  // Environmental Context Layers (Open Data)
  weather: {
    source: string;
    data: WeatherTelemetryBlock;
    forecast?: ProviderForecastPoint[];
    attribution: ProviderAttribution;
    quality: DataQualityMetrics;
  };

  airQuality: {
    source: string;
    data: AirQualityTelemetryBlock;
    attribution: ProviderAttribution;
    quality: DataQualityMetrics;
  };

  wildfire: {
    source: string;
    data: WildfireTelemetryBlock;
    attribution: ProviderAttribution;
    quality: DataQualityMetrics;
  };

  vegetation: {
    source: string;
    data: VegetationTelemetryBlock;
    attribution: ProviderAttribution;
    quality: DataQualityMetrics;
  };

  water: {
    source: string;
    data: WaterTelemetryBlock;
    attribution: ProviderAttribution;
    quality: DataQualityMetrics;
  };

  // Providers metadata
  activeProviders: Array<{
    id: string;
    name: string;
    category: ProviderCategory;
    status: ProviderAvailability;
    freshness: DataFreshness;
    confidence: number;
    attribution: ProviderAttribution;
    latencyMs: number;
  }>;

  fallbackWarnings: string[];
}
