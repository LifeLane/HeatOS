/**
 * HeatOS Phase 5: Nature Pulse Methodology & Documentation
 * 
 * Defines scoring formulas, weight distribution, and non-fabrication protocols.
 */

import { DimensionKey, PulseMethodologyNotes, PulseStatus } from './types';

export const NATURE_PULSE_METRIC_NAME = 'HeatOS Environmental Pulse';

export const DEFAULT_DIMENSION_WEIGHTS: Record<DimensionKey, number> = {
  heat: 0.30,   // FortyGuard Microclimate, Ambient, Heat Index, Wet Bulb (30%)
  air: 0.25,    // EPA AirNow AQI, PM2.5, PM10, Ozone (25%)
  water: 0.15,  // USGS Streamflow, Soil Moisture, Drought Index (15%)
  nature: 0.10, // Satellite NDVI & Canopy coverage (10%)
  fire: 0.10,   // NASA FIRMS Hotspots & Radiative Power (10%)
  solar: 0.10,  // FortyGuard Solar Irradiance & UV Index (10%)
};

export const PULSE_METHODOLOGY_DOCS: PulseMethodologyNotes = {
  title: 'HeatOS Nature Pulse Methodology',
  metricName: NATURE_PULSE_METRIC_NAME,
  description:
    'Nature Pulse is a real-time environmental condition synthesis designed to answer "How is this place doing right now?" It translates complex multi-source environmental telemetry into an intuitive 0–100 index without oversimplifying the underlying science or inventing unmeasured data.',
  scoringScale: {
    healthy: '85–100: Optimal environmental conditions, low thermal burden, clean air, stable moisture balance.',
    stable: '70–84: Normal seasonal baseline with minimal environmental stress or mild urban warming.',
    watch: '50–69: Moderate environmental stress (e.g. urban heat island surge, moderate particulate count, or dry soils).',
    elevated: '30–49: Significant stress factors requiring precautionary action (e.g. high heat index, unhealthy AQI, active regional smoke).',
    critical: '0–29: Severe environmental emergency (e.g. dangerous heat surge >40°C feels-like, hazardous air quality, or active wildfire proximity).',
  },
  dimensionWeights: DEFAULT_DIMENSION_WEIGHTS,
  nonFabricationGuarantee:
    'Strict Missing Data Integrity: If an upstream provider is unavailable or an indicator lacks verified observation data (such as water gaging or wildfire telemetry in rural regions), that dimension is excluded from the composite calculation. The remaining available dimensions are dynamically re-weighted. Scores are NEVER fabricated from proxy or unrelated signals.',
  transparencyNotice:
    'HeatOS Environmental Pulse is a decision-support and condition-awareness indicator synthesized from empirical sensor networks and public scientific datasets (FortyGuard, NOAA NWS, EPA AirNow, NASA FIRMS, Copernicus, USGS). It is designed for situational awareness and operational thermal resilience.',
};

/**
 * Maps a numerical score (0 - 100) to its discrete PulseStatus
 */
export function scoreToPulseStatus(score: number): PulseStatus {
  if (score >= 85) return 'HEALTHY';
  if (score >= 70) return 'STABLE';
  if (score >= 50) return 'WATCH';
  if (score >= 30) return 'ELEVATED';
  return 'CRITICAL';
}

/**
 * Computes status label adapted to the specific dimension's intuitive vocabulary
 */
export function getDimensionStatusLabel(dimension: DimensionKey, status: PulseStatus, score: number): string {
  switch (dimension) {
    case 'heat':
      if (status === 'CRITICAL') return 'CRITICAL HEAT';
      if (status === 'ELEVATED') return 'HIGH HEAT';
      if (status === 'WATCH') return 'WARM / WATCH';
      if (status === 'STABLE') return 'MODERATE';
      return 'OPTIMAL';
    case 'air':
      if (status === 'CRITICAL') return 'HAZARDOUS';
      if (status === 'ELEVATED') return 'UNHEALTHY';
      if (status === 'WATCH') return 'MODERATE';
      if (status === 'STABLE') return 'ACCEPTABLE';
      return 'GOOD';
    case 'water':
      if (status === 'CRITICAL') return 'ACUTE DROUGHT';
      if (status === 'ELEVATED') return 'WATER STRESS';
      if (status === 'WATCH') return 'WATCH';
      if (status === 'STABLE') return 'ADEQUATE';
      return 'HEALTHY';
    case 'nature':
      if (status === 'CRITICAL') return 'DEPLETED';
      if (status === 'ELEVATED') return 'SPARSE';
      if (status === 'WATCH') return 'MODERATE';
      if (status === 'STABLE') return 'STABLE';
      return 'HEALTHY';
    case 'fire':
      if (status === 'CRITICAL') return 'EXTREME';
      if (status === 'ELEVATED') return 'HIGH';
      if (status === 'WATCH') return 'ELEVATED';
      if (status === 'STABLE') return 'MODERATE';
      return 'LOW';
    case 'solar':
      if (status === 'CRITICAL') return 'EXTREME UV';
      if (status === 'ELEVATED') return 'VERY HIGH';
      if (status === 'WATCH') return 'HIGH UV';
      if (status === 'STABLE') return 'MODERATE';
      return 'MILD';
    default:
      return status;
  }
}
