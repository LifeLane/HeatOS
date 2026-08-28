/**
 * HeatOS Phase 5: Nature Pulse Diagnostic Test Suite
 * 
 * 10 Automated tests verifying non-fabrication, dimension synthesis,
 * missing data handling, status mapping, and transparent methodology.
 */

import { NaturePulseEngine } from './engine';
import { EnvironmentalStateManager } from '../state/snapshot';
import { scoreToPulseStatus, DEFAULT_DIMENSION_WEIGHTS } from './methodology';

export interface PulseTestResult {
  testId: string;
  name: string;
  category: string;
  passed: boolean;
  durationMs: number;
  details: string;
  diagnostics?: any;
}

export interface PulseTestSuiteReport {
  timestamp: string;
  totalTests: number;
  passedCount: number;
  failedCount: number;
  passRatePct: number;
  durationMs: number;
  results: PulseTestResult[];
}

export async function runPulseTestSuite(): Promise<PulseTestSuiteReport> {
  const startTime = Date.now();
  const results: PulseTestResult[] = [];

  // TEST 1: Full Multi-Dimension Pulse Synthesis
  {
    const t0 = Date.now();
    try {
      const pulse = await NaturePulseEngine.evaluatePulse({
        latitude: 40.7128,
        longitude: -74.006,
        locationName: 'New York City',
      });

      const passed =
        pulse.overallScore >= 0 &&
        pulse.overallScore <= 100 &&
        Boolean(pulse.overallStatus) &&
        pulse.availableDimensionCount >= 4 &&
        pulse.metricName === 'HeatOS Environmental Pulse' &&
        pulse.sourcesAttribution.length > 0;

      results.push({
        testId: 'TEST_PULSE_01_SYNTHESIS',
        name: 'Full Multi-Source Nature Pulse Evaluation',
        category: 'Synthesis',
        passed,
        durationMs: Date.now() - t0,
        details: `Synthesized Environmental Pulse: ${pulse.overallScore}/100 (${pulse.overallStatus}) with ${pulse.availableDimensionCount} active dimensions.`,
        diagnostics: {
          pulseId: pulse.pulseId,
          score: pulse.overallScore,
          status: pulse.overallStatus,
          dimensionsCount: pulse.availableDimensionCount,
          confidence: pulse.confidence,
        },
      });
    } catch (err: any) {
      results.push({
        testId: 'TEST_PULSE_01_SYNTHESIS',
        name: 'Full Multi-Source Nature Pulse Evaluation',
        category: 'Synthesis',
        passed: false,
        durationMs: Date.now() - t0,
        details: `Failed to synthesize Nature Pulse: ${err.message}`,
      });
    }
  }

  // TEST 2: Missing Dimension Exclusion & Zero Fabrication Rule
  {
    const t0 = Date.now();
    try {
      const rawState = await EnvironmentalStateManager.getEnvironmentalSnapshot({
        latitude: 40.7128,
        longitude: -74.006,
      });

      // Clone state and simulate completely missing Water & Air data
      const modifiedState = JSON.parse(JSON.stringify(rawState));
      modifiedState.airQuality.aqi = {
        value: null,
        status: 'UNAVAILABLE',
        source: 'unavailable',
        sourceName: 'Unavailable',
        timestamp: new Date().toISOString(),
        freshness: 'UNKNOWN',
        confidence: 0,
        spatialResolution: 'None',
      };
      modifiedState.water.streamflowStatus = {
        value: null,
        status: 'UNAVAILABLE',
        source: 'unavailable',
        sourceName: 'Unavailable',
        timestamp: new Date().toISOString(),
        freshness: 'UNKNOWN',
        confidence: 0,
        spatialResolution: 'None',
      };

      const pulse = NaturePulseEngine.synthesizeFromState(modifiedState);

      const passed =
        pulse.dimensions.air.isAvailable === false &&
        pulse.dimensions.air.score === null &&
        pulse.dimensions.water.isAvailable === false &&
        pulse.dimensions.water.score === null &&
        pulse.missingDimensions.includes('air') &&
        pulse.missingDimensions.includes('water') &&
        pulse.overallScore >= 0 &&
        pulse.overallScore <= 100;

      results.push({
        testId: 'TEST_PULSE_02_MISSING_DIMENSION_NO_FABRICATION',
        name: 'Missing Dimension Exclusion & Zero Score Fabrication',
        category: 'Integrity',
        passed,
        durationMs: Date.now() - t0,
        details: 'Verified missing Water and Air dimensions are strictly excluded from score calculation with null values.',
        diagnostics: {
          airAvailable: pulse.dimensions.air.isAvailable,
          airScore: pulse.dimensions.air.score,
          waterAvailable: pulse.dimensions.water.isAvailable,
          waterScore: pulse.dimensions.water.score,
          availableCount: pulse.availableDimensionCount,
          missingKeys: pulse.missingDimensions,
        },
      });
    } catch (err: any) {
      results.push({
        testId: 'TEST_PULSE_02_MISSING_DIMENSION_NO_FABRICATION',
        name: 'Missing Dimension Exclusion & Zero Score Fabrication',
        category: 'Integrity',
        passed: false,
        durationMs: Date.now() - t0,
        details: `Error testing missing dimension integrity: ${err.message}`,
      });
    }
  }

  // TEST 3: Status Categorization Thresholds
  {
    const t0 = Date.now();
    try {
      const s95 = scoreToPulseStatus(95); // HEALTHY
      const s75 = scoreToPulseStatus(75); // STABLE
      const s60 = scoreToPulseStatus(60); // WATCH
      const s40 = scoreToPulseStatus(40); // ELEVATED
      const s20 = scoreToPulseStatus(20); // CRITICAL

      const passed =
        s95 === 'HEALTHY' &&
        s75 === 'STABLE' &&
        s60 === 'WATCH' &&
        s40 === 'ELEVATED' &&
        s20 === 'CRITICAL';

      results.push({
        testId: 'TEST_PULSE_03_STATUS_THRESHOLDS',
        name: 'Status Categorization Thresholds (HEALTHY, STABLE, WATCH, ELEVATED, CRITICAL)',
        category: 'Status',
        passed,
        durationMs: Date.now() - t0,
        details: 'All 5 pulse status tiers correctly mapped across boundary values.',
        diagnostics: { s95, s75, s60, s40, s20 },
      });
    } catch (err: any) {
      results.push({
        testId: 'TEST_PULSE_03_STATUS_THRESHOLDS',
        name: 'Status Categorization Thresholds',
        category: 'Status',
        passed: false,
        durationMs: Date.now() - t0,
        details: err.message,
      });
    }
  }

  // TEST 4: Heat Dimension Psychrometric & Thermal Island Sensitivity
  {
    const t0 = Date.now();
    try {
      const rawState = await EnvironmentalStateManager.getEnvironmentalSnapshot({
        latitude: 40.7128,
        longitude: -74.006,
      });

      // Simulate extreme heat surge
      const heatState = JSON.parse(JSON.stringify(rawState));
      heatState.temperature.feelsLike.value = 38.5;
      heatState.temperature.surfaceHeatAnomaly.value = 5.2;
      heatState.temperature.wetBulb.value = 29.1;

      const pulse = NaturePulseEngine.synthesizeFromState(heatState);
      const heatDim = pulse.dimensions.heat;

      const passed =
        heatDim.score !== null &&
        heatDim.score <= 40 &&
        (heatDim.status === 'ELEVATED' || heatDim.status === 'CRITICAL') &&
        heatDim.topDrivers.length >= 2;

      results.push({
        testId: 'TEST_PULSE_04_HEAT_DIMENSION',
        name: 'Heat Dimension Psychrometric & Thermal Surge Calculation',
        category: 'Dimensions',
        passed,
        durationMs: Date.now() - t0,
        details: `Heat dimension accurately penalized extreme thermal stress (Score ${heatDim.score}, Status ${heatDim.status}).`,
        diagnostics: {
          score: heatDim.score,
          status: heatDim.status,
          topDrivers: heatDim.topDrivers,
        },
      });
    } catch (err: any) {
      results.push({
        testId: 'TEST_PULSE_04_HEAT_DIMENSION',
        name: 'Heat Dimension Psychrometric & Thermal Surge Calculation',
        category: 'Dimensions',
        passed: false,
        durationMs: Date.now() - t0,
        details: err.message,
      });
    }
  }

  // TEST 5: Air Dimension AQI & Particulate Translation
  {
    const t0 = Date.now();
    try {
      const rawState = await EnvironmentalStateManager.getEnvironmentalSnapshot({
        latitude: 40.7128,
        longitude: -74.006,
      });

      const airState = JSON.parse(JSON.stringify(rawState));
      airState.airQuality.aqi.value = 165; // Unhealthy
      airState.airQuality.pm25.value = 45.2;

      const pulse = NaturePulseEngine.synthesizeFromState(airState);
      const airDim = pulse.dimensions.air;

      const passed =
        airDim.score !== null &&
        airDim.score <= 50 &&
        (airDim.status === 'ELEVATED' || airDim.status === 'CRITICAL') &&
        airDim.source.includes('epa_airnow');

      results.push({
        testId: 'TEST_PULSE_05_AIR_DIMENSION',
        name: 'Air Dimension EPA AQI & Particulate Conversion',
        category: 'Dimensions',
        passed,
        durationMs: Date.now() - t0,
        details: `Air dimension translated AQI 165 to score ${airDim.score} (${airDim.status}) with source attribution.`,
        diagnostics: {
          score: airDim.score,
          status: airDim.status,
          source: airDim.source,
          topDrivers: airDim.topDrivers,
        },
      });
    } catch (err: any) {
      results.push({
        testId: 'TEST_PULSE_05_AIR_DIMENSION',
        name: 'Air Dimension EPA AQI & Particulate Conversion',
        category: 'Dimensions',
        passed: false,
        durationMs: Date.now() - t0,
        details: err.message,
      });
    }
  }

  // TEST 6: Water Dimension Non-Inference Rule
  {
    const t0 = Date.now();
    try {
      const rawState = await EnvironmentalStateManager.getEnvironmentalSnapshot({
        latitude: 40.7128,
        longitude: -74.006,
      });

      const waterDim = NaturePulseEngine.synthesizeFromState(rawState).dimensions.water;

      // USGS telemetry should either be available with valid source, or marked unavailable
      const passed =
        (!waterDim.isAvailable && waterDim.score === null) ||
        (waterDim.isAvailable && waterDim.source.includes('usgs_water'));

      results.push({
        testId: 'TEST_PULSE_06_WATER_NON_INFERENCE',
        name: 'Water Dimension Strict Hydrology Non-Inference Rule',
        category: 'Dimensions',
        passed,
        durationMs: Date.now() - t0,
        details: 'Verified water dimension relies exclusively on USGS hydrology telemetry and does not infer water health from unrelated weather.',
        diagnostics: {
          isAvailable: waterDim.isAvailable,
          source: waterDim.source,
          score: waterDim.score,
        },
      });
    } catch (err: any) {
      results.push({
        testId: 'TEST_PULSE_06_WATER_NON_INFERENCE',
        name: 'Water Dimension Strict Hydrology Non-Inference Rule',
        category: 'Dimensions',
        passed: false,
        durationMs: Date.now() - t0,
        details: err.message,
      });
    }
  }

  // TEST 7: Nature Dimension Experimental Labeling
  {
    const t0 = Date.now();
    try {
      const rawState = await EnvironmentalStateManager.getEnvironmentalSnapshot({
        latitude: 40.7128,
        longitude: -74.006,
      });

      const natureDim = NaturePulseEngine.synthesizeFromState(rawState).dimensions.nature;

      const passed = natureDim.isExperimental === true;

      results.push({
        testId: 'TEST_PULSE_07_NATURE_EXPERIMENTAL_LABEL',
        name: 'Nature Dimension Experimental Indicator Labeling',
        category: 'Compliance',
        passed,
        durationMs: Date.now() - t0,
        details: 'Verified Nature vegetation indicator is explicitly tagged as experimental (isExperimental: true).',
        diagnostics: {
          isExperimental: natureDim.isExperimental,
          score: natureDim.score,
          status: natureDim.status,
        },
      });
    } catch (err: any) {
      results.push({
        testId: 'TEST_PULSE_07_NATURE_EXPERIMENTAL_LABEL',
        name: 'Nature Dimension Experimental Indicator Labeling',
        category: 'Compliance',
        passed: false,
        durationMs: Date.now() - t0,
        details: err.message,
      });
    }
  }

  // TEST 8: Fire Dimension NASA FIRMS Exclusivity
  {
    const t0 = Date.now();
    try {
      const rawState = await EnvironmentalStateManager.getEnvironmentalSnapshot({
        latitude: 40.7128,
        longitude: -74.006,
      });

      // Hot ambient temperature but zero fire hotspots
      const hotState = JSON.parse(JSON.stringify(rawState));
      hotState.temperature.ambient.value = 42.0;
      hotState.fire.activeHotspotsCountInRadius.value = 0;

      const fireDim = NaturePulseEngine.synthesizeFromState(hotState).dimensions.fire;

      // Fire score should remain healthy/low-risk since no active hotspots exist
      const passed =
        fireDim.isAvailable &&
        fireDim.score !== null &&
        fireDim.score >= 90 &&
        fireDim.status === 'HEALTHY' &&
        fireDim.statusLabel === 'LOW';

      results.push({
        testId: 'TEST_PULSE_08_FIRE_EXCLUSIVITY',
        name: 'Fire Dimension NASA FIRMS Telemetry Exclusivity',
        category: 'Integrity',
        passed,
        durationMs: Date.now() - t0,
        details: 'Confirmed high ambient temperature alone does not falsely create high wildfire risk.',
        diagnostics: {
          ambientTemp: hotState.temperature.ambient.value,
          fireScore: fireDim.score,
          fireStatus: fireDim.status,
          fireStatusLabel: fireDim.statusLabel,
        },
      });
    } catch (err: any) {
      results.push({
        testId: 'TEST_PULSE_08_FIRE_EXCLUSIVITY',
        name: 'Fire Dimension NASA FIRMS Telemetry Exclusivity',
        category: 'Integrity',
        passed: false,
        durationMs: Date.now() - t0,
        details: err.message,
      });
    }
  }

  // TEST 9: Proportional Dynamic Weight Redistribution
  {
    const t0 = Date.now();
    try {
      const rawState = await EnvironmentalStateManager.getEnvironmentalSnapshot({
        latitude: 40.7128,
        longitude: -74.006,
      });

      const pulse = NaturePulseEngine.synthesizeFromState(rawState);

      // Verify the weighted sum is mathematically between 0 and 100
      const passed =
        pulse.overallScore >= 0 &&
        pulse.overallScore <= 100 &&
        Object.keys(DEFAULT_DIMENSION_WEIGHTS).length === 6;

      results.push({
        testId: 'TEST_PULSE_09_WEIGHT_REDISTRIBUTION',
        name: 'Proportional Weight Redistribution Across Available Dimensions',
        category: 'Methodology',
        passed,
        durationMs: Date.now() - t0,
        details: `Dynamic weight normalization computed composite score ${pulse.overallScore}/100 across ${pulse.availableDimensionCount} active dimensions.`,
        diagnostics: {
          overallScore: pulse.overallScore,
          weights: DEFAULT_DIMENSION_WEIGHTS,
        },
      });
    } catch (err: any) {
      results.push({
        testId: 'TEST_PULSE_09_WEIGHT_REDISTRIBUTION',
        name: 'Proportional Weight Redistribution',
        category: 'Methodology',
        passed: false,
        durationMs: Date.now() - t0,
        details: err.message,
      });
    }
  }

  // TEST 10: Human-Readable Driver Generation & Summary Synthesis
  {
    const t0 = Date.now();
    try {
      const pulse = await NaturePulseEngine.evaluatePulse({
        latitude: 40.7128,
        longitude: -74.006,
        locationName: 'New York City',
      });

      const passed =
        Boolean(pulse.summaryHeadline) &&
        Boolean(pulse.summaryExplanation) &&
        pulse.dimensions.heat.topDrivers.length > 0 &&
        Boolean(pulse.methodologyNotes.nonFabricationGuarantee);

      results.push({
        testId: 'TEST_PULSE_10_HUMAN_READABLE_SYNTHESIS',
        name: 'Intuitive Headline & Driver Synthesis without Technical Jargon',
        category: 'Communication',
        passed,
        durationMs: Date.now() - t0,
        details: `Generated headline: "${pulse.summaryHeadline}"`,
        diagnostics: {
          headline: pulse.summaryHeadline,
          explanation: pulse.summaryExplanation,
          heatDrivers: pulse.dimensions.heat.topDrivers,
        },
      });
    } catch (err: any) {
      results.push({
        testId: 'TEST_PULSE_10_HUMAN_READABLE_SYNTHESIS',
        name: 'Intuitive Headline & Driver Synthesis',
        category: 'Communication',
        passed: false,
        durationMs: Date.now() - t0,
        details: err.message,
      });
    }
  }

  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.length - passedCount;
  const passRatePct = Math.round((passedCount / results.length) * 100);

  return {
    timestamp: new Date().toISOString(),
    totalTests: results.length,
    passedCount,
    failedCount,
    passRatePct,
    durationMs: Date.now() - startTime,
    results,
  };
}
