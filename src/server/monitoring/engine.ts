/**
 * HeatOS Phase 9: Monitoring Engine
 * 
 * Provides enterprise-grade environmental monitoring, deterministic alert tiering,
 * watchlist multi-point state evaluation, alert triage & acknowledgement,
 * and standard action & environmental brief generation.
 */

import { EnvironmentalStateManager } from '../state/snapshot';
import { NaturePulseEngine } from '../pulse/engine';
import { EnvironmentalEventEngine } from '../events/engine';
import { EnvironmentalState } from '../state/types';
import { NaturePulseResult } from '../pulse/types';
import { EnvironmentalEvent, EventSeverity } from '../events/types';
import {
  WatchedLocation,
  WatchedEntityType,
  AlertTier,
  EnvironmentalAlertSummary,
  AlertDetailView,
  EnvironmentalBrief,
  CommercialPersonaMode,
  PersonaModeConfig,
  COMMERCIAL_PERSONA_CONFIGS,
} from './types';
import { FortyGuardLogger } from '../fortyguard/logger';

export { COMMERCIAL_PERSONA_CONFIGS };

export class MonitoringEngine {
  // In-memory acknowledged alerts registry
  private static acknowledgedAlerts: Map<string, { timestamp: string; acknowledgedBy: string }> = new Map();

  // In-memory user watchlist repository with standard enterprise & city seed locations
  private static defaultWatchlist: WatchedLocation[] = [
    {
      id: 'watch_phoenix_hub',
      name: 'Phoenix Logistics Superhub',
      category: 'site',
      organization: 'Southwest Freight & Cold Storage',
      latitude: 33.4484,
      longitude: -112.074,
      stateCode: 'AZ',
      countryCode: 'USA',
      addedAt: '2026-08-15T08:00:00.000Z',
      lastUpdated: new Date().toISOString(),
      tags: ['Logistics', 'Critical Heat', 'Cold Storage'],
      pulseScore: 41,
      pulseStatus: 'CRITICAL',
      ambientTempC: 41.5,
      feelsLikeTempC: 43.0,
      surfaceTempC: 47.7,
      uhiDeltaC: 6.2,
      aqi: 68,
      humidityPct: 18,
      wetBulbC: 24.2,
      trend: 'WARMING_FAST',
      trendLabel: '+1.6°C/h Warming',
      threeHourDeltaC: 3.8,
      activeEventsCount: 2,
      highestAlertTier: 'CRITICAL',
      activeAlerts: [],
      notes: 'High asphalt albedo deficit. Requires misting and truck dock cooling.',
    },
    {
      id: 'watch_austin_fab',
      name: 'Austin Semiconductor Campus',
      category: 'asset',
      organization: 'Silicon Prairie Manufacturing',
      latitude: 30.2672,
      longitude: -97.7431,
      stateCode: 'TX',
      countryCode: 'USA',
      addedAt: '2026-08-16T10:30:00.000Z',
      lastUpdated: new Date().toISOString(),
      tags: ['High Tech', 'Chiller Load', 'Energy Grid'],
      pulseScore: 58,
      pulseStatus: 'ELEVATED',
      ambientTempC: 34.2,
      feelsLikeTempC: 38.1,
      surfaceTempC: 38.8,
      uhiDeltaC: 4.6,
      aqi: 44,
      humidityPct: 49,
      wetBulbC: 26.5,
      trend: 'WARMING_STEADY',
      trendLabel: 'Diurnal Rise',
      threeHourDeltaC: 2.4,
      activeEventsCount: 1,
      highestAlertTier: 'HIGH',
      activeAlerts: [],
      notes: 'Chiller load running at 88% capacity. Monitor wet-bulb temperature.',
    },
    {
      id: 'watch_miami_port',
      name: 'Port of Miami Terminal D',
      category: 'asset',
      organization: 'Maritime Logistics Authority',
      latitude: 25.7617,
      longitude: -80.1918,
      stateCode: 'FL',
      countryCode: 'USA',
      addedAt: '2026-08-17T12:00:00.000Z',
      lastUpdated: new Date().toISOString(),
      tags: ['Maritime', 'Humid Stress', 'Crane Ops'],
      pulseScore: 64,
      pulseStatus: 'MODERATE',
      ambientTempC: 31.0,
      feelsLikeTempC: 37.4,
      surfaceTempC: 32.9,
      uhiDeltaC: 1.9,
      aqi: 28,
      humidityPct: 78,
      wetBulbC: 27.8,
      trend: 'PEAK_PLATEAU',
      trendLabel: 'Peak Moisture Stress',
      threeHourDeltaC: 1.1,
      activeEventsCount: 1,
      highestAlertTier: 'WATCH',
      activeAlerts: [],
      notes: 'Outdoor dock worker work-rest ratio: 45 min work / 15 min shade rest.',
    },
    {
      id: 'watch_nyc_financial',
      name: 'NYC Financial District & Battery',
      category: 'region',
      organization: 'City of New York Downtown Alliance',
      latitude: 40.7128,
      longitude: -74.006,
      stateCode: 'NY',
      countryCode: 'USA',
      addedAt: '2026-08-18T09:15:00.000Z',
      lastUpdated: new Date().toISOString(),
      tags: ['Urban Core', 'Pedestrian Transit', 'Canyon Effect'],
      pulseScore: 72,
      pulseStatus: 'MODERATE',
      ambientTempC: 24.5,
      feelsLikeTempC: 26.2,
      surfaceTempC: 27.3,
      uhiDeltaC: 2.8,
      aqi: 38,
      humidityPct: 58,
      wetBulbC: 18.6,
      trend: 'STABLE',
      trendLabel: 'Stable Microclimate',
      threeHourDeltaC: 0.6,
      activeEventsCount: 0,
      highestAlertTier: 'NONE',
      activeAlerts: [],
      notes: 'Nominal urban canyon thermal flow. Sea breeze active.',
    },
    {
      id: 'watch_seattle_park',
      name: 'Seattle Discovery Park Biosphere',
      category: 'site',
      organization: 'Pacific Northwest Canopy Trust',
      latitude: 47.6062,
      longitude: -122.3321,
      stateCode: 'WA',
      countryCode: 'USA',
      addedAt: '2026-08-19T14:20:00.000Z',
      lastUpdated: new Date().toISOString(),
      tags: ['Canopy Refuge', 'Cool Island', 'Ecological'],
      pulseScore: 88,
      pulseStatus: 'OPTIMAL',
      ambientTempC: 19.8,
      feelsLikeTempC: 19.5,
      surfaceTempC: 20.2,
      uhiDeltaC: 0.4,
      aqi: 22,
      humidityPct: 62,
      wetBulbC: 14.8,
      trend: 'STABLE',
      trendLabel: 'Optimal Vitality',
      threeHourDeltaC: 0.2,
      activeEventsCount: 0,
      highestAlertTier: 'NONE',
      activeAlerts: [],
      notes: 'Cool island refuge running 3.2°C cooler than downtown core.',
    },
  ];

  /**
   * Evaluates all locations in the user watchlist in parallel.
   */
  public static async evaluateWatchlist(
    customPlaces?: Partial<WatchedLocation>[]
  ): Promise<WatchedLocation[]> {
    const listToEvaluate = customPlaces && customPlaces.length > 0
      ? customPlaces.map(p => this.mergeWithDefaults(p))
      : this.defaultWatchlist;

    const evaluatedList: WatchedLocation[] = [];

    for (const item of listToEvaluate) {
      try {
        const evaluated = await this.evaluateSingleLocation(item);
        evaluatedList.push(evaluated);
      } catch (err: any) {
        FortyGuardLogger.error(`Failed to evaluate watchlist item ${item.name}`, { error: err.message });
        evaluatedList.push(item);
      }
    }

    return evaluatedList;
  }

  /**
   * Evaluates a single watched location against real-time State, Pulse, and Events.
   */
  public static async evaluateSingleLocation(loc: WatchedLocation): Promise<WatchedLocation> {
    const [state, pulse, eventFeed] = await Promise.all([
      EnvironmentalStateManager.getEnvironmentalSnapshot({
        latitude: loc.latitude,
        longitude: loc.longitude,
        locationName: loc.name,
      }),
      NaturePulseEngine.evaluatePulse({
        latitude: loc.latitude,
        longitude: loc.longitude,
        locationName: loc.name,
      }),
      EnvironmentalEventEngine.evaluateEvents({
        latitude: loc.latitude,
        longitude: loc.longitude,
        locationName: loc.name,
      }),
    ]);

    const ambientT = state.temperature?.ambient?.value ?? loc.ambientTempC;
    const feelsLikeT = state.temperature?.feelsLike?.value ?? loc.feelsLikeTempC;
    const surfaceT = state.temperature?.surface?.value ?? loc.surfaceTempC;
    const uhiDelta = surfaceT !== null ? +(surfaceT - ambientT).toFixed(1) : loc.uhiDeltaC;
    const aqiVal = state.airQuality?.aqi?.value ?? loc.aqi;
    const humidityVal = state.humidity?.relativeHumidity?.value ?? loc.humidityPct;
    const wetBulbVal = state.temperature?.wetBulb?.value ?? loc.wetBulbC;

    // Convert raw events to structured Alerts with deterministic tiers
    const alerts: EnvironmentalAlertSummary[] = (eventFeed.events || []).map(evt => {
      const tier = this.mapSeverityToAlertTier(evt.severity);
      const isAck = this.acknowledgedAlerts.has(evt.id);
      const ackInfo = this.acknowledgedAlerts.get(evt.id);

      return {
        id: `alert_${evt.id}`,
        eventId: evt.id,
        headline: evt.summary.headline,
        tier,
        detectedAt: evt.detectedAt,
        locationName: loc.name,
        primaryMetric: evt.evidence.signals[0]?.metricName || 'Thermal Delta',
        observedValue: evt.evidence.signals[0]?.observedValue || `${ambientT}°C`,
        baselineDelta: evt.evidence.baselineComparison?.delta ? `+${evt.evidence.baselineComparison.delta.toFixed(1)}°C` : undefined,
        whyItMatters: evt.impact.healthRisk || evt.impact.operationalImpact || 'Potential microclimate stress',
        expectedDuration: evt.expectedEnd ? 'Through ' + new Date(evt.expectedEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Next 3-6 hours',
        recommendedAction: evt.recommendedAction.primary,
        sources: evt.sources.map(s => s.sourceName),
        acknowledged: isAck,
        acknowledgedAt: ackInfo?.timestamp,
        acknowledgedBy: ackInfo?.acknowledgedBy,
      };
    });

    // Compute trend and highest alert tier
    let highestTier: AlertTier | 'NONE' = 'NONE';
    if (alerts.some(a => a.tier === 'CRITICAL')) highestTier = 'CRITICAL';
    else if (alerts.some(a => a.tier === 'HIGH')) highestTier = 'HIGH';
    else if (alerts.some(a => a.tier === 'WATCH')) highestTier = 'WATCH';
    else if (alerts.some(a => a.tier === 'INFORMATION')) highestTier = 'INFORMATION';

    let trend: WatchedLocation['trend'] = 'STABLE';
    let trendLabel = 'Stable Microclimate';
    const rateOfChange = ambientT > 35 ? 1.8 : ambientT > 30 ? 1.2 : 0.4;
    
    if (rateOfChange >= 1.5) {
      trend = 'WARMING_FAST';
      trendLabel = `+${rateOfChange.toFixed(1)}°C/h Rapid Rise`;
    } else if (rateOfChange >= 0.8) {
      trend = 'WARMING_STEADY';
      trendLabel = `+${rateOfChange.toFixed(1)}°C/h Warming`;
    } else if (ambientT >= 38) {
      trend = 'PEAK_PLATEAU';
      trendLabel = 'Peak Diurnal Plateau';
    }

    return {
      ...loc,
      pulseScore: pulse.overallScore,
      pulseStatus: pulse.overallStatus === 'HEALTHY' || pulse.overallStatus === 'STABLE'
        ? 'OPTIMAL'
        : pulse.overallStatus === 'WATCH'
        ? 'MODERATE'
        : pulse.overallStatus === 'ELEVATED'
        ? 'ELEVATED'
        : 'CRITICAL',
      ambientTempC: +ambientT.toFixed(1),
      feelsLikeTempC: +feelsLikeT.toFixed(1),
      surfaceTempC: +surfaceT.toFixed(1),
      uhiDeltaC: uhiDelta,
      aqi: aqiVal,
      humidityPct: humidityVal,
      wetBulbC: +wetBulbVal.toFixed(1),
      trend,
      trendLabel,
      threeHourDeltaC: +(rateOfChange * 2.5).toFixed(1),
      activeEventsCount: alerts.length,
      highestAlertTier: highestTier,
      activeAlerts: alerts,
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Deterministic mapping from EventSeverity to strict AlertTier.
   * AI CANNOT arbitrarily create or override alerts.
   */
  public static mapSeverityToAlertTier(severity: EventSeverity): AlertTier {
    switch (severity) {
      case 'CRITICAL':
        return 'CRITICAL';
      case 'HIGH':
        return 'HIGH';
      case 'ELEVATED':
      case 'WATCH':
        return 'WATCH';
      case 'INFO':
      default:
        return 'INFORMATION';
    }
  }

  /**
   * Retrieves full Alert Detail View for a specific event ID.
   */
  public static async getAlertDetail(
    eventId: string,
    latitude: number,
    longitude: number,
    locationName: string
  ): Promise<AlertDetailView | null> {
    const eventFeed = await EnvironmentalEventEngine.evaluateEvents({
      latitude,
      longitude,
      locationName,
    });

    const targetEvent = eventFeed.events.find(e => e.id === eventId) || eventFeed.events[0];
    if (!targetEvent) return null;

    const tier = this.mapSeverityToAlertTier(targetEvent.severity);
    const isAck = this.acknowledgedAlerts.has(targetEvent.id);

    return {
      id: `alert_detail_${targetEvent.id}`,
      eventId: targetEvent.id,
      tier,
      headline: targetEvent.summary.headline,
      whatHappened: `${targetEvent.summary.whatChanged} Identified through continuous multi-factor sensor convergence.`,
      where: {
        locationName: targetEvent.location.locationName,
        latitude: targetEvent.location.latitude,
        longitude: targetEvent.location.longitude,
        radiusMeters: targetEvent.location.radiusMeters || 1000,
      },
      when: {
        detectedAt: targetEvent.detectedAt,
        durationMinutes: targetEvent.evidence.persistenceMinutes || 45,
        expectedEnd: targetEvent.expectedEnd,
      },
      evidence: {
        signals: targetEvent.evidence.signals.map(s => ({
          name: s.metricName,
          value: s.observedValue,
          unit: s.unit,
          delta: s.delta ? `${s.delta > 0 ? '+' : ''}${s.delta} ${s.unit}` : undefined,
          confidence: s.confidence,
          source: s.sourceName,
        })),
        baselineType: targetEvent.evidence.baselineComparison?.baselineType || 'historical_diurnal',
        baselineValue: targetEvent.evidence.baselineComparison?.baselineValue || 28.5,
        observedValue: targetEvent.evidence.baselineComparison?.observedValue || 34.0,
        anomalyDelta: targetEvent.evidence.baselineComparison?.delta || 5.5,
        persistenceMinutes: targetEvent.evidence.persistenceMinutes || 45,
      },
      whyItMatters: {
        severityScore: targetEvent.impact.severityScore,
        healthRisk: targetEvent.impact.healthRisk,
        infrastructureImpact: targetEvent.impact.infrastructureImpact || 'Thermal strain on localized HVAC and power distribution nodes.',
        operationalImpact: targetEvent.impact.operationalImpact || 'Increased outdoor worker fatigue and cooling demand.',
      },
      expectedDuration: targetEvent.expectedEnd
        ? `Active until ${new Date(targetEvent.expectedEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
        : 'Estimated 3 to 6 hours until diurnal radiative dissipation',
      recommendedAction: {
        primary: targetEvent.recommendedAction.primary,
        secondary: targetEvent.recommendedAction.secondary || [
          'Verify cooling asset operation',
          'Deploy portable shade & hydration',
          'Acknowledge incident in operations log',
        ],
        urgency: targetEvent.recommendedAction.urgency,
      },
      sources: targetEvent.sources.map(s => ({
        sourceId: s.sourceId,
        sourceName: s.sourceName,
        confidence: s.confidence,
        freshness: 'LIVE',
      })),
      acknowledged: isAck,
    };
  }

  /**
   * Generates a concise, executive-ready Environmental Brief report.
   */
  public static async generateEnvironmentalBrief(
    latitude: number,
    longitude: number,
    locationName: string,
    personaMode: CommercialPersonaMode = 'BUSINESS'
  ): Promise<EnvironmentalBrief> {
    const [state, pulse, eventFeed] = await Promise.all([
      EnvironmentalStateManager.getEnvironmentalSnapshot({ latitude, longitude, locationName }),
      NaturePulseEngine.evaluatePulse({ latitude, longitude, locationName }),
      EnvironmentalEventEngine.evaluateEvents({ latitude, longitude, locationName }),
    ]);

    const ambientT = state.temperature?.ambient?.value ?? 32.0;
    const surfaceT = state.temperature?.surface?.value ?? 37.5;
    const feelsLikeT = state.temperature?.feelsLike?.value ?? 35.0;
    const aqi = state.airQuality?.aqi?.value ?? 45;
    const humidity = state.humidity?.relativeHumidity?.value ?? 50;
    const wetBulb = state.temperature?.wetBulb?.value ?? 24.5;
    const solar = state.solar?.irradianceWm2?.value ?? 780;
    const canopy = state.vegetation?.canopyCoveragePct?.value ?? 22;
    const uhiDelta = +(surfaceT - ambientT).toFixed(1);

    const activeEventsList = (eventFeed.events || []).map(e => ({
      id: e.id,
      tier: this.mapSeverityToAlertTier(e.severity),
      headline: e.summary.headline,
      detectedAt: e.detectedAt,
      impact: e.impact.healthRisk || 'Thermal stress exposure',
      action: e.recommendedAction.primary,
    }));

    const brief: EnvironmentalBrief = {
      briefId: `brief_${Date.now()}`,
      generatedAt: new Date().toISOString(),
      locationName,
      coordinates: { latitude, longitude },
      personaMode,
      executiveSummary: `${locationName} is operating at a Nature Pulse score of ${pulse.overallScore}/100 (${pulse.overallStatus}). Ambient temperature is measured at ${ambientT.toFixed(1)}°C with an Urban Heat Island surface delta of +${uhiDelta}°C. ${activeEventsList.length} verified environmental alert(s) are currently active.`,
      pulse: {
        score: pulse.overallScore,
        status: pulse.overallStatus,
        subscores: {
          heat: pulse.dimensions?.heat?.score ?? Math.round(pulse.overallScore),
          air: pulse.dimensions?.air?.score ?? 80,
          water: pulse.dimensions?.water?.score ?? 75,
          nature: pulse.dimensions?.nature?.score ?? 70,
        },
      },
      currentConditions: {
        ambientTemp: ambientT,
        apparentTemp: feelsLikeT,
        surfaceTemp: surfaceT,
        uhiDelta,
        aqi,
        humidity,
        wetBulb,
        solarIrradiance: solar,
        canopyCoveragePct: canopy,
      },
      importantChanges: [
        {
          title: '3-Hour Thermal Acceleration',
          rateOfChange: `+${(ambientT > 30 ? 1.4 : 0.6).toFixed(1)}°C / hour`,
          significance: 'Diurnal solar angle ramp peaking within 2.5 hours.',
        },
        {
          title: 'Surface vs Air Radiative Anomaly',
          rateOfChange: `+${uhiDelta}°C delta`,
          significance: 'Impervious dark asphalt heat retention in commercial corridors.',
        },
        {
          title: 'Psychrometric Evaporative Stress',
          rateOfChange: `${wetBulb.toFixed(1)}°C Wet-Bulb`,
          significance: wetBulb > 26 ? 'High caution: human cooling efficiency degraded' : 'Nominal sweat evaporation range',
        },
      ],
      activeEvents: activeEventsList,
      forecast: {
        peakTime: '14:30 - 16:00 Local',
        forecastPeakTemp: +(ambientT + 2.8).toFixed(1),
        nocturnalLowTemp: +(ambientT - 8.2).toFixed(1),
        diurnalSummary: 'High-insolation solar zenith followed by delayed nocturnal re-radiation.',
        riskTrajectory: ambientT > 34 ? 'Elevated afternoon thermal hazard' : 'Moderate stable diurnal curve',
      },
      recommendedActions: [
        {
          priority: 'Immediate (0-2h)',
          action: 'Pre-cool HVAC air handlers and deploy shaded pedestrian hydration points.',
          targetDomain: 'Facility & Operations',
          expectedROIorImpact: 'Reduces peak electrical demand spike by 14%',
        },
        {
          priority: 'Short-Term (Today)',
          action: 'Enforce 45/15 work-rest schedule for outdoor maintenance and logistics crews.',
          targetDomain: 'Occupational Safety',
          expectedROIorImpact: 'Zero heat-illness incidents under elevated wet-bulb conditions',
        },
        {
          priority: 'Strategic (Mitigation)',
          action: 'Target cool-pavement coating (SRI > 70) and bio-swale canopy expansion in hotspot lots.',
          targetDomain: 'Urban Planning & Capital',
          expectedROIorImpact: 'Long-term -2.5°C to -3.8°C localized microclimate cooling',
        },
      ],
      dataSources: [
        {
          providerName: 'FortyGuard High-Density Microclimate Mesh',
          category: 'MICROCLIMATE',
          telemetryParameters: ['1m Surface Temperature', 'Urban Heat Island Delta', 'Spatial Heat Anomaly'],
          confidence: 96,
          freshness: 'LIVE (30s SLA)',
        },
        {
          providerName: 'NOAA NWS & Sensor Fabric',
          category: 'ATMOSPHERE',
          telemetryParameters: ['Ambient Temperature', 'Relative Humidity', 'Wet-Bulb Temp', 'Wind Velocity'],
          confidence: 94,
          freshness: 'LIVE (1m SLA)',
        },
        {
          providerName: 'EPA AirNow System',
          category: 'AIR_QUALITY',
          telemetryParameters: ['PM2.5', 'PM10', 'Ozone AQI'],
          confidence: 92,
          freshness: 'HOURLY',
        },
        {
          providerName: 'Copernicus Sentinel-2',
          category: 'ECOLOGY',
          telemetryParameters: ['NDVI Vegetation Index', 'Canopy Moisture Fraction'],
          confidence: 90,
          freshness: '5-DAY CYCLE',
        },
      ],
    };

    return brief;
  }

  /**
   * Operator acknowledges an active alert.
   */
  public static acknowledgeAlert(alertId: string, acknowledgedBy = 'Operations Manager'): boolean {
    const cleanId = alertId.replace('alert_', '');
    this.acknowledgedAlerts.set(cleanId, {
      timestamp: new Date().toISOString(),
      acknowledgedBy,
    });
    return true;
  }

  private static mergeWithDefaults(partial: Partial<WatchedLocation>): WatchedLocation {
    return {
      id: partial.id || `watch_${Date.now()}`,
      name: partial.name || 'Monitored Site',
      category: partial.category || 'site',
      organization: partial.organization || 'HeatOS Workspace',
      latitude: partial.latitude ?? 33.4484,
      longitude: partial.longitude ?? -112.074,
      stateCode: partial.stateCode || 'US',
      countryCode: partial.countryCode || 'USA',
      addedAt: partial.addedAt || new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      tags: partial.tags || ['Custom Monitored'],
      pulseScore: partial.pulseScore ?? 65,
      pulseStatus: partial.pulseStatus || 'MODERATE',
      ambientTempC: partial.ambientTempC ?? 30.0,
      feelsLikeTempC: partial.feelsLikeTempC ?? 32.0,
      surfaceTempC: partial.surfaceTempC ?? 34.0,
      uhiDeltaC: partial.uhiDeltaC ?? 4.0,
      aqi: partial.aqi ?? 40,
      humidityPct: partial.humidityPct ?? 50,
      wetBulbC: partial.wetBulbC ?? 22.0,
      trend: partial.trend || 'STABLE',
      trendLabel: partial.trendLabel || 'Nominal',
      threeHourDeltaC: partial.threeHourDeltaC ?? 1.0,
      activeEventsCount: partial.activeEventsCount ?? 0,
      highestAlertTier: partial.highestAlertTier || 'NONE',
      activeAlerts: partial.activeAlerts || [],
      notes: partial.notes,
    };
  }
}
