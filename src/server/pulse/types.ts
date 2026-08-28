/**
 * HeatOS Phase 5: Nature Pulse Core Type Definitions
 * 
 * Answers: "How is this place doing right now?"
 * Simplifies complex multi-source environmental telemetry into a clear, trustworthy pulse.
 */

export type PulseStatus = 'HEALTHY' | 'STABLE' | 'WATCH' | 'ELEVATED' | 'CRITICAL';
export type PulseTrend = 'IMPROVING' | 'STABLE' | 'DEGRADING';
export type DimensionKey = 'heat' | 'air' | 'water' | 'nature' | 'fire' | 'solar';

export interface PulseDimensionResult {
  key: DimensionKey;
  label: string;
  shortLabel: string;
  score: number | null; // 0 - 100 (null if unavailable)
  status: PulseStatus;
  statusLabel: string; // e.g. "HIGH", "GOOD", "WATCH", "HEALTHY", "LOW"
  trend: PulseTrend;
  trendLabel: string;
  confidence: number; // 0 - 100
  topDrivers: string[];
  source: string;
  sourceName: string;
  timestamp: string;
  isAvailable: boolean;
  isExperimental?: boolean;
  rawSignals: Record<string, string | number | boolean | null>;
  methodologySummary: string;
}

export interface PulseMethodologyNotes {
  title: string;
  metricName: string;
  description: string;
  scoringScale: {
    healthy: string;
    stable: string;
    watch: string;
    elevated: string;
    critical: string;
  };
  dimensionWeights: Record<DimensionKey, number>;
  nonFabricationGuarantee: string;
  transparencyNotice: string;
}

export interface NaturePulseResult {
  pulseId: string;
  metricName: string; // "HeatOS Environmental Pulse" or "Environmental Condition Score"
  overallScore: number; // 0 - 100
  overallStatus: PulseStatus;
  overallStatusLabel: string;
  trend: PulseTrend;
  trendDelta: string;
  confidence: number; // 0 - 100
  dimensions: Record<DimensionKey, PulseDimensionResult>;
  availableDimensions: DimensionKey[];
  missingDimensions: DimensionKey[];
  availableDimensionCount: number;
  totalDimensionCount: number;
  location: {
    latitude: number;
    longitude: number;
    locationName: string;
    stateCode?: string;
    countryCode?: string;
  };
  timestamp: string;
  summaryHeadline: string;
  summaryExplanation: string;
  methodologyNotes: PulseMethodologyNotes;
  sourcesAttribution: Array<{
    sourceId: string;
    sourceName: string;
    role: string;
    license: string;
    attributionUrl?: string;
  }>;
}

export interface PulseQueryOptions {
  referenceTime?: string;
  bypassCache?: boolean;
  spatialRadiusMeters?: number;
  requestId?: string;
}
