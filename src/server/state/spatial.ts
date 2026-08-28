/**
 * HeatOS Phase 4: Spatial Normalization Layer
 * 
 * Normalizes coordinate boundaries, grid cells, GeoJSON structures,
 * and tracks mixed spatial resolutions without silent corruption.
 */

import { LocationState, SpatialAlignmentMetadata } from './types';

export interface SpatialObservationRef {
  source: string;
  latitude?: number;
  longitude?: number;
  spatialResolution: string;
}

export class SpatialNormalizer {
  /**
   * Calculates Haversine distance in kilometers between two lat/lng coordinates
   */
  public static calculateDistanceKm(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth radius in km
    const dLat = this.degToRad(lat2 - lat1);
    const dLon = this.degToRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.degToRad(lat1)) *
        Math.cos(this.degToRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 100) / 100;
  }

  private static degToRad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * Generates a deterministic spatial grid cell ID (e.g. H3-like or micro-grid)
   */
  public static generateGridCellId(lat: number, lng: number, precision = 3): string {
    const latSegment = Math.floor(lat * Math.pow(10, precision));
    const lngSegment = Math.floor(lng * Math.pow(10, precision));
    return `HEATOS_GRID_${latSegment}_${lngSegment}`;
  }

  /**
   * Constructs standardized LocationState with GeoJSON and bounding box
   */
  public static buildLocationState(
    latitude: number,
    longitude: number,
    locationName: string,
    stateCode?: string,
    countryCode?: string,
    radiusMeters = 500
  ): LocationState {
    const latDelta = radiusMeters / 111320;
    const lngDelta = radiusMeters / (111320 * Math.cos(this.degToRad(latitude)));

    const boundingBox = {
      north: latitude + latDelta,
      south: latitude - latDelta,
      east: longitude + lngDelta,
      west: longitude - lngDelta,
    };

    const gridCellId = this.generateGridCellId(latitude, longitude);

    const geoJson = {
      type: 'Polygon' as const,
      coordinates: [
        [
          [boundingBox.west, boundingBox.south],
          [boundingBox.east, boundingBox.south],
          [boundingBox.east, boundingBox.north],
          [boundingBox.west, boundingBox.north],
          [boundingBox.west, boundingBox.south],
        ],
      ],
    };

    return {
      latitude,
      longitude,
      locationName,
      stateCode,
      countryCode,
      boundingBox,
      gridCellId,
      geoJson,
    };
  }

  /**
   * Analyzes multi-provider spatial resolutions and distances to produce SpatialAlignmentMetadata
   */
  public static analyzeSpatialAlignment(
    targetLat: number,
    targetLng: number,
    observations: SpatialObservationRef[]
  ): SpatialAlignmentMetadata {
    const resolutions = new Set<string>();
    let maxDist = 0;

    for (const obs of observations) {
      if (obs.spatialResolution) {
        resolutions.add(obs.spatialResolution);
      }
      if (obs.latitude !== undefined && obs.longitude !== undefined) {
        const dist = this.calculateDistanceKm(targetLat, targetLng, obs.latitude, obs.longitude);
        if (dist > maxDist) {
          maxDist = dist;
        }
      }
    }

    const mixedSpatialResolutions = Array.from(resolutions);

    let spatialConsistencyStatus: 'CO_LOCATED' | 'INTERPOLATED' | 'REGIONAL_APPROXIMATION' =
      'CO_LOCATED';

    if (maxDist > 15 || mixedSpatialResolutions.some((r) => r.includes('Regional Basin') || r.includes('Statewide'))) {
      spatialConsistencyStatus = 'REGIONAL_APPROXIMATION';
    } else if (maxDist > 0.1 || mixedSpatialResolutions.length > 1) {
      spatialConsistencyStatus = 'INTERPOLATED';
    }

    return {
      targetLatitude: targetLat,
      targetLongitude: targetLng,
      maxObservationDistanceKm: maxDist,
      mixedSpatialResolutions,
      spatialConsistencyStatus,
    };
  }
}
