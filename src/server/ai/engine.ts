/**
 * HeatOS Phase 8: Nature Analyst AI Engine
 * 
 * Re-routed to CentralAIService for unified AI orchestration,
 * TabiToken Claude AI integration, cache lookup, request deduplication, and local deterministic fallback.
 */

import { CentralAIService } from './centralAIService';
import {
  AIAnalysisRequest,
  AIAnalysisResponse,
} from './types';

export class NatureAnalystEngine {
  /**
   * Main entry point for Nature Analyst AI analysis.
   * Delegated directly to CentralAIService.
   */
  public static async analyze(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    const routerResponse = await CentralAIService.execute({
      latitude: request.latitude,
      longitude: request.longitude,
      locationName: request.locationName,
      prompt: request.prompt,
      preferredPersona: request.preferredPersona,
      preferredSkill: request.preferredSkill,
      activeEventId: request.activeEventId,
      activeMetricKey: request.activeMetricKey,
      quickQuestionKey: request.quickQuestionKey,
      bypassCache: request.bypassCache,
    });

    const d = routerResponse.data;
    return {
      id: routerResponse.id,
      persona: d.persona,
      personaTitle: d.personaTitle,
      skill: d.skill,
      skillTitle: d.skillTitle,
      headline: d.headline,
      confidence: d.confidence,
      insufficientData: d.insufficientData,
      structure: d.structure,
      keyMetrics: d.keyMetrics,
      citations: d.citations,
      suggestedActions: d.suggestedActions,
      suggestedQuestions: d.suggestedQuestions,
      routingRationale: d.routingRationale,
      generatedAt: d.generatedAt,
      isFallback: routerResponse.fallbackUsed || routerResponse.provider === 'local_deterministic',
      providerModel: `${routerResponse.provider.toUpperCase()} (${routerResponse.model})${routerResponse.cacheHit ? ' [CACHED]' : ''}`,
      location: d.location,
    };
  }
}
