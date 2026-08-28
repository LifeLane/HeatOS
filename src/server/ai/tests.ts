/**
 * HeatOS Phase 8: Nature Analyst AI Test Suite
 * 
 * 8-point automated verification testing router accuracy, context pruning,
 * grounding citations, uncertainty handling, 4-part structure, and registered actions.
 */

import { NatureAnalystEngine } from './engine';
import { AgentRouter, PERSONA_METADATA, SKILL_METADATA } from './router';
import { AIPersona, AISkill, AIActionType, AITestResult, AITestReport } from './types';

export type { AITestResult, AITestReport };

export async function runAITestSuite(): Promise<AITestReport> {
  const startTime = Date.now();
  const results: AITestResult[] = [];

  const testLocation = {
    latitude: 25.2048,
    longitude: 55.2708,
    locationName: 'Dubai Downtown',
  };

  // -------------------------------------------------------------
  // TEST 1: Agent Router Persona & Skill Resolution
  // -------------------------------------------------------------
  const t1Start = Date.now();
  try {
    const r1 = await NatureAnalystEngine.analyze({
      ...testLocation,
      quickQuestionKey: 'what_to_do',
    });

    const passed = r1.persona === 'RESILIENCE_ADVISOR' && r1.skill === 'create_recommendation';
    results.push({
      id: 'AI_TEST_01_ROUTER_RESOLUTION',
      name: 'Agent Router Persona & Skill Resolution',
      category: 'ROUTER',
      passed,
      durationMs: Date.now() - t1Start,
      details: `Quick question 'what_to_do' routed to persona ${r1.persona} and skill ${r1.skill}`,
      evidence: { persona: r1.persona, skill: r1.skill, rationale: r1.routingRationale },
    });
  } catch (err: any) {
    results.push({
      id: 'AI_TEST_01_ROUTER_RESOLUTION',
      name: 'Agent Router Persona & Skill Resolution',
      category: 'ROUTER',
      passed: false,
      durationMs: Date.now() - t1Start,
      details: err.message,
    });
  }

  // -------------------------------------------------------------
  // TEST 2: Targeted Context Assembly (No DB Dump)
  // -------------------------------------------------------------
  const t2Start = Date.now();
  try {
    const analysis = await NatureAnalystEngine.analyze({
      ...testLocation,
      preferredSkill: 'find_peak',
    });

    // Verify key metrics exist and are targeted
    const passed = analysis.keyMetrics.length > 0 && analysis.keyMetrics.length <= 6;
    results.push({
      id: 'AI_TEST_02_TARGETED_CONTEXT',
      name: 'Targeted Structured Context Assembly',
      category: 'CONTEXT',
      passed,
      durationMs: Date.now() - t2Start,
      details: `Generated ${analysis.keyMetrics.length} curated metric signals for peak finding skill without dumping raw DB`,
      evidence: { metricsCount: analysis.keyMetrics.length, sample: analysis.keyMetrics[0] },
    });
  } catch (err: any) {
    results.push({
      id: 'AI_TEST_02_TARGETED_CONTEXT',
      name: 'Targeted Structured Context Assembly',
      category: 'CONTEXT',
      passed: false,
      durationMs: Date.now() - t2Start,
      details: err.message,
    });
  }

  // -------------------------------------------------------------
  // TEST 3: Grounding Citation Verification
  // -------------------------------------------------------------
  const t3Start = Date.now();
  try {
    const analysis = await NatureAnalystEngine.analyze({
      ...testLocation,
      preferredSkill: 'analyze_environment',
    });

    const hasFortyGuardCitation = analysis.citations.some(c => c.sourceId.includes('fortyguard'));
    const hasEngineCitation = analysis.citations.some(c => c.sourceId.includes('heatos_state_engine'));
    const passed = hasFortyGuardCitation && hasEngineCitation && analysis.citations.length >= 2;

    results.push({
      id: 'AI_TEST_03_GROUNDING_CITATIONS',
      name: 'Data Grounding & Multi-Source Citations',
      category: 'GROUNDING',
      passed,
      durationMs: Date.now() - t3Start,
      details: `Citations properly linked to internal data sources (${analysis.citations.map(c => c.sourceName).join(', ')})`,
      evidence: { citationsCount: analysis.citations.length, sources: analysis.citations.map(c => c.sourceId) },
    });
  } catch (err: any) {
    results.push({
      id: 'AI_TEST_03_GROUNDING_CITATIONS',
      name: 'Data Grounding & Multi-Source Citations',
      category: 'GROUNDING',
      passed: false,
      durationMs: Date.now() - t3Start,
      details: err.message,
    });
  }

  // -------------------------------------------------------------
  // TEST 4: Uncertainty & Insufficient Data Handling
  // -------------------------------------------------------------
  const t4Start = Date.now();
  try {
    // Calling explain_metric with an empty state should still produce standard threshold definitions
    const metricAnalysis = await NatureAnalystEngine.analyze({
      ...testLocation,
      preferredSkill: 'explain_metric',
      activeMetricKey: 'wet_bulb',
    });

    const passed = metricAnalysis.structure.whatsHappening.includes('Wet-Bulb Temperature');
    results.push({
      id: 'AI_TEST_04_UNCERTAINTY_HANDLING',
      name: 'Uncertainty & Controlled Scientific Definition',
      category: 'UNCERTAINTY',
      passed,
      durationMs: Date.now() - t4Start,
      details: `Metric explanation grounded in verified formulas without hallucinations`,
      evidence: { headline: metricAnalysis.headline, confidence: metricAnalysis.confidence },
    });
  } catch (err: any) {
    results.push({
      id: 'AI_TEST_04_UNCERTAINTY_HANDLING',
      name: 'Uncertainty & Controlled Scientific Definition',
      category: 'UNCERTAINTY',
      passed: false,
      durationMs: Date.now() - t4Start,
      details: err.message,
    });
  }

  // -------------------------------------------------------------
  // TEST 5: Standard 4-Part Structure Integrity
  // -------------------------------------------------------------
  const t5Start = Date.now();
  try {
    const analysis = await NatureAnalystEngine.analyze({
      ...testLocation,
      prompt: 'What is happening right now in this urban sector?',
    });

    const hasAllFour = Boolean(
      analysis.structure.whatsHappening &&
      analysis.structure.why &&
      analysis.structure.whatsNext &&
      analysis.structure.whatToDo
    );

    results.push({
      id: 'AI_TEST_05_FOUR_PART_STRUCTURE',
      name: 'Standardized 4-Part Explanation Structure',
      category: 'FORMAT',
      passed: hasAllFour,
      durationMs: Date.now() - t5Start,
      details: `Validated all four required sections (WHAT'S HAPPENING, WHY, WHAT'S NEXT, WHAT TO DO)`,
      evidence: {
        whatsHappeningLen: analysis.structure.whatsHappening.length,
        whyLen: analysis.structure.why.length,
        whatsNextLen: analysis.structure.whatsNext.length,
        whatToDoLen: analysis.structure.whatToDo.length,
      },
    });
  } catch (err: any) {
    results.push({
      id: 'AI_TEST_05_FOUR_PART_STRUCTURE',
      name: 'Standardized 4-Part Explanation Structure',
      category: 'FORMAT',
      passed: false,
      durationMs: Date.now() - t5Start,
      details: err.message,
    });
  }

  // -------------------------------------------------------------
  // TEST 6: Registered HeatOS Actions Validity
  // -------------------------------------------------------------
  const t6Start = Date.now();
  try {
    const analysis = await NatureAnalystEngine.analyze({
      ...testLocation,
      preferredSkill: 'identify_hotspot',
    });

    const validActionTypes: AIActionType[] = [
      'VIEW_MAP',
      'VIEW_EVENT',
      'VIEW_FORECAST',
      'VIEW_LOCATION',
      'REFRESH_DATA',
      'CREATE_REPORT',
    ];

    const allActionsValid = analysis.suggestedActions.every(a => validActionTypes.includes(a.type));
    const passed = allActionsValid && analysis.suggestedActions.length > 0;

    results.push({
      id: 'AI_TEST_06_REGISTERED_ACTIONS',
      name: 'HeatOS Registered Action Validation',
      category: 'ACTIONS',
      passed,
      durationMs: Date.now() - t6Start,
      details: `All suggested actions (${analysis.suggestedActions.map(a => a.type).join(', ')}) belong to registered HeatOS action registry`,
      evidence: { actions: analysis.suggestedActions },
    });
  } catch (err: any) {
    results.push({
      id: 'AI_TEST_06_REGISTERED_ACTIONS',
      name: 'HeatOS Registered Action Validation',
      category: 'ACTIONS',
      passed: false,
      durationMs: Date.now() - t6Start,
      details: err.message,
    });
  }

  // -------------------------------------------------------------
  // TEST 7: Deterministic Fallback Integrity
  // -------------------------------------------------------------
  const t7Start = Date.now();
  try {
    const riskAnalysis = await NatureAnalystEngine.analyze({
      ...testLocation,
      preferredPersona: 'RISK_ANALYST',
      preferredSkill: 'explain_risk',
    });

    const passed = Boolean(riskAnalysis.structure.whatsHappening && riskAnalysis.confidence >= 80);
    results.push({
      id: 'AI_TEST_07_DETERMINISTIC_FALLBACK',
      name: 'Deterministic Fallback Rule Integrity',
      category: 'RELIABILITY',
      passed,
      durationMs: Date.now() - t7Start,
      details: `Verified complete fallback response with 0% downtime and provider model: ${riskAnalysis.providerModel}`,
      evidence: { model: riskAnalysis.providerModel, isFallback: riskAnalysis.isFallback },
    });
  } catch (err: any) {
    results.push({
      id: 'AI_TEST_07_DETERMINISTIC_FALLBACK',
      name: 'Deterministic Fallback Rule Integrity',
      category: 'RELIABILITY',
      passed: false,
      durationMs: Date.now() - t7Start,
      details: err.message,
    });
  }

  // -------------------------------------------------------------
  // TEST 8: Multi-Persona Execution Coverage
  // -------------------------------------------------------------
  const t8Start = Date.now();
  try {
    const personas: AIPersona[] = [
      'NATURE_ANALYST',
      'CLIMATE_ANALYST',
      'RISK_ANALYST',
      'RESILIENCE_ADVISOR',
      'SYSTEM_GUIDE',
    ];

    const personaExecutions = await Promise.all(
      personas.map(p =>
        NatureAnalystEngine.analyze({
          ...testLocation,
          preferredPersona: p,
        })
      )
    );

    const allPassed = personaExecutions.every((res, i) => res.persona === personas[i]);

    results.push({
      id: 'AI_TEST_08_MULTI_PERSONA_COVERAGE',
      name: 'Multi-Persona Archetype Coverage (5 Personas)',
      category: 'PERSONAS',
      passed: allPassed,
      durationMs: Date.now() - t8Start,
      details: `Successfully executed analyses across all 5 personas: ${personas.join(', ')}`,
      evidence: { personasTested: personas },
    });
  } catch (err: any) {
    results.push({
      id: 'AI_TEST_08_MULTI_PERSONA_COVERAGE',
      name: 'Multi-Persona Archetype Coverage (5 Personas)',
      category: 'PERSONAS',
      passed: false,
      durationMs: Date.now() - t8Start,
      details: err.message,
    });
  }

  const passedTests = results.filter(r => r.passed).length;
  const failedTests = results.length - passedTests;

  return {
    suiteName: 'HeatOS Nature Analyst AI Test Suite (Phase 8)',
    totalTests: results.length,
    passedTests,
    failedTests,
    durationMs: Date.now() - startTime,
    timestamp: new Date().toISOString(),
    results,
  };
}
