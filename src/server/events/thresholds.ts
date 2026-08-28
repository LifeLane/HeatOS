/**
 * HeatOS Phase 7: Centralized Environmental Event Thresholds
 * 
 * Defines rigorous, auditable numerical trigger thresholds, persistence requirements,
 * and false-positive suppression rules across all environmental event categories.
 */

import { EnvironmentalEventType, EventSeverity } from './types';

export interface EventThresholdConfig {
  minConfidence: number; // Minimum confidence percentage (0-100) required to publish
  minPersistenceMinutes: number; // Minimum duration condition must persist
  minChangeDelta?: number; // Minimum deviation magnitude from baseline
  watchThreshold: number;
  elevatedThreshold: number;
  highThreshold: number;
  criticalThreshold: number;
  unit: string;
}

export const EVENT_THRESHOLDS: Record<EnvironmentalEventType, EventThresholdConfig> = {
  HEAT_ANOMALY: {
    minConfidence: 75,
    minPersistenceMinutes: 15,
    minChangeDelta: 1.5, // +1.5°C vs baseline minimum
    watchThreshold: 2.0, // +2.0°C surface/ambient anomaly
    elevatedThreshold: 3.5, // +3.5°C
    highThreshold: 5.0, // +5.0°C
    criticalThreshold: 7.0, // +7.0°C severe UHI hotspot
    unit: '°C vs Baseline',
  },
  RAPID_HEAT_INCREASE: {
    minConfidence: 80,
    minPersistenceMinutes: 20,
    minChangeDelta: 2.0, // +2.0°C / hour
    watchThreshold: 2.0, // 2.0°C / hr
    elevatedThreshold: 3.0, // 3.0°C / hr
    highThreshold: 4.5, // 4.5°C / hr
    criticalThreshold: 6.0, // 6.0°C / hr dangerous surge
    unit: '°C / hour',
  },
  EXTREME_HEAT: {
    minConfidence: 85,
    minPersistenceMinutes: 30,
    minChangeDelta: 0,
    watchThreshold: 33.0, // Ambient > 33°C (91.4°F)
    elevatedThreshold: 37.0, // Ambient > 37°C (98.6°F)
    highThreshold: 41.0, // Ambient > 41°C (105.8°F)
    criticalThreshold: 45.0, // Ambient > 45°C (113°F) or Wet Bulb > 31°C
    unit: '°C Ambient',
  },
  AIR_QUALITY_CHANGE: {
    minConfidence: 70,
    minPersistenceMinutes: 20,
    minChangeDelta: 15.0, // Delta AQI change
    watchThreshold: 51.0, // AQI Moderate
    elevatedThreshold: 101.0, // AQI Unhealthy for Sensitive Groups
    highThreshold: 151.0, // AQI Unhealthy
    criticalThreshold: 201.0, // AQI Very Unhealthy / Hazardous
    unit: 'AQI Index',
  },
  FIRE_ACTIVITY: {
    minConfidence: 80,
    minPersistenceMinutes: 10,
    minChangeDelta: 1, // Hotspot count
    watchThreshold: 1, // 1 low FRP hotspot in 25km radius
    elevatedThreshold: 2, // 2+ hotspots or FRP > 15MW
    highThreshold: 5, // 5+ hotspots or FRP > 40MW
    criticalThreshold: 10, // 10+ hotspots or FRP > 100MW proximate
    unit: 'Active Hotspots in Radius',
  },
  WATER_STRESS: {
    minConfidence: 70,
    minPersistenceMinutes: 60,
    minChangeDelta: 10.0,
    watchThreshold: 40.0, // Relative Soil Moisture < 40%
    elevatedThreshold: 30.0, // Relative Soil Moisture < 30%
    highThreshold: 20.0, // Relative Soil Moisture < 20%
    criticalThreshold: 12.0, // Relative Soil Moisture < 12% (severe agricultural drought)
    unit: '% Soil Moisture',
  },
  VEGETATION_STRESS: {
    minConfidence: 75,
    minPersistenceMinutes: 120,
    minChangeDelta: 0.1,
    watchThreshold: 0.35, // NDVI < 0.35 in vegetated corridor
    elevatedThreshold: 0.28, // NDVI < 0.28
    highThreshold: 0.20, // NDVI < 0.20
    criticalThreshold: 0.12, // NDVI < 0.12 (severe canopy dieback)
    unit: 'NDVI Canopy Index',
  },
  MULTI_FACTOR_EVENT: {
    minConfidence: 85,
    minPersistenceMinutes: 30,
    minChangeDelta: 2.0,
    watchThreshold: 2, // 2 converging stress signals
    elevatedThreshold: 3, // 3 converging signals (e.g. Heat + Low Moisture + High Solar)
    highThreshold: 4, // 4 converging signals
    criticalThreshold: 5, // 5 compound stress vectors simultaneously
    unit: 'Converging Independent Signals',
  },
  ENVIRONMENTAL_SHIFT: {
    minConfidence: 80,
    minPersistenceMinutes: 30,
    minChangeDelta: 4.0, // > 4°C synoptic step change or 180° wind direction reversal
    watchThreshold: 4.0,
    elevatedThreshold: 6.0,
    highThreshold: 8.0,
    criticalThreshold: 12.0,
    unit: 'Delta Metric Magnitude',
  },
  DATA_QUALITY_EVENT: {
    minConfidence: 90,
    minPersistenceMinutes: 15,
    minChangeDelta: 0,
    watchThreshold: 60, // Feed latency > 60 min
    elevatedThreshold: 120, // Feed latency > 120 min
    highThreshold: 240, // Feed latency > 4 hours
    criticalThreshold: 480, // Feed latency > 8 hours or missing core stream
    unit: 'Minutes Latency / Dropped Feeds',
  },
};

/**
 * Maps an observed scalar and threshold table to standard EventSeverity
 */
export function calculateSeverity(
  type: EnvironmentalEventType,
  value: number,
  isInverse: boolean = false
): EventSeverity {
  const cfg = EVENT_THRESHOLDS[type];
  if (!cfg) return 'INFO';

  if (isInverse) {
    // Lower value means higher severity (e.g., Soil Moisture, NDVI)
    if (value <= cfg.criticalThreshold) return 'CRITICAL';
    if (value <= cfg.highThreshold) return 'HIGH';
    if (value <= cfg.elevatedThreshold) return 'ELEVATED';
    if (value <= cfg.watchThreshold) return 'WATCH';
    return 'INFO';
  } else {
    // Higher value means higher severity
    if (value >= cfg.criticalThreshold) return 'CRITICAL';
    if (value >= cfg.highThreshold) return 'HIGH';
    if (value >= cfg.elevatedThreshold) return 'ELEVATED';
    if (value >= cfg.watchThreshold) return 'WATCH';
    return 'INFO';
  }
}
