/**
 * HeatOS Phase 7: Environmental Event Engine Types
 * 
 * Extensible, strongly-typed contracts for meaningful environmental change detection,
 * multi-factor convergence, structured evidence, false-positive filtering, and action recommendations.
 */

export type EnvironmentalEventType =
  | 'HEAT_ANOMALY'
  | 'RAPID_HEAT_INCREASE'
  | 'EXTREME_HEAT'
  | 'AIR_QUALITY_CHANGE'
  | 'FIRE_ACTIVITY'
  | 'WATER_STRESS'
  | 'VEGETATION_STRESS'
  | 'MULTI_FACTOR_EVENT'
  | 'ENVIRONMENTAL_SHIFT'
  | 'DATA_QUALITY_EVENT';

export type EventSeverity = 'INFO' | 'WATCH' | 'ELEVATED' | 'HIGH' | 'CRITICAL';

export interface EventEvidenceSignal {
  metricName: string;
  observedValue: number | string;
  baselineValue?: number | string;
  delta?: number;
  unit: string;
  persistenceMinutes?: number;
  signalThreshold?: number | string;
  source: string;
  sourceName: string;
  confidence: number;
}

export interface BaselineComparison {
  baselineType: 'historical_diurnal' | 'rural_reference' | 'seasonal_norm' | 'sensor_baseline';
  baselineValue: number;
  observedValue: number;
  delta: number;
  unit: string;
  referenceDescription?: string;
}

export interface EventLocation {
  latitude: number;
  longitude: number;
  locationName: string;
  district?: string;
  radiusMeters?: number;
}

export interface EventImpact {
  healthRisk: string;
  infrastructureImpact?: string;
  ecologicalImpact?: string;
  operationalImpact?: string;
  severityScore: number; // 0 - 100
}

export interface EventRecommendedAction {
  primary: string;
  secondary?: string[];
  urgency: 'IMMEDIATE' | 'HIGH' | 'MODERATE' | 'INFORMATIONAL';
  targetedAudience?: 'general_public' | 'municipal_ops' | 'vulnerable_populations' | 'facility_managers';
}

export interface EventSource {
  sourceId: string;
  sourceName: string;
  lastUpdated: string;
  confidence: number;
}

export interface EventSummary {
  headline: string;
  whatChanged: string;
  when: string;
  where: string;
  why: string;
}

export interface EventEvidence {
  signals: EventEvidenceSignal[];
  baselineComparison?: BaselineComparison;
  convergenceCount?: number;
  persistenceMinutes: number;
  noiseRejectionRationale?: string;
}

export interface EnvironmentalEvent {
  id: string;
  type: EnvironmentalEventType;
  severity: EventSeverity;
  location: EventLocation;
  detectedAt: string; // ISO-8601
  startTime: string; // ISO-8601
  expectedEnd?: string; // ISO-8601
  confidence: number; // 0 - 100%
  drivers: string[];
  evidence: EventEvidence;
  summary: EventSummary;
  impact: EventImpact;
  recommendedAction: EventRecommendedAction;
  sources: EventSource[];
  isDismissed?: boolean;
}

export interface EventQueryOptions {
  latitude: number;
  longitude: number;
  locationName?: string;
  severity?: EventSeverity[];
  types?: EnvironmentalEventType[];
  minConfidence?: number;
  includeDataQualityEvents?: boolean;
  referenceTime?: string;
  bypassCache?: boolean;
}

export interface EventFeedResponse {
  location: EventLocation;
  timestamp: string;
  totalActiveEvents: number;
  severityCounts: Record<EventSeverity, number>;
  events: EnvironmentalEvent[];
  systemStatus: {
    engineVersion: string;
    anomalyModelActive: boolean;
    multiFactorConvergenceActive: boolean;
    falsePositiveFilterActive: boolean;
    activeDataStreamsCount: number;
  };
}

export interface EventEngineTestResult {
  testId: string;
  name: string;
  category: 'Anomaly' | 'Convergence' | 'Integrity' | 'Filtering' | 'Resilience';
  passed: boolean;
  durationMs: number;
  details: string;
  diagnostics?: any;
}

export interface EventEngineTestReport {
  timestamp: string;
  totalTests: number;
  passedCount: number;
  failedCount: number;
  passRatePct: number;
  durationMs: number;
  results: EventEngineTestResult[];
}

