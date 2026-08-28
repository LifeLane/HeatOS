import { EnvironmentalState, HeatmapData } from '../types/environmental';

/**
 * Client-side Environmental API Service
 * Communicates with server-side HeatOS Data Orchestrator.
 * All FortyGuard API keys, timeouts, polling, and low-level details remain purely on the server.
 */
export async function fetchEnvironmentalState(params: {
  latitude: number;
  longitude: number;
  temperature?: number;
  startDate?: string;
  endDate?: string;
  timeSeries?: boolean;
  filterType?: string;
  bypassCache?: boolean;
}): Promise<EnvironmentalState> {
  const response = await fetch('/api/environmental/params', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      latitude: params.latitude,
      longitude: params.longitude,
      temperature: params.temperature,
      start_date: params.startDate,
      end_date: params.endDate,
      time_series: params.timeSeries,
      filter_type: params.filterType,
      bypassCache: params.bypassCache,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to fetch environmental data (${response.status})`);
  }

  return response.json();
}

export async function fetchHeatmapData(params: {
  bounds?: { north: number; south: number; east: number; west: number };
  geojson?: any;
  resolution?: '1m' | '5m' | '10m' | '30m' | '100m';
  targetParameter?: 'surface_heat' | 'canopy' | 'thermal_anomaly';
  dateTime?: string;
  bypassCache?: boolean;
}): Promise<HeatmapData> {
  const response = await fetch('/api/environmental/heatmap', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      bounds: params.bounds,
      geojson: params.geojson,
      resolution: params.resolution,
      target_parameter: params.targetParameter,
      date_time: params.dateTime,
      bypassCache: params.bypassCache,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to fetch heatmap data (${response.status})`);
  }

  return response.json();
}

export async function fetchHealthStatus() {
  const response = await fetch('/api/health');
  if (!response.ok) throw new Error('Health check failed');
  return response.json();
}

/**
 * Fetch Enriched Environmental State (FortyGuard Primary Thermal + Open Data Context)
 */
export async function fetchEnrichedEnvironmentalState(params: {
  latitude: number;
  longitude: number;
  locationName?: string;
  bypassCache?: boolean;
}): Promise<import('../types/environmental').EnrichedEnvironmentalState> {
  const response = await fetch('/api/environmental/fabric/enriched', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to fetch enriched environmental state (${response.status})`);
  }

  return response.json();
}

/**
 * Fetch all registered providers with real-time health and metadata
 */
export async function fetchFabricProviders(): Promise<{
  success: boolean;
  count: number;
  providers: import('../types/environmental').ProviderConfigInfo[];
}> {
  const response = await fetch('/api/environmental/fabric/providers');
  if (!response.ok) {
    throw new Error('Failed to fetch provider registry');
  }
  return response.json();
}

/**
 * Toggle provider enabled status
 */
export async function toggleFabricProvider(providerId: string, enabled: boolean) {
  const response = await fetch('/api/environmental/fabric/toggle', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ providerId, enabled }),
  });
  if (!response.ok) {
    throw new Error(`Failed to toggle provider ${providerId}`);
  }
  return response.json();
}

/**
 * Run Data Fabric self-diagnostic test suite
 */
export async function fetchFabricTestSuiteReport() {
  const response = await fetch('/api/environmental/fabric/tests');
  if (!response.ok) {
    throw new Error('Failed to run fabric test suite');
  }
  return response.json();
}

