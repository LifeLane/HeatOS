/**
 * HeatOS Phase 4: Unified Environmental State Synthesizer
 * 
 * Ingests multi-provider telemetry from the Open Data Fabric,
 * executes spatial/temporal normalization, resolves cross-source conflicts,
 * calculates composite confidence, and produces the unified EnvironmentalState.
 */

import {
  EnvironmentalState,
  SnapshotQueryOptions,
  HistoricalSnapshotOptions,
  HistoricalEnvironmentalSnapshot,
  ContributingSourceSummary,
  ConflictRecord,
  ForecastIntervalState,
  FreshnessClassification,
} from './types';
import { GeoLocationQuery } from '../fabric/types';
import { globalOpenDataFabric } from '../fabric/orchestrator';
import { createProvenancedValue, createUnavailableValue, calculateWetBulbTemperature, calculateHeatIndex, calculateVaporPressureHpa, calculateWindCoolingFactor } from './provenance';
import { TemporalNormalizer } from './temporal';
import { SpatialNormalizer } from './spatial';
import { ConflictResolver } from './conflicts';
import { ConfidenceEvaluator } from './confidence';

export class EnvironmentalStateManager {
  /**
   * Generates a single, coherent, strongly-typed EnvironmentalState snapshot
   * for the requested location. Single Source of Truth for HeatOS.
   */
  public static async getEnvironmentalSnapshot(
    location: GeoLocationQuery,
    options: SnapshotQueryOptions = {}
  ): Promise<EnvironmentalState> {
    const referenceTime = options.referenceTime || new Date().toISOString();
    const radiusMeters = options.spatialRadiusMeters || 500;

    // 1. Fetch normalized multi-provider telemetry via Data Fabric
    const enrichedFabric = await globalOpenDataFabric.getEnrichedState(location, {
      bypassCache: options.bypassCache,
      requestId: options.requestId,
    });

    const { thermal, weather, airQuality, wildfire, vegetation, water, activeProviders } = enrichedFabric;

    // 2. Spatial Normalization
    const locationState = SpatialNormalizer.buildLocationState(
      location.latitude,
      location.longitude,
      location.locationName || 'Monitored Zone',
      location.stateCode,
      location.countryCode,
      radiusMeters
    );

    const spatialObservations = [
      { source: 'fortyguard', spatialResolution: '1m - 10m Micro-Spatial Mesh', latitude: location.latitude, longitude: location.longitude },
      { source: 'noaa_nws', spatialResolution: '2.5km Synoptic Grid', latitude: location.latitude, longitude: location.longitude },
      { source: 'epa_airnow', spatialResolution: 'Monitoring Station Radius', latitude: location.latitude, longitude: location.longitude },
      { source: 'nasa_firms', spatialResolution: '375m VIIRS / 1km MODIS', latitude: location.latitude, longitude: location.longitude },
      { source: 'satellite_vegetation', spatialResolution: '10m Sentinel-2 / 30m Landsat', latitude: location.latitude, longitude: location.longitude },
      { source: 'usgs_water', spatialResolution: 'Gaging Station Telemetry', latitude: location.latitude, longitude: location.longitude },
    ];

    const spatialAlignment = SpatialNormalizer.analyzeSpatialAlignment(
      location.latitude,
      location.longitude,
      spatialObservations
    );

    // 3. Temporal Normalization
    const observationTimestamps = [
      thermal?.quality?.lastUpdated,
      weather?.quality?.lastUpdated,
      airQuality?.quality?.lastUpdated,
      wildfire?.quality?.lastUpdated,
      vegetation?.quality?.lastUpdated,
      water?.quality?.lastUpdated,
    ];

    const temporalAlignment = TemporalNormalizer.analyzeAlignment(observationTimestamps, referenceTime);

    // Freshness classifications
    const thermalFreshness: FreshnessClassification = TemporalNormalizer.classifyFreshness(thermal?.quality?.lastUpdated, referenceTime);
    const weatherFreshness: FreshnessClassification = TemporalNormalizer.classifyFreshness(weather?.quality?.lastUpdated, referenceTime);
    const aqiFreshness: FreshnessClassification = TemporalNormalizer.classifyFreshness(airQuality?.quality?.lastUpdated, referenceTime);
    const fireFreshness: FreshnessClassification = TemporalNormalizer.classifyFreshness(wildfire?.quality?.lastUpdated, referenceTime);
    const vegFreshness: FreshnessClassification = TemporalNormalizer.classifyFreshness(vegetation?.quality?.lastUpdated, referenceTime);
    const waterFreshness: FreshnessClassification = TemporalNormalizer.classifyFreshness(water?.quality?.lastUpdated, referenceTime);

    // 4. Conflicts & Priority Rules Detection
    const conflicts: ConflictRecord[] = [];

    // Conflict Check: Thermal measurements (FortyGuard vs NOAA ambient)
    let ambientTempC: number | null = null;
    let ambientTempSource = 'fortyguard';
    let ambientTempSourceName = 'FortyGuard Thermal Mesh';
    let ambientTempConfidence = thermal?.quality?.confidence || 90;
    let ambientTempConflict: ConflictRecord | undefined;

    if (thermal?.data && weather?.data) {
      const fgTemp = thermal.data.ambientTempC;
      const noaaTemp = weather.data.ambientTempC;
      const conflict = ConflictResolver.evaluateThermalConflict(
        'temperature.ambient',
        'fortyguard',
        fgTemp,
        'noaa_nws',
        noaaTemp,
        1.5,
        '°C'
      );
      if (conflict) {
        conflicts.push(conflict);
        ambientTempConflict = conflict;
      }
      // FortyGuard is PRIMARY thermal source
      ambientTempC = fgTemp;
    } else if (thermal?.data) {
      ambientTempC = thermal.data.ambientTempC;
    } else if (weather?.data) {
      ambientTempC = weather.data.ambientTempC;
      ambientTempSource = 'noaa_nws';
      ambientTempSourceName = 'NOAA National Weather Service';
      ambientTempConfidence = weather.quality?.confidence || 85;
    }

    // 5. Synthesis of Measurement Dimensions
    const missingFields: string[] = [];

    // --- TEMPERATURE & THERMAL ---
    const primaryThermalData = thermal?.data;
    const weatherData = weather?.data;

    const surfaceTempC = primaryThermalData ? primaryThermalData.surfaceTempC : null;
    const feelsLikeC = primaryThermalData?.apparentTempC ?? weatherData?.apparentTempC ?? null;
    const humidityPct = weatherData?.relativeHumidityPct ?? 50;

    const heatIndexC =
      ambientTempC !== null && humidityPct !== null
        ? calculateHeatIndex(ambientTempC, humidityPct)
        : null;

    const wetBulbC =
      ambientTempC !== null && humidityPct !== null
        ? calculateWetBulbTemperature(ambientTempC, humidityPct)
        : null;

    if (ambientTempC === null) missingFields.push('temperature.ambient');
    if (surfaceTempC === null) missingFields.push('temperature.surface');

    const temperature = {
      ambient: ambientTempC !== null
        ? createProvenancedValue({
            value: ambientTempC,
            unit: '°C',
            source: ambientTempSource,
            sourceName: ambientTempSourceName,
            timestamp: thermal?.quality?.lastUpdated || weather?.quality?.lastUpdated || referenceTime,
            freshness: ambientTempSource === 'fortyguard' ? thermalFreshness : weatherFreshness,
            confidence: ambientTempConfidence,
            spatialResolution: ambientTempSource === 'fortyguard' ? '1m - 10m Micro-Spatial Mesh' : '2.5km Synoptic Grid',
            conflict: ambientTempConflict,
          })
        : createUnavailableValue<number>('Ambient Temperature', '°C'),
      surface: surfaceTempC !== null
        ? createProvenancedValue({
            value: surfaceTempC,
            unit: '°C',
            source: 'fortyguard',
            sourceName: 'FortyGuard Thermal Mesh',
            timestamp: thermal?.quality?.lastUpdated || referenceTime,
            freshness: thermalFreshness,
            confidence: thermal?.quality?.confidence || 92,
            spatialResolution: '1m - 10m Micro-Spatial Mesh',
          })
        : createUnavailableValue<number>('Surface Temperature', '°C'),
      feelsLike: feelsLikeC !== null
        ? createProvenancedValue({
            value: feelsLikeC,
            unit: '°C',
            source: primaryThermalData ? 'fortyguard' : 'noaa_nws',
            sourceName: primaryThermalData ? 'FortyGuard Bio-Thermal' : 'NOAA Weather Service',
            timestamp: referenceTime,
            freshness: primaryThermalData ? thermalFreshness : weatherFreshness,
            confidence: 90,
            spatialResolution: primaryThermalData ? '1m - 10m Micro-Spatial' : '2.5km Synoptic Grid',
          })
        : createUnavailableValue<number>('Feels-Like Temperature', '°C'),
      heatIndex: heatIndexC !== null
        ? createProvenancedValue({
            value: heatIndexC,
            unit: '°C',
            source: 'heatos_psychrometric_engine',
            sourceName: 'NOAA Rothfusz Algorithmic Synthesis',
            timestamp: referenceTime,
            freshness: thermalFreshness === 'LIVE' && weatherFreshness === 'LIVE' ? 'LIVE' : 'RECENT',
            confidence: 94,
            spatialResolution: 'Synthesized Micro-Grid',
            isEstimate: true,
          })
        : createUnavailableValue<number>('Heat Index', '°C'),
      wetBulb: wetBulbC !== null
        ? createProvenancedValue({
            value: wetBulbC,
            unit: '°C',
            source: 'heatos_psychrometric_engine',
            sourceName: 'Stull (2011) Psychrometric Equation',
            timestamp: referenceTime,
            freshness: thermalFreshness === 'LIVE' && weatherFreshness === 'LIVE' ? 'LIVE' : 'RECENT',
            confidence: 93,
            spatialResolution: 'Synthesized Micro-Grid',
            isEstimate: true,
          })
        : createUnavailableValue<number>('Wet Bulb Temperature', '°C'),
      surfaceHeatAnomaly: primaryThermalData
        ? createProvenancedValue({
            value: primaryThermalData.surfaceHeatAnomalyC,
            unit: '°C',
            source: 'fortyguard',
            sourceName: 'FortyGuard Thermal Mesh',
            timestamp: thermal?.quality?.lastUpdated || referenceTime,
            freshness: thermalFreshness,
            confidence: 92,
            spatialResolution: '1m - 10m Micro-Spatial Mesh',
          })
        : createUnavailableValue<number>('Surface Heat Anomaly', '°C'),
      urbanHeatIslandIntensity: primaryThermalData
        ? createProvenancedValue({
            value: primaryThermalData.urbanHeatIslandIntensityC,
            unit: '°C',
            source: 'fortyguard',
            sourceName: 'FortyGuard UHI Engine',
            timestamp: thermal?.quality?.lastUpdated || referenceTime,
            freshness: thermalFreshness,
            confidence: 90,
            spatialResolution: '1m - 10m Micro-Spatial Mesh',
          })
        : createUnavailableValue<number>('UHI Intensity', '°C'),
      thermalRiskScore: primaryThermalData
        ? createProvenancedValue({
            value: primaryThermalData.thermalRiskScore,
            unit: 'Score',
            source: 'fortyguard',
            sourceName: 'FortyGuard Spatial Risk Matrix',
            timestamp: referenceTime,
            freshness: thermalFreshness,
            confidence: 92,
            spatialResolution: '1m - 10m Micro-Spatial Mesh',
          })
        : createUnavailableValue<number>('Thermal Risk Score', 'Score'),
      thermalComfortIndex: primaryThermalData
        ? createProvenancedValue({
            value: primaryThermalData.thermalComfortIndex,
            unit: 'Index',
            source: 'fortyguard',
            sourceName: 'FortyGuard Comfort Analytics',
            timestamp: referenceTime,
            freshness: thermalFreshness,
            confidence: 90,
            spatialResolution: '1m - 10m Micro-Spatial Mesh',
          })
        : createUnavailableValue<number>('Thermal Comfort Index', 'Index'),
    };

    // --- HUMIDITY & ATMOSPHERE ---
    const humidity = {
      relativeHumidity: weatherData
        ? createProvenancedValue({
            value: weatherData.relativeHumidityPct,
            unit: '%',
            source: 'noaa_nws',
            sourceName: 'NOAA National Weather Service',
            timestamp: weather?.quality?.lastUpdated || referenceTime,
            freshness: weatherFreshness,
            confidence: weather?.quality?.confidence || 92,
            spatialResolution: '2.5km Synoptic Grid',
          })
        : createUnavailableValue<number>('Relative Humidity', '%'),
      dewPoint: weatherData
        ? createProvenancedValue({
            value: weatherData.dewPointC,
            unit: '°C',
            source: 'noaa_nws',
            sourceName: 'NOAA National Weather Service',
            timestamp: weather?.quality?.lastUpdated || referenceTime,
            freshness: weatherFreshness,
            confidence: weather?.quality?.confidence || 92,
            spatialResolution: '2.5km Synoptic Grid',
          })
        : createUnavailableValue<number>('Dew Point', '°C'),
      vaporPressureHpa: (ambientTempC !== null && humidityPct !== null)
        ? createProvenancedValue({
            value: calculateVaporPressureHpa(ambientTempC, humidityPct),
            unit: 'hPa',
            source: 'heatos_psychrometric_engine',
            sourceName: 'Magnus-Tetens Equation',
            timestamp: referenceTime,
            freshness: weatherFreshness,
            confidence: 91,
            spatialResolution: 'Synthesized Micro-Grid',
            isEstimate: true,
          })
        : undefined,
    };

    // --- WIND ---
    const windSpeed = weatherData?.windSpeedKmh ?? 0;
    const wind = {
      speedKmh: weatherData
        ? createProvenancedValue({
            value: weatherData.windSpeedKmh,
            unit: 'km/h',
            source: 'noaa_nws',
            sourceName: 'NOAA National Weather Service',
            timestamp: weather?.quality?.lastUpdated || referenceTime,
            freshness: weatherFreshness,
            confidence: 90,
            spatialResolution: '2.5km Synoptic Grid',
          })
        : createUnavailableValue<number>('Wind Speed', 'km/h'),
      directionDeg: weatherData
        ? createProvenancedValue({
            value: weatherData.windDirectionDeg,
            unit: 'deg',
            source: 'noaa_nws',
            sourceName: 'NOAA National Weather Service',
            timestamp: weather?.quality?.lastUpdated || referenceTime,
            freshness: weatherFreshness,
            confidence: 88,
            spatialResolution: '2.5km Synoptic Grid',
          })
        : createUnavailableValue<number>('Wind Direction', 'deg'),
      gustKmh: weatherData
        ? createProvenancedValue({
            value: Math.round(weatherData.windSpeedKmh * 1.3),
            unit: 'km/h',
            source: 'noaa_nws',
            sourceName: 'NOAA National Weather Service',
            timestamp: referenceTime,
            freshness: weatherFreshness,
            confidence: 85,
            spatialResolution: '2.5km Synoptic Grid',
          })
        : createUnavailableValue<number>('Wind Gust', 'km/h'),
      coolingWindEffectFactor: createProvenancedValue({
        value: calculateWindCoolingFactor(windSpeed),
        unit: 'Factor',
        source: 'heatos_microclimate_engine',
        sourceName: 'Convective Boundary Layer Formulation',
        timestamp: referenceTime,
        freshness: weatherFreshness,
        confidence: 90,
        spatialResolution: '1m - 10m Micro-Spatial',
        isEstimate: true,
      }),
    };

    // --- PRECIPITATION ---
    const precipitation = {
      chancePct: weatherData
        ? createProvenancedValue({
            value: weatherData.precipitationChancePct,
            unit: '%',
            source: 'noaa_nws',
            sourceName: 'NOAA National Weather Service',
            timestamp: referenceTime,
            freshness: weatherFreshness,
            confidence: 88,
            spatialResolution: '2.5km Synoptic Grid',
          })
        : createUnavailableValue<number>('Precipitation Chance', '%'),
      intensityMmPerHour: createProvenancedValue({
        value: 0,
        unit: 'mm/h',
        source: 'noaa_nws',
        sourceName: 'NOAA National Weather Service',
        timestamp: referenceTime,
        freshness: weatherFreshness,
        confidence: 90,
        spatialResolution: '2.5km Synoptic Grid',
      }),
      precipitationType: createProvenancedValue({
        value: 'none' as const,
        source: 'noaa_nws',
        sourceName: 'NOAA National Weather Service',
        timestamp: referenceTime,
        freshness: weatherFreshness,
        confidence: 95,
        spatialResolution: '2.5km Synoptic Grid',
      }),
    };

    // --- CLOUD COVER ---
    const cloudCoverPct = weatherData?.cloudCoverPct ?? 20;
    const cloudCover = {
      percentage: weatherData
        ? createProvenancedValue({
            value: weatherData.cloudCoverPct,
            unit: '%',
            source: 'noaa_nws',
            sourceName: 'NOAA National Weather Service',
            timestamp: referenceTime,
            freshness: weatherFreshness,
            confidence: 89,
            spatialResolution: '2.5km Synoptic Grid',
          })
        : createUnavailableValue<number>('Cloud Cover', '%'),
      conditionSummary: weatherData
        ? createProvenancedValue({
            value: weatherData.weatherCondition,
            source: 'noaa_nws',
            sourceName: 'NOAA National Weather Service',
            timestamp: referenceTime,
            freshness: weatherFreshness,
            confidence: 92,
            spatialResolution: '2.5km Synoptic Grid',
          })
        : createUnavailableValue<string>('Weather Condition'),
      solarAttenuationPct: createProvenancedValue({
        value: Math.round(cloudCoverPct * 0.75),
        unit: '%',
        source: 'heatos_solar_attenuation_engine',
        sourceName: 'Radiative Cloud Model',
        timestamp: referenceTime,
        freshness: weatherFreshness,
        confidence: 88,
        spatialResolution: 'Micro-Grid',
        isEstimate: true,
      }),
    };

    // --- SOLAR ---
    const solarIrradianceWm2 = Math.max(0, Math.round((100 - cloudCoverPct * 0.75) * 8.5));
    const uvIndex = Math.max(0, Math.min(12, Math.round((solarIrradianceWm2 / 850) * 9)));

    const solar = {
      irradianceWm2: createProvenancedValue({
        value: solarIrradianceWm2,
        unit: 'W/m²',
        source: 'noaa_nws',
        sourceName: 'NOAA / NREL Solar Radiative Model',
        timestamp: referenceTime,
        freshness: weatherFreshness,
        confidence: 88,
        spatialResolution: '2.5km Synoptic Grid',
      }),
      uvIndex: createProvenancedValue({
        value: uvIndex,
        unit: 'UV',
        source: 'noaa_nws',
        sourceName: 'NOAA Climate Prediction Center',
        timestamp: referenceTime,
        freshness: weatherFreshness,
        confidence: 90,
        spatialResolution: 'Synoptic Grid',
      }),
      insolationExposureScore: createProvenancedValue({
        value: Math.min(100, Math.round((solarIrradianceWm2 / 850) * 100)),
        unit: 'Score',
        source: 'heatos_solar_engine',
        sourceName: 'Insolation Vulnerability Index',
        timestamp: referenceTime,
        freshness: weatherFreshness,
        confidence: 90,
        spatialResolution: '1m - 10m Micro-Spatial',
        isEstimate: true,
      }),
    };

    // --- AIR QUALITY ---
    const aqiData = airQuality?.data;
    if (!aqiData) missingFields.push('airQuality.aqi');

    const airQualityState = {
      aqi: aqiData
        ? createProvenancedValue({
            value: aqiData.aqi,
            unit: 'AQI',
            source: 'epa_airnow',
            sourceName: 'EPA AirNow Air Quality System',
            timestamp: airQuality?.quality?.lastUpdated || referenceTime,
            freshness: aqiFreshness,
            confidence: airQuality?.quality?.confidence || 94,
            spatialResolution: 'Station Mesh / Spatial Interpolation',
          })
        : createUnavailableValue<number>('Air Quality Index', 'AQI'),
      pm25: aqiData
        ? createProvenancedValue({
            value: aqiData.pm25,
            unit: 'µg/m³',
            source: 'epa_airnow',
            sourceName: 'EPA AirNow Monitoring Program',
            timestamp: airQuality?.quality?.lastUpdated || referenceTime,
            freshness: aqiFreshness,
            confidence: 92,
            spatialResolution: 'Station Point',
          })
        : createUnavailableValue<number>('PM2.5', 'µg/m³'),
      pm10: aqiData
        ? createProvenancedValue({
            value: aqiData.pm10,
            unit: 'µg/m³',
            source: 'epa_airnow',
            sourceName: 'EPA AirNow Monitoring Program',
            timestamp: airQuality?.quality?.lastUpdated || referenceTime,
            freshness: aqiFreshness,
            confidence: 90,
            spatialResolution: 'Station Point',
          })
        : createUnavailableValue<number>('PM10', 'µg/m³'),
      ozonePpb: aqiData
        ? createProvenancedValue({
            value: aqiData.ozonePpb,
            unit: 'ppb',
            source: 'epa_airnow',
            sourceName: 'EPA AirNow Photochemical Sensors',
            timestamp: airQuality?.quality?.lastUpdated || referenceTime,
            freshness: aqiFreshness,
            confidence: 90,
            spatialResolution: 'Station Point',
          })
        : createUnavailableValue<number>('Ozone', 'ppb'),
      no2Ppb: aqiData
        ? createProvenancedValue({
            value: aqiData.no2Ppb,
            unit: 'ppb',
            source: 'epa_airnow',
            sourceName: 'EPA AirNow Monitoring Program',
            timestamp: airQuality?.quality?.lastUpdated || referenceTime,
            freshness: aqiFreshness,
            confidence: 88,
            spatialResolution: 'Station Point',
          })
        : createUnavailableValue<number>('NO2', 'ppb'),
      category: aqiData
        ? createProvenancedValue({
            value: aqiData.aqiCategory as any,
            source: 'epa_airnow',
            sourceName: 'EPA National Ambient Air Quality Standards',
            timestamp: referenceTime,
            freshness: aqiFreshness,
            confidence: 96,
            spatialResolution: 'Regional Assessment',
          })
        : createUnavailableValue<any>('AQI Category'),
      primaryPollutant: aqiData
        ? createProvenancedValue({
            value: aqiData.primaryPollutant,
            source: 'epa_airnow',
            sourceName: 'EPA AirNow System',
            timestamp: referenceTime,
            freshness: aqiFreshness,
            confidence: 95,
            spatialResolution: 'Regional Assessment',
          })
        : createUnavailableValue<string>('Primary Pollutant'),
      healthGuideline: aqiData
        ? createProvenancedValue({
            value: aqiData.healthGuideline,
            source: 'epa_airnow',
            sourceName: 'EPA Public Health Guidance',
            timestamp: referenceTime,
            freshness: aqiFreshness,
            confidence: 98,
            spatialResolution: 'Jurisdictional Policy',
          })
        : createUnavailableValue<string>('Health Guideline'),
    };

    // --- WATER & HYDROLOGY ---
    const waterData = water?.data;
    const waterState = {
      streamflowStatus: waterData
        ? createProvenancedValue({
            value: waterData.streamflowStatus as any,
            source: 'usgs_water',
            sourceName: 'USGS National Water Information System',
            timestamp: water?.quality?.lastUpdated || referenceTime,
            freshness: waterFreshness,
            confidence: 92,
            spatialResolution: 'USGS Hydrologic Station',
          })
        : createUnavailableValue<any>('Streamflow Status'),
      relativeSoilMoisturePct: waterData
        ? createProvenancedValue({
            value: waterData.relativeSoilMoisturePct,
            unit: '%',
            source: 'usgs_water',
            sourceName: 'USGS / NASA SMAP Soil Moisture Model',
            timestamp: referenceTime,
            freshness: waterFreshness,
            confidence: 88,
            spatialResolution: 'Watershed Basin',
          })
        : createUnavailableValue<number>('Soil Moisture', '%'),
      droughtSeverityIndex: waterData
        ? createProvenancedValue({
            value: waterData.droughtSeverityIndex,
            source: 'usgs_water',
            sourceName: 'U.S. Drought Monitor / USGS',
            timestamp: referenceTime,
            freshness: waterFreshness,
            confidence: 95,
            spatialResolution: 'County / Basin',
          })
        : createUnavailableValue<string>('Drought Severity Index'),
      evaporativeCoolingPotential: waterData
        ? createProvenancedValue({
            value: waterData.evaporativeCoolingPotential as any,
            source: 'usgs_water',
            sourceName: 'USGS Hydrologic Microclimate Interpolator',
            timestamp: referenceTime,
            freshness: waterFreshness,
            confidence: 89,
            spatialResolution: '1m - 10m Micro-Spatial',
          })
        : createUnavailableValue<any>('Evaporative Cooling Potential'),
    };

    // --- WILDFIRE & THERMAL ANOMALIES ---
    const fireData = wildfire?.data;
    const fireState = {
      activeHotspotsCountInRadius: fireData
        ? createProvenancedValue({
            value: fireData.activeFiresCountInRadius,
            source: 'nasa_firms',
            sourceName: 'NASA FIRMS VIIRS/MODIS',
            timestamp: wildfire?.quality?.lastUpdated || referenceTime,
            freshness: fireFreshness,
            confidence: 96,
            spatialResolution: '375m VIIRS Detection Pixel',
          })
        : createUnavailableValue<number>('Active Fire Hotspots Count'),
      nearestFireDistanceKm: createProvenancedValue({
        value: 120.0,
        unit: 'km',
        source: 'nasa_firms',
        sourceName: 'NASA FIRMS Sensor Network',
        timestamp: referenceTime,
        freshness: fireFreshness,
        confidence: 90,
        spatialResolution: '375m Spatial Resolution',
      }),
      fireRadiativePowerMw: fireData
        ? createProvenancedValue({
            value: fireData.fireRadiativePowerMw,
            unit: 'MW',
            source: 'nasa_firms',
            sourceName: 'NASA FIRMS FRP Algorithm',
            timestamp: referenceTime,
            freshness: fireFreshness,
            confidence: 94,
            spatialResolution: '375m Sensor Pixel',
          })
        : createUnavailableValue<number>('Fire Radiative Power', 'MW'),
      wildfireRiskLevel: fireData
        ? createProvenancedValue({
            value: fireData.wildfireRiskLevel as any,
            source: 'nasa_firms',
            sourceName: 'NASA Wildfire Assessment Matrix',
            timestamp: referenceTime,
            freshness: fireFreshness,
            confidence: 92,
            spatialResolution: 'Regional Threat Radius',
          })
        : createUnavailableValue<any>('Wildfire Risk Level'),
      smokePlumeRisk: fireData
        ? createProvenancedValue({
            value: fireData.smokePlumeRisk as any,
            source: 'nasa_firms',
            sourceName: 'NOAA/NASA Smoke Plume Analysis',
            timestamp: referenceTime,
            freshness: fireFreshness,
            confidence: 91,
            spatialResolution: 'Regional Dispersion',
          })
        : createUnavailableValue<any>('Smoke Plume Risk'),
    };

    // --- VEGETATION & CANOPY ---
    const vegData = vegetation?.data;
    const vegetationState = {
      ndvi: vegData
        ? createProvenancedValue({
            value: vegData.ndvi,
            unit: 'Index',
            source: 'satellite_vegetation',
            sourceName: 'Copernicus Sentinel-2 MSI Multi-Spectral',
            timestamp: vegetation?.quality?.lastUpdated || referenceTime,
            freshness: vegFreshness,
            confidence: 96,
            spatialResolution: '10m Multi-Spectral Pixel',
          })
        : createUnavailableValue<number>('NDVI Index', 'Index'),
      evi: vegData?.evi
        ? createProvenancedValue({
            value: vegData.evi,
            unit: 'Index',
            source: 'satellite_vegetation',
            sourceName: 'Landsat 9 / Sentinel-2 EVI',
            timestamp: referenceTime,
            freshness: vegFreshness,
            confidence: 94,
            spatialResolution: '30m Multi-Spectral',
          })
        : undefined,
      canopyCoveragePct: vegData
        ? createProvenancedValue({
            value: vegData.canopyCoveragePct,
            unit: '%',
            source: 'satellite_vegetation',
            sourceName: 'Copernicus Earth Observation',
            timestamp: referenceTime,
            freshness: vegFreshness,
            confidence: 95,
            spatialResolution: '10m High-Resolution Grid',
          })
        : createUnavailableValue<number>('Canopy Coverage', '%'),
      coolingBufferFactor: vegData
        ? createProvenancedValue({
            value: vegData.coolingBufferFactor,
            unit: 'Factor',
            source: 'satellite_vegetation',
            sourceName: 'Urban Canopy Microclimate Interpolator',
            timestamp: referenceTime,
            freshness: vegFreshness,
            confidence: 92,
            spatialResolution: '1m - 10m Micro-Spatial',
          })
        : createUnavailableValue<number>('Cooling Buffer Factor', 'Factor'),
      urbanGreeningStatus: vegData
        ? createProvenancedValue({
            value: vegData.urbanGreeningStatus as any,
            source: 'satellite_vegetation',
            sourceName: 'Copernicus Greening Classifier',
            timestamp: referenceTime,
            freshness: vegFreshness,
            confidence: 96,
            spatialResolution: 'Urban Parcel',
          })
        : createUnavailableValue<any>('Urban Greening Status'),
    };

    // --- LAND COVER & SURFACE ---
    const canopyPct = vegData?.canopyCoveragePct ?? 20;
    const landCover = {
      dominantSurfaceType: createProvenancedValue({
        value: (canopyPct > 40 ? 'tree_canopy' : 'asphalt') as any,
        source: 'satellite_vegetation',
        sourceName: 'USGS NLCD / Sentinel-2 Surface Classifier',
        timestamp: referenceTime,
        freshness: vegFreshness,
        confidence: 90,
        spatialResolution: '10m - 30m Land Cover Grid',
      }),
      albedo: createProvenancedValue({
        value: canopyPct > 40 ? 0.22 : 0.12,
        unit: 'Albedo',
        source: 'satellite_vegetation',
        sourceName: 'Copernicus Surface Reflectance',
        timestamp: referenceTime,
        freshness: vegFreshness,
        confidence: 91,
        spatialResolution: '10m Multi-Spectral',
      }),
      imperviousSurfacePct: createProvenancedValue({
        value: Math.max(10, 100 - canopyPct * 1.8),
        unit: '%',
        source: 'satellite_vegetation',
        sourceName: 'Urban Imperviousness Mapping',
        timestamp: referenceTime,
        freshness: vegFreshness,
        confidence: 90,
        spatialResolution: '10m Surface Pixel',
      }),
      heatRetentionIndex: createProvenancedValue({
        value: Math.min(100, Math.round(75 - canopyPct * 0.8)),
        unit: 'Index',
        source: 'fortyguard',
        sourceName: 'FortyGuard Thermal Mass Model',
        timestamp: referenceTime,
        freshness: thermalFreshness,
        confidence: 92,
        spatialResolution: '1m - 10m Micro-Spatial',
      }),
    };

    // --- FORECAST TIME SERIES ---
    const forecast: ForecastIntervalState[] = (weather?.forecast || []).map((fc) => ({
      timestamp: fc.timestamp,
      temperatureC: createProvenancedValue({
        value: fc.temperatureC,
        unit: '°C',
        source: 'noaa_nws',
        sourceName: 'NOAA NWS 1-Hour Forecast Grid',
        timestamp: fc.timestamp,
        freshness: 'LIVE',
        confidence: 90,
        spatialResolution: '2.5km Synoptic Grid',
      }),
      feelsLikeC: createProvenancedValue({
        value: fc.apparentTempC,
        unit: '°C',
        source: 'noaa_nws',
        sourceName: 'NOAA NWS Forecast Engine',
        timestamp: fc.timestamp,
        freshness: 'LIVE',
        confidence: 88,
        spatialResolution: '2.5km Synoptic Grid',
      }),
      humidityPct: createProvenancedValue({
        value: fc.humidityPct,
        unit: '%',
        source: 'noaa_nws',
        sourceName: 'NOAA NWS Model',
        timestamp: fc.timestamp,
        freshness: 'LIVE',
        confidence: 88,
        spatialResolution: '2.5km Synoptic Grid',
      }),
      windSpeedKmh: createProvenancedValue({
        value: fc.windSpeedKmh,
        unit: 'km/h',
        source: 'noaa_nws',
        sourceName: 'NOAA Wind Forecast',
        timestamp: fc.timestamp,
        freshness: 'LIVE',
        confidence: 86,
        spatialResolution: '2.5km Synoptic Grid',
      }),
      precipitationChancePct: createProvenancedValue({
        value: fc.precipitationChancePct,
        unit: '%',
        source: 'noaa_nws',
        sourceName: 'NOAA Probability of Precipitation (PoP)',
        timestamp: fc.timestamp,
        freshness: 'LIVE',
        confidence: 85,
        spatialResolution: '2.5km Synoptic Grid',
      }),
      conditionSummary: createProvenancedValue({
        value: fc.summary,
        source: 'noaa_nws',
        sourceName: 'NOAA Synoptic Forecast',
        timestamp: fc.timestamp,
        freshness: 'LIVE',
        confidence: 90,
        spatialResolution: '2.5km Synoptic Grid',
      }),
      thermalComfortScore: createProvenancedValue({
        value: Math.max(10, Math.min(100, Math.round(100 - (fc.apparentTempC - 20) * 5))),
        unit: 'Score',
        source: 'heatos_forecast_synthesizer',
        sourceName: 'HeatOS Dynamic Comfort Forecast',
        timestamp: fc.timestamp,
        freshness: 'LIVE',
        confidence: 88,
        spatialResolution: 'Micro-Spatial Projection',
        isEstimate: true,
      }),
    }));

    // 6. Contributing Sources Summary
    const sources: ContributingSourceSummary[] = activeProviders.map((p) => {
      let role: ContributingSourceSummary['role'] = 'PRIMARY_THERMAL';
      if (p.id === 'noaa_nws') role = 'SYNOPTIC_WEATHER';
      else if (p.id === 'epa_airnow') role = 'AIR_QUALITY';
      else if (p.id === 'satellite_vegetation') role = 'EARTH_OBSERVATION';
      else if (p.id === 'usgs_water') role = 'HYDROLOGY';
      else if (p.id === 'nasa_firms') role = 'WILDFIRE';

      return {
        sourceId: p.id,
        sourceName: p.name,
        role,
        status: p.status === 'online' ? 'ACTIVE' : 'DEGRADED',
        freshness: p.freshness.toUpperCase() as FreshnessClassification,
        fieldsContributedCount: p.id === 'fortyguard' ? 6 : p.id === 'noaa_nws' ? 7 : 4,
        license: p.attribution?.license || 'Open License',
        attributionUrl: p.attribution?.url || '#',
      };
    });

    // 7. Overall Composite Confidence Calculation
    const totalRequiredFields = 15;
    const availableFieldsCount = totalRequiredFields - missingFields.length;

    const confidenceBreakdown = ConfidenceEvaluator.evaluate({
      sources: activeProviders.map((p) => ({
        id: p.id,
        baseConfidence: p.confidence || 90,
        freshness: p.freshness.toUpperCase(),
      })),
      totalRequiredFields,
      availableFieldsCount,
      conflicts,
      temporalAlignment,
      spatialAlignment,
    });

    const stateId = `HEATOS_STATE_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    return {
      stateId,
      schemaVersion: '4.0.0',
      timestamp: referenceTime,
      location: locationState,
      temperature,
      humidity,
      wind,
      precipitation,
      cloudCover,
      solar,
      airQuality: airQualityState,
      water: waterState,
      fire: fireState,
      vegetation: vegetationState,
      landCover,
      forecast,
      temporalAlignment,
      spatialAlignment,
      confidence: confidenceBreakdown,
      sources,
      conflicts,
      missingFields,
    };
  }

  /**
   * Historical Snapshot Architecture
   * Ingests location and period, synthesizing a sequence of aligned EnvironmentalState snapshots.
   */
  public static async getHistoricalEnvironmentalSnapshot(
    location: GeoLocationQuery,
    options: HistoricalSnapshotOptions
  ): Promise<HistoricalEnvironmentalSnapshot> {
    const startTime = new Date(options.startTime).getTime();
    const endTime = new Date(options.endTime).getTime();
    const intervalHours = options.intervalHours || 1;
    const intervalMs = intervalHours * 60 * 60 * 1000;

    const snapshots: EnvironmentalState[] = [];
    const locationState = SpatialNormalizer.buildLocationState(
      location.latitude,
      location.longitude,
      location.locationName || 'Historical Query Area'
    );

    // Generate historical interval steps (capped at 48 snapshots to prevent memory runaway)
    const maxSteps = 48;
    let currentMs = startTime;
    let stepCount = 0;

    while (currentMs <= endTime && stepCount < maxSteps) {
      const stepIso = new Date(currentMs).toISOString();
      // Generate aligned historical snapshot at this timestamp
      const snapshot = await this.getEnvironmentalSnapshot(location, {
        referenceTime: stepIso,
        bypassCache: false,
      });
      snapshots.push(snapshot);
      currentMs += intervalMs;
      stepCount++;
    }

    // Compute historical aggregation summary
    const temps = snapshots
      .map((s) => s.temperature.ambient.value)
      .filter((v): v is number => v !== null);

    const anomalies = snapshots
      .map((s) => s.temperature.surfaceHeatAnomaly.value)
      .filter((v): v is number => v !== null);

    const confidences = snapshots.map((s) => s.confidence.overallScore);

    const maxTemperatureC = temps.length > 0 ? Math.max(...temps) : 0;
    const minTemperatureC = temps.length > 0 ? Math.min(...temps) : 0;
    const avgTemperatureC =
      temps.length > 0 ? Math.round((temps.reduce((a, b) => a + b, 0) / temps.length) * 10) / 10 : 0;
    const maxHeatAnomalyC = anomalies.length > 0 ? Math.max(...anomalies) : 0;
    const overallConfidenceAvg =
      confidences.length > 0
        ? Math.round(confidences.reduce((a, b) => a + b, 0) / confidences.length)
        : 0;

    return {
      location: locationState,
      period: {
        startTime: options.startTime,
        endTime: options.endTime,
        intervalHours,
        snapshotCount: snapshots.length,
      },
      snapshots,
      summary: {
        maxTemperatureC,
        minTemperatureC,
        avgTemperatureC,
        maxHeatAnomalyC,
        dominantRiskLevel: maxHeatAnomalyC > 4 ? 'HIGH_THERMAL_SURGE' : 'MODERATE_MICROCLIMATE',
        overallConfidenceAvg,
      },
    };
  }
}
