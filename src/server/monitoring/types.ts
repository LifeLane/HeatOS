/**
 * HeatOS Phase 9: Monitoring, Actions & Commercialization Types
 * 
 * Defines enterprise contracts for Watched Places, Sites, Assets, Regions,
 * Deterministic Alert Tiers (Critical, High, Watch, Information),
 * Action Handlers, Environmental Briefs, and Commercial Experience Modes.
 */

import { EnvironmentalState } from '../state/types';
import { NaturePulseResult } from '../pulse/types';
import { EnvironmentalEvent, EventSeverity } from '../events/types';

export type WatchedEntityType = 'city' | 'site' | 'asset' | 'region' | 'campus';

export type AlertTier = 'CRITICAL' | 'HIGH' | 'WATCH' | 'INFORMATION';

export type CommercialPersonaMode = 'PERSONAL' | 'BUSINESS' | 'OPERATIONS' | 'RESEARCH';

export type StandardActionType =
  | 'INVESTIGATE'
  | 'VIEW_MAP'
  | 'VIEW_EVENT'
  | 'VIEW_FORECAST'
  | 'VIEW_LOCATION'
  | 'REFRESH_DATA'
  | 'ACKNOWLEDGE'
  | 'CREATE_REPORT';

export interface WatchedLocation {
  id: string;
  name: string;
  category: WatchedEntityType;
  organization?: string;
  latitude: number;
  longitude: number;
  stateCode?: string;
  countryCode?: string;
  addedAt: string;
  lastUpdated: string;
  tags?: string[];
  
  // Real-time telemetry & Pulse snapshot
  pulseScore: number;
  pulseStatus: 'OPTIMAL' | 'MODERATE' | 'ELEVATED' | 'CRITICAL';
  ambientTempC: number;
  feelsLikeTempC: number;
  surfaceTempC: number;
  uhiDeltaC: number;
  aqi: number;
  humidityPct: number;
  wetBulbC: number;
  
  // Change indicators
  trend: 'WARMING_FAST' | 'WARMING_STEADY' | 'PEAK_PLATEAU' | 'COOLING' | 'STABLE';
  trendLabel: string;
  threeHourDeltaC: number;
  
  // Event & Alert roll-up
  activeEventsCount: number;
  highestAlertTier: AlertTier | 'NONE';
  activeAlerts: EnvironmentalAlertSummary[];
  
  // Custom thresholds (optional enterprise overrides)
  thresholds?: {
    maxAmbientC?: number;
    maxSurfaceC?: number;
    maxAqi?: number;
    minPulseScore?: number;
  };
  
  notes?: string;
}

export interface EnvironmentalAlertSummary {
  id: string;
  eventId: string;
  headline: string;
  tier: AlertTier;
  detectedAt: string;
  locationName: string;
  primaryMetric: string;
  observedValue: string | number;
  baselineDelta?: string;
  whyItMatters: string;
  expectedDuration?: string;
  recommendedAction: string;
  sources: string[];
  acknowledged: boolean;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
}

export interface AlertDetailView {
  id: string;
  eventId: string;
  tier: AlertTier;
  headline: string;
  whatHappened: string;
  where: {
    locationName: string;
    latitude: number;
    longitude: number;
    radiusMeters?: number;
  };
  when: {
    detectedAt: string;
    durationMinutes: number;
    expectedEnd?: string;
  };
  evidence: {
    signals: {
      name: string;
      value: string | number;
      unit: string;
      delta?: string;
      confidence: number;
      source: string;
    }[];
    baselineType: string;
    baselineValue: number;
    observedValue: number;
    anomalyDelta: number;
    persistenceMinutes: number;
  };
  whyItMatters: {
    severityScore: number;
    healthRisk: string;
    infrastructureImpact?: string;
    operationalImpact?: string;
  };
  expectedDuration: string;
  recommendedAction: {
    primary: string;
    secondary?: string[];
    urgency: 'IMMEDIATE' | 'HIGH' | 'MODERATE' | 'INFORMATIONAL';
  };
  sources: {
    sourceId: string;
    sourceName: string;
    confidence: number;
    freshness: string;
  }[];
  acknowledged: boolean;
}

export interface EnvironmentalBrief {
  briefId: string;
  generatedAt: string;
  locationName: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  personaMode: CommercialPersonaMode;
  executiveSummary: string;
  
  // 1. Current Pulse
  pulse: {
    score: number;
    status: string;
    subscores: {
      heat: number;
      air: number;
      water: number;
      nature: number;
    };
  };
  
  // 2. Current Conditions & Physical State
  currentConditions: {
    ambientTemp: number;
    apparentTemp: number;
    surfaceTemp: number;
    uhiDelta: number;
    aqi: number;
    humidity: number;
    wetBulb: number;
    solarIrradiance: number;
    canopyCoveragePct: number;
  };
  
  // 3. Important Environmental Changes
  importantChanges: {
    title: string;
    rateOfChange: string;
    significance: string;
  }[];
  
  // 4. Active Events & Alerts
  activeEvents: {
    id: string;
    tier: AlertTier;
    headline: string;
    detectedAt: string;
    impact: string;
    action: string;
  }[];
  
  // 5. Forecast Trajectory
  forecast: {
    peakTime: string;
    forecastPeakTemp: number;
    nocturnalLowTemp: number;
    diurnalSummary: string;
    riskTrajectory: string;
  };
  
  // 6. Recommended Actions & Mitigation Blueprint
  recommendedActions: {
    priority: 'Immediate (0-2h)' | 'Short-Term (Today)' | 'Strategic (Mitigation)';
    action: string;
    targetDomain: string;
    expectedROIorImpact: string;
  }[];
  
  // 7. Data Sources & Provenance
  dataSources: {
    providerName: string;
    category: string;
    telemetryParameters: string[];
    confidence: number;
    freshness: string;
  }[];
}

export interface PersonaModeConfig {
  mode: CommercialPersonaMode;
  title: string;
  tagline: string;
  targetAudience: string;
  primaryActionLabel: string;
  focusMetrics: string[];
  bannerBadge: string;
  themeColor: string;
}

export const COMMERCIAL_PERSONA_CONFIGS: Record<CommercialPersonaMode, PersonaModeConfig> = {
  PERSONAL: {
    mode: 'PERSONAL',
    title: 'Explore',
    tagline: 'Personal health, daily thermal comfort, and nature vitality overview.',
    targetAudience: 'Citizens, athletes, outdoor enthusiasts, and neighborhood residents',
    primaryActionLabel: 'View Health Comfort',
    focusMetrics: ['Ambient Temp', 'Feels Like', 'Air Quality', 'Canopy Cover', 'UV Index'],
    bannerBadge: 'Personal Explore Mode',
    themeColor: 'emerald',
  },
  BUSINESS: {
    mode: 'BUSINESS',
    title: 'Monitor',
    tagline: 'Portfolio-wide site monitoring, multi-asset heat risk, and sustainability KPI tracking.',
    targetAudience: 'Sustainability directors, property operators, real estate portfolios, logistics networks',
    primaryActionLabel: 'Track Asset Risk',
    focusMetrics: ['UHI Delta', 'Surface Heat Anomaly', 'Nature Pulse Score', 'Operational Risk Tier'],
    bannerBadge: 'Enterprise Monitor Mode',
    themeColor: 'blue',
  },
  OPERATIONS: {
    mode: 'OPERATIONS',
    title: 'Act',
    tagline: 'Incident response, thermal threshold alarms, cooling center dispatch, and worker safety.',
    targetAudience: 'Facility managers, municipal emergency response, grid operators, occupational safety',
    primaryActionLabel: 'Dispatch Intervention',
    focusMetrics: ['Wet-Bulb Temp', 'Peak Heat Window', 'Active Alarms', 'Mitigation ROI'],
    bannerBadge: 'Operations Command Mode',
    themeColor: 'amber',
  },
  RESEARCH: {
    mode: 'RESEARCH',
    title: 'Analyze',
    tagline: 'Empirical microclimate science, biophysical modeling, and cross-source research export.',
    targetAudience: 'Urban climatologists, university labs, public health researchers, meteorologists',
    primaryActionLabel: 'Export Science Data',
    focusMetrics: ['Biophysical Delta', 'Confidence Matrix', 'Multi-Source Provenance', 'Spatial Gradient'],
    bannerBadge: 'Scientific Research Mode',
    themeColor: 'indigo',
  },
};

