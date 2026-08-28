/**
 * HeatOS Phase 8: Nature Analyst AI — Type Definitions
 * 
 * Contracts for specialized Environmental Intelligence Personas, Skills,
 * Agent Router, Grounding Citations, and Structured Explanations.
 */

import { EnvironmentalState } from '../state/types';
import { NaturePulseResult } from '../pulse/types';
import { EnvironmentalEvent } from '../events/types';

export type AIPersona =
  | 'NATURE_ANALYST'
  | 'CLIMATE_ANALYST'
  | 'RISK_ANALYST'
  | 'RESILIENCE_ADVISOR'
  | 'SYSTEM_GUIDE';

export type AISkill =
  | 'analyze_environment'
  | 'explain_event'
  | 'identify_change'
  | 'compare_periods'
  | 'explain_risk'
  | 'analyze_forecast'
  | 'find_peak'
  | 'identify_hotspot'
  | 'summarize_location'
  | 'create_recommendation'
  | 'explain_metric';

export type AIActionType =
  | 'VIEW_MAP'
  | 'VIEW_EVENT'
  | 'VIEW_FORECAST'
  | 'VIEW_LOCATION'
  | 'REFRESH_DATA'
  | 'CREATE_REPORT';

export interface AIAction {
  type: AIActionType;
  label: string;
  payload?: {
    layer?: string;
    eventId?: string;
    locationName?: string;
    coordinates?: { lat: number; lng: number };
    metricKey?: string;
    reportFormat?: 'pdf' | 'json' | 'markdown';
  };
}

export interface GroundingCitation {
  sourceId: string;
  sourceName: string;
  category: string;
  parametersUsed: string[];
  confidence: number;
  freshness: string;
}

export interface KeyMetricSnapshot {
  label: string;
  value: string | number;
  unit: string;
  delta?: string;
  status?: 'optimal' | 'normal' | 'moderate' | 'elevated' | 'warning' | 'critical';
  source?: string;
}

export interface StructuredExplanation {
  whatsHappening: string;
  why: string;
  whatsNext: string;
  whatToDo: string;
}

export interface AIAnalysisRequest {
  prompt?: string;
  latitude: number;
  longitude: number;
  locationName?: string;
  preferredPersona?: AIPersona;
  preferredSkill?: AISkill;
  activeEventId?: string;
  activeMetricKey?: string;
  quickQuestionKey?: string;
  bypassCache?: boolean;
}

export interface AIAnalysisResponse {
  id: string;
  persona: AIPersona;
  personaTitle: string;
  skill: AISkill;
  skillTitle: string;
  headline: string;
  confidence: number; // 0-100%
  insufficientData: boolean;
  structure: StructuredExplanation;
  keyMetrics: KeyMetricSnapshot[];
  citations: GroundingCitation[];
  suggestedActions: AIAction[];
  suggestedQuestions: string[];
  routingRationale: string;
  generatedAt: string;
  isFallback: boolean;
  providerModel: string;
  location: {
    latitude: number;
    longitude: number;
    locationName: string;
  };
}

export interface PersonaMetadata {
  id: AIPersona;
  name: string;
  role: string;
  tagline: string;
  answers: string[];
  icon: string;
  badgeColor: string;
}

export interface SkillMetadata {
  id: AISkill;
  name: string;
  description: string;
  applicablePersonas: AIPersona[];
}

export interface TargetedSkillContext {
  skill: AISkill;
  persona: AIPersona;
  summaryText: string;
  extractedParameters: Record<string, any>;
  citations: GroundingCitation[];
  baselineComparisons?: Record<string, any>;
  activeEventsSummary?: Record<string, any>[];
  pulseOverview?: Record<string, any>;
  forecastOverview?: Record<string, any>;
  hasSufficientData: boolean;
  uncertaintyReason?: string;
}

export interface AITestResult {
  id: string;
  name: string;
  category: string;
  passed: boolean;
  durationMs: number;
  details: string;
  evidence?: any;
}

export interface AITestReport {
  suiteName: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  durationMs: number;
  timestamp: string;
  results: AITestResult[];
}

