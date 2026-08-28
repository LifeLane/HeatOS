/**
 * HeatOS Phase 5: Nature Pulse Client API Service
 * 
 * Provides typed access to:
 * - getNaturePulse()
 * - runPulseTests()
 */

import { NaturePulseResult, PulseQueryOptions } from '../types/naturePulse';

export interface GetPulseRequest {
  latitude: number;
  longitude: number;
  locationName?: string;
  stateCode?: string;
  countryCode?: string;
  referenceTime?: string;
  bypassCache?: boolean;
  spatialRadiusMeters?: number;
}

export const naturePulseApi = {
  /**
   * Fetches the synthesized Nature Pulse for a given location
   */
  async getPulse(params: GetPulseRequest): Promise<NaturePulseResult> {
    const res = await fetch('/api/environmental/pulse', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.message || `Failed to fetch Nature Pulse (Status ${res.status})`);
    }

    return res.json();
  },

  /**
   * Runs Phase 5 Nature Pulse Diagnostic Test Suite
   */
  async runTests(): Promise<any> {
    const res = await fetch('/api/environmental/pulse/tests');
    if (!res.ok) {
      throw new Error(`Failed to run pulse test suite (Status ${res.status})`);
    }
    return res.json();
  },
};
