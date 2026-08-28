/**
 * HeatOS: Universal Explanation & Provenance System
 * 
 * Type definitions for the universal explanation metadata across:
 * - Metric cards (Dashboard, Weather, Tools)
 * - Badges & scorecards
 * - Environmental scores (Pulse, Comfort, Nature, etc.)
 * - Forecast events (Thermal peaks, solar maximum, night low)
 * - Alert conditions & active hazard watchdogs
 * - Map inspector metrics & spatial locations
 * - Tool results & AI synthesis
 */

export type ExplanationDataType =
  | 'MEASURED'
  | 'CALCULATED'
  | 'MODELED'
  | 'DERIVED'
  | 'AI INTERPRETATION';

export type ExplanationSource =
  | 'FortyGuard'
  | 'NOAA'
  | 'EPA AirNow'
  | 'HeatOS Derived'
  | 'HeatOS Intelligence'
  | 'Copernicus CAMS'
  | 'NASA POWER'
  | 'ESA WorldCover'
  | 'Open-Meteo'
  | 'National Weather Service'
  | string;

export interface RelatedMetricItem {
  key: string;
  label: string;
  value?: string | number;
}

export interface CalculationDetails {
  isDerived: boolean;
  concept: string;
  inputSignals?: string[];
  transparencyNote?: string;
}

export interface AISynthesisDetails {
  isAISynthesis: boolean;
  basedOnSignals: string[]; // Only signals actually ingested
  disclaimer: string;
}

export interface ForecastEventExplanationDetails {
  eventName: string;
  targetTime: string;
  projectedValue: string;
  whatIsExpected: string;
  why: string;
  keySignals: string[];
  confidence: number;
  limitations: string;
}

export interface AlertExplanationDetails {
  alertTitle: string;
  whatHappened: string;
  whyItTriggered: string;
  severity: string;
  confidence: number;
  affectedLocation: string;
  currentValue: string;
  threshold: string;
  whatToWatchNext: string;
}

export interface MapInspectorExplanationDetails {
  locationName: string;
  coordinates: { lat: number; lng: number };
  whyThisArea: string;
  urbanMorphology?: string;
  sensorCoverage?: string;
}

export interface ExplanationMetadata {
  metricId: string;
  label: string;
  value: string | number;
  unit?: string;
  status?: string; // e.g. 'LIVE', 'ACTIVE', 'WARNING', 'OPTIMAL', 'CACHED', 'ELEVATED'
  source?: ExplanationSource; // Only displayed if actually known
  sourceInstitution?: string;
  dataType: ExplanationDataType;
  timestamp?: string; // Freshness e.g. "Updated just now", "Observed 14:05", "Updated 34s ago"
  whatItMeans: string; // Plain-language explanation
  whyItMatters?: string; // Concise contextual sentence
  calculation?: CalculationDetails; // For derived/calculated metrics
  aiSynthesis?: AISynthesisDetails; // For AI-generated insights
  forecastDetails?: ForecastEventExplanationDetails; // For forecast events
  alertDetails?: AlertExplanationDetails; // For alerts
  mapInspectorDetails?: MapInspectorExplanationDetails; // For map inspector / zones
  confidence?: number | string; // e.g. 96 or "96%"
  spatialResolution?: string; // e.g. "1m - 10m Micro-Spatial Mesh", "Point Station Radius"
  limitations?: string;
  recommendedAction?: string;
  relatedMetrics?: RelatedMetricItem[];
  iconType?: string; // 'heat' | 'air' | 'water' | 'nature' | 'solar' | 'fire' | 'wind' | 'pressure' | 'pulse' | 'ai' | 'alert' | 'map'
}
