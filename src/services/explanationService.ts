/**
 * HeatOS: Explanation Knowledge Base & Generation Engine
 * 
 * Provides deterministic, structured metadata for every metric, badge,
 * score, forecast event, alert, and map location in HeatOS.
 */

import { ExplanationMetadata, ExplanationDataType } from '../types/explanation';
import { LocationData, SpatialZone } from '../types';
import { NormalizedEnvironmentalState } from '../types/normalizedEnvironmentalState';
import { EnvironmentalEvent } from '../server/events/types';

// Metric Knowledge Base Dictionary
export const METRIC_KNOWLEDGE_BASE: Record<string, Partial<ExplanationMetadata>> = {
  temperature: {
    metricId: 'temperature',
    label: 'Ambient Air Temperature',
    unit: '°C',
    dataType: 'MEASURED',
    source: 'NOAA / Weather Underground',
    sourceInstitution: 'Surface Weather Observation Network & FortyGuard Ambient Telemetry',
    spatialResolution: 'Point Ground Station / 100m Regional Mesh',
    whatItMeans: 'The dry-bulb atmospheric temperature of free-flowing air measured at standard 2-meter meteorological height in the shade.',
    whyItMatters: 'Ambient temperature sets the thermodynamic foundation for regional atmospheric heat load and urban energy exchange.',
    limitations: 'Measured in the shade; direct sunlight on asphalt or facades will induce significantly higher local surface contact temperatures.',
    iconType: 'heat',
  },
  ambientTemp: {
    metricId: 'ambientTemp',
    label: 'Ambient Temperature',
    unit: '°C',
    dataType: 'MEASURED',
    source: 'NOAA / Weather Underground',
    sourceInstitution: 'Surface Observation Network',
    spatialResolution: 'Ground Station Mesh',
    whatItMeans: 'Standard ambient air temperature measured 2 meters above ground level away from direct solar radiation.',
    whyItMatters: 'Direct indicator of baseline thermal environment and regional synoptic weather patterns.',
    limitations: 'Does not account for radiant heat emitted from unshaded dark pavement or building envelopes.',
    iconType: 'heat',
  },
  feelsLike: {
    metricId: 'feelsLike',
    label: 'Feels Like (Apparent Temperature)',
    unit: '°C',
    dataType: 'CALCULATED',
    source: 'HeatOS Derived',
    sourceInstitution: 'Steadman Biophysical Psychrometric Formula',
    spatialResolution: 'Localized Micro-Climate Point',
    whatItMeans: 'Perceived temperature combining dry-bulb ambient temperature, relative humidity, and wind ventilation speed.',
    whyItMatters: 'High humidity impedes human sweat evaporation, making the thermal environment feel substantially hotter and more physiologically taxing than the thermometer reading indicates.',
    calculation: {
      isDerived: true,
      concept: 'Calculated using Steadman’s psychrometric apparent temperature model, combining ambient air temperature, vapor pressure (humidity), and wind cooling effect.',
      inputSignals: ['Ambient Temperature', 'Relative Humidity', 'Wind Speed'],
      transparencyNote: 'Standard biophysical psychrometric index for human thermal comfort estimation in outdoor environments.',
    },
    limitations: 'Assumes standard light clothing and walking activity in shade; direct solar radiation adds additional thermal stress.',
    iconType: 'heat',
  },
  apparentTemp: {
    metricId: 'apparentTemp',
    label: 'Apparent Temperature',
    unit: '°C',
    dataType: 'CALCULATED',
    source: 'HeatOS Derived',
    sourceInstitution: 'Biophysical Psychrometric Index',
    spatialResolution: 'Localized Point Calculation',
    whatItMeans: 'Estimated human-experienced thermal strain considering humidity and wind cooling factors.',
    whyItMatters: 'Provides an accurate physiological assessment of whether evaporative cooling is effective or restricted.',
    calculation: {
      isDerived: true,
      concept: 'Synthesizes dry-bulb temperature, vapor pressure derived from relative humidity, and convection from wind velocity.',
      inputSignals: ['Ambient Air Temp', 'Relative Humidity', 'Wind Velocity'],
    },
    iconType: 'heat',
  },
  surfaceHeatAnomaly: {
    metricId: 'surfaceHeatAnomaly',
    label: 'Surface Heat Anomaly (UHI Delta)',
    unit: '°C',
    dataType: 'MEASURED',
    source: 'FortyGuard',
    sourceInstitution: 'FortyGuard High-Density Urban Thermal Mesh',
    spatialResolution: '1m - 10m Micro-Spatial Mesh',
    whatItMeans: 'The differential temperature between dense paved urban surfaces and natural vegetated baseline reference surroundings.',
    whyItMatters: 'A positive urban thermal anomaly increases localized heat exposure and night-time heat retention even when synoptic weather forecasts appear moderate.',
    limitations: 'Micro-spatial variations occur between asphalt roads, light concrete sidewalks, and shaded tree canopies within few meters.',
    iconType: 'heat',
  },
  surfaceTemp: {
    metricId: 'surfaceTemp',
    label: 'Radiative Surface Temperature',
    unit: '°C',
    dataType: 'MEASURED',
    source: 'FortyGuard',
    sourceInstitution: 'FortyGuard Spatial Radiometric Telemetry',
    spatialResolution: '1m - 10m Micro-Spatial Resolution',
    whatItMeans: 'Direct skin temperature of ground materials (pavement, roofing, soil, vegetation) measured via infrared radiometry and thermal sensor arrays.',
    whyItMatters: 'Paved surfaces absorb solar radiation during the day and re-emit longwave thermal radiation directly toward pedestrians and nearby building envelopes.',
    limitations: 'Surface temperature fluctuates rapidly with cloud shadows and micro-shading.',
    iconType: 'heat',
  },
  humidity: {
    metricId: 'humidity',
    label: 'Relative Humidity',
    unit: '%',
    dataType: 'MEASURED',
    source: 'NOAA / Sensor Network',
    sourceInstitution: 'National Meteorological & Hydrological Stations',
    spatialResolution: 'Point Station Mesh',
    whatItMeans: 'The percentage ratio of water vapor currently present in the air relative to the maximum water vapor the air can hold at the current temperature.',
    whyItMatters: 'High relative humidity impedes cutaneous sweat evaporation, while extremely low humidity accelerates dehydration and increases wildfire susceptibility.',
    limitations: 'Relative humidity is inversely proportional to temperature throughout the diurnal cycle.',
    iconType: 'water',
  },
  dewPoint: {
    metricId: 'dewPoint',
    label: 'Dew Point',
    unit: '°C',
    dataType: 'CALCULATED',
    source: 'HeatOS Derived',
    sourceInstitution: 'Magnus-Tetens Thermodynamic Formulation',
    spatialResolution: 'Point Thermodynamic Mesh',
    whatItMeans: 'The temperature to which ambient air must be cooled at constant barometric pressure for water vapor to condense into liquid dew.',
    whyItMatters: 'Dew point is the absolute measure of atmospheric moisture content; values above 18°C feel muggy, while values above 22°C cause severe oppressive discomfort.',
    calculation: {
      isDerived: true,
      concept: 'Computed via Magnus-Tetens thermodynamic equation using saturation vapor pressure from measured ambient temperature and relative humidity.',
      inputSignals: ['Ambient Temperature', 'Relative Humidity'],
    },
    limitations: 'Calculated assuming sea-level or standard barometric pressure calibration.',
    iconType: 'water',
  },
  wetBulb: {
    metricId: 'wetBulb',
    label: 'Wet-Bulb Temperature',
    unit: '°C',
    dataType: 'CALCULATED',
    source: 'HeatOS Derived',
    sourceInstitution: 'Stull Psychrometric Formulation',
    spatialResolution: 'Microclimate Thermodynamic Model',
    whatItMeans: 'The lowest temperature air can reach through the evaporation of water into it at constant pressure.',
    whyItMatters: 'Represents the thermodynamic limit of evaporative cooling. A wet-bulb temperature exceeding 31°C–35°C is dangerous for human survival even in shade with unlimited water.',
    calculation: {
      isDerived: true,
      concept: 'Derived using the empirical Stull psychrometric equation combining ambient dry-bulb temperature and relative humidity.',
      inputSignals: ['Ambient Temperature', 'Relative Humidity'],
      transparencyNote: 'Standard thermodynamic empirical formulation used across biometeorological occupational safety standards.',
    },
    limitations: 'Assumes continuous adiabatic water saturation and standard atmospheric pressure.',
    iconType: 'water',
  },
  heatIndex: {
    metricId: 'heatIndex',
    label: 'NOAA Heat Index',
    unit: '°C',
    dataType: 'CALCULATED',
    source: 'HeatOS Derived',
    sourceInstitution: 'NOAA / National Weather Service Algorithm',
    spatialResolution: 'Synoptic & Urban Grid',
    whatItMeans: 'Biometeorological metric quantifying human-perceived equivalent temperature in shaded conditions with light air movement.',
    whyItMatters: 'Used by public health and occupational safety authorities (OSHA/NWS) to issue heat advisories and trigger hydration breaks.',
    calculation: {
      isDerived: true,
      concept: 'Multi-regression polynomial formulation developed by Rothfusz/NOAA, modeling human thermoregulatory response to temperature and humidity combinations.',
      inputSignals: ['Ambient Air Temperature', 'Relative Humidity'],
    },
    limitations: 'Valid for shaded areas; direct sunlight exposure can add up to 8°C (15°F) to the effective heat index.',
    iconType: 'heat',
  },
  airQuality: {
    metricId: 'airQuality',
    label: 'Air Quality Index (AQI)',
    unit: 'AQI',
    dataType: 'MEASURED',
    source: 'EPA AirNow',
    sourceInstitution: 'US EPA AirNow / Copernicus Atmospheric Monitoring Service (CAMS)',
    spatialResolution: 'Station Radius & Urban Dispersion Model',
    whatItMeans: 'Standardized national environmental index reporting daily air quality and particulate/gaseous health risk levels.',
    whyItMatters: 'Fine particulate matter (PM2.5) and tropospheric ground-level ozone (O3) penetrate deep into the respiratory system, exacerbating cardiovascular and lung conditions.',
    limitations: 'Ground-level ozone peaks during sunny afternoon hours through photochemical reactions, whereas particulate matter often peaks in morning inversions.',
    iconType: 'air',
  },
  aqi: {
    metricId: 'aqi',
    label: 'Air Quality Index',
    unit: 'AQI',
    dataType: 'MEASURED',
    source: 'EPA AirNow',
    sourceInstitution: 'EPA AirNow Monitoring Network',
    spatialResolution: 'Station Radius Mesh',
    whatItMeans: 'Standardized index quantifying particulate matter (PM2.5, PM10) and ozone levels on a 0–500 scale.',
    whyItMatters: 'Direct indicator of atmospheric pollutant burden on respiratory and cardiovascular health.',
    limitations: 'Station readings represent neighborhood airsheds and may not capture localized diesel exhaust in immediate street canyons.',
    iconType: 'air',
  },
  uvIndex: {
    metricId: 'uvIndex',
    label: 'UV Index',
    unit: 'UV',
    dataType: 'MODELED',
    source: 'NOAA',
    sourceInstitution: 'NOAA National Weather Service / Climate Prediction Center',
    spatialResolution: 'Synoptic Solar Grid',
    whatItMeans: 'International standard measurement of the strength of sunburn-producing ultraviolet radiation at a particular place and time.',
    whyItMatters: 'High UV exposure (8+) can cause epidermal sunburn in under 15 minutes and contributes to cellular damage and eye strain.',
    limitations: 'Assumes clear sky conditions unless adjusted for localized cloud cover thickness.',
    iconType: 'solar',
  },
  solarIrradiance: {
    metricId: 'solarIrradiance',
    label: 'Global Horizontal Solar Irradiance (GHI)',
    unit: 'W/m²',
    dataType: 'MODELED',
    source: 'NASA POWER / NOAA',
    sourceInstitution: 'Solar Radiation & Insolation Model',
    spatialResolution: 'Synoptic Satellite Grid (1km)',
    whatItMeans: 'Total amount of shortwave solar radiant energy received per square meter by a horizontal surface on Earth.',
    whyItMatters: 'Direct driver of urban surface heat accumulation and photochemical ozone generation in the lower atmosphere.',
    limitations: 'Surface tilt, building shadows, and urban street canyon geometry modify actual received irradiance.',
    iconType: 'solar',
  },
  wind: {
    metricId: 'wind',
    label: 'Surface Wind Speed & Direction',
    unit: 'km/h',
    dataType: 'MEASURED',
    source: 'NOAA / Ground Stations',
    sourceInstitution: 'Surface Anemometer Telemetry',
    spatialResolution: '10m Meteorological Height Station',
    whatItMeans: 'Rate and cardinal direction of horizontal air mass movement measured at 10-meter reference height.',
    whyItMatters: 'Adequate ventilation disperses accumulated trapped heat and pollutants from urban street corridors; stagnant air (<5 km/h) intensifies heat domes.',
    limitations: 'Tall buildings generate wind turbulence, aerodynamic channeling, and localized dead zones.',
    iconType: 'wind',
  },
  pressureHpa: {
    metricId: 'pressureHpa',
    label: 'Barometric Pressure',
    unit: 'hPa',
    dataType: 'MEASURED',
    source: 'NOAA',
    sourceInstitution: 'National Weather Observation Network',
    spatialResolution: 'Synoptic Barometric Network',
    whatItMeans: 'Atmospheric pressure exerted by the weight of air in the atmosphere, normalized to sea-level equivalent.',
    whyItMatters: 'High pressure systems typically bring descending air, clear skies, low winds, and intense heat dome entrapment.',
    limitations: 'Calibrated to mean sea level; absolute station pressure varies with elevation.',
    iconType: 'pressure',
  },
  canopyCoverage: {
    metricId: 'canopyCoverage',
    label: 'Urban Tree Canopy Coverage',
    unit: '%',
    dataType: 'MEASURED',
    source: 'ESA WorldCover',
    sourceInstitution: 'European Space Agency 10m High-Resolution Land Cover Model',
    spatialResolution: '10m Satellite Grid',
    whatItMeans: 'Percentage of the urban surface area covered by living tree crowns when viewed from above.',
    whyItMatters: 'Tree canopies provide direct solar shade and cooling via evapotranspiration, reducing surface temperatures by up to 8°C–12°C compared to unshaded asphalt.',
    limitations: 'Captures horizontal crown area; deciduous trees lose seasonal leaves affecting winter insolation.',
    iconType: 'nature',
  },
  thermalComfortIndex: {
    metricId: 'thermalComfortIndex',
    label: 'Thermal Comfort Index',
    unit: '/100',
    dataType: 'DERIVED',
    source: 'HeatOS Derived',
    sourceInstitution: 'HeatOS Biophysical Microclimate Model',
    spatialResolution: 'Micro-Spatial Zone (10m)',
    whatItMeans: 'Composite index synthesizing ambient air, radiative surface anomaly, humidity, and airflow into a normalized 0–100 human comfort score.',
    whyItMatters: 'Helps urban managers and individuals quickly assess physiological thermal stress without needing to calculate multiple separate psychrometric variables.',
    calculation: {
      isDerived: true,
      concept: 'HeatOS combines surface radiative temperature, ambient air, vapor pressure, and wind dispersion into a normalized human physiological tolerance index.',
      inputSignals: ['Surface Heat Anomaly', 'Ambient Air Temp', 'Relative Humidity', 'Wind Speed'],
      transparencyNote: 'Heuristic biometeorological composite indicator designed for rapid environmental assessment.',
    },
    limitations: 'Personal metabolic rate, acclimatization, age, and indoor air-conditioning availability influence individual tolerance.',
    iconType: 'heat',
  },
  environmentalPulse: {
    metricId: 'environmentalPulse',
    label: 'Environmental Pulse Score',
    unit: '/100',
    dataType: 'DERIVED',
    source: 'HeatOS Derived',
    sourceInstitution: 'HeatOS 6-Dimensional Ecological & Biophysical Engine',
    spatialResolution: 'Multi-Sensor Normalized Composite',
    whatItMeans: 'Holistic 6-dimension composite vitality index measuring the overall environmental health and biophysical stability of the location.',
    whyItMatters: 'Single comprehensive score revealing whether environmental conditions across heat, air, water, nature, fire, and solar vectors are resilient or under compounding stress.',
    calculation: {
      isDerived: true,
      concept: 'Weighted multidimensional synthesis evaluating Heat load (25%), Air purity (20%), Water/Hydration balance (15%), Nature & Canopy health (15%), Wildfire stability (15%), and Solar radiation stress (10%).',
      inputSignals: ['FortyGuard Surface Heat', 'Air Quality AQI', 'Vapor Pressure / Dew Point', 'Tree Canopy Coverage', 'Fire Radiance', 'Solar UV Index'],
      transparencyNote: 'Composite ecosystem indicator calibrated against regional historical baselines and physical safety limits.',
    },
    limitations: 'Calculated based on available multi-sensor streams; weighting adjusts proportionally if a specific sensor channel is syncing or degraded.',
    iconType: 'pulse',
  },
  pulse_heat: {
    metricId: 'pulse_heat',
    label: 'Heat & Thermal Stability Dimension',
    unit: '/100',
    dataType: 'DERIVED',
    source: 'HeatOS Derived',
    sourceInstitution: 'FortyGuard + NOAA Telemetry Engine',
    spatialResolution: 'Micro-Spatial Mesh',
    whatItMeans: 'Sub-score evaluating thermal load, urban heat island elevation, and physiological heat stress.',
    whyItMatters: 'Identifies whether thermal conditions are in the optimal biological zone or approaching dangerous thermal extremes.',
    calculation: {
      isDerived: true,
      concept: 'Evaluates ambient temperature delta from 21°C baseline, surface anomaly, and wet-bulb evaporative potential.',
      inputSignals: ['Ambient Temp', 'Surface Anomaly', 'Wet-Bulb Temp'],
    },
    iconType: 'heat',
  },
  pulse_air: {
    metricId: 'pulse_air',
    label: 'Air Quality & Purity Dimension',
    unit: '/100',
    dataType: 'DERIVED',
    source: 'HeatOS Derived',
    sourceInstitution: 'EPA AirNow & CAMS Ingestion',
    spatialResolution: 'Regional Airshed',
    whatItMeans: 'Sub-score evaluating atmospheric particulate cleanliness (PM2.5, PM10) and ozone concentration.',
    whyItMatters: 'High air scores indicate pristine, breathable air suitable for outdoor athletic activity and vulnerable populations.',
    calculation: {
      isDerived: true,
      concept: 'Inverted AQI normalization curve penalizing particulate concentrations above WHO guideline thresholds.',
      inputSignals: ['AQI PM2.5', 'AQI PM10', 'Ground-level Ozone'],
    },
    iconType: 'air',
  },
  pulse_water: {
    metricId: 'pulse_water',
    label: 'Water & Atmospheric Moisture Dimension',
    unit: '/100',
    dataType: 'DERIVED',
    source: 'HeatOS Derived',
    sourceInstitution: 'Hydrological & Psychrometric Model',
    spatialResolution: 'Atmospheric Station Mesh',
    whatItMeans: 'Sub-score measuring atmospheric humidity balance, precipitation likelihood, and evaporative demand.',
    whyItMatters: 'Prevents both severe drought/desiccation stress and oppressive, uncompensable humid heat conditions.',
    calculation: {
      isDerived: true,
      concept: 'Evaluates relative humidity adherence to optimal 40%–60% comfort envelope and precipitation adequacy.',
      inputSignals: ['Relative Humidity', 'Dew Point', 'Precipitation Chance'],
    },
    iconType: 'water',
  },
  pulse_nature: {
    metricId: 'pulse_nature',
    label: 'Nature & Vegetative Canopy Dimension',
    unit: '/100',
    dataType: 'DERIVED',
    source: 'HeatOS Derived',
    sourceInstitution: 'ESA WorldCover & Biomass Indices',
    spatialResolution: '10m Satellite Grid',
    whatItMeans: 'Sub-score assessing urban tree canopy density, green infrastructure buffer, and vegetative health.',
    whyItMatters: 'Dense vegetative canopies reduce urban heat islands, filter airborne particulates, and enhance mental well-being.',
    calculation: {
      isDerived: true,
      concept: 'Calibrated against municipal canopy target benchmarks (35%+ target for urban cooling resilience).',
      inputSignals: ['Tree Canopy Coverage %', 'Permeable Surface Ratio'],
    },
    iconType: 'nature',
  },
  pulse_fire: {
    metricId: 'pulse_fire',
    label: 'Fire Weather & Flammability Dimension',
    unit: '/100',
    dataType: 'DERIVED',
    source: 'HeatOS Derived',
    sourceInstitution: 'Fire Weather Index (FWI) Formulation',
    spatialResolution: 'Regional Meteorological Grid',
    whatItMeans: 'Sub-score tracking wildfire risk potential based on low atmospheric humidity, high heat, and dry fuels.',
    whyItMatters: 'Early warning indicator for rapid fire spread, red flag conditions, and wildland-urban interface vulnerability.',
    calculation: {
      isDerived: true,
      concept: 'Synthesizes temperature, relative humidity depression (<20%), wind velocity, and drought indices.',
      inputSignals: ['Ambient Temp', 'Relative Humidity', 'Wind Gusts'],
    },
    iconType: 'fire',
  },
  pulse_solar: {
    metricId: 'pulse_solar',
    label: 'Solar & Radiative Insolation Dimension',
    unit: '/100',
    dataType: 'DERIVED',
    source: 'HeatOS Derived',
    sourceInstitution: 'NOAA / NASA Solar Telemetry',
    spatialResolution: 'Synoptic Solar Grid',
    whatItMeans: 'Sub-score evaluating solar radiation intensity and UV index safety limits.',
    whyItMatters: 'Monitors skin damage risk, cellular radiation load, and photovoltaic generation potential.',
    calculation: {
      isDerived: true,
      concept: 'Normalizes Global Horizontal Irradiance and UV Index against safe daylight exposure thresholds.',
      inputSignals: ['UV Index', 'Solar Irradiance GHI'],
    },
    iconType: 'solar',
  },
  precipitation: {
    metricId: 'precipitation',
    label: 'Precipitation Probability & Intensity',
    unit: '%',
    dataType: 'MODELED',
    source: 'NOAA / NWS HRRR',
    sourceInstitution: 'High-Resolution Rapid Refresh (HRRR) Meteorological Ensemble',
    spatialResolution: 'Synoptic Precipitation Radar Mesh',
    whatItMeans: 'The statistical probability of measurable liquid precipitation (>= 0.25mm) occurring at this coordinate location during the observation or forecast window.',
    whyItMatters: 'Rainfall events break prolonged thermal heat domes, wash particulate matter from the lower atmosphere, and replenish urban canopy moisture reserves.',
    limitations: 'Localized convective thunderstorms can generate sudden heavy precipitation within narrow 1–2 km corridors not always resolved in regional grids.',
    iconType: 'water',
  },
};

const METRIC_KEY_ALIASES: Record<string, string> = {
  air_quality: 'airQuality',
  airquality: 'airQuality',
  air: 'airQuality',
  aqi: 'airQuality',
  pm25: 'airQuality',
  wind_speed: 'wind',
  windspeed: 'wind',
  wind_gusts: 'wind',
  uv_index: 'uvIndex',
  uvindex: 'uvIndex',
  uv: 'uvIndex',
  canopy_cover: 'canopyCoverage',
  canopy_coverage: 'canopyCoverage',
  canopy: 'canopyCoverage',
  solar_irradiance: 'solarIrradiance',
  solar: 'solarIrradiance',
  ghi: 'solarIrradiance',
  dew_point: 'dewPoint',
  dewpoint: 'dewPoint',
  dew: 'dewPoint',
  wet_bulb: 'wetBulb',
  wetbulb: 'wetBulb',
  heat_index: 'heatIndex',
  heatindex: 'heatIndex',
  heat_stress: 'heatIndex',
  heatstress: 'heatIndex',
  surface_heat: 'surfaceHeatAnomaly',
  surface_heat_anomaly: 'surfaceHeatAnomaly',
  heat_island: 'surfaceHeatAnomaly',
  uhi: 'surfaceHeatAnomaly',
  temperature: 'temperature',
  temp: 'temperature',
  ambient_temp: 'ambientTemp',
  ambienttemp: 'ambientTemp',
  feels_like: 'feelsLike',
  feelslike: 'feelsLike',
  apparent_temp: 'apparentTemp',
  apparenttemp: 'apparentTemp',
  perceived_heat: 'feelsLike',
  pressure: 'pressureHpa',
  pressure_hpa: 'pressureHpa',
  atm_pressure: 'pressureHpa',
  barometric_pressure: 'pressureHpa',
  precipitation: 'precipitation',
  rain: 'precipitation',
  nature_pulse: 'environmentalPulse',
  pulse: 'environmentalPulse',
  thermal_comfort: 'thermalComfortIndex',
};

/**
 * Service to build complete explanation metadata for any metric
 */
export class ExplanationService {
  /**
   * Build explanation metadata for a generic metric key
   */
  static getMetricExplanation(
    metricKey: string,
    value?: string | number,
    location?: LocationData,
    normalizedState?: NormalizedEnvironmentalState | null,
    overrides?: Partial<ExplanationMetadata>
  ): ExplanationMetadata {
    const resolvedKey = METRIC_KEY_ALIASES[metricKey] || METRIC_KEY_ALIASES[metricKey.toLowerCase()] || metricKey;
    const base = METRIC_KNOWLEDGE_BASE[resolvedKey] || METRIC_KNOWLEDGE_BASE[metricKey] || {
      metricId: metricKey,
      label: metricKey.charAt(0).toUpperCase() + metricKey.slice(1).replace(/([A-Z])/g, ' $1'),
      dataType: 'MEASURED' as ExplanationDataType,
      source: 'HeatOS Sensor Mesh',
      whatItMeans: `Standard environmental telemetry observation for ${metricKey}.`,
      whyItMatters: 'Provides environmental awareness for localized decision making.',
      iconType: 'heat',
    };

    // Determine real freshness timestamp
    const timestamp =
      normalizedState?.metadata?.timestamps?.syncedAt
        ? `Updated ${new Date(normalizedState.metadata.timestamps.syncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
        : normalizedState?.metadata?.lastSuccessfulSyncHuman
        ? `Updated ${normalizedState.metadata.lastSuccessfulSyncHuman}`
        : 'Live Telemetry Active';

    const confidence = normalizedState?.metadata?.confidenceScore || 96;

    return {
      metricId: metricKey,
      label: base.label || metricKey,
      value: value !== undefined ? value : (location ? (location as any)[metricKey] : 'Synced'),
      unit: base.unit || '',
      status: normalizedState?.metadata?.statusLabel || 'LIVE',
      source: base.source,
      sourceInstitution: base.sourceInstitution,
      dataType: base.dataType || 'MEASURED',
      timestamp,
      whatItMeans: base.whatItMeans || 'Observed biophysical measurement.',
      whyItMatters: base.whyItMatters,
      calculation: base.calculation,
      aiSynthesis: base.aiSynthesis,
      confidence: `${confidence}%`,
      spatialResolution: base.spatialResolution || 'Point / 10m Mesh',
      limitations: base.limitations,
      relatedMetrics: base.relatedMetrics,
      iconType: base.iconType || 'heat',
      ...overrides,
    };
  }

  /**
   * Build explanation for an Alert
   */
  static getAlertExplanation(alert: EnvironmentalEvent, location?: LocationData): ExplanationMetadata {
    const baseline = alert.evidence?.baselineComparison;
    const currentVal = baseline ? `${baseline.observedValue} ${baseline.unit}` : 'Threshold Exceeded';
    const thresholdVal = baseline ? `${baseline.baselineValue} ${baseline.unit}` : 'Safe Baseline';
    const primaryAction = typeof alert.recommendedAction === 'string' 
      ? alert.recommendedAction 
      : alert.recommendedAction?.primary || 'Activate targeted cooling protocols and monitor vulnerable cohorts.';
    const primarySource = alert.sources && alert.sources.length > 0 ? alert.sources[0].sourceName : 'HeatOS Event Engine';

    return {
      metricId: `alert-${alert.id}`,
      label: alert.summary?.headline || 'Environmental Alert',
      value: currentVal,
      status: alert.severity,
      source: primarySource,
      sourceInstitution: 'FortyGuard Spatial Mesh & Synoptic Anomaly Engine',
      dataType: alert.type === 'HEAT_ANOMALY' ? 'MEASURED' : 'DERIVED',
      timestamp: `Detected ${new Date(alert.detectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      whatItMeans: alert.summary?.whatChanged || alert.summary?.why || 'Environmental parameter crossed critical threshold.',
      whyItMatters: alert.impact?.healthRisk || 'Compound environmental extremes elevate localized physical risk and stress building cooling systems.',
      confidence: `${alert.confidence}%`,
      spatialResolution: '1m - 10m Micro-Spatial Mesh',
      recommendedAction: primaryAction,
      alertDetails: {
        alertTitle: alert.summary?.headline || 'Environmental Alert',
        whatHappened: alert.summary?.whatChanged || 'Anomaly detected in environmental stream.',
        whyItTriggered: alert.summary?.why || `Observed value exceeded normal operating threshold.`,
        severity: alert.severity,
        confidence: alert.confidence,
        affectedLocation: alert.location?.locationName || location?.name || 'Monitored Spatial Zone',
        currentValue: currentVal,
        threshold: thresholdVal,
        whatToWatchNext: primaryAction,
      },
      iconType: 'alert',
    };
  }

  /**
   * Build explanation for a Forecast Event
   */
  static getForecastEventExplanation(event: {
    title: string;
    time: string;
    temperature: string;
    anomaly: string;
    why: string;
    keySignals?: string[];
    confidence?: number;
    limitations?: string;
  }): ExplanationMetadata {
    return {
      metricId: `forecast-event-${event.time}`,
      label: event.title,
      value: event.temperature,
      status: 'MODELED PROJECTION',
      source: 'HeatOS Synoptic & Diurnal Model',
      sourceInstitution: 'NOAA GFS + FortyGuard Urban Radiance Engine',
      dataType: 'MODELED',
      timestamp: `Forecast generated for ${event.time}`,
      whatItMeans: `Projected thermodynamic event expected at ${event.time} with a peak thermal level of ${event.temperature} and ${event.anomaly}.`,
      whyItMatters: 'Identifying peak exposure windows in advance enables proactive cooling actions before heat accumulation becomes dangerous.',
      confidence: `${event.confidence || 88}%`,
      spatialResolution: '100m Micro-Urban Diurnal Curve',
      limitations: event.limitations || 'Modeled synoptic forecast subject to localized cloud formation and wind direction shifts. Not a guaranteed outcome.',
      forecastDetails: {
        eventName: event.title,
        targetTime: event.time,
        projectedValue: event.temperature,
        whatIsExpected: `At ${event.time}, conditions will reach ${event.temperature} with ${event.anomaly}.`,
        why: event.why,
        keySignals: event.keySignals || ['Peak Solar Irradiance', 'Surface Thermal Lag', 'Canopy Shading Deficit', 'Wind Dispersion'],
        confidence: event.confidence || 88,
        limitations: event.limitations || 'Modeled synoptic forecast subject to convective cloud cover and micro-spatial wind deviations.',
      },
      iconType: 'heat',
    };
  }

  /**
   * Build explanation for Map Location / Spatial Zone
   */
  static getMapLocationExplanation(
    locationName: string,
    coords: { lat: number; lng: number },
    metrics: {
      temperature: string;
      heatAnomaly: string;
      aqi: string;
      wind: string;
      humidity: string;
      pulse: string;
    },
    whyThisArea: string
  ): ExplanationMetadata {
    return {
      metricId: `map-location-${coords.lat}-${coords.lng}`,
      label: locationName,
      value: metrics.temperature,
      status: 'LIVE MESH INSPECTION',
      source: 'FortyGuard',
      sourceInstitution: 'FortyGuard 1m-10m Spatial Thermal Mesh',
      dataType: 'MEASURED',
      timestamp: 'Live Micro-Spatial Ingestion',
      whatItMeans: `Comprehensive environmental snapshot for coordinates (${coords.lat.toFixed(4)}°N, ${Math.abs(coords.lng).toFixed(4)}°W).`,
      whyItMatters: `High-density spatial sensing reveals micro-urban pockets where temperatures deviate by up to 5°C from regional airport weather stations.`,
      confidence: '95%',
      spatialResolution: '1m - 10m Micro-Spatial Mesh',
      mapInspectorDetails: {
        locationName,
        coordinates: coords,
        whyThisArea,
        urbanMorphology: 'High impervious surface density with localized street canyon thermal trapping.',
        sensorCoverage: 'Active FortyGuard IoT node mesh with direct telemetry sync.',
      },
      iconType: 'map',
    };
  }

  /**
   * Build explanation for AI Insight
   */
  static getAIInsightExplanation(
    headline: string,
    summary: string,
    signalsUsed: string[]
  ): ExplanationMetadata {
    return {
      metricId: 'ai-synthesis-insight',
      label: headline,
      value: 'AI Synthesis',
      status: 'GROUNDED REASONING',
      source: 'HeatOS Intelligence',
      sourceInstitution: 'HeatOS Grounded Environmental Intelligence Engine',
      dataType: 'AI INTERPRETATION',
      timestamp: 'Synthesized from current live state',
      whatItMeans: summary,
      whyItMatters: 'Synthesizes multiple disparate sensor streams into clear, actionable operational intelligence.',
      confidence: 'Grounded in Live Data',
      aiSynthesis: {
        isAISynthesis: true,
        basedOnSignals: signalsUsed,
        disclaimer: 'Data-grounded interpretation generated from the current HeatOS environmental state. AI did not independently measure physical conditions.',
      },
      iconType: 'ai',
    };
  }
}
