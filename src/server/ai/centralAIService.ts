/**
 * HeatOS: Centralized AI Service & Smart Provider Router
 * 
 * Pipeline Architecture:
 * UI -> HeatOS API -> CentralAIService -> Request Deduplication Lock -> Response Cache Lookup -> Deterministic Environmental Context -> TabiToken (claude-opus-4-8) -> Structured HeatOS Response
 */

import { AIRouterRequest, AIRouterResponse, AIProviderName, StructuredAIOutput } from './providerTypes';
import { AICacheService } from './cacheService';
import { AILoggerService } from './loggerService';
import { callTabiTokenChat, getTabiTokenConfig } from './providers';
import { LocalIntelligenceEngine } from './localIntelligence';
import { EnvironmentalStateManager } from '../state/snapshot';
import { NaturePulseEngine } from '../pulse/engine';
import { EnvironmentalEventEngine } from '../events/engine';
import { AgentRouter, PERSONA_METADATA, SKILL_METADATA } from './router';
import { EnvironmentalSkillRegistry } from './skills/environmentalSkills';
import { StructuredExplanation, KeyMetricSnapshot, GroundingCitation, AIAction } from './types';
import { FortyGuardLogger } from '../fortyguard/logger';

export class CentralAIService {
  // In-flight request deduplication map
  private static inFlightRequests: Map<string, Promise<AIRouterResponse>> = new Map();

  /**
   * Main dispatch method for all HeatOS AI operations.
   */
  public static async execute(request: AIRouterRequest): Promise<AIRouterResponse> {
    const startTime = Date.now();
    const requestId = request.id || `ai_req_${startTime}_${Math.random().toString(36).substring(2, 6)}`;
    const locationName = request.locationName || 'Monitored Location';

    // 1. Build cache key for deduplication and caching
    const operation = request.preferredSkill || request.quickQuestionKey || request.activeMetricKey || 'general_analysis';
    const dedupeKey = AICacheService.buildKey({
      operation,
      location: locationName,
      persona: request.preferredPersona,
      prompt: request.prompt,
      targetedDataKey: this.summarizeTargetedData(request.targetedData),
    });

    // 2. Check Cache
    if (!request.bypassCache) {
      const cached = AICacheService.get(dedupeKey);
      if (cached) {
        AILoggerService.log({
          requestId,
          provider: cached.provider,
          model: cached.model,
          operation,
          location: locationName,
          cacheHit: true,
          latencyMs: Date.now() - startTime,
          success: true,
          fallbackUsed: cached.fallbackUsed,
          retryCount: 0,
          timestamp: new Date().toISOString(),
        });
        return cached;
      }
    } else {
      // User explicitly requested cache bypass - invalidate any stale entry for this key
      AICacheService.delete(dedupeKey);
    }

    // 3. Request Deduplication: If identical request is already running, join its promise (unless bypassCache is requested)
    if (!request.bypassCache && this.inFlightRequests.has(dedupeKey)) {
      try {
        const result = await this.inFlightRequests.get(dedupeKey)!;
        return {
          ...result,
          cacheHit: true,
        };
      } catch {
        // If the shared request failed, proceed to try independently
      }
    }

    // Wrap execution and store in deduplication map
    const executionPromise = this.performRoutingPipeline(requestId, dedupeKey, request, startTime);
    this.inFlightRequests.set(dedupeKey, executionPromise);

    try {
      const response = await executionPromise;
      // Save to cache ONLY if successful and NOT a fallback / degraded response
      if (response.success && !request.bypassCache && !response.fallbackUsed) {
        AICacheService.set(dedupeKey, response);
      }
      return response;
    } finally {
      this.inFlightRequests.delete(dedupeKey);
    }
  }

  /**
   * Internal routing and provider execution pipeline
   */
  private static async performRoutingPipeline(
    requestId: string,
    cacheKey: string,
    request: AIRouterRequest,
    startTime: number
  ): Promise<AIRouterResponse> {
    const {
      latitude,
      longitude,
      locationName = 'Monitored Location',
      prompt,
      preferredPersona,
      preferredSkill,
      activeEventId,
      activeMetricKey,
      quickQuestionKey,
      targetedData,
    } = request;

    // 1. Fetch Structured Environmental Snapshots (if not purely provided via targetedData)
    const [state, pulseResult, eventFeed] = await Promise.all([
      EnvironmentalStateManager.getEnvironmentalSnapshot(
        { latitude, longitude, locationName },
        { bypassCache: request.bypassCache }
      ),
      NaturePulseEngine.evaluatePulse(
        { latitude, longitude, locationName },
        { bypassCache: request.bypassCache }
      ).catch(() => null),
      EnvironmentalEventEngine.evaluateEvents({
        latitude,
        longitude,
        locationName,
        bypassCache: request.bypassCache,
      }).catch(() => null),
    ]);

    // 2. Evaluate Routing (Persona, Skill, and Curated Context)
    const routingResult = AgentRouter.route({
      prompt,
      quickQuestionKey,
      preferredPersona,
      preferredSkill,
      activeEventId,
      activeMetricKey,
      locationName,
      state,
      pulse: pulseResult,
      events: eventFeed?.events,
    });

    const { persona, skill, routingRationale, curatedContext } = routingResult;
    let personaMeta = PERSONA_METADATA[persona as keyof typeof PERSONA_METADATA];
    if (!personaMeta) {
      personaMeta = PERSONA_METADATA['NATURE_ANALYST'];
    }
    
    let skillMeta = SKILL_METADATA[skill as keyof typeof SKILL_METADATA];
    if (!skillMeta) {
      skillMeta = SKILL_METADATA['analyze_environment'];
    }

    // 3. Compute Deterministic Local Intelligence (Authoritative Foundation)
    const deterministicResult = this.computeDeterministicBaseline(
      skill,
      persona,
      prompt,
      locationName,
      latitude,
      longitude,
      state,
      pulseResult,
      eventFeed?.events,
      activeEventId,
      activeMetricKey,
      targetedData
    );

    // 4. Minimize Context Payload (Strict context minimization rule)
    const minimizedContext = this.buildMinimizedContext(skill, state, curatedContext, targetedData);

    // 5. Build System Instruction and User Prompt for AI
    const systemInstruction = `You are the HeatOS Nature Analyst AI, persona "${personaMeta.name}" (${personaMeta.role}).
Core Principle: Authoritative environmental data is ground truth. Interpret biophysical drivers without hallucination.
Respond in valid JSON adhering strictly to:
- headline: Executive summary (max 10 words)
- whatsHappening: Observed microclimate conditions based on provided signals.
- why: Physical and biophysical drivers (solar radiation, heat retention, canopy deficit, humidity).
- whatsNext: Trajectory for the next 6-24 hours.
- whatToDo: Practical actionable advice.
- suggestedQuestions: 2-3 focused follow-up inquiries.`;

    const userPrompt = `User Query: "${prompt || quickQuestionKey || skillMeta.name}"
Location: ${locationName} (${latitude.toFixed(4)}, ${longitude.toFixed(4)})
Targeted Signals:
${JSON.stringify(minimizedContext, null, 2)}
Active Events: ${JSON.stringify(curatedContext.activeEventsSummary || [], null, 2)}
Composite Vitality Score: ${pulseResult?.overallScore ?? targetedData?.pulseScore ?? 'N/A'}/100`;

    
    // 6. TabiToken AI Invocation (Exclusive Provider) with graceful local deterministic fallback
    const tabiConfig = getTabiTokenConfig();
    let provider: AIProviderName = 'tabitoken';
    let modelName = tabiConfig.model;
    let rawOutput: any = null;
    let fallbackUsed = false;
    let retryCount = 0;

    if (!tabiConfig.apiKey) {
      FortyGuardLogger.info('Local deterministic intelligence engine engaged (TabiToken key unconfigured or in offline mode)', { requestId });
      fallbackUsed = true;
      provider = 'local_deterministic';
      modelName = 'local-deterministic-engine';
    } else {
      try {
        rawOutput = await callTabiTokenChat({
          requestId,
          systemInstruction,
          userPrompt,
          imageUrl: request.imageUrl,
        });
      } catch (err: any) {
        FortyGuardLogger.info('Upstream AI unavailable, engaging local deterministic intelligence engine', {
          requestId,
          reason: err.message,
        });
        fallbackUsed = true;
        provider = 'local_deterministic';
        modelName = 'local-deterministic-engine';
      }
    }

    // 7. Assemble and Validate Final Structured Response
    let finalStructure: StructuredExplanation = deterministicResult.structure;
    let headline = deterministicResult.headline;
    let suggestedQuestions = deterministicResult.suggestedQuestions;
    let confidence = deterministicResult.confidence;

    if (!fallbackUsed && rawOutput && rawOutput.whatsHappening && rawOutput.why && rawOutput.whatsNext && rawOutput.whatToDo) {
      finalStructure = {
        whatsHappening: rawOutput.whatsHappening,
        why: rawOutput.why,
        whatsNext: rawOutput.whatsNext,
        whatToDo: rawOutput.whatToDo,
      };
      if (rawOutput.headline) headline = rawOutput.headline;
      if (rawOutput.suggestedQuestions) suggestedQuestions = rawOutput.suggestedQuestions;
      confidence = rawOutput.confidence || 96;
    } else if (!fallbackUsed) {
      FortyGuardLogger.warn('TabiToken response missing required fields, falling back to local deterministic intelligence.', { requestId });
      fallbackUsed = true;
      provider = 'local_deterministic';
      modelName = 'local-deterministic-engine';
    }

    const structuredOutput: StructuredAIOutput = {
      summary: finalStructure.whatsHappening,
      whyItMatters: finalStructure.why,
      recommendation: finalStructure.whatToDo,
      whatsNext: finalStructure.whatsNext,
      confidence,
      headline,
      suggestedQuestions,
    };

    const latencyMs = Date.now() - startTime;
    const response: AIRouterResponse = {
      id: requestId,
      provider,
      model: modelName,
      cacheHit: false,
      latencyMs,
      success: true,
      fallbackUsed,
      retryCount,
      data: {
        headline,
        structure: finalStructure,
        structuredOutput,
        confidence,
        insufficientData: deterministicResult.insufficientData,
        keyMetrics: deterministicResult.keyMetrics,
        citations: deterministicResult.citations,
        suggestedActions: deterministicResult.suggestedActions,
        suggestedQuestions,
        persona,
        personaTitle: personaMeta.name,
        skill,
        skillTitle: skillMeta.name,
        routingRationale,
        generatedAt: new Date().toISOString(),
        location: {
          latitude,
          longitude,
          locationName,
        },
      },
    };

    // Log request telemetry
    AILoggerService.log({
      requestId,
      provider,
      model: modelName,
      operation: skill,
      location: locationName,
      cacheHit: false,
      latencyMs,
      success: true,
      fallbackUsed,
      retryCount,
      timestamp: new Date().toISOString(),
    });

    return response;
  }

  /**
   * Builds minimized context payload based on skill to prevent token bloat
   */
  private static buildMinimizedContext(
    skill: string,
    state: any,
    curatedContext: any,
    targetedData?: AIRouterRequest['targetedData']
  ): Record<string, any> {
    if (targetedData) {
      return targetedData;
    }

    const temp = state.temperature;
    const air = state.airQuality;
    const veg = state.vegetation;
    const atm = state.atmosphere;

    switch (skill) {
      case 'explain_metric':
      case 'find_peak':
        return {
          ambientTemp: temp?.ambient?.value,
          apparentTemp: temp?.feelsLike?.value,
          heatIndex: temp?.heatIndex?.value,
          wetBulb: temp?.wetBulb?.value,
        };

      case 'identify_hotspot':
        return {
          surfaceTemp: temp?.surface?.value,
          ambientTemp: temp?.ambient?.value,
          heatIslandDelta: temp?.surface?.value && temp?.ambient?.value ? temp.surface.value - temp.ambient.value : undefined,
          treeCanopy: veg?.canopyCoverPct?.value,
        };

      case 'explain_risk':
        return {
          ambientTemp: temp?.ambient?.value,
          feelsLike: temp?.feelsLike?.value,
          humidity: atm?.relativeHumidityPct?.value,
          wetBulb: temp?.wetBulb?.value,
          aqi: air?.aqi?.value,
          uvIndex: state.solar?.uvIndex?.value,
        };

      default:
        // Compact summary only
        return {
          temperature: temp?.ambient?.value,
          feelsLike: temp?.feelsLike?.value,
          uhiDelta: temp?.surface?.value && temp?.ambient?.value ? (temp.surface.value - temp.ambient.value).toFixed(1) : undefined,
          aqi: air?.aqi?.value,
          treeCanopyPct: veg?.canopyCoverPct?.value,
        };
    }
  }

  /**
   * Deterministic baseline skill execution
   */
  private static computeDeterministicBaseline(
    skill: any,
    persona: any,
    userPrompt: string | undefined,
    locationName: string,
    latitude: number,
    longitude: number,
    state: any,
    pulse: any,
    events: any,
    activeEventId: string | undefined,
    activeMetricKey: string | undefined,
    targetedData?: AIRouterRequest['targetedData']
  ) {
    const input = {
      skill,
      persona,
      userPrompt,
      locationName,
      latitude,
      longitude,
      state,
      pulse,
      events,
      activeEventId,
      activeMetricKey,
    };

    switch (skill) {
      case 'analyze_environment':
        return EnvironmentalSkillRegistry.analyzeEnvironment(input);
      case 'explain_event':
        return EnvironmentalSkillRegistry.explainEvent(input);
      case 'identify_change':
        return EnvironmentalSkillRegistry.identifyChange(input);
      case 'compare_periods':
        return EnvironmentalSkillRegistry.comparePeriods(input);
      case 'explain_risk':
        return EnvironmentalSkillRegistry.explainRisk(input);
      case 'analyze_forecast':
        return EnvironmentalSkillRegistry.analyzeForecast(input);
      case 'find_peak':
        return EnvironmentalSkillRegistry.findPeak(input);
      case 'identify_hotspot':
        return EnvironmentalSkillRegistry.identifyHotspot(input);
      case 'summarize_location':
        return EnvironmentalSkillRegistry.summarizeLocation(input);
      case 'create_recommendation':
        return EnvironmentalSkillRegistry.createRecommendation(input);
      case 'explain_metric':
        return EnvironmentalSkillRegistry.explainMetric(input);
      default:
        return EnvironmentalSkillRegistry.analyzeEnvironment(input);
    }
  }

  private static summarizeTargetedData(data?: AIRouterRequest['targetedData']): string | undefined {
    if (!data) return undefined;
    return Object.entries(data)
      .map(([k, v]) => `${k}=${v}`)
      .join(',');
  }
}
