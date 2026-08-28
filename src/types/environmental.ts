/**
 * Normalized Environmental State & FortyGuard Data Fabric Types
 */

export type FreshnessType = 'live' | 'cached' | 'demo';
export type ProviderSource = 'fortyguard' | 'fortyguard_mock' | 'system';

export interface GeoLocation {
  lat: number;
  lng: number;
  name?: string;
  address?: string;
  boundingBox?: [number, number, number, number]; // [minLat, minLng, maxLat, maxLng]
}

export interface TemperatureData {
  ambient: number;
  apparent: number;
  surface?: number;
  min?: number;
  max?: number;
  unit: 'C';
}

export interface WindData {
  speedKmh: number;
  directionDeg: number;
  gustKmh?: number;
}

export interface AirQualityData {
  aqi: number;
  pm25: number;
  pm10?: number;
  o3?: number;
  no2?: number;
  co?: number;
  so2?: number;
}

export interface GreenhouseGasesData {
  co2Ppm?: number;
  ch4Ppb?: number;
}

export interface SolarData {
  irradianceWm2: number;
  uvIndex: number;
  directNormalWm2?: number;
}

export interface PrecipitationData {
  probability: number; // 0-100%
  intensityMmPerHour?: number;
}

export interface ThermalRiskData {
  score: number; // 0-100
  level: 'low' | 'moderate' | 'high' | 'extreme';
  anomalyDeltaC: number;
}

export interface CanopyData {
  coveragePercentage?: number;
  vegetativeIndex?: number;
}

export interface EnvironmentalForecastPoint {
  timestamp: string; // ISO-8601
  temperature: number;
  surfaceTemp?: number;
  heatIndex?: number;
  humidity?: number;
  aqi?: number;
  solarIrradiance?: number;
}

/**
 * Normalized Environmental State
 * HeatOS standard model for environmental and microclimate data
 */
export interface EnvironmentalState {
  location: GeoLocation;
  timestamp: string; // ISO-8601
  temperature: TemperatureData;
  feelsLike: number;
  heatIndex: number;
  wetBulbTemperature: number;
  humidity: number;
  precipitation: PrecipitationData;
  cloudCover: number; // 0-100%
  wind: WindData;
  airQuality: AirQualityData;
  greenhouseGases?: GreenhouseGasesData;
  solar: SolarData;
  thermalRisk: ThermalRiskData;
  canopy?: CanopyData;
  forecast: EnvironmentalForecastPoint[] | null;
  source: ProviderSource;
  freshness: FreshnessType;
  dataAge: number; // in milliseconds
  activityId?: string;
  warning?: string;
}

/**
 * Normalized Heatmap Data
 */
export interface HeatmapGridPoint {
  lat: number;
  lng: number;
  surfaceTemp: number;
  heatAnomaly: number;
  canopyCover?: number;
  elevationMeters?: number;
}

export interface HeatmapStatistics {
  min: number;
  max: number;
  mean: number;
  stdDev: number;
  unit: 'C';
}

export interface HeatmapData {
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  resolution: string;
  grid: HeatmapGridPoint[];
  statistics: HeatmapStatistics;
  source: ProviderSource;
  freshness: FreshnessType;
  timestamp: string;
  activityId?: string;
}

/**
 * Premium Capabilities Results
 */
export interface HeatIntelligenceResult {
  activityId: string;
  location: GeoLocation;
  urbanHeatIslandScore: number; // 0-100
  albedoIndex: number; // 0-1
  thermalStorageCapacity: string;
  vulnerabilityIndex: number; // 0-100
  mitigationImpactScore: number;
  coolingCapacityEstimateKW: number;
  recommendedInterventions: string[];
  timestamp: string;
  source: ProviderSource;
  freshness: FreshnessType;
}

export interface SatelliteThermalResult {
  activityId: string;
  location: GeoLocation;
  bandType: string;
  resolutionMeters: number;
  radianceWm2Sr: number;
  surfaceEmissivity: number;
  landSurfaceTemperature: number;
  cloudFreePercentage: number;
  imageryTimestamp: string;
  source: ProviderSource;
  freshness: FreshnessType;
}

export interface StreetviewMicroclimateResult {
  activityId: string;
  location: GeoLocation;
  skyViewFactor: number; // 0-1
  meanRadiantTemperature: number;
  pedestrianComfortZone: 'comfortable' | 'slight_stress' | 'moderate_stress' | 'extreme_stress';
  solarShadingPercentage: number;
  asphaltFraction: number;
  vegetationFraction: number;
  timestamp: string;
  source: ProviderSource;
  freshness: FreshnessType;
}

// --------------------------------------------------------------------
// Open Environmental Data Fabric Types (Phase 3)
// --------------------------------------------------------------------

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

export interface ProviderAttribution {
  name: string;
  license: string;
  credit: string;
  url: string;
  requiredNotice?: string;
}

export interface ProviderCoverage {
  region: string;
  spatialResolution: string;
  temporalResolution: string;
}

export interface DataQualityMetrics {
  freshness: DataFreshness;
  confidence: number; // 0 - 100
  availability: ProviderAvailability;
  quality: DataQualityLevel;
  latencyMs?: number;
  lastUpdated: string;
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

export interface ProviderConfigInfo {
  id: string;
  name: string;
  category: ProviderCategory;
  enabled: boolean;
  baseUrl: string;
  authRequirements: AuthRequirement;
  timeout: number;
  rateLimit: { maxRequestsPerMinute: number; windowMs: number };
  cachePolicy: { defaultTtlMs: number; staleWhileRevalidateMs?: number };
  dataTypes: string[];
  coverage: ProviderCoverage;
  attribution: ProviderAttribution;
  health?: ProviderHealthStatus;
}

export interface ThermalTelemetryBlock {
  ambientTempC: number;
  apparentTempC: number;
  surfaceTempC: number;
  surfaceHeatAnomalyC: number;
  thermalRiskScore: number;
  thermalRiskLevel: 'low' | 'moderate' | 'high' | 'extreme';
  urbanHeatIslandIntensityC: number;
  thermalComfortIndex: number;
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
  activeAlerts?: Array<{ event: string; severity: string; description: string }>;
}

export interface AirQualityTelemetryBlock {
  aqi: number;
  aqiCategory: 'Good' | 'Moderate' | 'Unhealthy for Sensitive Groups' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous';
  pm25: number;
  pm10?: number;
  ozonePpb?: number;
  no2Ppb?: number;
  coPpm?: number;
  primaryPollutant: string;
  healthGuideline: string;
}

export interface WildfireTelemetryBlock {
  activeFiresCountInRadius: number;
  nearestFireDistanceKm?: number;
  fireRadiativePowerMw?: number;
  wildfireRiskLevel: 'low' | 'moderate' | 'high' | 'extreme';
  smokePlumeRisk: 'clear' | 'light' | 'moderate' | 'heavy';
  detectionSensor: string;
}

export interface VegetationTelemetryBlock {
  ndvi: number;
  evi?: number;
  canopyCoveragePct: number;
  coolingBufferFactor: number;
  urbanGreeningStatus: 'sparse' | 'moderate' | 'dense' | 'canopy_rich';
  sensorPlatform: string;
}

export interface WaterTelemetryBlock {
  droughtSeverityIndex: string;
  streamflowStatus: 'low' | 'normal' | 'high' | 'flood_warning';
  relativeSoilMoisturePct: number;
  evaporativeCoolingPotential: 'High' | 'Moderate' | 'Constrained';
  gageLocation?: string;
}

export interface EnrichedEnvironmentalState {
  location: {
    latitude: number;
    longitude: number;
    locationName?: string;
  };
  timestamp: string;
  compositeThermalComfortIndex: number;
  overallStatus: 'optimal' | 'moderate' | 'warning' | 'critical';
  thermal: {
    source: string;
    data: ThermalTelemetryBlock;
    attribution: ProviderAttribution;
    quality: DataQualityMetrics;
    isFallback?: boolean;
  };
  weather: {
    source: string;
    data: WeatherTelemetryBlock;
    forecast?: Array<{
      timestamp: string;
      temperatureC?: number;
      apparentTempC?: number;
      humidityPct?: number;
      windSpeedKmh?: number;
      precipitationChancePct?: number;
      summary?: string;
    }>;
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

