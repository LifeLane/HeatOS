/**
 * HeatOS Phase 8: Nature Analyst AI — Agent Router
 * 
 * Routes incoming questions and environmental state vectors to the appropriate
 * Persona, Skill, and Curated Context.
 */

import { EnvironmentalState } from '../state/types';
import { NaturePulseResult } from '../pulse/types';
import { EnvironmentalEvent } from '../events/types';
import {
  AIPersona,
  AISkill,
  PersonaMetadata,
  SkillMetadata,
  TargetedSkillContext,
  GroundingCitation,
} from './types';
import { buildGroundingCitations } from './skills/base';

export const PERSONA_METADATA: Record<AIPersona, PersonaMetadata> = {
  NATURE_ANALYST: {
    id: 'NATURE_ANALYST',
    name: 'Nature Analyst',
    role: 'Biophysical Intelligence Specialist',
    tagline: 'Interprets real-time biophysical state, ecosystem vitality, and microclimate drivers.',
    answers: ['What is happening?', 'What changed?', 'Why?'],
    icon: 'Leaf',
    badgeColor: 'emerald',
  },
  CLIMATE_ANALYST: {
    id: 'CLIMATE_ANALYST',
    name: 'Climate Analyst',
    role: 'Microclimate & Trend Modeler',
    tagline: 'Quantifies historical departures, atmospheric anomalies, and predictive trajectories.',
    answers: ['What is unusual?', 'How is the trend changing?', 'What might happen next?'],
    icon: 'CloudSun',
    badgeColor: 'sky',
  },
  RISK_ANALYST: {
    id: 'RISK_ANALYST',
    name: 'Risk Analyst',
    role: 'Hazard & Vulnerability Assessor',
    tagline: 'Evaluates compound environmental stressors, extreme wet-bulb thresholds, and exposure risks.',
    answers: ['What matters most?', 'Where is risk increasing?'],
    icon: 'ShieldAlert',
    badgeColor: 'rose',
  },
  RESILIENCE_ADVISOR: {
    id: 'RESILIENCE_ADVISOR',
    name: 'Resilience Advisor',
    role: 'Urban Mitigation & Action Strategist',
    tagline: 'Prescribes high-ROI cooling interventions, municipal playbooks, and monitoring priorities.',
    answers: ['What should we do?', 'What should we monitor?'],
    icon: 'Lightbulb',
    badgeColor: 'amber',
  },
  SYSTEM_GUIDE: {
    id: 'SYSTEM_GUIDE',
    name: 'System Guide',
    role: 'HeatOS Architecture & Metric Navigator',
    tagline: 'Explains biophysical formulas, safety thresholds, and data mesh telemetry operations.',
    answers: ['What does this metric mean?', 'How does HeatOS work?'],
    icon: 'BookOpen',
    badgeColor: 'indigo',
  },
};

export const SKILL_METADATA: Record<AISkill, SkillMetadata> = {
  analyze_environment: {
    id: 'analyze_environment',
    name: 'Analyze Environment',
    description: 'Holistic assessment of thermal, atmospheric, ecological, and hydrological states.',
    applicablePersonas: ['NATURE_ANALYST', 'SYSTEM_GUIDE'],
  },
  explain_event: {
    id: 'explain_event',
    name: 'Explain Event',
    description: 'Structured breakdown of detected anomalies, physical drivers, and evidence.',
    applicablePersonas: ['NATURE_ANALYST', 'RISK_ANALYST'],
  },
  identify_change: {
    id: 'identify_change',
    name: 'Identify Change',
    description: 'Rate-of-change (dT/dt) analysis, recent shifts, and acceleration patterns.',
    applicablePersonas: ['NATURE_ANALYST', 'CLIMATE_ANALYST'],
  },
  compare_periods: {
    id: 'compare_periods',
    name: 'Compare Periods',
    description: 'Multi-period and historical baseline comparison to identify deviations.',
    applicablePersonas: ['CLIMATE_ANALYST'],
  },
  explain_risk: {
    id: 'explain_risk',
    name: 'Explain Risk',
    description: 'Compound hazard convergence, extreme heat metrics, and public health impact.',
    applicablePersonas: ['RISK_ANALYST'],
  },
  analyze_forecast: {
    id: 'analyze_forecast',
    name: 'Analyze Forecast',
    description: 'Predictive 24h-72h microclimate trajectory and thermal mass retention curves.',
    applicablePersonas: ['CLIMATE_ANALYST', 'RESILIENCE_ADVISOR'],
  },
  find_peak: {
    id: 'find_peak',
    name: 'Find Peak',
    description: 'Pinpoints daily maximum thermal, solar UV, and AQI stress windows.',
    applicablePersonas: ['CLIMATE_ANALYST', 'RESILIENCE_ADVISOR'],
  },
  identify_hotspot: {
    id: 'identify_hotspot',
    name: 'Identify Hotspot',
    description: 'Locates spatial microclimate thermal traps and high-albedo deficit zones.',
    applicablePersonas: ['RISK_ANALYST', 'RESILIENCE_ADVISOR'],
  },
  summarize_location: {
    id: 'summarize_location',
    name: 'Summarize Location',
    description: 'Concise executive environmental overview for the active spatial node.',
    applicablePersonas: ['NATURE_ANALYST', 'SYSTEM_GUIDE'],
  },
  create_recommendation: {
    id: 'create_recommendation',
    name: 'Create Recommendation',
    description: 'Prioritized, phased cooling interventions with estimated thermal ROI.',
    applicablePersonas: ['RESILIENCE_ADVISOR'],
  },
  explain_metric: {
    id: 'explain_metric',
    name: 'Explain Metric',
    description: 'Scientific definitions, formulas, and safety threshold interpretations.',
    applicablePersonas: ['SYSTEM_GUIDE'],
  },
};

export interface RouterInput {
  prompt?: string;
  quickQuestionKey?: string;
  preferredPersona?: AIPersona;
  preferredSkill?: AISkill;
  activeEventId?: string;
  activeMetricKey?: string;
  locationName: string;
  state: EnvironmentalState;
  pulse?: NaturePulseResult | null;
  events?: EnvironmentalEvent[];
}

export interface RouterOutput {
  persona: AIPersona;
  skill: AISkill;
  routingRationale: string;
  curatedContext: TargetedSkillContext;
}

export class AgentRouter {
  /**
   * Evaluates input prompt or context and routes to the optimal Persona, Skill, and targeted data slice.
   */
  public static route(input: RouterInput): RouterOutput {
    const { prompt = '', quickQuestionKey, preferredPersona, preferredSkill, activeEventId, activeMetricKey } = input;
    const cleanPrompt = prompt.toLowerCase().trim();

    let resolvedPersona: AIPersona = preferredPersona || 'NATURE_ANALYST';
    let resolvedSkill: AISkill = preferredSkill || 'analyze_environment';
    let rationale = 'Default holistic environmental evaluation';

    // 1. Quick Question Shortcuts
    if (quickQuestionKey) {
      if (quickQuestionKey === 'whats_happening' || quickQuestionKey === 'what_happened') {
        resolvedPersona = 'NATURE_ANALYST';
        resolvedSkill = 'analyze_environment';
        rationale = 'Quick Question: Overview of current biophysical state.';
      } else if (quickQuestionKey === 'what_changed') {
        resolvedPersona = 'NATURE_ANALYST';
        resolvedSkill = 'identify_change';
        rationale = 'Quick Question: Rate-of-change and recent thermal shifts.';
      } else if (quickQuestionKey === 'why_unusual') {
        resolvedPersona = 'CLIMATE_ANALYST';
        resolvedSkill = 'compare_periods';
        rationale = 'Quick Question: Historical baseline departure and anomalies.';
      } else if (quickQuestionKey === 'what_to_watch' || quickQuestionKey === 'what_matters') {
        resolvedPersona = 'RISK_ANALYST';
        resolvedSkill = 'explain_risk';
        rationale = 'Quick Question: Compound risk vectors and vulnerable areas.';
      } else if (quickQuestionKey === 'whats_next') {
        resolvedPersona = 'CLIMATE_ANALYST';
        resolvedSkill = 'analyze_forecast';
        rationale = 'Quick Question: Predictive 24h-72h microclimate trajectory.';
      } else if (quickQuestionKey === 'what_to_do') {
        resolvedPersona = 'RESILIENCE_ADVISOR';
        resolvedSkill = 'create_recommendation';
        rationale = 'Quick Question: Actionable municipal interventions and cooling ROI.';
      }
    }
    // 2. Active Event Focus
    else if (activeEventId) {
      resolvedPersona = 'RISK_ANALYST';
      resolvedSkill = 'explain_event';
      rationale = `Targeted inspection of detected incident ${activeEventId}.`;
    }
    // 3. Active Metric Deep-Dive Focus
    else if (activeMetricKey) {
      resolvedPersona = 'SYSTEM_GUIDE';
      resolvedSkill = 'explain_metric';
      rationale = `Educational deep-dive on metric definition for ${activeMetricKey}.`;
    }
    // 4. Natural Language Intent Parsing (if no explicit preference)
    else if (!preferredPersona && !preferredSkill && cleanPrompt.length > 0) {
      if (cleanPrompt.includes('recommend') || cleanPrompt.includes('what to do') || cleanPrompt.includes('solution') || cleanPrompt.includes('intervention') || cleanPrompt.includes('mitigate') || cleanPrompt.includes('pavement') || cleanPrompt.includes('canopy')) {
        resolvedPersona = 'RESILIENCE_ADVISOR';
        resolvedSkill = 'create_recommendation';
        rationale = 'Natural Language: User requested cooling solutions or civic actions.';
      } else if (cleanPrompt.includes('risk') || cleanPrompt.includes('danger') || cleanPrompt.includes('hazard') || cleanPrompt.includes('vulnerable') || cleanPrompt.includes('threat') || cleanPrompt.includes('wet bulb')) {
        resolvedPersona = 'RISK_ANALYST';
        resolvedSkill = 'explain_risk';
        rationale = 'Natural Language: User inquired about hazard levels or vulnerability.';
      } else if (cleanPrompt.includes('hotspot') || cleanPrompt.includes('where is it hottest') || cleanPrompt.includes('worst area') || cleanPrompt.includes('canyon')) {
        resolvedPersona = 'RISK_ANALYST';
        resolvedSkill = 'identify_hotspot';
        rationale = 'Natural Language: Spatial hotspot identification request.';
      } else if (cleanPrompt.includes('forecast') || cleanPrompt.includes('tomorrow') || cleanPrompt.includes('later') || cleanPrompt.includes('next 24') || cleanPrompt.includes('future') || cleanPrompt.includes('trend')) {
        resolvedPersona = 'CLIMATE_ANALYST';
        resolvedSkill = 'analyze_forecast';
        rationale = 'Natural Language: User requested predictive forecast trajectory.';
      } else if (cleanPrompt.includes('peak') || cleanPrompt.includes('highest') || cleanPrompt.includes('when is it hottest') || cleanPrompt.includes('worst hour')) {
        resolvedPersona = 'CLIMATE_ANALYST';
        resolvedSkill = 'find_peak';
        rationale = 'Natural Language: Diurnal peak exposure query.';
      } else if (cleanPrompt.includes('change') || cleanPrompt.includes('rate') || cleanPrompt.includes('dt/dt') || cleanPrompt.includes('faster') || cleanPrompt.includes('heating up')) {
        resolvedPersona = 'NATURE_ANALYST';
        resolvedSkill = 'identify_change';
        rationale = 'Natural Language: Rate-of-change and dynamic shift inquiry.';
      } else if (cleanPrompt.includes('compare') || cleanPrompt.includes('unusual') || cleanPrompt.includes('normal') || cleanPrompt.includes('baseline') || cleanPrompt.includes('historical') || cleanPrompt.includes('anomaly')) {
        resolvedPersona = 'CLIMATE_ANALYST';
        resolvedSkill = 'compare_periods';
        rationale = 'Natural Language: Historical baseline and anomaly comparison.';
      } else if (cleanPrompt.includes('what is') || cleanPrompt.includes('meaning') || cleanPrompt.includes('formula') || cleanPrompt.includes('how does heatos work') || cleanPrompt.includes('definition')) {
        resolvedPersona = 'SYSTEM_GUIDE';
        resolvedSkill = 'explain_metric';
        rationale = 'Natural Language: System or metric conceptual inquiry.';
      } else if (cleanPrompt.includes('summary') || cleanPrompt.includes('brief') || cleanPrompt.includes('overview') || cleanPrompt.includes('city')) {
        resolvedPersona = 'NATURE_ANALYST';
        resolvedSkill = 'summarize_location';
        rationale = 'Natural Language: Executive location briefing requested.';
      }
    }

    const curatedContext = this.assembleTargetedContext(resolvedSkill, resolvedPersona, input);

    return {
      persona: resolvedPersona,
      skill: resolvedSkill,
      routingRationale: rationale,
      curatedContext,
    };
  }

  /**
   * Assembles concise, targeted structured data for the specific skill.
   */
  private static assembleTargetedContext(
    skill: AISkill,
    persona: AIPersona,
    input: RouterInput
  ): TargetedSkillContext {
    const { state, pulse, events, locationName } = input;
    const citations: GroundingCitation[] = buildGroundingCitations(state, []);

    const extractedParameters: Record<string, any> = {
      location: locationName,
      coordinates: { lat: state.location?.latitude ?? 0, lng: state.location?.longitude ?? 0 },
      ambientTempC: state.temperature?.ambient?.value ?? null,
      surfaceTempC: state.temperature?.surface?.value ?? null,
      aqi: state.airQuality?.aqi?.value ?? null,
      relativeHumidity: state.humidity?.relativeHumidity?.value ?? null,
      wetBulbTempC: state.temperature?.wetBulb?.value ?? null,
      ndvi: state.vegetation?.ndvi?.value ?? null,
      soilMoisture: state.water?.relativeSoilMoisturePct?.value ?? null,
      dataConfidence: state.confidence?.overallScore ?? 90,
    };

    let summaryText = `Location: ${locationName} | Ambient: ${extractedParameters.ambientTempC}°C | Surface: ${extractedParameters.surfaceTempC}°C | AQI: ${extractedParameters.aqi}`;

    return {
      skill,
      persona,
      summaryText,
      extractedParameters,
      citations,
      activeEventsSummary: events?.map(e => ({ id: e.id, headline: e.summary.headline, severity: e.severity, type: e.type })),
      pulseOverview: pulse ? { score: pulse.overallScore, status: pulse.overallStatus } : undefined,
      hasSufficientData: extractedParameters.ambientTempC !== null,
    };
  }
}
