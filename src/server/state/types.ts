/**
 * HeatOS Phase 4: Unified Environmental State
 * Core Type Definitions & Interfaces
 * 
 * Single Source of Truth for all downstream HeatOS Intelligence
 */

export type FreshnessClassification = 'LIVE' | 'RECENT' | 'STALE' | 'UNKNOWN';
export type FieldAvailabilityStatus = 'AVAILABLE' | 'UNAVAILABLE' | 'DEGRADED';
export type ResolutionType = 'POINT_MESH_1M' | 'GRID_10M' | 'GRID_100M' | 'STATION_RADIUS' | 'SYNOPTIC_GRID_2_5KM' | 'SATELLITE_10M_30M' | 'REGIONAL_WATERSHED';

/**
 * Conflict Record tracking when two or more upstream sources disagree
 */
export interface ConflictRecord {
  field: string;
  primarySource: string;
  conflictingSource: string;
  primaryValue: any;
  conflictingValue: any;
  variance: number;
  unit: string;
  resolutionRule: string;
  resolvedValue: any;
  timestamp: string;
}

/**
 * Generic Provenanced Value wrapping every discrete measurement
 */
export interface ProvenancedValue<T> {
  value: T | null;
  unit?: string;
  source: string;
  sourceName: string;
  timestamp: string;
  freshness: FreshnessClassification;
  confidence: number; // 0 - 100
  spatialResolution: string;
  status: FieldAvailabilityStatus;
  isEstimate?: boolean;
  notes?: string;
  conflict?: ConflictRecord;
}

/**
 * Location State representation with Spatial Normalization
 */
export interface LocationState {
  latitude: number;
  longitude: number;
  locationName: string;
  stateCode?: string;
  countryCode?: string;
  boundingBox?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  gridCellId?: string;
  geoJson?: {
    type: 'Point' | 'Polygon';
    coordinates: any;
  };
  elevationMeters?: ProvenancedValue<number>;
}

/**
 * Temperature & Thermal State
 */
export interface TemperatureState {
  ambient: ProvenancedValue<number>; // Celsius
  surface: ProvenancedValue<number>; // Celsius
  feelsLike: ProvenancedValue<number>; // Celsius
  heatIndex: ProvenancedValue<number>; // Celsius (calculated / observed)
  wetBulb: ProvenancedValue<number>; // Celsius (Stull psychrometric calculation)
  surfaceHeatAnomaly: ProvenancedValue<number>; // Delta Celsius above background
  urbanHeatIslandIntensity: ProvenancedValue<number>; // UHI intensity delta C
  thermalRiskScore: ProvenancedValue<number>; // 0 - 100
  thermalComfortIndex: ProvenancedValue<number>; // 0 - 100
}

/**
 * Atmospheric & Humidity State
 */
export interface HumidityState {
  relativeHumidity: ProvenancedValue<number>; // Percentage 0 - 100
  dewPoint: ProvenancedValue<number>; // Celsius
  vaporPressureHpa?: ProvenancedValue<number>; // hPa
}

/**
 * Wind & Airflow State
 */
export interface WindState {
  speedKmh: ProvenancedValue<number>;
  directionDeg: ProvenancedValue<number>;
  gustKmh: ProvenancedValue<number>;
  coolingWindEffectFactor: ProvenancedValue<number>; // 0 - 1.0 multiplier
}

/**
 * Precipitation State
 */
export interface PrecipitationState {
  chancePct: ProvenancedValue<number>;
  intensityMmPerHour: ProvenancedValue<number>;
  precipitationType: ProvenancedValue<'none' | 'rain' | 'drizzle' | 'thunderstorm' | 'snow' | 'hail'>;
}

/**
 * Cloud Cover & Solar Attenuation
 */
export interface CloudCoverState {
  percentage: ProvenancedValue<number>;
  conditionSummary: ProvenancedValue<string>;
  solarAttenuationPct: ProvenancedValue<number>;
}

/**
 * Solar Radiation State
 */
export interface SolarState {
  irradianceWm2: ProvenancedValue<number>; // Watts per square meter
  uvIndex: ProvenancedValue<number>; // 0 - 12+
  directNormalIrradianceWm2?: ProvenancedValue<number>;
  insolationExposureScore: ProvenancedValue<number>; // 0 - 100
}

/**
 * Air Quality State
 */
export interface AirQualityState {
  aqi: ProvenancedValue<number>; // 0 - 500
  pm25: ProvenancedValue<number>; // ug/m3
  pm10: ProvenancedValue<number>; // ug/m3
  ozonePpb: ProvenancedValue<number>; // ppb
  no2Ppb: ProvenancedValue<number>; // ppb
  category: ProvenancedValue<'Good' | 'Moderate' | 'Unhealthy for Sensitive Groups' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous'>;
  primaryPollutant: ProvenancedValue<string>;
  healthGuideline: ProvenancedValue<string>;
}

/**
 * Hydrology & Water State
 */
export interface WaterState {
  streamflowStatus: ProvenancedValue<'low' | 'normal' | 'high' | 'flood_warning'>;
  relativeSoilMoisturePct: ProvenancedValue<number>; // 0 - 100
  droughtSeverityIndex: ProvenancedValue<string>;
  evaporativeCoolingPotential: ProvenancedValue<'High' | 'Moderate' | 'Constrained'>;
  nearestGageDistanceKm?: ProvenancedValue<number>;
}

/**
 * Wildfire & Smoke State
 */
export interface FireState {
  activeHotspotsCountInRadius: ProvenancedValue<number>;
  nearestFireDistanceKm: ProvenancedValue<number>;
  fireRadiativePowerMw: ProvenancedValue<number>;
  wildfireRiskLevel: ProvenancedValue<'low' | 'moderate' | 'high' | 'extreme'>;
  smokePlumeRisk: ProvenancedValue<'clear' | 'light' | 'moderate' | 'heavy'>;
}

/**
 * Vegetation & Canopy State
 */
export interface VegetationState {
  ndvi: ProvenancedValue<number>; // -1.0 to +1.0
  evi?: ProvenancedValue<number>;
  canopyCoveragePct: ProvenancedValue<number>; // 0 - 100
  coolingBufferFactor: ProvenancedValue<number>; // 0 - 1.0
  urbanGreeningStatus: ProvenancedValue<'sparse' | 'moderate' | 'dense' | 'canopy_rich'>;
}

/**
 * Land Cover & Surface Composition State
 */
export interface LandCoverState {
  dominantSurfaceType: ProvenancedValue<'asphalt' | 'concrete' | 'turf' | 'tree_canopy' | 'water_body' | 'bare_soil' | 'mixed_urban'>;
  albedo: ProvenancedValue<number>; // 0.0 - 1.0
  imperviousSurfacePct: ProvenancedValue<number>; // 0 - 100
  heatRetentionIndex: ProvenancedValue<number>; // 0 - 100
}

/**
 * Aligned Forecast Interval
 */
export interface ForecastIntervalState {
  timestamp: string;
  temperatureC: ProvenancedValue<number>;
  feelsLikeC: ProvenancedValue<number>;
  humidityPct: ProvenancedValue<number>;
  windSpeedKmh: ProvenancedValue<number>;
  precipitationChancePct: ProvenancedValue<number>;
  uvIndex?: ProvenancedValue<number>;
  conditionSummary: ProvenancedValue<string>;
  thermalComfortScore: ProvenancedValue<number>;
}

/**
 * Temporal Alignment Metadata
 */
export interface TemporalAlignmentMetadata {
  referenceTime: string;
  oldestObservationTime: string;
  newestObservationTime: string;
  maxDivergenceMinutes: number;
  temporalStatus: 'ALIGNED' | 'ACCEPTABLE_WINDOW' | 'MISMATCHED_WINDOW';
}

/**
 * Spatial Alignment Metadata
 */
export interface SpatialAlignmentMetadata {
  targetLatitude: number;
  targetLongitude: number;
  maxObservationDistanceKm: number;
  mixedSpatialResolutions: string[];
  spatialConsistencyStatus: 'CO_LOCATED' | 'INTERPOLATED' | 'REGIONAL_APPROXIMATION';
}

/**
 * Confidence Breakdown
 */
export interface StateConfidenceBreakdown {
  overallScore: number; // 0 - 100
  sourceQualityScore: number;
  freshnessScore: number;
  completenessScore: number;
  agreementScore: number;
  spatialCompatibilityScore: number;
  temporalCompatibilityScore: number;
  degradationReasons: string[];
}

/**
 * Source Summary in Unified State
 */
export interface ContributingSourceSummary {
  sourceId: string;
  sourceName: string;
  role: 'PRIMARY_THERMAL' | 'SYNOPTIC_WEATHER' | 'AIR_QUALITY' | 'EARTH_OBSERVATION' | 'HYDROLOGY' | 'WILDFIRE';
  status: 'ACTIVE' | 'DEGRADED' | 'UNAVAILABLE';
  freshness: FreshnessClassification;
  fieldsContributedCount: number;
  license: string;
  attributionUrl: string;
}

/**
 * MASTER UNIFIED ENVIRONMENTAL STATE
 * The single source of truth for all of HeatOS
 */
export interface EnvironmentalState {
  stateId: string;
  schemaVersion: '4.0.0';
  timestamp: string; // ISO 8601 aligned reference time
  
  // Spatial context
  location: LocationState;

  // Measurement dimensions (Strongly typed with provenance)
  temperature: TemperatureState;
  humidity: HumidityState;
  wind: WindState;
  precipitation: PrecipitationState;
  cloudCover: CloudCoverState;
  solar: SolarState;
  airQuality: AirQualityState;
  water: WaterState;
  fire: FireState;
  vegetation: VegetationState;
  landCover: LandCoverState;

  // Forecast time series
  forecast: ForecastIntervalState[];

  // Data Fabric Meta & Provenance
  temporalAlignment: TemporalAlignmentMetadata;
  spatialAlignment: SpatialAlignmentMetadata;
  confidence: StateConfidenceBreakdown;
  sources: ContributingSourceSummary[];
  conflicts: ConflictRecord[];
  missingFields: string[];
}

/**
 * Options for Requesting an Environmental Snapshot
 */
export interface SnapshotQueryOptions {
  referenceTime?: string;
  bypassCache?: boolean;
  spatialRadiusMeters?: number;
  requestId?: string;
}

/**
 * Options for Historical Snapshot Query
 */
export interface HistoricalSnapshotOptions extends SnapshotQueryOptions {
  startTime: string; // ISO 8601
  endTime: string;   // ISO 8601
  intervalHours?: number; // default 1 or 3
}

/**
 * Historical Environmental Snapshot Response
 */
export interface HistoricalEnvironmentalSnapshot {
  location: LocationState;
  period: {
    startTime: string;
    endTime: string;
    intervalHours: number;
    snapshotCount: number;
  };
  snapshots: EnvironmentalState[];
  summary: {
    maxTemperatureC: number;
    minTemperatureC: number;
    avgTemperatureC: number;
    maxHeatAnomalyC: number;
    dominantRiskLevel: string;
    overallConfidenceAvg: number;
  };
}
