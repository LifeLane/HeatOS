/**
 * HeatOS Phase 8: Nature Analyst AI Client Service
 * 
 * Communicates with backend Nature Analyst AI Engine and provides
 * personas, quick questions, and automated test diagnostics.
 */

import {
  AIAnalysisRequest,
  AIAnalysisResponse,
  PersonaMetadata,
  SkillMetadata,
  AITestReport,
} from '../server/ai/types';

export interface QuickQuestionItem {
  key: string;
  label: string;
  persona: string;
  skill: string;
}

export interface PersonasMetaResponse {
  personas: PersonaMetadata[];
  skills: SkillMetadata[];
  quickQuestions: QuickQuestionItem[];
}

export class AiAnalystService {
  /**
   * Request specialized environmental intelligence analysis from HeatOS AI Engine.
   */
  public static async analyze(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    const response = await fetch('/api/environmental/ai/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to analyze environmental data: HTTP ${response.status}`);
    }

    return response.json();
  }

  /**
   * Fetch registered Persona and Skill metadata.
   */
  public static async fetchPersonas(): Promise<PersonasMetaResponse> {
    const response = await fetch('/api/environmental/ai/personas');
    if (!response.ok) {
      throw new Error(`Failed to fetch AI personas metadata: HTTP ${response.status}`);
    }
    return response.json();
  }

  /**
   * Run automated 8-point Nature Analyst AI test suite.
   */
  public static async runDiagnostics(): Promise<AITestReport> {
    const response = await fetch('/api/environmental/ai/tests');
    if (!response.ok) {
      throw new Error(`Failed to execute AI diagnostics: HTTP ${response.status}`);
    }
    return response.json();
  }
}
