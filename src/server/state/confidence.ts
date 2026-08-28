/**
 * HeatOS Phase 4: Confidence Evaluation Engine
 * 
 * Multi-factor algorithmic confidence calculation synthesizing source quality,
 * freshness decay, field completeness, cross-source agreement, and spatial/temporal compatibility.
 */

import { StateConfidenceBreakdown, ConflictRecord, TemporalAlignmentMetadata, SpatialAlignmentMetadata } from './types';
import { TemporalNormalizer } from './temporal';

export interface ConfidenceInputData {
  sources: Array<{ id: string; baseConfidence: number; freshness: string }>;
  totalRequiredFields: number;
  availableFieldsCount: number;
  conflicts: ConflictRecord[];
  temporalAlignment: TemporalAlignmentMetadata;
  spatialAlignment: SpatialAlignmentMetadata;
}

export class ConfidenceEvaluator {
  /**
   * Computes comprehensive confidence breakdown and overall confidence score (0 - 100)
   */
  public static evaluate(input: ConfidenceInputData): StateConfidenceBreakdown {
    const degradationReasons: string[] = [];

    // 1. Source Baseline Quality Score (0 - 100)
    let sourceQualityScore = 70;
    if (input.sources.length > 0) {
      const sum = input.sources.reduce((acc, s) => acc + (s.baseConfidence || 70), 0);
      sourceQualityScore = Math.round(sum / input.sources.length);
    } else {
      degradationReasons.push('No active provider telemetry available.');
    }

    // 2. Freshness Score (0 - 100)
    let freshnessScore = 50;
    if (input.sources.length > 0) {
      const freshnessWeights = input.sources.map((s) =>
        TemporalNormalizer.getFreshnessConfidenceWeight(s.freshness as any)
      );
      const avgWeight = freshnessWeights.reduce((a, b) => a + b, 0) / freshnessWeights.length;
      freshnessScore = Math.round(avgWeight * 100);
      if (freshnessScore < 75) {
        degradationReasons.push(`Telemetry freshness degraded (${freshnessScore}% recent/stale mix).`);
      }
    }

    // 3. Completeness Score (0 - 100)
    const completenessRatio =
      input.totalRequiredFields > 0
        ? Math.min(1.0, input.availableFieldsCount / input.totalRequiredFields)
        : 0;
    const completenessScore = Math.round(completenessRatio * 100);
    if (completenessScore < 80) {
      degradationReasons.push(`Incomplete environmental coverage (${completenessScore}% dimensions available).`);
    }

    // 4. Cross-Source Agreement Score (0 - 100)
    let agreementScore = 100;
    if (input.conflicts.length > 0) {
      const penalty = input.conflicts.reduce((acc, c) => acc + Math.min(25, c.variance * 3), 0);
      agreementScore = Math.max(40, Math.round(100 - penalty));
      degradationReasons.push(`${input.conflicts.length} cross-source measurement divergence(s) resolved via priority rules.`);
    }

    // 5. Spatial Compatibility Score (0 - 100)
    let spatialCompatibilityScore = 100;
    if (input.spatialAlignment.spatialConsistencyStatus === 'REGIONAL_APPROXIMATION') {
      spatialCompatibilityScore = 70;
      degradationReasons.push('Regional synoptic spatial approximation in effect.');
    } else if (input.spatialAlignment.spatialConsistencyStatus === 'INTERPOLATED') {
      spatialCompatibilityScore = 88;
    }

    // 6. Temporal Compatibility Score (0 - 100)
    let temporalCompatibilityScore = 100;
    if (input.temporalAlignment.temporalStatus === 'MISMATCHED_WINDOW') {
      temporalCompatibilityScore = 50;
      degradationReasons.push(`Temporal window divergence (${input.temporalAlignment.maxDivergenceMinutes}m) exceeds strict alignment limits.`);
    } else if (input.temporalAlignment.temporalStatus === 'ACCEPTABLE_WINDOW') {
      temporalCompatibilityScore = 82;
    }

    // 7. Weighted Composite Score
    const weightedSum =
      sourceQualityScore * 0.25 +
      freshnessScore * 0.20 +
      completenessScore * 0.20 +
      agreementScore * 0.15 +
      spatialCompatibilityScore * 0.10 +
      temporalCompatibilityScore * 0.10;

    const overallScore = Math.max(10, Math.min(100, Math.round(weightedSum)));

    return {
      overallScore,
      sourceQualityScore,
      freshnessScore,
      completenessScore,
      agreementScore,
      spatialCompatibilityScore,
      temporalCompatibilityScore,
      degradationReasons,
    };
  }
}
