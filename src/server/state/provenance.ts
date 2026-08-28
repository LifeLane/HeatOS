/**
 * HeatOS Phase 4: Provenance & Physical Metric Synthesizer
 * 
 * Provides rigorous provenance wrapping and psychrometric calculations
 * (Wet Bulb, Heat Index, Vapor Pressure) based on peer-reviewed meteorological formulas.
 */

import {
  ProvenancedValue,
  FreshnessClassification,
  FieldAvailabilityStatus,
  ConflictRecord,
} from './types';

export interface CreateProvenancedValueOptions<T> {
  value: T | null;
  unit?: string;
  source: string;
  sourceName: string;
  timestamp: string;
  freshness: FreshnessClassification;
  confidence: number;
  spatialResolution: string;
  status?: FieldAvailabilityStatus;
  isEstimate?: boolean;
  notes?: string;
  conflict?: ConflictRecord;
}

/**
 * Creates a strongly typed ProvenancedValue
 */
export function createProvenancedValue<T>(
  options: CreateProvenancedValueOptions<T>
): ProvenancedValue<T> {
  const status: FieldAvailabilityStatus =
    options.value === null || options.value === undefined
      ? 'UNAVAILABLE'
      : options.status || 'AVAILABLE';

  return {
    value: options.value,
    unit: options.unit,
    source: options.source,
    sourceName: options.sourceName,
    timestamp: options.timestamp,
    freshness: options.freshness,
    confidence: Math.max(0, Math.min(100, Math.round(options.confidence))),
    spatialResolution: options.spatialResolution,
    status,
    isEstimate: options.isEstimate || false,
    notes: options.notes,
    conflict: options.conflict,
  };
}

/**
 * Creates an explicitly UNAVAILABLE provenanced value (never fabricates data)
 */
export function createUnavailableValue<T>(
  fieldDescription: string,
  unit?: string,
  source = 'none',
  sourceName = 'Unavailable'
): ProvenancedValue<T> {
  return {
    value: null,
    unit,
    source,
    sourceName,
    timestamp: new Date().toISOString(),
    freshness: 'UNKNOWN',
    confidence: 0,
    spatialResolution: 'UNKNOWN',
    status: 'UNAVAILABLE',
    isEstimate: false,
    notes: `Field [${fieldDescription}] is unavailable from active providers.`,
  };
}

/**
 * Computes Wet Bulb Temperature in Celsius using Stull's empirical formula (2011)
 * Valid across typical atmospheric ranges (-20°C to 50°C, 5% to 99% RH)
 */
export function calculateWetBulbTemperature(tempC: number, relativeHumidityPct: number): number {
  const T = tempC;
  const RH = Math.max(1, Math.min(100, relativeHumidityPct));

  const term1 = T * Math.atan(0.151977 * Math.pow(RH + 8.313659, 0.5));
  const term2 = Math.atan(T + RH);
  const term3 = Math.atan(RH - 1.676331);
  const term4 = 0.00391838 * Math.pow(RH, 1.5) * Math.atan(0.023101 * RH);
  const term5 = 4.686035;

  const tw = term1 + term2 - term3 + term4 - term5;
  return Math.round(tw * 10) / 10;
}

/**
 * Computes NOAA Heat Index in Celsius using the full Rothfusz regression equation
 */
export function calculateHeatIndex(tempC: number, relativeHumidityPct: number): number {
  // Convert C to Fahrenheit for standard NOAA formula
  const T = (tempC * 9) / 5 + 32;
  const RH = Math.max(1, Math.min(100, relativeHumidityPct));

  // If temperature is below 80°F (26.7°C), Heat Index ~ Simple Steadman formula
  if (T < 80) {
    const simpleHI = 0.5 * (T + 61.0 + (T - 68.0) * 1.2 + RH * 0.094);
    const hiC = ((simpleHI - 32) * 5) / 9;
    return Math.round(hiC * 10) / 10;
  }

  // Full Rothfusz polynomial
  let hi =
    -42.379 +
    2.04901523 * T +
    10.14333127 * RH -
    0.22475541 * T * RH -
    0.00683783 * T * T -
    0.05481717 * RH * RH +
    0.00122874 * T * T * RH +
    0.00085282 * T * RH * RH -
    0.00000199 * T * T * RH * RH;

  // Adjustments
  if (RH < 13 && T >= 80 && T <= 112) {
    const adj = ((13 - RH) / 4) * Math.sqrt((17 - Math.abs(T - 95)) / 17);
    hi -= adj;
  } else if (RH > 85 && T >= 80 && T <= 87) {
    const adj = ((RH - 85) / 10) * ((87 - T) / 5);
    hi += adj;
  }

  const resultC = ((hi - 32) * 5) / 9;
  return Math.round(resultC * 10) / 10;
}

/**
 * Computes Actual Vapor Pressure in hPa via Magnus-Tetens approximation
 */
export function calculateVaporPressureHpa(tempC: number, relativeHumidityPct: number): number {
  const es = 6.112 * Math.exp((17.67 * tempC) / (tempC + 243.5));
  const ea = (es * relativeHumidityPct) / 100;
  return Math.round(ea * 10) / 10;
}

/**
 * Calculates Wind Cooling Effect Factor (0.0 to 1.0)
 * Higher wind reduces perceived thermal stagnation.
 */
export function calculateWindCoolingFactor(windSpeedKmh: number): number {
  if (windSpeedKmh <= 1) return 0.0;
  // Logarithmic wind convective cooling curve, capped at 1.0
  const factor = Math.min(1.0, Math.log10(windSpeedKmh) * 0.6);
  return Math.round(factor * 100) / 100;
}
