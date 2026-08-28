/**
 * HeatOS Phase 4: Temporal Normalization Layer
 * 
 * Synchronizes multi-provider timestamps, determines freshness decay,
 * and identifies temporal window mismatches.
 */

import { FreshnessClassification, TemporalAlignmentMetadata } from './types';

export class TemporalNormalizer {
  /**
   * Thresholds for freshness classification in milliseconds
   */
  private static readonly LIVE_THRESHOLD_MS = 15 * 60 * 1000;    // 15 minutes
  private static readonly RECENT_THRESHOLD_MS = 60 * 60 * 1000;   // 60 minutes
  private static readonly STALE_THRESHOLD_MS = 360 * 60 * 1000;  // 6 hours (360 minutes)

  /**
   * Classifies freshness of an observation timestamp relative to reference time
   */
  public static classifyFreshness(
    observationIso: string | undefined | null,
    referenceIso: string = new Date().toISOString()
  ): FreshnessClassification {
    if (!observationIso) {
      return 'UNKNOWN';
    }

    const obsTime = new Date(observationIso).getTime();
    const refTime = new Date(referenceIso).getTime();

    if (isNaN(obsTime) || isNaN(refTime)) {
      return 'UNKNOWN';
    }

    const ageMs = Math.abs(refTime - obsTime);

    if (ageMs <= this.LIVE_THRESHOLD_MS) {
      return 'LIVE';
    }
    if (ageMs <= this.RECENT_THRESHOLD_MS) {
      return 'RECENT';
    }
    if (ageMs <= this.STALE_THRESHOLD_MS) {
      return 'STALE';
    }
    return 'UNKNOWN';
  }

  /**
   * Computes temporal decay multiplier for confidence scoring (0.0 to 1.0)
   */
  public static getFreshnessConfidenceWeight(freshness: FreshnessClassification): number {
    switch (freshness) {
      case 'LIVE':
        return 1.0;
      case 'RECENT':
        return 0.85;
      case 'STALE':
        return 0.50;
      case 'UNKNOWN':
      default:
        return 0.20;
    }
  }

  /**
   * Analyzes an array of observation timestamps from diverse providers
   * and computes comprehensive temporal alignment metadata.
   */
  public static analyzeAlignment(
    timestamps: (string | undefined | null)[],
    referenceTime: string = new Date().toISOString()
  ): TemporalAlignmentMetadata {
    const validTimes: number[] = [];

    for (const ts of timestamps) {
      if (ts) {
        const parsed = new Date(ts).getTime();
        if (!isNaN(parsed)) {
          validTimes.push(parsed);
        }
      }
    }

    if (validTimes.length === 0) {
      return {
        referenceTime,
        oldestObservationTime: referenceTime,
        newestObservationTime: referenceTime,
        maxDivergenceMinutes: 0,
        temporalStatus: 'ALIGNED',
      };
    }

    const minTime = Math.min(...validTimes);
    const maxTime = Math.max(...validTimes);
    const divergenceMs = maxTime - minTime;
    const maxDivergenceMinutes = Math.round(divergenceMs / (60 * 1000));

    let temporalStatus: 'ALIGNED' | 'ACCEPTABLE_WINDOW' | 'MISMATCHED_WINDOW' = 'ALIGNED';
    if (maxDivergenceMinutes > 180) {
      temporalStatus = 'MISMATCHED_WINDOW';
    } else if (maxDivergenceMinutes > 30) {
      temporalStatus = 'ACCEPTABLE_WINDOW';
    }

    return {
      referenceTime,
      oldestObservationTime: new Date(minTime).toISOString(),
      newestObservationTime: new Date(maxTime).toISOString(),
      maxDivergenceMinutes,
      temporalStatus,
    };
  }
}
