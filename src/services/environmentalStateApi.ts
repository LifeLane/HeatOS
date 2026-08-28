/**
 * HeatOS Phase 4: Unified Environmental State Client API
 * 
 * Provides typed access to the single source of truth:
 * - getEnvironmentalSnapshot()
 * - getHistoricalEnvironmentalSnapshot()
 * - runStateTestSuite()
 */

import {
  EnvironmentalState,
  SnapshotQueryOptions,
  HistoricalSnapshotOptions,
  HistoricalEnvironmentalSnapshot,
  LocationState,
} from '../types/unifiedState';

export interface GetSnapshotRequest {
  latitude: number;
  longitude: number;
  locationName?: string;
  stateCode?: string;
  countryCode?: string;
  referenceTime?: string;
  bypassCache?: boolean;
  spatialRadiusMeters?: number;
}

export interface GetHistoryRequest {
  latitude: number;
  longitude: number;
  locationName?: string;
  stateCode?: string;
  countryCode?: string;
  startTime?: string;
  endTime?: string;
  intervalHours?: number;
}

export const unifiedEnvironmentalStateApi = {
  /**
   * Fetches the unified EnvironmentalState snapshot for a location
   */
  async getSnapshot(params: GetSnapshotRequest): Promise<EnvironmentalState> {
    const res = await fetch('/api/environmental/state/snapshot', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.message || `Failed to fetch snapshot (Status ${res.status})`);
    }

    return res.json();
  },

  /**
   * Fetches historical time-series of unified EnvironmentalState snapshots
   */
  async getHistory(params: GetHistoryRequest): Promise<HistoricalEnvironmentalSnapshot> {
    const res = await fetch('/api/environmental/state/history', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.message || `Failed to fetch history (Status ${res.status})`);
    }

    return res.json();
  },

  /**
   * Runs the Phase 4 Unified Environmental State Diagnostic Test Suite
   */
  async runTests(): Promise<any> {
    const res = await fetch('/api/environmental/state/tests');
    if (!res.ok) {
      throw new Error(`Failed to run state test suite (Status ${res.status})`);
    }
    return res.json();
  },
};
