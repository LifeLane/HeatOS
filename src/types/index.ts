/**
 * HeatOS Type Definitions
 * The Living Environment OS
 */

export type NavigationTab = 
  | 'dashboard' 
  | 'weather' 
  | 'forecast' 
  | 'navigation' 
  | 'alerts' 
  | 'tools'
  | 'ai' 
  | 'pulse' 
  | 'monitor' 
  | 'settings'
  // Legacy aliases for backward compatibility
  | 'home' 
  | 'map' 
  | 'events' 
  | 'more';

export type EnvironmentalCategory = 'heat' | 'air' | 'water' | 'nature' | 'solar' | 'fire';

export type StatusSeverity = 'optimal' | 'normal' | 'moderate' | 'elevated' | 'warning' | 'critical' | 'info';

export interface LocationData {
  id: string;
  name: string;
  state: string;
  country: string;
  displayName: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  elevation: string;
  climateZone: string;
  activeSensors: number;
  activeZones: number;
  thermalComfortIndex: number; // 0-100
  surfaceHeatAnomaly: number; // in °C / °F delta
  ambientTemp: number; // in °C
  apparentTemp: number; // "feels like"
  aqi: number;
  humidity: number;
  uvIndex: number;
  solarIrradiance: number; // W/m²
  canopyCoverage: number; // percentage
  status: 'optimal' | 'moderate' | 'warning' | 'critical';
  statusText: string;
}

export interface FortyGuardConnectionState {
  providerName: string;
  engineVersion: string;
  status: 'connected' | 'syncing' | 'degraded' | 'offline';
  meshStatus: 'active_mesh' | 'standby' | 'syncing';
  activeNodes: number;
  totalNodes: number;
  latencyMs: number;
  lastSyncTimestamp: string;
  meshDensity: string; // e.g. "12.4 nodes / km²"
  dataThroughput: string; // e.g. "4.2 MB/s"
  apiEndpoint: string;
  connectedSince: string;
}

export interface EnvironmentalMetric {
  id: string;
  label: string;
  value: string | number;
  unit: string;
  category: EnvironmentalCategory;
  status: StatusSeverity;
  statusLabel: string;
  delta: string;
  deltaType: 'up' | 'down' | 'neutral';
  deltaLabel: string;
  sparkline: number[];
  description: string;
  confidenceScore: number;
}

export interface SensorNode {
  id: string;
  name: string;
  zone: string;
  category: EnvironmentalCategory;
  status: 'active' | 'calibrating' | 'offline';
  temperature: number;
  surfaceTemp: number;
  humidity: number;
  aqi: number;
  battery: number;
  signalStrength: number; // 0-100%
  lastHeartbeat: string;
  coordinates: [number, number];
}

export interface EnvironmentalEvent {
  id: string;
  title: string;
  category: EnvironmentalCategory;
  severity: 'info' | 'normal' | 'warning' | 'critical';
  severityLabel: string;
  timestamp: string;
  locationArea: string;
  summary: string;
  impactScore: number; // 1-10
  recommendation: string;
  status: 'active' | 'monitoring' | 'resolved';
}

export interface SpatialZone {
  id: string;
  name: string;
  district: string;
  heatSeverity: 'low' | 'moderate' | 'high' | 'critical';
  surfaceTemp: number;
  canopyCover: number;
  heatIslandFactor: number;
  activeSensors: number;
  coordinates: [number, number];
  riskLevel: string;
  recommendedAction: string;
}

export interface MitigationStrategy {
  id: string;
  title: string;
  type: string;
  coolingPotentialC: number;
  estimatedCost: string;
  roiTimeline: string;
  difficulty: string;
  description: string;
  targetZones: string[];
}

export * from './unifiedState';
export * from './naturePulse';
export * from './tools';
export * from '../server/monitoring/types';

