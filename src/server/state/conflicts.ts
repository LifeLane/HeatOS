/**
 * HeatOS Phase 4: Conflict Resolution & Provider Priority Engine
 * 
 * Enforces strict provider priority hierarchies and records all
 * multi-source measurement divergences rather than silently dropping them.
 */

import { ConflictRecord } from './types';

export class ConflictResolver {
  /**
   * Priority rankings per environmental domain (Lower index = higher priority)
   */
  private static readonly PRIORITY_HIERARCHY: Record<string, string[]> = {
    thermal: ['fortyguard', 'noaa_nws', 'satellite_vegetation', 'epa_airnow'],
    weather: ['noaa_nws', 'fortyguard', 'satellite_vegetation', 'usgs_water'],
    air_quality: ['epa_airnow', 'satellite_vegetation', 'noaa_nws'],
    wildfire: ['nasa_firms', 'satellite_vegetation', 'noaa_nws'],
    vegetation: ['satellite_vegetation', 'usgs_water', 'noaa_nws'],
    water: ['usgs_water', 'noaa_nws', 'satellite_vegetation'],
  };

  /**
   * Evaluates potential conflict between primary and secondary source values
   */
  public static evaluateThermalConflict(
    field: string,
    primarySource: string,
    primaryValue: number,
    conflictingSource: string,
    conflictingValue: number,
    varianceThreshold = 1.5,
    unit = '°C'
  ): ConflictRecord | undefined {
    const variance = Math.abs(primaryValue - conflictingValue);

    if (variance >= varianceThreshold) {
      return {
        field,
        primarySource,
        conflictingSource,
        primaryValue,
        conflictingValue,
        variance: Math.round(variance * 10) / 10,
        unit,
        resolutionRule: `FortyGuard Primary Thermal Rule: Preserved ${primarySource} high-resolution microclimate observation (${primaryValue}${unit}) over synoptic ${conflictingSource} (${conflictingValue}${unit}).`,
        resolvedValue: primaryValue,
        timestamp: new Date().toISOString(),
      };
    }

    return undefined;
  }

  /**
   * Evaluates generic numerical conflicts
   */
  public static evaluateNumericConflict(
    domain: string,
    field: string,
    sourceA: { id: string; value: number; unit?: string },
    sourceB: { id: string; value: number; unit?: string },
    varianceThreshold: number
  ): { resolvedSource: string; resolvedValue: number; conflict?: ConflictRecord } {
    const hierarchy = this.PRIORITY_HIERARCHY[domain] || [];
    const rankA = hierarchy.indexOf(sourceA.id);
    const rankB = hierarchy.indexOf(sourceB.id);

    const primary = (rankA !== -1 && (rankB === -1 || rankA <= rankB)) ? sourceA : sourceB;
    const secondary = primary === sourceA ? sourceB : sourceA;

    const variance = Math.abs(sourceA.value - sourceB.value);
    let conflict: ConflictRecord | undefined;

    if (variance >= varianceThreshold) {
      conflict = {
        field,
        primarySource: primary.id,
        conflictingSource: secondary.id,
        primaryValue: primary.value,
        conflictingValue: secondary.value,
        variance: Math.round(variance * 10) / 10,
        unit: primary.unit || '',
        resolutionRule: `Provider Priority Rule [Domain: ${domain}]: Prioritized ${primary.id} over ${secondary.id}.`,
        resolvedValue: primary.value,
        timestamp: new Date().toISOString(),
      };
    }

    return {
      resolvedSource: primary.id,
      resolvedValue: primary.value,
      conflict,
    };
  }
}
