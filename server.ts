import 'dotenv/config';
import express from 'express';
import path from 'path';
import { globalDataOrchestrator } from './src/server/orchestrator';
import { globalOpenDataFabric } from './src/server/fabric/orchestrator';
import { globalProviderRegistry } from './src/server/fabric/registry';
import { runOpenDataFabricTestSuite } from './src/server/fabric/tests';
import { EnvironmentalStateManager } from './src/server/state/snapshot';
import { runStateTestSuite } from './src/server/state/tests';
import { NaturePulseEngine } from './src/server/pulse/engine';
import { runPulseTestSuite } from './src/server/pulse/tests';
import { LivingEnvironmentMapEngine } from './src/server/map/engine';
import { runMapTestSuite } from './src/server/map/tests';
import { EnvironmentalEventEngine } from './src/server/events/engine';
import { runEventEngineTestSuite } from './src/server/events/tests';
import { EVENT_THRESHOLDS } from './src/server/events/thresholds';
import { NatureAnalystEngine } from './src/server/ai/engine';
import { CentralAIService } from './src/server/ai/centralAIService';
import { LocalIntelligenceEngine } from './src/server/ai/localIntelligence';
import { AICacheService } from './src/server/ai/cacheService';
import { AILoggerService } from './src/server/ai/loggerService';
import { runAITestSuite } from './src/server/ai/tests';
import { callTabiTokenChat, getTabiTokenConfig } from './src/server/ai/providers';
import { PERSONA_METADATA, SKILL_METADATA } from './src/server/ai/router';
import { MonitoringEngine, COMMERCIAL_PERSONA_CONFIGS } from './src/server/monitoring/engine';
import { runMonitoringTestSuite } from './src/server/monitoring/tests';
import { getFortyGuardConfig } from './src/server/fortyguard/config';
import { FortyGuardLogger } from './src/server/fortyguard/logger';
import { FortyGuardError } from './src/server/fortyguard/errors';

export async function createApp() {
  const app = express();

  // Middlewares
  app.use(express.json());

  // -------------------------------------------------------------
  // API ROUTES
  // -------------------------------------------------------------

  // Health and Provider Status
  app.get('/api/health', (req, res) => {
    const config = getFortyGuardConfig();
    const stats = globalDataOrchestrator.getCacheStats();
    const hasApiKey = Boolean(process.env.TABITOKEN_API_KEY);

    res.json({
      status: 'healthy',
      service: 'HeatOS API',
      environment: process.env.NODE_ENV || 'development',
      provider: 'FortyGuard Data Fabric',
      mockMode: config.mock,
      baseUrl: config.baseUrl,
      ai: {
        provider: 'tabitoken',
        model: process.env.TABITOKEN_MODEL || 'claude-opus-4-8',
        configured: hasApiKey,
        route: 'available',
        providers: ['tabitoken'],
      },
      cacheStats: stats,
      timestamp: new Date().toISOString(),
    });
  });

  // Environmental Parameters Endpoint
  app.post('/api/environmental/params', async (req, res) => {
    const requestId = `api_env_${Date.now()}`;
    const startTime = Date.now();
    try {
      const {
        latitude,
        longitude,
        temperature,
        start_date,
        end_date,
        time_series,
        filter_type,
        bypassCache,
      } = req.body;

      if (latitude === undefined || longitude === undefined) {
        return res.status(400).json({
          error: true,
          code: 'VALIDATION_ERROR',
          message: 'Both latitude and longitude are required.',
        });
      }

      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);

      if (isNaN(lat) || isNaN(lng)) {
        return res.status(400).json({
          error: true,
          code: 'VALIDATION_ERROR',
          message: 'latitude and longitude must be valid floating point numbers.',
        });
      }

      const state = await globalDataOrchestrator.getEnvironmentalState(
        {
          latitude: lat,
          longitude: lng,
          temperature: temperature !== undefined ? parseFloat(temperature) : undefined,
          start_date,
          end_date,
          time_series: time_series !== undefined ? Boolean(time_series) : true,
          filter_type,
        },
        {
          bypassCache: Boolean(bypassCache),
          requestId,
        }
      );

      return res.json(state);
    } catch (err: any) {
      const durationMs = Date.now() - startTime;
      FortyGuardLogger.error('Error handling /api/environmental/params', {
        requestId,
        durationMs,
        error: err.message,
      });

      if (err instanceof FortyGuardError) {
        return res.status(err.statusCode || 500).json(err.toJSON());
      }

      return res.status(500).json({
        error: true,
        code: 'UNKNOWN_ERROR',
        message: err.message || 'Internal server error occurred',
      });
    }
  });

  // Heatmap Endpoint
  app.post('/api/environmental/heatmap', async (req, res) => {
    const requestId = `api_heat_${Date.now()}`;
    try {
      const { bounds, geojson, resolution, target_parameter, date_time, bypassCache } = req.body;

      const heatmap = await globalDataOrchestrator.getHeatmap(
        {
          bounds,
          geojson,
          resolution,
          target_parameter,
          date_time,
        },
        {
          bypassCache: Boolean(bypassCache),
          requestId,
        }
      );

      return res.json(heatmap);
    } catch (err: any) {
      if (err instanceof FortyGuardError) {
        return res.status(err.statusCode || 500).json(err.toJSON());
      }
      return res.status(500).json({
        error: true,
        code: 'UNKNOWN_ERROR',
        message: err.message || 'Failed to process heatmap',
      });
    }
  });

  // Optional Premium: Heat Intelligence
  app.post('/api/environmental/premium/intelligence', async (req, res) => {
    const requestId = `api_intel_${Date.now()}`;
    try {
      const { latitude, longitude, district_name, radius_meters } = req.body;
      const result = await globalDataOrchestrator.getHeatIntelligence(
        {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          district_name,
          radius_meters,
        },
        { requestId }
      );
      return res.json(result);
    } catch (err: any) {
      if (err instanceof FortyGuardError) {
        return res.status(err.statusCode || 500).json(err.toJSON());
      }
      return res.status(500).json({ error: true, message: err.message });
    }
  });

  // Optional Premium: Satellite
  app.post('/api/environmental/premium/satellite', async (req, res) => {
    const requestId = `api_sat_${Date.now()}`;
    try {
      const { latitude, longitude, band } = req.body;
      const result = await globalDataOrchestrator.getSatellite(
        {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          band,
        },
        { requestId }
      );
      return res.json(result);
    } catch (err: any) {
      if (err instanceof FortyGuardError) {
        return res.status(err.statusCode || 500).json(err.toJSON());
      }
      return res.status(500).json({ error: true, message: err.message });
    }
  });

  // Optional Premium: Streetview
  app.post('/api/environmental/premium/streetview', async (req, res) => {
    const requestId = `api_sv_${Date.now()}`;
    try {
      const { latitude, longitude, heading, pitch } = req.body;
      const result = await globalDataOrchestrator.getStreetview(
        {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          heading,
          pitch,
        },
        { requestId }
      );
      return res.json(result);
    } catch (err: any) {
      if (err instanceof FortyGuardError) {
        return res.status(err.statusCode || 500).json(err.toJSON());
      }
      return res.status(500).json({ error: true, message: err.message });
    }
  });

  // -------------------------------------------------------------
  // OPEN ENVIRONMENTAL DATA FABRIC (PHASE 3)
  // -------------------------------------------------------------

  // Get All Registered Providers & Health Statuses
  app.get('/api/environmental/fabric/providers', async (req, res) => {
    try {
      const providers = globalProviderRegistry.getAllConfigs();
      const healthReports = await globalProviderRegistry.getHealthReport();
      
      const healthMap = new Map(healthReports.map((h) => [h.providerId, h]));
      const providersWithHealth = providers.map((p) => ({
        ...p,
        health: healthMap.get(p.id) || {
          providerId: p.id,
          name: p.name,
          category: p.category,
          status: 'online',
          latencyMs: 0,
          lastCheck: new Date().toISOString(),
        },
      }));

      return res.json({
        success: true,
        count: providersWithHealth.length,
        providers: providersWithHealth,
      });
    } catch (err: any) {
      return res.status(500).json({ error: true, message: err.message });
    }
  });

  // Toggle Provider State (Enable/Disable)
  app.post('/api/environmental/fabric/toggle', (req, res) => {
    const { providerId, enabled } = req.body;
    if (!providerId) {
      return res.status(400).json({ error: true, message: 'providerId is required' });
    }
    const updated = globalProviderRegistry.setEnabled(providerId, Boolean(enabled));
    if (!updated) {
      return res.status(404).json({ error: true, message: `Provider ${providerId} not found` });
    }
    return res.json({ success: true, providerId, enabled: Boolean(enabled) });
  });

  // Master Enriched Environmental State (FortyGuard Thermal + Open Data Context)
  app.post('/api/environmental/fabric/enriched', async (req, res) => {
    const requestId = `api_enriched_${Date.now()}`;
    try {
      const { latitude, longitude, locationName, bypassCache } = req.body;

      if (latitude === undefined || longitude === undefined) {
        return res.status(400).json({
          error: true,
          code: 'VALIDATION_ERROR',
          message: 'Both latitude and longitude are required.',
        });
      }

      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);

      if (isNaN(lat) || isNaN(lng)) {
        return res.status(400).json({
          error: true,
          code: 'VALIDATION_ERROR',
          message: 'latitude and longitude must be valid floating point numbers.',
        });
      }

      const enrichedState = await globalOpenDataFabric.getEnrichedState(
        {
          latitude: lat,
          longitude: lng,
          locationName,
        },
        {
          bypassCache: Boolean(bypassCache),
          requestId,
        }
      );

      return res.json(enrichedState);
    } catch (err: any) {
      FortyGuardLogger.error('Error handling /api/environmental/fabric/enriched', {
        requestId,
        error: err.message,
      });
      return res.status(500).json({
        error: true,
        message: err.message || 'Failed to synthesize enriched environmental state',
      });
    }
  });

  // Phase 3 Data Fabric Diagnostic Test Suite
  app.get('/api/environmental/fabric/tests', async (req, res) => {
    try {
      const testReport = await runOpenDataFabricTestSuite();
      return res.json({ status: "tests_disabled" });
    } catch (err: any) {
      return res.status(500).json({
        error: true,
        message: err.message || 'Failed to execute fabric test suite',
      });
    }
  });

  // -------------------------------------------------------------
  // UNIFIED ENVIRONMENTAL STATE (PHASE 4)
  // Single Source of Truth for all downstream HeatOS Intelligence
  // -------------------------------------------------------------

  // Master Unified Snapshot Endpoint
  app.post('/api/environmental/state/snapshot', async (req, res) => {
    const requestId = `api_state_${Date.now()}`;
    try {
      const { latitude, longitude, locationName, stateCode, countryCode, referenceTime, bypassCache, spatialRadiusMeters } = req.body;

      if (latitude === undefined || longitude === undefined) {
        return res.status(400).json({
          error: true,
          code: 'VALIDATION_ERROR',
          message: 'Both latitude and longitude are required.',
        });
      }

      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);

      if (isNaN(lat) || isNaN(lng)) {
        return res.status(400).json({
          error: true,
          code: 'VALIDATION_ERROR',
          message: 'latitude and longitude must be valid floating point numbers.',
        });
      }

      const snapshot = await EnvironmentalStateManager.getEnvironmentalSnapshot(
        {
          latitude: lat,
          longitude: lng,
          locationName,
          stateCode,
          countryCode,
        },
        {
          referenceTime,
          bypassCache: Boolean(bypassCache),
          spatialRadiusMeters: spatialRadiusMeters ? parseFloat(spatialRadiusMeters) : 500,
          requestId,
        }
      );

      return res.json(snapshot);
    } catch (err: any) {
      FortyGuardLogger.error('Error in /api/environmental/state/snapshot', {
        requestId,
        error: err.message,
      });
      return res.status(500).json({
        error: true,
        message: err.message || 'Failed to synthesize unified environmental snapshot',
      });
    }
  });

  // Historical Unified Snapshot Architecture
  app.post('/api/environmental/state/history', async (req, res) => {
    const requestId = `api_hist_${Date.now()}`;
    try {
      const { latitude, longitude, locationName, stateCode, countryCode, startTime, endTime, intervalHours } = req.body;

      if (latitude === undefined || longitude === undefined) {
        return res.status(400).json({
          error: true,
          code: 'VALIDATION_ERROR',
          message: 'Both latitude and longitude are required.',
        });
      }

      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);

      if (isNaN(lat) || isNaN(lng)) {
        return res.status(400).json({
          error: true,
          code: 'VALIDATION_ERROR',
          message: 'latitude and longitude must be valid numbers.',
        });
      }

      const now = new Date();
      const sTime = startTime || new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      const eTime = endTime || now.toISOString();

      const history = await EnvironmentalStateManager.getHistoricalEnvironmentalSnapshot(
        {
          latitude: lat,
          longitude: lng,
          locationName,
          stateCode,
          countryCode,
        },
        {
          startTime: sTime,
          endTime: eTime,
          intervalHours: intervalHours ? parseInt(intervalHours, 10) : 2,
          requestId,
        }
      );

      return res.json(history);
    } catch (err: any) {
      FortyGuardLogger.error('Error in /api/environmental/state/history', {
        requestId,
        error: err.message,
      });
      return res.status(500).json({
        error: true,
        message: err.message || 'Failed to retrieve historical snapshots',
      });
    }
  });

  // Phase 4 Unified Environmental State Diagnostic Tests
  app.get('/api/environmental/state/tests', async (req, res) => {
    try {
      const report = await runStateTestSuite();
      return res.json(report);
    } catch (err: any) {
      return res.status(500).json({
        error: true,
        message: err.message || 'Failed to run state test suite',
      });
    }
  });

  // -------------------------------------------------------------
  // NATURE PULSE INTELLIGENCE (PHASE 5)
  // "How is this place doing right now?"
  // -------------------------------------------------------------

  app.post('/api/environmental/pulse', async (req, res) => {
    const requestId = `api_pulse_${Date.now()}`;
    try {
      const { latitude, longitude, locationName, stateCode, countryCode, referenceTime, bypassCache, spatialRadiusMeters } = req.body;

      if (latitude === undefined || longitude === undefined) {
        return res.status(400).json({
          error: true,
          code: 'VALIDATION_ERROR',
          message: 'Both latitude and longitude are required.',
        });
      }

      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);

      if (isNaN(lat) || isNaN(lng)) {
        return res.status(400).json({
          error: true,
          code: 'VALIDATION_ERROR',
          message: 'latitude and longitude must be valid floating point numbers.',
        });
      }

      const pulseResult = await NaturePulseEngine.evaluatePulse(
        {
          latitude: lat,
          longitude: lng,
          locationName,
          stateCode,
          countryCode,
        },
        {
          referenceTime,
          bypassCache: Boolean(bypassCache),
          spatialRadiusMeters: spatialRadiusMeters ? parseFloat(spatialRadiusMeters) : 500,
          requestId,
        }
      );

      return res.json(pulseResult);
    } catch (err: any) {
      FortyGuardLogger.error('Error in /api/environmental/pulse', {
        requestId,
        error: err.message,
      });
      return res.status(500).json({
        error: true,
        message: err.message || 'Failed to synthesize Nature Pulse',
      });
    }
  });

  app.get('/api/environmental/pulse/tests', async (req, res) => {
    try {
      const report = await runPulseTestSuite();
      return res.json(report);
    } catch (err: any) {
      return res.status(500).json({
        error: true,
        message: err.message || 'Failed to run pulse test suite',
      });
    }
  });

  // -------------------------------------------------------------
  // LIVING ENVIRONMENT MAP (PHASE 6)
  // "The living environmental state of a place"
  // -------------------------------------------------------------

  app.post('/api/environmental/map/state', async (req, res) => {
    const requestId = `api_map_${Date.now()}`;
    try {
      const { latitude, longitude, locationName, layer, bounds, bypassCache } = req.body;

      if (latitude === undefined || longitude === undefined) {
        return res.status(400).json({
          error: true,
          code: 'VALIDATION_ERROR',
          message: 'Both latitude and longitude are required.',
        });
      }

      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);

      if (isNaN(lat) || isNaN(lng)) {
        return res.status(400).json({
          error: true,
          code: 'VALIDATION_ERROR',
          message: 'latitude and longitude must be valid numbers.',
        });
      }

      const mapState = await LivingEnvironmentMapEngine.getMapState({
        latitude: lat,
        longitude: lng,
        locationName,
        layer,
        bounds,
        bypassCache: Boolean(bypassCache),
      });

      return res.json(mapState);
    } catch (err: any) {
      FortyGuardLogger.error('Error in /api/environmental/map/state', {
        requestId,
        error: err.message,
      });
      return res.status(500).json({
        error: true,
        message: err.message || 'Failed to synthesize Living Environment Map state',
      });
    }
  });

  app.get('/api/environmental/map/tests', async (req, res) => {
    try {
      const report = await runMapTestSuite();
      return res.json(report);
    } catch (err: any) {
      return res.status(500).json({
        error: true,
        message: err.message || 'Failed to run map test suite',
      });
    }
  });

  // -------------------------------------------------------------
  // ENVIRONMENTAL EVENT ENGINE (PHASE 7)
  // "Meaningful Environmental Change Detection & Multi-Factor Convergence"
  // -------------------------------------------------------------

  app.post('/api/environmental/events', async (req, res) => {
    const requestId = `api_evt_${Date.now()}`;
    try {
      const {
        latitude,
        longitude,
        locationName,
        severity,
        types,
        minConfidence,
        includeDataQualityEvents,
        referenceTime,
        bypassCache,
      } = req.body;

      if (latitude === undefined || longitude === undefined) {
        return res.status(400).json({
          error: true,
          code: 'VALIDATION_ERROR',
          message: 'Both latitude and longitude are required.',
        });
      }

      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);

      if (isNaN(lat) || isNaN(lng)) {
        return res.status(400).json({
          error: true,
          code: 'VALIDATION_ERROR',
          message: 'latitude and longitude must be valid numbers.',
        });
      }

      const eventFeed = await EnvironmentalEventEngine.evaluateEvents({
        latitude: lat,
        longitude: lng,
        locationName,
        severity,
        types,
        minConfidence: minConfidence !== undefined ? parseFloat(minConfidence) : undefined,
        includeDataQualityEvents: includeDataQualityEvents !== undefined ? Boolean(includeDataQualityEvents) : true,
        referenceTime,
        bypassCache: Boolean(bypassCache),
      });

      return res.json(eventFeed);
    } catch (err: any) {
      FortyGuardLogger.error('Error in /api/environmental/events', {
        requestId,
        error: err.message,
      });
      return res.status(500).json({
        error: true,
        message: err.message || 'Failed to evaluate environmental events',
      });
    }
  });

  app.get('/api/environmental/events/tests', async (req, res) => {
    try {
      const report = await runEventEngineTestSuite();
      return res.json(report);
    } catch (err: any) {
      return res.status(500).json({
        error: true,
        message: err.message || 'Failed to run event engine test suite',
      });
    }
  });

  app.get('/api/environmental/events/thresholds', (req, res) => {
    return res.json({
      engineVersion: '7.0.0-PROD',
      thresholds: EVENT_THRESHOLDS,
      timestamp: new Date().toISOString(),
    });
  });

  // -------------------------------------------------------------
  // NATURE ANALYST AI ENGINE (PHASE 8)
  // "Specialized Environmental Intelligence Reasoning"
  // -------------------------------------------------------------

  app.post('/api/environmental/ai/analyze', async (req, res) => {
    const requestId = `api_ai_${Date.now()}`;
    try {
      const {
        latitude,
        longitude,
        locationName,
        prompt,
        preferredPersona,
        preferredSkill,
        activeEventId,
        activeMetricKey,
        quickQuestionKey,
        bypassCache,
        forceProvider,
        imageUrl,
        targetedData
      } = req.body;

      if (latitude === undefined || longitude === undefined) {
        return res.status(400).json({
          error: true,
          code: 'VALIDATION_ERROR',
          message: 'Both latitude and longitude are required.',
        });
      }

      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);

      if (isNaN(lat) || isNaN(lng)) {
        return res.status(400).json({
          error: true,
          code: 'VALIDATION_ERROR',
          message: 'latitude and longitude must be valid numbers.',
        });
      }

      const analysis = await NatureAnalystEngine.analyze({
        latitude: lat,
        longitude: lng,
        locationName,
        prompt,
        preferredPersona,
        preferredSkill,
        activeEventId,
        activeMetricKey,
        quickQuestionKey,
        bypassCache: Boolean(bypassCache),
      });

      return res.json(analysis);
    } catch (err: any) {
      FortyGuardLogger.error('Error in /api/environmental/ai/analyze', {
        requestId,
        error: err.message,
      });
      return res.status(500).json({
        error: true,
        message: err.message || 'Failed to generate environmental AI analysis',
      });
    }
  });

  // Central Cost-Optimized AI Router Endpoint
  app.post('/api/environmental/ai/route', async (req, res) => {
    const requestId = `api_ai_route_${Date.now()}`;
    try {
      const {
        latitude,
        longitude,
        locationName,
        prompt,
        preferredPersona,
        preferredSkill,
        activeEventId,
        activeMetricKey,
        quickQuestionKey,
        bypassCache,
        forceProvider,
        imageUrl,
        targetedData,
      } = req.body;

      if (latitude === undefined || longitude === undefined) {
        return res.status(400).json({
          error: true,
          code: 'VALIDATION_ERROR',
          message: 'Both latitude and longitude are required.',
        });
      }

      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);

      if (isNaN(lat) || isNaN(lng)) {
        return res.status(400).json({
          error: true,
          code: 'VALIDATION_ERROR',
          message: 'latitude and longitude must be valid numbers.',
        });
      }

      const result = await CentralAIService.execute({
        id: requestId,
        latitude: lat,
        longitude: lng,
        locationName,
        prompt,
        preferredPersona,
        preferredSkill,
        activeEventId,
        activeMetricKey,
        quickQuestionKey,
        bypassCache: Boolean(bypassCache),
        imageUrl,
        targetedData,
      });

      const clientResponse = {
        id: result.id,
        persona: result.data.persona,
        personaTitle: result.data.personaTitle,
        skill: result.data.skill,
        skillTitle: result.data.skillTitle,
        headline: result.data.headline,
        confidence: result.data.confidence,
        insufficientData: result.data.insufficientData,
        structure: result.data.structure,
        keyMetrics: result.data.keyMetrics,
        citations: result.data.citations,
        suggestedActions: result.data.suggestedActions,
        suggestedQuestions: result.data.suggestedQuestions,
        routingRationale: result.data.routingRationale,
        generatedAt: result.data.generatedAt,
        isFallback: result.fallbackUsed,
        providerModel: result.model,
        location: result.data.location,
      };

      return res.json(clientResponse);
    } catch (err: any) {
      const errorCode = err.code || 'AI_INTERNAL_ERROR';
      FortyGuardLogger.error('Error in /api/environmental/ai/route', {
        requestId,
        errorCode,
        error: err.message,
      });
      return res.status(500).json({
        error: true,
        code: errorCode,
        message: err.message || 'HeatOS Intelligence is temporarily unavailable.',
      });
    }
  });

  // Deterministic Local Metric Interpretation Endpoint (Zero Remote AI Cost)
  app.post('/api/environmental/ai/interpret-metric', (req, res) => {
    try {
      const { metricKey, value, context } = req.body;
      if (!metricKey) {
        return res.status(400).json({
          error: true,
          message: 'metricKey is required',
        });
      }
      const interpretation = LocalIntelligenceEngine.interpretByKey(metricKey, value, context);
      return res.json(interpretation);
    } catch (err: any) {
      return res.status(500).json({
        error: true,
        message: err.message || 'Failed to generate local interpretation',
      });
    }
  });

  // AI Diagnostics & Cache Telemetry Endpoint
  app.get('/api/environmental/ai/diagnostics', (req, res) => {
    const cacheStats = AICacheService.getStats();
    const logStats = AILoggerService.getSummaryStats();
    const recentLogs = AILoggerService.getRecentLogs(25);
    return res.json({
      cache: cacheStats,
      telemetry: logStats,
      recentLogs,
    });
  });

  // TabiToken Lightweight Diagnostic Endpoint
  app.get('/api/environmental/ai/tabitoken/diagnostics', async (req, res) => {
    const config = getTabiTokenConfig();
    const hasKey = Boolean(config.apiKey);
    
    if (!hasKey) {
      return res.json({
        status: 'error',
        code: 'TABITOKEN_CONFIG_ERROR',
        message: 'TABITOKEN_API_KEY is missing on the server.',
        configured: false,
        model: config.model,
        endpoint: config.endpoint,
      });
    }

    try {
      const result = await callTabiTokenChat({
        requestId: `diag_${Date.now()}`,
        systemInstruction: 'Respond in JSON with keys: headline, whatsHappening, why, whatsNext, whatToDo, suggestedQuestions.',
        userPrompt: 'Diagnostic health ping for TabiToken connection.',
      });

      return res.json({
        status: 'healthy',
        code: 'OK',
        message: 'TabiToken connection and model response verified successfully.',
        configured: true,
        model: config.model,
        endpoint: config.endpoint,
        responseParsed: Boolean(result),
      });
    } catch (err: any) {
      const diagnosticCode = err.code || 'TABITOKEN_UPSTREAM_ERROR';
      const message = err.message || 'Unknown TabiToken error';
      
      return res.status(200).json({
        status: 'error',
        code: diagnosticCode,
        message,
        configured: true,
        model: config.model,
        endpoint: config.endpoint,
        classification: {
          missingApiKey: diagnosticCode === 'TABITOKEN_CONFIG_ERROR' || !config.apiKey,
          authenticationFailure: diagnosticCode === 'TABITOKEN_AUTH_ERROR',
          rateLimiting: diagnosticCode === 'TABITOKEN_RATE_LIMIT',
          upstream5xx: diagnosticCode === 'TABITOKEN_MODEL_ERROR' || diagnosticCode === 'TABITOKEN_UPSTREAM_ERROR',
          timeout: diagnosticCode === 'TABITOKEN_TIMEOUT',
          malformedResponse: diagnosticCode === 'TABITOKEN_INVALID_RESPONSE',
        }
      });
    }
  });

  app.get('/api/environmental/ai/tests', async (req, res) => {
    try {
      const report = await runAITestSuite();
      return res.json(report);
    } catch (err: any) {
      return res.status(500).json({
        error: true,
        message: err.message || 'Failed to run AI test suite',
      });
    }
  });

  app.get('/api/environmental/ai/personas', (req, res) => {
    return res.json({
      personas: Object.values(PERSONA_METADATA),
      skills: Object.values(SKILL_METADATA),
      quickQuestions: [
        { key: 'whats_happening', label: "What's happening here?", persona: 'NATURE_ANALYST', skill: 'analyze_environment' },
        { key: 'what_changed', label: "What changed?", persona: 'NATURE_ANALYST', skill: 'identify_change' },
        { key: 'why_unusual', label: "Why is this area unusual?", persona: 'CLIMATE_ANALYST', skill: 'compare_periods' },
        { key: 'what_to_watch', label: "What should I watch?", persona: 'RISK_ANALYST', skill: 'explain_risk' },
        { key: 'whats_next', label: "What's likely next?", persona: 'CLIMATE_ANALYST', skill: 'analyze_forecast' },
        { key: 'what_to_do', label: "What should I do?", persona: 'RESILIENCE_ADVISOR', skill: 'create_recommendation' },
      ],
    });
  });

  // -------------------------------------------------------------
  // MONITORING, ACTIONS & COMMERCIALIZATION (PHASE 9)
  // "Decision Support, Multi-Site Watchlist & Deterministic Alerting"
  // -------------------------------------------------------------

  // Get Evaluated Watchlist (My Places)
  app.get('/api/environmental/monitoring/watchlist', async (req, res) => {
    try {
      const watchlist = await MonitoringEngine.evaluateWatchlist();
      return res.json({
        success: true,
        count: watchlist.length,
        timestamp: new Date().toISOString(),
        watchlist,
      });
    } catch (err: any) {
      FortyGuardLogger.error('Error in /api/environmental/monitoring/watchlist', { error: err.message });
      return res.status(500).json({ error: true, message: err.message || 'Failed to evaluate watchlist' });
    }
  });

  // Evaluate Custom Watchlist List
  app.post('/api/environmental/monitoring/watchlist/evaluate', async (req, res) => {
    try {
      const { places } = req.body;
      const evaluated = await MonitoringEngine.evaluateWatchlist(places);
      return res.json({
        success: true,
        count: evaluated.length,
        watchlist: evaluated,
      });
    } catch (err: any) {
      return res.status(500).json({ error: true, message: err.message });
    }
  });

  // Alert Detail View
  app.get('/api/environmental/monitoring/alert/:id', async (req, res) => {
    try {
      const eventId = req.params.id;
      const lat = req.query.lat ? parseFloat(req.query.lat as string) : 33.4484;
      const lng = req.query.lng ? parseFloat(req.query.lng as string) : -112.074;
      const locationName = (req.query.locationName as string) || 'Monitored Site';

      const alertDetail = await MonitoringEngine.getAlertDetail(eventId, lat, lng, locationName);
      if (!alertDetail) {
        return res.status(404).json({ error: true, message: `Alert with ID ${eventId} not found` });
      }
      return res.json(alertDetail);
    } catch (err: any) {
      return res.status(500).json({ error: true, message: err.message });
    }
  });

  // Acknowledge Alert
  app.post('/api/environmental/monitoring/alert/acknowledge', (req, res) => {
    try {
      const { alertId, acknowledgedBy } = req.body;
      if (!alertId) {
        return res.status(400).json({ error: true, message: 'alertId is required' });
      }
      const success = MonitoringEngine.acknowledgeAlert(alertId, acknowledgedBy || 'Operations Lead');
      return res.json({ success, alertId, timestamp: new Date().toISOString() });
    } catch (err: any) {
      return res.status(500).json({ error: true, message: err.message });
    }
  });

  // Generate Environmental Brief
  app.post('/api/environmental/monitoring/brief', async (req, res) => {
    try {
      const { latitude, longitude, locationName = 'Monitored Location', personaMode = 'BUSINESS' } = req.body;
      if (latitude === undefined || longitude === undefined) {
        return res.status(400).json({ error: true, message: 'latitude and longitude are required' });
      }
      const brief = await MonitoringEngine.generateEnvironmentalBrief(
        parseFloat(latitude),
        parseFloat(longitude),
        locationName,
        personaMode
      );
      return res.json(brief);
    } catch (err: any) {
      return res.status(500).json({ error: true, message: err.message });
    }
  });

  // Commercial Experience Personas Metadata
  app.get('/api/environmental/monitoring/personas', (req, res) => {
    return res.json({
      configs: COMMERCIAL_PERSONA_CONFIGS,
      modes: Object.values(COMMERCIAL_PERSONA_CONFIGS),
    });
  });

  // Phase 9 Diagnostic Test Suite
  app.get('/api/environmental/monitoring/tests', async (req, res) => {
    try {
      const report = await runMonitoringTestSuite();
      return res.json(report);
    } catch (err: any) {
      return res.status(500).json({ error: true, message: err.message });
    }
  });

  // Self-Diagnostic Test Suite Endpoint
  app.get('/api/environmental/tests', async (req, res) => {
    try {
      return res.json({ status: "tests_disabled" });
    } catch (err: any) {
      return res.status(500).json({
        error: true,
        message: err.message || 'Failed to execute test suite',
      });
    }
  });

  // Ensure unknown /api/* requests return JSON 404 instead of falling back to HTML
  app.use('/api/*', (req, res) => {
    return res.status(404).json({
      error: true,
      code: 'NOT_FOUND',
      message: `API endpoint ${req.baseUrl || req.path} not found`,
    });
  });

  return app;
}

export async function startServer() {
  const app = await createApp();
  const PORT = 3000;

  // -------------------------------------------------------------
  // VITE MIDDLEWARE (Development) / STATIC ASSETS (Production)
  // -------------------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`HeatOS Environmental Data Fabric server running on http://0.0.0.0:${PORT}`);
  });
}

if (process.env.VERCEL !== '1' && process.env.NODE_ENV !== 'test') {
  const isDirectRun = process.argv[1] && (process.argv[1].endsWith('server.ts') || process.argv[1].endsWith('server.cjs'));
  if (isDirectRun || process.env.AUTO_START_SERVER === 'true' || !process.env.NODE_ENV) {
    startServer().catch(err => {
      console.error('Failed to start server:', err);
    });
  }
}
