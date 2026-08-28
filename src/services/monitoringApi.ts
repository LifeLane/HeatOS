/**
 * HeatOS Phase 9: Monitoring Client API
 */

import {
  WatchedLocation,
  AlertDetailView,
  EnvironmentalBrief,
  CommercialPersonaMode,
  PersonaModeConfig,
} from '../server/monitoring/types';

export async function fetchWatchlist(): Promise<WatchedLocation[]> {
  try {
    const res = await fetch('/api/environmental/monitoring/watchlist');
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data.watchlist || [];
  } catch (err) {
    console.error('Failed to fetch watchlist from server:', err);
    return [];
  }
}

export async function evaluateCustomWatchlist(places: Partial<WatchedLocation>[]): Promise<WatchedLocation[]> {
  try {
    const res = await fetch('/api/environmental/monitoring/watchlist/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ places }),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data.watchlist || [];
  } catch (err) {
    console.error('Failed to evaluate custom watchlist:', err);
    return [];
  }
}

export async function fetchAlertDetail(
  alertId: string,
  latitude: number,
  longitude: number,
  locationName: string
): Promise<AlertDetailView | null> {
  try {
    const cleanId = alertId.replace('alert_', '');
    const url = `/api/environmental/monitoring/alert/${encodeURIComponent(cleanId)}?lat=${latitude}&lng=${longitude}&locationName=${encodeURIComponent(locationName)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch alert detail:', err);
    return null;
  }
}

export async function acknowledgeAlert(alertId: string, acknowledgedBy = 'Operations Lead'): Promise<boolean> {
  try {
    const res = await fetch('/api/environmental/monitoring/alert/acknowledge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alertId, acknowledgedBy }),
    });
    return res.ok;
  } catch (err) {
    console.error('Failed to acknowledge alert:', err);
    return false;
  }
}

export async function generateEnvironmentalBrief(
  latitude: number,
  longitude: number,
  locationName: string,
  personaMode: CommercialPersonaMode = 'BUSINESS'
): Promise<EnvironmentalBrief | null> {
  try {
    const res = await fetch('/api/environmental/monitoring/brief', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ latitude, longitude, locationName, personaMode }),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('Failed to generate environmental brief:', err);
    return null;
  }
}

export async function fetchCommercialPersonas(): Promise<Record<CommercialPersonaMode, PersonaModeConfig> | null> {
  try {
    const res = await fetch('/api/environmental/monitoring/personas');
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data.configs || null;
  } catch (err) {
    console.error('Failed to fetch persona modes:', err);
    return null;
  }
}

export async function runMonitoringTestSuite(): Promise<any> {
  try {
    const res = await fetch('/api/environmental/monitoring/tests');
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err: any) {
    return {
      suite: 'Monitoring Engine Tests (Client Fallback)',
      status: 'FAILED',
      totalTests: 1,
      passed: 0,
      failed: 1,
      tests: [{ testId: 'COMM_ERR', description: 'Network error', passed: false, durationMs: 0, details: err.message }],
    };
  }
}
