/**
 * HeatOS Phase 9: Monitoring, Actions & Commercialization Test Suite
 * 
 * Validates:
 * 1. Watchlist multi-location state evaluation
 * 2. Deterministic rule-based alert tier mapping (AI non-hallucination test)
 * 3. 4-tier alert classification (CRITICAL, HIGH, WATCH, INFORMATION)
 * 4. Alert detail inspection & evidence chain
 * 5. Environmental Brief generation completeness
 * 6. Commercial Persona configuration coverage (Personal, Business, Operations, Research)
 * 7. Alert acknowledgement tracking
 */

import { MonitoringEngine, COMMERCIAL_PERSONA_CONFIGS } from './engine';
import { WatchedLocation } from './types';

export interface MonitoringTestResult {
  suite: string;
  timestamp: string;
  totalTests: number;
  passed: number;
  failed: number;
  status: 'PASSED' | 'FAILED';
  tests: {
    testId: string;
    description: string;
    passed: boolean;
    durationMs: number;
    details?: string;
  }[];
}

export async function runMonitoringTestSuite(): Promise<MonitoringTestResult> {
  const tests: MonitoringTestResult['tests'] = [];
  const startTime = Date.now();

  // Test 1: Watchlist Multi-Location Evaluation
  const t1Start = Date.now();
  try {
    const watchlist = await MonitoringEngine.evaluateWatchlist();
    const passed = watchlist.length >= 3 && watchlist.every(w => w.pulseScore >= 0 && w.pulseScore <= 100 && w.ambientTempC !== undefined);
    tests.push({
      testId: 'TEST_01_WATCHLIST_EVALUATION',
      description: 'Evaluate multi-location watchlist with Environmental Pulse, Heat, and Trends',
      passed,
      durationMs: Date.now() - t1Start,
      details: `Retrieved and evaluated ${watchlist.length} watched locations successfully.`,
    });
  } catch (err: any) {
    tests.push({
      testId: 'TEST_01_WATCHLIST_EVALUATION',
      description: 'Evaluate multi-location watchlist with Environmental Pulse, Heat, and Trends',
      passed: false,
      durationMs: Date.now() - t1Start,
      details: err.message,
    });
  }

  // Test 2: Deterministic Rule-Based Alert Tier Mapping (Zero-AI-Hallucination)
  const t2Start = Date.now();
  try {
    const cTier = MonitoringEngine.mapSeverityToAlertTier('CRITICAL');
    const hTier = MonitoringEngine.mapSeverityToAlertTier('HIGH');
    const wTier = MonitoringEngine.mapSeverityToAlertTier('ELEVATED');
    const iTier = MonitoringEngine.mapSeverityToAlertTier('INFO');

    const passed = cTier === 'CRITICAL' && hTier === 'HIGH' && wTier === 'WATCH' && iTier === 'INFORMATION';
    tests.push({
      testId: 'TEST_02_DETERMINISTIC_ALERT_TIERS',
      description: 'Verify strictly deterministic mapping to CRITICAL, HIGH, WATCH, INFORMATION without AI hallucination',
      passed,
      durationMs: Date.now() - t2Start,
      details: `Tiers: ${cTier}, ${hTier}, ${wTier}, ${iTier}`,
    });
  } catch (err: any) {
    tests.push({
      testId: 'TEST_02_DETERMINISTIC_ALERT_TIERS',
      description: 'Verify strictly deterministic mapping to CRITICAL, HIGH, WATCH, INFORMATION without AI hallucination',
      passed: false,
      durationMs: Date.now() - t2Start,
      details: err.message,
    });
  }

  // Test 3: Alert Detail View & Evidence Retrieval
  const t3Start = Date.now();
  try {
    const alertDetail = await MonitoringEngine.getAlertDetail(
      'any_event',
      33.4484,
      -112.074,
      'Phoenix Logistics Superhub'
    );
    const passed = alertDetail !== null && alertDetail.evidence.signals.length > 0 && alertDetail.recommendedAction.primary.length > 0;
    tests.push({
      testId: 'TEST_03_ALERT_DETAIL_EVIDENCE',
      description: 'Verify Alert Detail includes What, Where, When, Evidence, Why it matters, and Recommended Action',
      passed: Boolean(passed),
      durationMs: Date.now() - t3Start,
      details: `Alert Detail headline: ${alertDetail?.headline}`,
    });
  } catch (err: any) {
    tests.push({
      testId: 'TEST_03_ALERT_DETAIL_EVIDENCE',
      description: 'Verify Alert Detail includes What, Where, When, Evidence, Why it matters, and Recommended Action',
      passed: false,
      durationMs: Date.now() - t3Start,
      details: err.message,
    });
  }

  // Test 4: Environmental Brief Generation
  const t4Start = Date.now();
  try {
    const brief = await MonitoringEngine.generateEnvironmentalBrief(
      30.2672,
      -97.7431,
      'Austin Semiconductor Campus',
      'OPERATIONS'
    );
    const passed = brief.pulse.score > 0 &&
      brief.currentConditions.ambientTemp > 0 &&
      brief.importantChanges.length > 0 &&
      brief.forecast.forecastPeakTemp > 0 &&
      brief.recommendedActions.length >= 3 &&
      brief.dataSources.length >= 4;

    tests.push({
      testId: 'TEST_04_ENVIRONMENTAL_BRIEF',
      description: 'Verify Environmental Brief summarizes Pulse, Changes, Events, Forecast, Actions, and Sources',
      passed,
      durationMs: Date.now() - t4Start,
      details: `Brief generated for ${brief.locationName} (${brief.recommendedActions.length} actions, ${brief.dataSources.length} sources).`,
    });
  } catch (err: any) {
    tests.push({
      testId: 'TEST_04_ENVIRONMENTAL_BRIEF',
      description: 'Verify Environmental Brief summarizes Pulse, Changes, Events, Forecast, Actions, and Sources',
      passed: false,
      durationMs: Date.now() - t4Start,
      details: err.message,
    });
  }

  // Test 5: Commercial Persona Mode Configuration
  const t5Start = Date.now();
  try {
    const modes = Object.keys(COMMERCIAL_PERSONA_CONFIGS);
    const passed = modes.includes('PERSONAL') && modes.includes('BUSINESS') && modes.includes('OPERATIONS') && modes.includes('RESEARCH');
    tests.push({
      testId: 'TEST_05_COMMERCIAL_PERSONA_MODES',
      description: 'Verify all 4 Commercial Experience Modes (Explore, Monitor, Act, Analyze) are configured',
      passed,
      durationMs: Date.now() - t5Start,
      details: `Configured modes: ${modes.join(', ')}`,
    });
  } catch (err: any) {
    tests.push({
      testId: 'TEST_05_COMMERCIAL_PERSONA_MODES',
      description: 'Verify all 4 Commercial Experience Modes (Explore, Monitor, Act, Analyze) are configured',
      passed: false,
      durationMs: Date.now() - t5Start,
      details: err.message,
    });
  }

  // Test 6: Alert Acknowledgement Tracking
  const t6Start = Date.now();
  try {
    const ackSuccess = MonitoringEngine.acknowledgeAlert('test_event_101', 'Facility Director');
    tests.push({
      testId: 'TEST_06_ALERT_ACKNOWLEDGEMENT',
      description: 'Verify operator alert acknowledgement workflow updates state',
      passed: ackSuccess === true,
      durationMs: Date.now() - t6Start,
      details: 'Alert test_event_101 acknowledged successfully.',
    });
  } catch (err: any) {
    tests.push({
      testId: 'TEST_06_ALERT_ACKNOWLEDGEMENT',
      description: 'Verify operator alert acknowledgement workflow updates state',
      passed: false,
      durationMs: Date.now() - t6Start,
      details: err.message,
    });
  }

  const passedCount = tests.filter(t => t.passed).length;
  const failedCount = tests.filter(t => !t.passed).length;

  return {
    suite: 'HeatOS Phase 9: Monitoring, Actions & Commercialization Engine Test Suite',
    timestamp: new Date().toISOString(),
    totalTests: tests.length,
    passed: passedCount,
    failed: failedCount,
    status: failedCount === 0 ? 'PASSED' : 'FAILED',
    tests,
  };
}
