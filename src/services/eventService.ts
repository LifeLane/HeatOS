/**
 * HeatOS Phase 7: Environmental Event Engine Client Service
 */

import {
  EnvironmentalEvent,
  EventFeedResponse,
  EventQueryOptions,
} from '../server/events/types';

export class EventService {
  /**
   * Fetches active environmental events for coordinates with optional filtering.
   */
  public static async fetchEvents(options: EventQueryOptions): Promise<EventFeedResponse> {
    const res = await fetch('/api/environmental/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Failed to fetch events (${res.status})`);
    }

    return res.json();
  }

  /**
   * Executes the Phase 7 automated verification suite.
   */
  public static async runDiagnostics(): Promise<any> {
    const res = await fetch('/api/environmental/events/tests');
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Diagnostic run failed (${res.status})`);
    }
    return res.json();
  }

  /**
   * Fetches the centralized event thresholds.
   */
  public static async fetchThresholds(): Promise<any> {
    const res = await fetch('/api/environmental/events/thresholds');
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Failed to fetch thresholds (${res.status})`);
    }
    return res.json();
  }
}
