/**
 * HeatOS Phase 6: The Living Environment Map Types
 */

import { PulseStatus } from '../pulse/types';

export type FreshnessStatus = 'LIVE' | 'RECENT' | 'STALE' | 'OFFLINE' | 'UNAVAILABLE';
export type MapLayerKey = 'heat' | 'heat_risk' | 'precipitation' | 'wind' | 'humidity' | 'air' | 'water' | 'nature' | 'fire' | 'solar';
export type MapTimeHorizon = 'now' | '+2h' | '+4h' | '+6h' | '+12h' | '+24h';

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface MapHotspotNode {
  id: string;
  name: string;
  type: 'thermal_spike' | 'cooling_buffer' | 'air_station' | 'water_gauge' | 'canopy_cluster' | 'fire_hotspot' | 'solar_array';
  latitude: number;
  longitude: number;
  layer: MapLayerKey;
  severity: 'low' | 'moderate' | 'high' | 'critical';
  primaryValue: number;
  primaryUnit: string;
  primaryLabel: string;
  secondaryLabel?: string;
  anomalyDelta?: number;
  trend: 'SURGE' | 'STABLE' | 'DECREASING';
  pulseScore: number;
  pulseStatus: PulseStatus;
  riskTitle: string;
  topChangeDescription: string;
  sourceId: string;
  sourceName: string;
  freshness: FreshnessStatus;
  timestamp: string;
  details: Record<string, any>;
}

export interface MapSpatialDistrict {
  id: string;
  name: string;
  districtType: 'commercial_core' | 'parkland_buffer' | 'residential_neighborhood' | 'industrial_hub' | 'waterfront_corridor';
  bounds: MapBounds;
  center: [number, number];
  primaryMetric: {
    label: string;
    value: number;
    unit: string;
  };
  heatAnomalyC: number;
  canopyCoverPct: number;
  pulseScore: number;
  pulseStatus: PulseStatus;
  riskLevel: string;
  recommendedAction: string;
  activeSensorsCount: number;
}

export interface MapGridCell {
  lat: number;
  lng: number;
  value: number;
  normalizedIntensity: number; // 0.0 to 1.0
  secondaryValue?: number;
  category?: string;
}

export interface MapLayerData {
  layerKey: MapLayerKey;
  layerName: string;
  description: string;
  isAvailable: boolean;
  unavailableReason?: string;
  defaultMetricName: string;
  unit: string;
  freshness: FreshnessStatus;
  sourceId: string;
  sourceName: string;
  timestamp: string;
  grid: MapGridCell[];
  hotspots: MapHotspotNode[];
  districts: MapSpatialDistrict[];
  statistics: {
    min: number;
    max: number;
    mean: number;
    median?: number;
    unit: string;
    activeHotspotsCount: number;
  };
  legend: {
    title: string;
    unit: string;
    ticks: Array<{
      value: number | string;
      label: string;
      color: string;
      icon?: string;
    }>;
  };
}

export interface MapEnvironmentalStateResponse {
  center: {
    latitude: number;
    longitude: number;
    locationName: string;
  };
  activeLayer: MapLayerKey;
  availableLayers: MapLayerKey[];
  layers: Partial<Record<MapLayerKey, MapLayerData>>;
  selectedLocationSummary?: {
    locationName: string;
    ambientTemp: number;
    feelsLike: number;
    pulseScore: number;
    pulseStatus: PulseStatus;
    riskSummary: string;
    timestamp: string;
  };
}

export interface MapLayerQueryOptions {
  latitude: number;
  longitude: number;
  locationName?: string;
  layer?: MapLayerKey;
  bounds?: MapBounds;
  bypassCache?: boolean;
}
