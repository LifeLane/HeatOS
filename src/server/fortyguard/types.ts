/**
 * FortyGuard Low-Level Protocol & Raw API Types
 */

export interface FortyGuardConfig {
  baseUrl: string;
  apiKey?: string;
  timeout: number; // in ms
  pollInterval: number; // in ms
  maxPollTime: number; // in ms
  retryCount: number;
  cacheTtl: number; // in ms
  mock: boolean;
}

export type FortyGuardActivityStatus = 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'TIMEOUT';

export interface FortyGuardAsyncSubmissionResponse {
  activity_id: string;
  status: 'QUEUED' | 'PROCESSING';
  submitted_at: string;
  estimated_completion_seconds?: number;
  message?: string;
}

export interface FortyGuardStatusResponse<T = any> {
  activity_id: string;
  status: FortyGuardActivityStatus;
  progress_percent?: number;
  submitted_at?: string;
  completed_at?: string;
  result?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface FortyGuardEnvParamsRequest {
  latitude: number;
  longitude: number;
  temperature?: number;
  start_date?: string;
  end_date?: string;
  time_series?: boolean;
  filter_type?: string;
}

export interface FortyGuardEnvParamsRawResult {
  location: {
    lat: number;
    lng: number;
    elevation?: number;
  };
  timestamp: string;
  ambient_temperature_c: number;
  apparent_temperature_c: number;
  surface_temperature_c?: number;
  relative_humidity_percent: number;
  heat_index_c: number;
  wet_bulb_temperature_c: number;
  dew_point_c?: number;
  wind_speed_kmh: number;
  wind_direction_deg: number;
  wind_gust_kmh?: number;
  cloud_cover_percent: number;
  precipitation_probability_percent: number;
  precipitation_mm_hr?: number;
  solar_irradiance_wm2: number;
  uv_index: number;
  aqi: number;
  pm25_ugm3: number;
  pm10_ugm3?: number;
  co2_ppm?: number;
  canopy_cover_percent?: number;
  urban_heat_island_anomaly_c: number;
  time_series_data?: Array<{
    timestamp: string;
    ambient_temp_c: number;
    surface_temp_c?: number;
    heat_index_c?: number;
    humidity_percent?: number;
    aqi?: number;
    solar_wm2?: number;
  }>;
}

export interface FortyGuardHeatmapRequest {
  geojson?: {
    type: 'Polygon' | 'MultiPolygon' | 'FeatureCollection' | 'Feature' | 'Point';
    coordinates: any;
  };
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  resolution?: '1m' | '5m' | '10m' | '30m' | '100m';
  target_parameter?: 'surface_heat' | 'canopy' | 'thermal_anomaly';
  date_time?: string;
}

export interface FortyGuardHeatmapRawResult {
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  resolution: string;
  grid: Array<{
    lat: number;
    lng: number;
    surface_temp_c: number;
    heat_anomaly_c: number;
    canopy_percent?: number;
    elevation_m?: number;
  }>;
  statistics: {
    min: number;
    max: number;
    mean: number;
    std_dev: number;
  };
  timestamp: string;
}

export interface FortyGuardHeatIntelligenceRequest {
  latitude: number;
  longitude: number;
  district_name?: string;
  radius_meters?: number;
}

export interface FortyGuardHeatIntelligenceRawResult {
  latitude: number;
  longitude: number;
  uhi_index: number;
  surface_albedo: number;
  thermal_mass_rating: string;
  vulnerability_score: number;
  mitigation_potential: number;
  cooling_capacity_kw: number;
  prescribed_actions: string[];
  analyzed_at: string;
}

export interface FortyGuardSatelliteRequest {
  latitude: number;
  longitude: number;
  band?: 'thermal_ir' | 'ndvi' | 'multispectral';
}

export interface FortyGuardSatelliteRawResult {
  latitude: number;
  longitude: number;
  band: string;
  resolution_meters: number;
  radiance: number;
  emissivity: number;
  lst_c: number;
  cloud_free_pct: number;
  captured_at: string;
}

export interface FortyGuardStreetviewRequest {
  latitude: number;
  longitude: number;
  heading?: number;
  pitch?: number;
}

export interface FortyGuardStreetviewRawResult {
  latitude: number;
  longitude: number;
  svf: number;
  mrt_c: number;
  pedestrian_stress: 'comfortable' | 'slight_stress' | 'moderate_stress' | 'extreme_stress';
  shading_pct: number;
  asphalt_pct: number;
  vegetation_pct: number;
  measured_at: string;
}
