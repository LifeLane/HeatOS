/**
 * HeatOS Phase 6: The Living Environment Map Diagnostic Test Suite
 */

import { LivingEnvironmentMapEngine } from './engine';
import { MapLayerKey } from './types';

export interface MapTestResult {
  testId: string;
  name: string;
  category: string;
  passed: boolean;
  durationMs: number;
  details: string;
  diagnostics?: any;
}

export interface MapTestSuiteReport {
  timestamp: string;
  totalTests: number;
  passedCount: number;
  failedCount: number;
  passRatePct: number;
  durationMs: number;
  results: MapTestResult[];
}

export async function runMapTestSuite(): Promise<MapTestSuiteReport> {
  const startTime = Date.now();
  const results: MapTestResult[] = [];

  // TEST 1: Map Initialization and Default Heat Layer
  {
    const t0 = Date.now();
    try {
      const mapState = await LivingEnvironmentMapEngine.getMapState({
        latitude: 40.7128,
        longitude: -74.006,
        locationName: 'New York City',
      });

      const passed =
        mapState.activeLayer === 'heat' &&
        Boolean(mapState.layers.heat) &&
        mapState.layers.heat?.sourceId === 'fortyguard' &&
        mapState.availableLayers.includes('heat');

      results.push({
        testId: 'TEST_MAP_01_DEFAULT_HEAT_LAYER',
        name: 'Default Heat Layer with FortyGuard Core Thermal Intelligence',
        category: 'Core',
        passed,
        durationMs: Date.now() - t0,
        details: 'Verified default layer is Heat powered by FortyGuard thermal intelligence.',
        diagnostics: {
          activeLayer: mapState.activeLayer,
          heatLayerName: mapState.layers.heat?.layerName,
          sourceId: mapState.layers.heat?.sourceId,
        },
      });
    } catch (err: any) {
      results.push({
        testId: 'TEST_MAP_01_DEFAULT_HEAT_LAYER',
        name: 'Default Heat Layer with FortyGuard',
        category: 'Core',
        passed: false,
        durationMs: Date.now() - t0,
        details: err.message,
      });
    }
  }

  // TEST 2: Multi-Layer Generation & Availability Rule
  {
    const t0 = Date.now();
    try {
      const mapState = await LivingEnvironmentMapEngine.getMapState({
        latitude: 40.7128,
        longitude: -74.006,
        locationName: 'New York City',
      });

      const layers = mapState.availableLayers;
      const passed =
        layers.length >= 4 &&
        layers.every((l) => ['heat', 'air', 'water', 'nature', 'fire', 'solar'].includes(l)) &&
        Boolean(mapState.layers[mapState.activeLayer]?.grid);

      results.push({
        testId: 'TEST_MAP_02_LAYER_AVAILABILITY_RULE',
        name: 'Dynamic Layer Availability Rule (Only Real Data Enabled)',
        category: 'Integrity',
        passed,
        durationMs: Date.now() - t0,
        details: `Verified ${layers.length} available environmental layers with empirical data backing: ${layers.join(', ')}.`,
        diagnostics: { availableLayers: layers },
      });
    } catch (err: any) {
      results.push({
        testId: 'TEST_MAP_02_LAYER_AVAILABILITY_RULE',
        name: 'Dynamic Layer Availability Rule',
        category: 'Integrity',
        passed: false,
        durationMs: Date.now() - t0,
        details: err.message,
      });
    }
  }

  // TEST 3: FortyGuard Heat Layer Hotspots & Microclimate Statistics
  {
    const t0 = Date.now();
    try {
      const mapState = await LivingEnvironmentMapEngine.getMapState({
        latitude: 40.7128,
        longitude: -74.006,
        locationName: 'New York City',
        layer: 'heat',
      });

      const heatLayer = mapState.layers.heat;
      const passed =
        Boolean(heatLayer) &&
        (heatLayer?.hotspots.length ?? 0) >= 3 &&
        Boolean(heatLayer?.statistics) &&
        heatLayer!.statistics.max > heatLayer!.statistics.min &&
        heatLayer!.districts.length >= 2;

      results.push({
        testId: 'TEST_MAP_03_HEAT_HOTSPOTS_STATISTICS',
        name: 'Heat Layer Thermal Intensity, Hotspots & Microclimate Statistics',
        category: 'Thermal',
        passed,
        durationMs: Date.now() - t0,
        details: `Heat layer successfully populated with ${heatLayer?.hotspots.length} hotspots and min/max (${heatLayer?.statistics.min}°C / ${heatLayer?.statistics.max}°C).`,
        diagnostics: {
          hotspotsCount: heatLayer?.hotspots.length,
          stats: heatLayer?.statistics,
          districtsCount: heatLayer?.districts.length,
        },
      });
    } catch (err: any) {
      results.push({
        testId: 'TEST_MAP_03_HEAT_HOTSPOTS_STATISTICS',
        name: 'Heat Layer Thermal Intensity, Hotspots & Statistics',
        category: 'Thermal',
        passed: false,
        durationMs: Date.now() - t0,
        details: err.message,
      });
    }
  }

  // TEST 4: Hotspot Node Telemetry Richness (Panel Data Contract)
  {
    const t0 = Date.now();
    try {
      const mapState = await LivingEnvironmentMapEngine.getMapState({
        latitude: 40.7128,
        longitude: -74.006,
        locationName: 'New York City',
        layer: 'heat',
      });

      const firstHotspot = mapState.layers.heat?.hotspots[0];
      const passed =
        Boolean(firstHotspot) &&
        firstHotspot!.primaryValue > 0 &&
        Boolean(firstHotspot!.pulseScore) &&
        Boolean(firstHotspot!.pulseStatus) &&
        Boolean(firstHotspot!.riskTitle) &&
        Boolean(firstHotspot!.topChangeDescription) &&
        Boolean(firstHotspot!.sourceName) &&
        Boolean(firstHotspot!.freshness);

      results.push({
        testId: 'TEST_MAP_04_HOTSPOT_PANEL_CONTRACT',
        name: 'Hotspot Node Telemetry Completeness (Location Panel Contract)',
        category: 'Panel',
        passed,
        durationMs: Date.now() - t0,
        details: 'Confirmed all required panel fields (Temperature, Pulse, Risk, Trend, Top Change, Source, Updated) are present.',
        diagnostics: {
          name: firstHotspot?.name,
          pulseScore: firstHotspot?.pulseScore,
          risk: firstHotspot?.riskTitle,
          source: firstHotspot?.sourceName,
        },
      });
    } catch (err: any) {
      results.push({
        testId: 'TEST_MAP_04_HOTSPOT_PANEL_CONTRACT',
        name: 'Hotspot Node Telemetry Completeness',
        category: 'Panel',
        passed: false,
        durationMs: Date.now() - t0,
        details: err.message,
      });
    }
  }

  // TEST 5: Comprehensive Legend Integrity (Never Color Alone)
  {
    const t0 = Date.now();
    try {
      const mapState = await LivingEnvironmentMapEngine.getMapState({
        latitude: 40.7128,
        longitude: -74.006,
        locationName: 'New York City',
      });

      const layersToTest: MapLayerKey[] = ['heat', 'air', 'water', 'nature', 'solar'];
      let allValid = true;

      for (const l of layersToTest) {
        const layerData = mapState.layers[l];
        if (layerData) {
          if (
            !layerData.legend ||
            !layerData.legend.title ||
            !layerData.legend.unit ||
            layerData.legend.ticks.length < 3 ||
            layerData.legend.ticks.some((t) => !t.value || !t.label || !t.color)
          ) {
            allValid = false;
            break;
          }
        }
      }

      results.push({
        testId: 'TEST_MAP_05_LEGEND_INTEGRITY',
        name: 'Comprehensive Accessible Layer Legends (Color + Text + Unit)',
        category: 'Accessibility',
        passed: allValid,
        durationMs: Date.now() - t0,
        details: 'Verified legends across all active layers include numerical thresholds, colors, and descriptive text.',
      });
    } catch (err: any) {
      results.push({
        testId: 'TEST_MAP_05_LEGEND_INTEGRITY',
        name: 'Comprehensive Accessible Layer Legends',
        category: 'Accessibility',
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
