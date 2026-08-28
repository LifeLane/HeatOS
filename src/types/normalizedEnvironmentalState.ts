/**
 * HeatOS: Normalized Environmental State Model
 * 
 * Single source of truth for all HeatOS views (Dashboard, Weather, Forecast, Navigation, Alerts, Tools).
 * Fully provenanced, resilient, with clear domain separation.
 */

export type ConnectionHealthStatus = 'LIVE' | 'CACHED' | 'SYNCING' | 'DEGRADED' | 'OFFLINE';

export interface MetricProvenance {
  metricKey: string;
  metricLabel: string;
  sourceId: string;
  sourceName: string;
  institution: string;
  freshness: 'LIVE' | 'CACHED' | 'ESTIMATED' | 'SYNTHESIZED';
  confidence: number; // 0 - 100
  spatialResolution: string;
  timestamp: string;
  isEstimate?: boolean;
  notes?: string;
}

export interface ProvenancedMetric<T> {
  value: T;
  unit?: string;
  provenance: MetricProvenance;
}

export interface CurrentConditions {
  temperature: ProvenancedMetric<number>; // °C
  feelsLike: ProvenancedMetric<number>; // °C
  humidity: ProvenancedMetric<number>; // %
  dewPoint: ProvenancedMetric<number>; // °C
  wind: ProvenancedMetric<{
    speedKmh: number;
    directionDeg: number;
    directionCardinal: string;
    gustKmh: number;
    coolingEffectFactor: number;
  }>;
  precipitation: ProvenancedMetric<{
    chancePct: number;
    intensityMmPerHour: number;
    type: 'none' | 'rain' | 'drizzle' | 'thunderstorm' | 'snow' | 'hail';
  }>;
  pressureHpa: ProvenancedMetric<number>; // hPa (e.g. 1013.25)
  heatIndex: ProvenancedMetric<number>; // °C
  wetBulb: ProvenancedMetric<number>; // °C
  solarIrradiance: ProvenancedMetric<number>; // W/m²
  uvIndex: ProvenancedMetric<number>; // 0 - 12+
  airQuality: ProvenancedMetric<{
    aqi: number;
    pm25: number;
    pm10: number;
    category: 'Good' | 'Moderate' | 'Unhealthy for Sensitive Groups' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous';
    primaryPollutant: string;
    healthGuideline: string;
  }>;
  conditionSummary: string;
  cloudCoverPct: number;
}

export interface EnvironmentalPulseSummary {
  score: number; // 0 - 100
  status: 'optimal' | 'stable' | 'moderate' | 'warning' | 'critical';
  label: string;
  trend: 'improving' | 'stable' | 'degrading';
  dimensions: {
    heat: { score: number; status: string; summary: string; isAvailable: boolean };
    air: { score: number; status: string; summary: string; isAvailable: boolean };
    water: { score: number; status: string; summary: string; isAvailable: boolean };
    nature: { score: number; status: string; summary: string; isAvailable: boolean };
    fire: { score: number; status: string; summary: string; isAvailable: boolean };
    solar: { score: number; status: string; summary: string; isAvailable: boolean };
  };
  keyAlerts: string[];
  vitalitySummary: string;
}

export interface SpatialThermalMetrics {
  provider: string; // "FortyGuard Spatial Thermal Engine"
  resolution: string; // "1m - 10m Micro-Spatial Mesh"
  surfaceTemp: ProvenancedMetric<number>; // °C
  surfaceHeatAnomaly: ProvenancedMetric<number>; // Delta °C above background
  uhiIntensity: ProvenancedMetric<number>; // Delta °C
  thermalRiskScore: ProvenancedMetric<number>; // 0 - 100
  thermalComfortIndex: ProvenancedMetric<number>; // 0 - 100
  canopyCoveragePct: ProvenancedMetric<number>; // %
  activeSensors: number;
  activeZones: number;
  gridCellId?: string;
  elevation?: string;
  nearestHotspot?: {
    distanceMeters: number;
    intensityDeltaC: number;
  };
}

export interface NormalizedForecastInterval {
  timestamp: string; // ISO 8601
  timeLabel: string; // e.g. "12:00", "Tomorrow"
  temperatureC: number;
  feelsLikeC: number;
  humidityPct: number;
  windSpeedKmh: number;
  precipitationChancePct: number;
  uvIndex: number;
  conditionSummary: string;
  uhiAnomalyC: number;
  riskLevel: 'Low' | 'Moderate' | 'Elevated' | 'Peak High' | 'Extreme';
  canopyBuffer: string;
}

export interface EnvironmentalAlertItem {
  id: string;
  title: string;
  category: 'THERMAL' | 'ATMOSPHERIC' | 'ECOLOGICAL' | 'COMPOUND' | 'QUALITY';
  severity: 'CRITICAL' | 'HIGH' | 'ELEVATED' | 'WATCH' | 'INFO';
  confidence: number;
  source: string;
  sourceName: string;
  timestamp: string;
  description: string;
  recommendedAction?: string;
}

export interface EnvironmentalStateMetadata {
  location: {
    id: string;
    name: string;
    state?: string;
    country?: string;
    displayName: string;
    coordinates: { lat: number; lng: number };
    climateZone?: string;
    elevation?: string;
  };
  timestamps: {
    observedAt: string;
    syncedAt: string;
    dataAgeMs: number;
  };
  connectionStatus: ConnectionHealthStatus;
  statusLabel: string; // e.g. "LIVE", "CACHED · 2m", "SYNC DELAY", "OFFLINE · LAST SYNC 4m"
  isCached: boolean;
  isDegraded: boolean;
  isOffline: boolean;
  lastSuccessfulSyncIso: string;
  lastSuccessfulSyncHuman: string; // e.g. "Just now", "2m ago"
  latencyMs: number;
  confidenceScore: number; // 0 - 100
  sources: Array<{
    id: string;
    name: string;
    category: string;
    role: string;
    status: 'ACTIVE' | 'DEGRADED' | 'UNAVAILABLE';
    freshness: string;
    license?: string;
  }>;
  provenanceMap: Record<string, MetricProvenance>;
}

export interface NormalizedEnvironmentalState {
  currentConditions: CurrentConditions;
  environmentalPulse: EnvironmentalPulseSummary;
  spatialMetrics: SpatialThermalMetrics;
  forecast: NormalizedForecastInterval[];
  alerts: EnvironmentalAlertItem[];
  metadata: EnvironmentalStateMetadata;
}
