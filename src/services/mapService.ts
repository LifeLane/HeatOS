/**
 * HeatOS Phase 6: Map Service
 * Client API connector for the Living Environment Map.
 */

import {
  MapEnvironmentalStateResponse,
  MapLayerKey,
  MapHotspotNode,
  MapSpatialDistrict,
} from '../server/map/types';

export class MapService {
  private static cache = new Map<string, { data: MapEnvironmentalStateResponse; timestamp: number }>();
  private static TTL_MS = 60 * 1000; // 1 minute client cache

  public static async fetchMapState(
    latitude: number,
    longitude: number,
    locationName?: string,
    layer: MapLayerKey = 'heat',
    bypassCache: boolean = false
  ): Promise<MapEnvironmentalStateResponse> {
    const cacheKey = `${latitude.toFixed(4)}_${longitude.toFixed(4)}_${layer}`;

    if (!bypassCache) {
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.TTL_MS) {
        return cached.data;
      }
    }

    const response = await fetch('/api/environmental/map/state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        latitude,
        longitude,
        locationName,
        layer,
        bypassCache,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch map state: ${response.statusText}`);
    }

    const data: MapEnvironmentalStateResponse = await response.json();
    this.cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  }

  public static async runDiagnostics(): Promise<any> {
    const response = await fetch('/api/environmental/map/tests');
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to run map diagnostic tests: HTTP ${response.status}`);
    }
    return response.json();
  }
}
