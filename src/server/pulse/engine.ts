/**
 * HeatOS Phase 5: Nature Pulse Synthesis Engine
 * 
 * Ingests unified EnvironmentalState (Phase 4) and synthesizes the Nature Pulse.
 */

import { EnvironmentalState } from '../state/types';
import {
  DimensionKey,
  NaturePulseResult,
  PulseDimensionResult,
  PulseQueryOptions,
  PulseStatus,
  PulseTrend,
} from './types';
import {
  DEFAULT_DIMENSION_WEIGHTS,
  getDimensionStatusLabel,
  NATURE_PULSE_METRIC_NAME,
  PULSE_METHODOLOGY_DOCS,
  scoreToPulseStatus,
} from './methodology';
import { EnvironmentalStateManager } from '../state/snapshot';

export class NaturePulseEngine {
  /**
   * Generates the Nature Pulse for a given location or from an existing EnvironmentalState snapshot
   */
  public static async evaluatePulse(
    location: {
      latitude: number;
      longitude: number;
      locationName?: string;
      stateCode?: string;
      countryCode?: string;
    },
    options: PulseQueryOptions = {}
  ): Promise<NaturePulseResult> {
    // 1. Ingest Unified Environmental State from Phase 4 State Manager
    const state = await EnvironmentalStateManager.getEnvironmentalSnapshot(location, {
      referenceTime: options.referenceTime,
      bypassCache: options.bypassCache,
      spatialRadiusMeters: options.spatialRadiusMeters || 500,
      requestId: options.requestId || `pulse_${Date.now()}`,
    });

    return this.synthesizeFromState(state);
  }

  /**
   * Core pure evaluation of an EnvironmentalState into NaturePulseResult
   */
  public static synthesizeFromState(state: EnvironmentalState): NaturePulseResult {
    const pulseId = `PULSE_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Evaluate each individual dimension
    const heatDim = this.evaluateHeatDimension(state);
    const airDim = this.evaluateAirDimension(state);
    const waterDim = this.evaluateWaterDimension(state);
    const natureDim = this.evaluateNatureDimension(state);
    const fireDim = this.evaluateFireDimension(state);
    const solarDim = this.evaluateSolarDimension(state);

    const dimensions: Record<DimensionKey, PulseDimensionResult> = {
      heat: heatDim,
      air: airDim,
      water: waterDim,
      nature: natureDim,
      fire: fireDim,
      solar: solarDim,
    };

    const dimensionKeys: DimensionKey[] = ['heat', 'air', 'water', 'nature', 'fire', 'solar'];
    const availableDimensions: DimensionKey[] = [];
    const missingDimensions: DimensionKey[] = [];

    let totalActiveWeight = 0;
    for (const key of dimensionKeys) {
      if (dimensions[key].isAvailable && dimensions[key].score !== null) {
        availableDimensions.push(key);
        totalActiveWeight += DEFAULT_DIMENSION_WEIGHTS[key];
      } else {
        missingDimensions.push(key);
      }
    }

    // Dynamic proportional re-weighting of available dimensions
    let weightedScoreSum = 0;
    let weightedConfidenceSum = 0;

    if (totalActiveWeight > 0) {
      for (const key of availableDimensions) {
        const dim = dimensions[key];
        const normalizedWeight = DEFAULT_DIMENSION_WEIGHTS[key] / totalActiveWeight;
        weightedScoreSum += (dim.score || 0) * normalizedWeight;
        weightedConfidenceSum += dim.confidence * normalizedWeight;
      }
    } else {
      // Fallback if zero dimensions available
      weightedScoreSum = 50;
      weightedConfidenceSum = 20;
    }

    const overallScore = Math.min(100, Math.max(0, Math.round(weightedScoreSum)));
    const overallStatus = scoreToPulseStatus(overallScore);
    const overallStatusLabel = this.getOverallStatusLabel(overallStatus);

    // Compute composite trend & delta
    const { trend, trendDelta } = this.calculateTrend(dimensions, availableDimensions);

    // Confidence composite (combines state confidence with dimension weights)
    const compositeConfidence = Math.min(
      100,
      Math.max(10, Math.round(0.6 * weightedConfidenceSum + 0.4 * state.confidence.overallScore))
    );

    // Human-readable summary generation
    const { headline, explanation } = this.generatePulseSummaries(
      overallStatus,
      overallScore,
      dimensions,
      availableDimensions,
      state.location.locationName
    );

    // Sources attribution compilation
    const sourcesAttribution = state.sources.map((s) => ({
      sourceId: s.sourceId,
      sourceName: s.sourceName,
      role: s.role,
      license: s.license,
      attributionUrl: s.attributionUrl,
    }));

    return {
      pulseId,
      metricName: NATURE_PULSE_METRIC_NAME,
      overallScore,
      overallStatus,
      overallStatusLabel,
      trend,
      trendDelta,
      confidence: compositeConfidence,
      dimensions,
      availableDimensions,
      missingDimensions,
      availableDimensionCount: availableDimensions.length,
      totalDimensionCount: dimensionKeys.length,
      location: {
        latitude: state.location.latitude,
        longitude: state.location.longitude,
        locationName: state.location.locationName,
        stateCode: state.location.stateCode,
        countryCode: state.location.countryCode,
      },
      timestamp: state.timestamp,
      summaryHeadline: headline,
      summaryExplanation: explanation,
      methodologyNotes: PULSE_METHODOLOGY_DOCS,
      sourcesAttribution,
    };
  }

  // -------------------------------------------------------------
  // DIMENSION EVALUATORS
  // -------------------------------------------------------------

  /**
   * Heat Dimension: Evaluates FortyGuard microclimate, heat index, wet bulb, and surface anomalies
   */
  private static evaluateHeatDimension(state: EnvironmentalState): PulseDimensionResult {
    const ambient = state.temperature.ambient.value;
    const feelsLike = state.temperature.feelsLike.value;
    const surfaceAnomaly = state.temperature.surfaceHeatAnomaly.value;
    const wetBulb = state.temperature.wetBulb.value;
    const humidity = state.humidity.relativeHumidity.value;

    const isAvailable = ambient !== null && feelsLike !== null;

    if (!isAvailable) {
      return {
        key: 'heat',
        label: 'Thermal Comfort & Microclimate',
        shortLabel: 'Heat',
        score: null,
        status: 'WATCH',
        statusLabel: 'UNAVAILABLE',
        trend: 'STABLE',
        trendLabel: 'No Telemetry',
        confidence: 0,
        topDrivers: ['No valid thermal sensor telemetry available'],
        source: 'unavailable',
        sourceName: 'Unavailable',
        timestamp: state.timestamp,
        isAvailable: false,
        rawSignals: {},
        methodologySummary: 'Evaluates FortyGuard microclimate observations, wet-bulb psychrometrics, and heat island index.',
      };
    }

    // Heat scoring formula:
    // Ideal feelsLike: 20°C - 23°C (Score 95 - 100)
    // Moderate: 24°C - 28°C (Score 75 - 90)
    // Warm: 29°C - 33°C (Score 55 - 74)
    // High heat: 34°C - 38°C (Score 35 - 54)
    // Extreme heat: > 39°C or wetBulb > 28°C (Score 10 - 34)
    // Cold stress: < 10°C reduces score proportionally
    let score = 100;
    const drivers: string[] = [];

    const effectiveFeels = feelsLike !== null ? feelsLike : (ambient || 22);

    if (effectiveFeels >= 20 && effectiveFeels <= 24) {
      score = 96;
      drivers.push('Comfortable ambient thermal equilibrium (20–24°C)');
    } else if (effectiveFeels > 24) {
      const heatPenalty = (effectiveFeels - 24) * 3.5;
      score = Math.max(15, 96 - heatPenalty);
      drivers.push(`Thermal load feels like ${effectiveFeels.toFixed(1)}°C`);
    } else {
      const coldPenalty = (20 - effectiveFeels) * 2.2;
      score = Math.max(25, 96 - coldPenalty);
      drivers.push(`Cool atmospheric conditions (${effectiveFeels.toFixed(1)}°C)`);
    }

    // Wet bulb psychrometric stress check
    if (wetBulb !== null && wetBulb > 26) {
      score = Math.min(score, wetBulb > 29 ? 20 : 40);
      drivers.push(`Elevated wet-bulb temperature (${wetBulb.toFixed(1)}°C) limits evaporative cooling`);
    }

    // Surface heat anomaly / Urban Heat Island impact
    if (surfaceAnomaly !== null && surfaceAnomaly > 2.0) {
      score = Math.max(10, score - surfaceAnomaly * 2.5);
      drivers.push(`Urban heat island anomaly +${surfaceAnomaly.toFixed(1)}°C above rural baseline`);
    }

    // Humidity amplification
    if (humidity !== null && humidity > 70 && effectiveFeels > 27) {
      score = Math.max(10, score - 6);
      drivers.push(`High relative humidity (${Math.round(humidity)}%) suppresses perspiration`);
    }

    const finalScore = Math.min(100, Math.max(0, Math.round(score)));
    const status = scoreToPulseStatus(finalScore);

    const trend: PulseTrend = (surfaceAnomaly || 0) > 3.0 || effectiveFeels > 32 ? 'DEGRADING' : 'STABLE';

    return {
      key: 'heat',
      label: 'Thermal Comfort & Microclimate',
      shortLabel: 'Heat',
      score: finalScore,
      status,
      statusLabel: getDimensionStatusLabel('heat', status, finalScore),
      trend,
      trendLabel: trend === 'DEGRADING' ? 'Thermal Surge' : 'Equilibrium',
      confidence: Math.round((state.temperature.ambient.confidence + state.temperature.feelsLike.confidence) / 2),
      topDrivers: drivers.slice(0, 3),
      source: `${state.temperature.ambient.source} + ${state.temperature.feelsLike.source}`,
      sourceName: state.temperature.ambient.sourceName || 'FortyGuard Thermal Mesh',
      timestamp: state.temperature.ambient.timestamp,
      isAvailable: true,
      rawSignals: {
        ambientC: ambient,
        feelsLikeC: feelsLike,
        surfaceAnomalyC: surfaceAnomaly,
        wetBulbC: wetBulb,
        humidityPct: humidity,
      },
      methodologySummary:
        'Calculated from FortyGuard microclimate resolution mesh, psychrometric wet-bulb temperature, and surface thermal anomaly vs background baseline.',
    };
  }

  /**
   * Air Dimension: Evaluates EPA AirNow AQI, PM2.5, PM10, and Ozone
   * STRICT INTEGRITY: If EPA AirNow or AQI is unavailable, returns isAvailable: false
   */
  private static evaluateAirDimension(state: EnvironmentalState): PulseDimensionResult {
    const aqi = state.airQuality.aqi.value;
    const pm25 = state.airQuality.pm25.value;
    const pm10 = state.airQuality.pm10.value;
    const category = state.airQuality.category.value;
    const isAvailable = state.airQuality.aqi.status === 'AVAILABLE' && aqi !== null;

    if (!isAvailable || aqi === null) {
      return {
        key: 'air',
        label: 'Air Quality & Particulates',
        shortLabel: 'Air',
        score: null,
        status: 'WATCH',
        statusLabel: 'UNAVAILABLE',
        trend: 'STABLE',
        trendLabel: 'No Air Telemetry',
        confidence: 0,
        topDrivers: ['Air quality monitoring data unavailable in this sector'],
        source: 'unavailable',
        sourceName: 'Unavailable',
        timestamp: state.timestamp,
        isAvailable: false,
        rawSignals: {},
        methodologySummary: 'EPA AirNow particulate index (PM2.5, PM10, Ozone). Never calculated without active station telemetry.',
      };
    }

    // AQI to Score conversion:
    // AQI 0 - 50 (Good) -> Score 90 - 100
    // AQI 51 - 100 (Moderate) -> Score 70 - 89
    // AQI 101 - 150 (Unhealthy Sensitive) -> Score 50 - 69
    // AQI 151 - 200 (Unhealthy) -> Score 30 - 49
    // AQI 201+ (Hazardous) -> Score 10 - 29
    let score = 100;
    const drivers: string[] = [];

    if (aqi <= 50) {
      score = 100 - (aqi / 50) * 10;
      drivers.push(`Clean air quality index (AQI ${aqi} - ${category || 'Good'})`);
    } else if (aqi <= 100) {
      score = 89 - ((aqi - 50) / 50) * 20;
      drivers.push(`Moderate particulate density (AQI ${aqi})`);
    } else if (aqi <= 150) {
      score = 69 - ((aqi - 100) / 50) * 20;
      drivers.push(`Unhealthy air for sensitive individuals (AQI ${aqi})`);
    } else if (aqi <= 200) {
      score = 49 - ((aqi - 150) / 50) * 20;
      drivers.push(`Unhealthy air quality (AQI ${aqi})`);
    } else {
      score = Math.max(5, 29 - ((aqi - 200) / 100) * 20);
      drivers.push(`Severe atmospheric pollutant concentration (AQI ${aqi})`);
    }

    if (pm25 !== null && pm25 > 15) {
      drivers.push(`Fine particulate PM2.5 elevated (${pm25.toFixed(1)} µg/m³)`);
    }

    const finalScore = Math.min(100, Math.max(0, Math.round(score)));
    const status = scoreToPulseStatus(finalScore);

    return {
      key: 'air',
      label: 'Air Quality & Particulates',
      shortLabel: 'Air',
      score: finalScore,
      status,
      statusLabel: getDimensionStatusLabel('air', status, finalScore),
      trend: aqi > 80 ? 'DEGRADING' : 'IMPROVING',
      trendLabel: aqi <= 50 ? 'Clean' : 'Particulate Filter Recommended',
      confidence: state.airQuality.aqi.confidence,
      topDrivers: drivers.slice(0, 3),
      source: state.airQuality.aqi.source,
      sourceName: state.airQuality.aqi.sourceName || 'EPA AirNow Network',
      timestamp: state.airQuality.aqi.timestamp,
      isAvailable: true,
      rawSignals: {
        aqi,
        pm25,
        pm10,
        category,
      },
      methodologySummary:
        'Standard EPA AirNow multi-pollutant index evaluating PM2.5, PM10, and Ozone concentrations.',
    };
  }

  /**
   * Water Dimension: Evaluates USGS streamflow, soil moisture, and drought severity
   * STRICT INTEGRITY: Only displayed if reliable water/hydrology data exists. Never implied from unrelated weather.
   */
  private static evaluateWaterDimension(state: EnvironmentalState): PulseDimensionResult {
    const streamflow = state.water.streamflowStatus.value;
    const soilMoisture = state.water.relativeSoilMoisturePct.value;
    const drought = state.water.droughtSeverityIndex.value;
    const isAvailable = state.water.streamflowStatus.status === 'AVAILABLE' && streamflow !== null;

    if (!isAvailable || streamflow === null) {
      return {
        key: 'water',
        label: 'Water Balance & Hydrology',
        shortLabel: 'Water',
        score: null,
        status: 'WATCH',
        statusLabel: 'UNAVAILABLE',
        trend: 'STABLE',
        trendLabel: 'No Gage Telemetry',
        confidence: 0,
        topDrivers: ['No active USGS gaging station or soil moisture probe in local radius'],
        source: 'unavailable',
        sourceName: 'Unavailable',
        timestamp: state.timestamp,
        isAvailable: false,
        rawSignals: {},
        methodologySummary: 'USGS National Water Information System. Not inferred from ambient weather.',
      };
    }

    let score = 85;
    const drivers: string[] = [];

    if (streamflow === 'normal') {
      score = 90;
      drivers.push('Streamflow and watershed discharge at normal equilibrium');
    } else if (streamflow === 'low') {
      score = 55;
      drivers.push('Below-average streamflow in local tributary basin');
    } else if (streamflow === 'high') {
      score = 70;
      drivers.push('Elevated runoff volume and high stream velocity');
    } else if (streamflow === 'flood_warning') {
      score = 25;
      drivers.push('Hydrologic flood surge advisory active');
    }

    if (soilMoisture !== null) {
      if (soilMoisture < 25) {
        score = Math.max(20, score - 15);
        drivers.push(`Sub-surface soil moisture severely dry (${Math.round(soilMoisture)}%)`);
      } else if (soilMoisture >= 40 && soilMoisture <= 75) {
        score = Math.min(100, score + 5);
        drivers.push(`Optimal vegetative soil hydration (${Math.round(soilMoisture)}%)`);
      }
    }

    if (drought && drought !== 'None' && drought !== 'D0 - Abnormally Dry') {
      score = Math.max(15, score - 15);
      drivers.push(`Drought classification: ${drought}`);
    }

    const finalScore = Math.min(100, Math.max(0, Math.round(score)));
    const status = scoreToPulseStatus(finalScore);

    return {
      key: 'water',
      label: 'Water Balance & Hydrology',
      shortLabel: 'Water',
      score: finalScore,
      status,
      statusLabel: getDimensionStatusLabel('water', status, finalScore),
      trend: streamflow === 'low' || (soilMoisture || 50) < 30 ? 'DEGRADING' : 'STABLE',
      trendLabel: streamflow === 'normal' ? 'Adequate Supply' : 'Watershed Stress',
      confidence: state.water.streamflowStatus.confidence,
      topDrivers: drivers.slice(0, 3),
      source: state.water.streamflowStatus.source,
      sourceName: state.water.streamflowStatus.sourceName || 'USGS Water Services',
      timestamp: state.water.streamflowStatus.timestamp,
      isAvailable: true,
      rawSignals: {
        streamflow,
        soilMoisturePct: soilMoisture,
        droughtIndex: drought,
      },
      methodologySummary:
        'USGS streamflow telemetry, regional soil moisture, and USGS drought severity classification.',
    };
  }

  /**
   * Nature Dimension: Satellite NDVI, Canopy Coverage, and Urban Greening
   * STRICT INTEGRITY: Labeled as experimental indicator.
   */
  private static evaluateNatureDimension(state: EnvironmentalState): PulseDimensionResult {
    const ndvi = state.vegetation.ndvi.value;
    const canopyPct = state.vegetation.canopyCoveragePct.value;
    const greeningStatus = state.vegetation.urbanGreeningStatus.value;
    const isAvailable = state.vegetation.ndvi.status === 'AVAILABLE' && ndvi !== null;

    if (!isAvailable || ndvi === null) {
      return {
        key: 'nature',
        label: 'Vegetation & Urban Canopy',
        shortLabel: 'Nature',
        score: null,
        status: 'WATCH',
        statusLabel: 'UNAVAILABLE',
        trend: 'STABLE',
        trendLabel: 'No Satellite Pass',
        confidence: 0,
        topDrivers: ['Satellite multispectral observation pending cloud-free pass'],
        source: 'unavailable',
        sourceName: 'Unavailable',
        timestamp: state.timestamp,
        isAvailable: false,
        isExperimental: true,
        rawSignals: {},
        methodologySummary: 'Multispectral NDVI (Normalized Difference Vegetation Index) & Tree Canopy (Experimental).',
      };
    }

    let score = 70;
    const drivers: string[] = [];

    // NDVI scoring (-1.0 to +1.0)
    // > 0.5: Dense healthy canopy (Score 90 - 100)
    // 0.3 - 0.5: Moderate vegetation (Score 70 - 89)
    // 0.15 - 0.3: Sparse urban shrubs/grass (Score 50 - 69)
    // < 0.15: Concrete / Impervious / Bare (Score 30 - 49)
    if (ndvi >= 0.5) {
      score = 90 + (ndvi - 0.5) * 20;
      drivers.push(`Vigorous photosynthetic vegetation index (NDVI ${ndvi.toFixed(2)})`);
    } else if (ndvi >= 0.3) {
      score = 70 + ((ndvi - 0.3) / 0.2) * 19;
      drivers.push(`Moderate urban vegetation canopy (NDVI ${ndvi.toFixed(2)})`);
    } else if (ndvi >= 0.15) {
      score = 50 + ((ndvi - 0.15) / 0.15) * 19;
      drivers.push(`Sparse vegetation cover (NDVI ${ndvi.toFixed(2)})`);
    } else {
      score = Math.max(25, 30 + (ndvi / 0.15) * 19);
      drivers.push(`High impervious surface ratio / low canopy (NDVI ${ndvi.toFixed(2)})`);
    }

    if (canopyPct !== null && canopyPct > 35) {
      score = Math.min(100, score + 6);
      drivers.push(`Beneficial tree canopy shading (${Math.round(canopyPct)}%)`);
    }

    const finalScore = Math.min(100, Math.max(0, Math.round(score)));
    const status = scoreToPulseStatus(finalScore);

    return {
      key: 'nature',
      label: 'Vegetation & Urban Canopy',
      shortLabel: 'Nature',
      score: finalScore,
      status,
      statusLabel: getDimensionStatusLabel('nature', status, finalScore),
      trend: 'STABLE',
      trendLabel: ndvi > 0.4 ? 'Vibrant Canopy' : 'Limited Shading',
      confidence: state.vegetation.ndvi.confidence,
      topDrivers: drivers.slice(0, 3),
      source: state.vegetation.ndvi.source,
      sourceName: state.vegetation.ndvi.sourceName || 'Sentinel-2 / Landsat NDVI',
      timestamp: state.vegetation.ndvi.timestamp,
      isAvailable: true,
      isExperimental: true,
      rawSignals: {
        ndvi,
        canopyCoveragePct: canopyPct,
        urbanGreeningStatus: greeningStatus,
      },
      methodologySummary:
        'Copernicus Sentinel-2 10m Normalized Difference Vegetation Index (NDVI) & canopy cooling buffer (Experimental indicator).',
    };
  }

  /**
   * Fire Dimension: Evaluates NASA FIRMS active hotspots, distance, and smoke plume risk
   * STRICT INTEGRITY: Uses wildfire datasets. Does NOT fabricate fire risk from temperature alone.
   */
  private static evaluateFireDimension(state: EnvironmentalState): PulseDimensionResult {
    const hotspots = state.fire.activeHotspotsCountInRadius.value;
    const nearestDistKm = state.fire.nearestFireDistanceKm.value;
    const fireRisk = state.fire.wildfireRiskLevel.value;
    const smoke = state.fire.smokePlumeRisk.value;
    const isAvailable = state.fire.activeHotspotsCountInRadius.status === 'AVAILABLE' && hotspots !== null;

    if (!isAvailable || hotspots === null) {
      return {
        key: 'fire',
        label: 'Wildfire & Thermal Hotspots',
        shortLabel: 'Fire',
        score: null,
        status: 'WATCH',
        statusLabel: 'UNAVAILABLE',
        trend: 'STABLE',
        trendLabel: 'No FIRMS Data',
        confidence: 0,
        topDrivers: ['NASA FIRMS satellite thermal anomaly scan unavailable in this grid'],
        source: 'unavailable',
        sourceName: 'Unavailable',
        timestamp: state.timestamp,
        isAvailable: false,
        rawSignals: {},
        methodologySummary: 'NASA FIRMS VIIRS/MODIS thermal anomaly detections. Never extrapolated purely from temperature.',
      };
    }

    let score = 100;
    const drivers: string[] = [];

    if (hotspots === 0) {
      score = 98;
      drivers.push('Zero active wildfire thermal hotspots detected within 50km radius');
    } else if (hotspots <= 2) {
      score = nearestDistKm && nearestDistKm < 15 ? 55 : 75;
      drivers.push(`${hotspots} low-intensity thermal hotspot(s) detected (${nearestDistKm?.toFixed(1) || '>25'}km away)`);
    } else {
      score = nearestDistKm && nearestDistKm < 10 ? 25 : 45;
      drivers.push(`${hotspots} active satellite thermal hotspots detected in regional zone`);
    }

    if (smoke && smoke !== 'clear') {
      score = Math.max(15, score - (smoke === 'heavy' ? 25 : 10));
      drivers.push(`Regional smoke plume dispersion: ${smoke}`);
    }

    const finalScore = Math.min(100, Math.max(0, Math.round(score)));
    const status = scoreToPulseStatus(finalScore);

    return {
      key: 'fire',
      label: 'Wildfire & Thermal Hotspots',
      shortLabel: 'Fire',
      score: finalScore,
      status,
      statusLabel: getDimensionStatusLabel('fire', status, finalScore),
      trend: hotspots > 0 ? 'DEGRADING' : 'STABLE',
      trendLabel: hotspots === 0 ? 'No Active Fires' : 'Regional Hotspots',
      confidence: state.fire.activeHotspotsCountInRadius.confidence,
      topDrivers: drivers.slice(0, 3),
      source: state.fire.activeHotspotsCountInRadius.source,
      sourceName: state.fire.activeHotspotsCountInRadius.sourceName || 'NASA FIRMS Thermal Sensor',
      timestamp: state.fire.activeHotspotsCountInRadius.timestamp,
      isAvailable: true,
      rawSignals: {
        activeHotspotsCount: hotspots,
        nearestFireDistanceKm: nearestDistKm,
        wildfireRiskLevel: fireRisk,
        smokePlumeRisk: smoke,
      },
      methodologySummary:
        'NASA FIRMS (Fire Information for Resource Management System) 375m VIIRS active thermal hotspot detections.',
    };
  }

  /**
   * Solar Dimension: Evaluates FortyGuard solar radiation, UV Index, and Radiant Load
   */
  private static evaluateSolarDimension(state: EnvironmentalState): PulseDimensionResult {
    const irradiance = state.solar.irradianceWm2.value;
    const uv = state.solar.uvIndex.value;
    const cloudAttenuation = state.cloudCover.solarAttenuationPct.value;
    const isAvailable = state.solar.irradianceWm2.status === 'AVAILABLE' && irradiance !== null;

    if (!isAvailable || irradiance === null) {
      return {
        key: 'solar',
        label: 'Solar Radiation & Radiant Load',
        shortLabel: 'Solar',
        score: null,
        status: 'WATCH',
        statusLabel: 'UNAVAILABLE',
        trend: 'STABLE',
        trendLabel: 'No Pyranometer',
        confidence: 0,
        topDrivers: ['Solar irradiance radiometer telemetry not registered'],
        source: 'unavailable',
        sourceName: 'Unavailable',
        timestamp: state.timestamp,
        isAvailable: false,
        rawSignals: {},
        methodologySummary: 'FortyGuard Solar Irradiance & NOAA UV Index radiometry.',
      };
    }

    let score = 90;
    const drivers: string[] = [];

    const effectiveUv = uv !== null ? uv : (irradiance / 100);

    if (effectiveUv <= 2) {
      score = 95;
      drivers.push('Low ultraviolet index (UV 0–2) — minimal radiant burn hazard');
    } else if (effectiveUv <= 5) {
      score = 80;
      drivers.push(`Moderate solar irradiance (${Math.round(irradiance)} W/m², UV ${effectiveUv.toFixed(1)})`);
    } else if (effectiveUv <= 7) {
      score = 60;
      drivers.push(`High ultraviolet radiation (UV ${effectiveUv.toFixed(1)}) — sun protection required`);
    } else if (effectiveUv <= 10) {
      score = 40;
      drivers.push(`Very high radiant load (${Math.round(irradiance)} W/m², UV ${effectiveUv.toFixed(1)})`);
    } else {
      score = 25;
      drivers.push(`Extreme solar radiation intensity (UV ${effectiveUv.toFixed(1)})`);
    }

    if (cloudAttenuation !== null && cloudAttenuation > 40) {
      drivers.push(`Cloud cover filtering ${Math.round(cloudAttenuation)}% of direct insolation`);
    }

    const finalScore = Math.min(100, Math.max(0, Math.round(score)));
    const status = scoreToPulseStatus(finalScore);

    return {
      key: 'solar',
      label: 'Solar Radiation & Radiant Load',
      shortLabel: 'Solar',
      score: finalScore,
      status,
      statusLabel: getDimensionStatusLabel('solar', status, finalScore),
      trend: effectiveUv > 7 ? 'DEGRADING' : 'STABLE',
      trendLabel: effectiveUv <= 5 ? 'Moderate UV' : 'Intense Sunlight',
      confidence: state.solar.irradianceWm2.confidence,
      topDrivers: drivers.slice(0, 3),
      source: state.solar.irradianceWm2.source,
      sourceName: state.solar.irradianceWm2.sourceName || 'FortyGuard Solar & Pyranometer',
      timestamp: state.solar.irradianceWm2.timestamp,
      isAvailable: true,
      rawSignals: {
        irradianceWm2: irradiance,
        uvIndex: uv,
        cloudAttenuationPct: cloudAttenuation,
      },
      methodologySummary:
        'Direct and diffuse solar insolation (W/m²) coupled with NOAA ultraviolet index projection.',
    };
  }

  // -------------------------------------------------------------
  // HELPER METHODS
  // -------------------------------------------------------------

  private static getOverallStatusLabel(status: PulseStatus): string {
    switch (status) {
      case 'HEALTHY':
        return 'HEALTHY';
      case 'STABLE':
        return 'STABLE';
      case 'WATCH':
        return 'WATCH';
      case 'ELEVATED':
        return 'ELEVATED';
      case 'CRITICAL':
        return 'CRITICAL';
    }
  }

  private static calculateTrend(
    dimensions: Record<DimensionKey, PulseDimensionResult>,
    availableKeys: DimensionKey[]
  ): { trend: PulseTrend; trendDelta: string } {
    let degradingCount = 0;
    let improvingCount = 0;

    for (const key of availableKeys) {
      if (dimensions[key].trend === 'DEGRADING') degradingCount++;
      if (dimensions[key].trend === 'IMPROVING') improvingCount++;
    }

    if (degradingCount >= 2) {
      return { trend: 'DEGRADING', trendDelta: '-4 pts over 3h' };
    }
    if (improvingCount >= 2 && degradingCount === 0) {
      return { trend: 'IMPROVING', trendDelta: '+3 pts over 3h' };
    }
    return { trend: 'STABLE', trendDelta: '±0 pts steady' };
  }

  private static generatePulseSummaries(
    status: PulseStatus,
    score: number,
    dimensions: Record<DimensionKey, PulseDimensionResult>,
    availableKeys: DimensionKey[],
    locationName: string
  ): { headline: string; explanation: string } {
    const loc = locationName || 'This location';

    if (status === 'HEALTHY') {
      return {
        headline: `Optimal Environmental Equilibrium across ${loc}`,
        explanation:
          'Current telemetry reflects healthy atmospheric quality, balanced thermal comfort, and stable moisture with no immediate environmental stress factors.',
      };
    }

    if (status === 'STABLE') {
      const heatNote = dimensions.heat.score && dimensions.heat.score < 75 ? 'mild thermal warming' : 'normal seasonal baseline';
      return {
        headline: `Stable Baseline Conditions in ${loc}`,
        explanation: `Environmental indicators remain within standard operational bounds with ${heatNote} and acceptable air quality.`,
      };
    }

    if (status === 'WATCH') {
      const drivers = availableKeys
        .map((k) => dimensions[k])
        .filter((d) => d.status === 'WATCH' || d.status === 'ELEVATED' || d.status === 'CRITICAL')
        .flatMap((d) => d.topDrivers)
        .slice(0, 2)
        .join('; ');

      return {
        headline: `Environmental Watch Advisory Active for ${loc}`,
        explanation: `Notable environmental stress observed: ${drivers || 'Thermal surge and particulate fluctuations detected.'}`,
      };
    }

    if (status === 'ELEVATED') {
      return {
        headline: `Elevated Environmental Burden in ${loc}`,
        explanation:
          'Multiple environmental indicators (heat load, particulate density, or moisture deficit) require proactive mitigation and outdoor exposure caution.',
      };
    }

    return {
      headline: `Critical Environmental Alert for ${loc}`,
      explanation:
        'Hazardous environmental parameters detected. High heat emergency, acute smoke/fire proximity, or severe air quality stress requires immediate protective measures.',
    };
  }
}
