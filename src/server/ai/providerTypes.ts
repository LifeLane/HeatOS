/**
 * HeatOS: Central AI Request & Cost-Optimized Provider Types
 */

import { AIPersona, AISkill, AIAction, KeyMetricSnapshot, GroundingCitation, StructuredExplanation } from './types';

export type AIProviderName = 'groq' | 'nvidia' | 'moonshot' | 'local_deterministic';

export interface StructuredAIOutput {
  summary: string;
  whyItMatters: string;
  recommendation: string;
  confidence: number;
  whatsNext?: string;
  suggestedQuestions?: string[];
  headline?: string;
}

export interface AIRouterRequest {
  id?: string;
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
  forceProvider?: AIProviderName;
  imageUrl?: string;
  // Specific targeted data to minimize context window
  targetedData?: {
    temperature?: number;
    feelsLike?: number;
    humidity?: number;
    wetBulb?: number;
    heatIndex?: number;
    dewPoint?: number;
    windSpeed?: number;
    pressure?: number;
    aqi?: number;
    aqiCategory?: string;
    uvIndex?: number;
    solarIrradiance?: number;
    surfaceTemp?: number;
    heatIslandDelta?: number;
    treeCanopy?: number;
    baselineTemperature?: number;
    pulseScore?: number;
  };
}

export interface AIRouterResponse {
  id: string;
  provider: AIProviderName;
  model: string;
  cacheHit: boolean;
  latencyMs: number;
  success: boolean;
  fallbackUsed: boolean;
  retryCount: number;
  data: {
    headline: string;
    structure: StructuredExplanation;
    structuredOutput: StructuredAIOutput;
    confidence: number;
    insufficientData: boolean;
    keyMetrics: KeyMetricSnapshot[];
    citations: GroundingCitation[];
    suggestedActions: AIAction[];
    suggestedQuestions: string[];
    persona: AIPersona;
    personaTitle: string;
    skill: AISkill;
    skillTitle: string;
    routingRationale: string;
    generatedAt: string;
    location: {
      latitude: number;
      longitude: number;
      locationName: string;
    };
  };
}

export interface AICacheEntry {
  response: AIRouterResponse;
  expiresAt: number;
  createdAt: number;
  hitCount: number;
}

export interface AILogRecord {
  requestId: string;
  provider: AIProviderName;
  model: string;
  operation: string;
  location: string;
  cacheHit: boolean;
  latencyMs: number;
  success: boolean;
  fallbackUsed: boolean;
  retryCount: number;
  timestamp: string;
  errorMessage?: string;
}
