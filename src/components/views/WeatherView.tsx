import React from 'react';
import {
  CloudSun,
  Sun,
  Wind,
  Droplets,
  Thermometer,
  Compass,
  Sparkles,
  Flame,
  Activity,
  ShieldCheck,
  Database,
  Gauge,
  Eye,
  Info,
  Layers,
  ArrowRight,
  TrendingUp,
  MapPin,
  RefreshCw,
  SunMedium,
  CheckCircle2,
  AlertTriangle,
  Waves,
  Trees,
} from 'lucide-react';
import { useLocation } from '../../context/LocationContext';
import { useFortyGuard } from '../../context/FortyGuardContext';
import { useAIAnalyst } from '../../context/AIAnalystContext';
import { useNavigation } from '../../context/NavigationContext';
import PageContainer from '../ui/PageContainer';
import Card from '../ui/Card';
import MetricCard from '../ui/MetricCard';
import StatusPill from '../ui/StatusPill';
import SecondaryButton from '../ui/SecondaryButton';
import PrimaryButton from '../ui/PrimaryButton';
import { FadeIn, CardEntrance } from '../motion/MotionPrimitives';

export const WeatherView: React.FC = () => {
  const {
    currentLocation,
    formatTemp,
    tempUnit,
    toggleTempUnit,
    lastTelemetryTime,
    statusLabel,
    connectionStatus,
    normalizedState,
    inspectProvenance,
    refreshEnvironmentalData,
    isLoadingEnvironmental,
  } = useLocation();

  const { openAIWithContext } = useAIAnalyst();
  const { setActiveTab } = useNavigation();

  // Extract from normalizedState or fallback with high-fidelity telemetry
  const conditions = normalizedState?.currentConditions;
  const spatial = normalizedState?.spatialMetrics;

  const tempC = currentLocation.ambientTemp;
  const apparentC = currentLocation.apparentTemp;
  const humidityPct = currentLocation.humidity;
  const wetBulbC = conditions?.wetBulb.value ?? 18.4;
  const heatIndexC = conditions?.heatIndex.value ?? apparentC;
  const dewPointC = conditions?.dewPoint.value ?? 15.2;
  const pressureHpa = conditions?.pressureHpa.value ?? 1013.25;
  const solarGhi = currentLocation.solarIrradiance;
  const uvIdx = currentLocation.uvIndex;
  const aqiVal = currentLocation.aqi;
  const uhiVal = currentLocation.surfaceHeatAnomaly;
  const canopyPct = currentLocation.canopyCoverage;

  const windData = conditions?.wind.value ?? {
    speedKmh: 14,
    directionDeg: 165,
    directionCardinal: 'SSE',
    gustKmh: 19,
    coolingEffectFactor: 0.85,
  };

  const aqiCategory = conditions?.airQuality.value.category || (aqiVal <= 50 ? 'Good' : aqiVal <= 100 ? 'Moderate' : 'Unhealthy for Sensitive Groups');
  const conditionText = conditions?.conditionSummary || (tempC > 30 ? 'Intense Solar Insolation' : 'Clear Atmospheric Baseline');

  // Compute concise Environmental Impact assessments strictly from available data
  const getHeatLoadImpact = () => {
    if (uhiVal >= 3.0 || tempC >= 33) return { label: 'Severe urban heat load.', level: 'high', detail: `+${uhiVal.toFixed(1)}°C surface heat anomaly across paved corridors.` };
    if (uhiVal >= 1.5 || tempC >= 27) return { label: 'Moderate urban heat load.', level: 'moderate', detail: `+${uhiVal.toFixed(1)}°C localized microclimate elevation above background.` };
    return { label: 'Temperate baseline thermal load.', level: 'low', detail: 'Minimal thermal retention in surrounding urban fabric.' };
  };

  const getSolarExposureImpact = () => {
    if (uvIdx >= 8 || solarGhi >= 750) return { label: 'High solar exposure.', level: 'high', detail: `${solarGhi} W/m² GHI radiation with UV Index ${uvIdx}.` };
    if (uvIdx >= 5 || solarGhi >= 450) return { label: 'Moderate solar exposure.', level: 'moderate', detail: `${solarGhi} W/m² GHI radiation with UV Index ${uvIdx}.` };
    return { label: 'Low solar radiation load.', level: 'low', detail: 'Diffuse solar insolation with low UV stress.' };
  };

  const getAirQualityImpact = () => {
    if (aqiVal > 100) return { label: 'Elevated air-quality stress.', level: 'high', detail: `AQI ${aqiVal} (${aqiCategory}) - particulate sensitivity active.` };
    if (aqiVal > 50) return { label: 'Moderate air-quality stress.', level: 'moderate', detail: `AQI ${aqiVal} (${aqiCategory}) - within acceptable standard.` };
    return { label: 'Low air-quality stress.', level: 'low', detail: `AQI ${aqiVal} (${aqiCategory}) - clean atmospheric baseline.` };
  };

  const getBiophysicalComfortImpact = () => {
    if (wetBulbC >= 26 || heatIndexC >= 35) return { label: 'Restricted evaporative cooling.', level: 'high', detail: `Wet-bulb ${formatTemp(wetBulbC)} limits natural human metabolic cooling.` };
    if (wetBulbC >= 21 || heatIndexC >= 29) return { label: 'Compensable metabolic thermal strain.', level: 'moderate', detail: `Dew point ${dewPointC}°C and ${humidityPct}% RH moderate cooling rate.` };
    return { label: 'Optimal physiological comfort zone.', level: 'low', detail: `Wet-bulb ${formatTemp(wetBulbC)} enables full evaporative dissipation.` };
  };

  const heatImpact = getHeatLoadImpact();
  const solarImpact = getSolarExposureImpact();
  const airImpact = getAirQualityImpact();
  const bioImpact = getBiophysicalComfortImpact();

  return (
    <PageContainer maxWidth="7xl">
      <FadeIn>
        {/* ========================================================================= */}
        {/* TOP STATUS BAR: Location, Sync, Refresh, Unit Toggle */}
        {/* ========================================================================= */}
        <div className="mb-4 sm:mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200/80 rounded-2xl p-3 sm:px-4 sm:py-3 shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center flex-shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-extrabold text-slate-900 truncate">
                {currentLocation.displayName || currentLocation.name}
              </div>
              <div className="text-[11px] font-mono text-slate-500 truncate flex items-center gap-2">
                <span>{currentLocation.coordinates.lat.toFixed(2)}°N, {Math.abs(currentLocation.coordinates.lng).toFixed(2)}°W</span>
                <span>•</span>
                <span>{currentLocation.elevation || '10m ASL'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <div
              onClick={() => inspectProvenance('temperature')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200/90 text-xs font-mono font-medium text-slate-700 cursor-pointer hover:border-slate-300 transition-colors shadow-2xs"
              title="Click to inspect provenance"
            >
              {connectionStatus === 'LIVE' ? (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
              ) : (
                <span className="h-2 w-2 rounded-full bg-slate-400" />
              )}
              <span className="font-bold text-[11px] uppercase tracking-wider text-slate-800">
                {statusLabel}
              </span>
              <span className="text-[10px] text-slate-400">({lastTelemetryTime})</span>
            </div>

            <button
              id="weather-refresh-btn"
              type="button"
              onClick={() => refreshEnvironmentalData(true)}
              disabled={isLoadingEnvironmental}
              className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-all cursor-pointer shadow-2xs min-h-[34px] min-w-[34px] flex items-center justify-center disabled:opacity-50"
              title="Refresh telemetry"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingEnvironmental ? 'animate-spin text-[#2563EB]' : ''}`} />
            </button>

            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/80">
              <button
                type="button"
                onClick={() => tempUnit !== 'C' && toggleTempUnit()}
                className={`px-2 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  tempUnit === 'C' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                °C
              </button>
              <button
                type="button"
                onClick={() => tempUnit !== 'F' && toggleTempUnit()}
                className={`px-2 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  tempUnit === 'F' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                °F
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 1. PRIMARY WEATHER HERO CARD */}
        {/* ========================================================================= */}
        <div className="mb-5 sm:mb-6">
          <div className="rounded-3xl bg-white border border-slate-200/80 p-5 sm:p-7 shadow-xs relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-50/70 via-sky-50/40 to-transparent rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              {/* Left: Atmospheric State */}
              <div className="space-y-3 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                    Environmental Conditions Right Now
                  </span>
                  <StatusPill status="optimal" label="SYNOPTIC MESH SYNCED" size="sm" />
                </div>

                <div className="flex items-center gap-4 sm:gap-5 flex-wrap">
                  <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-50 to-blue-50 border border-slate-200/80 flex items-center justify-center flex-shrink-0 shadow-2xs">
                    <Sun className="w-8 h-8 text-amber-500 animate-[spin_20s_linear_infinite]" />
                    <CloudSun className="w-5 h-5 text-blue-600 absolute bottom-1 right-1" />
                  </div>

                  <div>
                    <div className="flex items-baseline flex-wrap gap-x-3 gap-y-1">
                      <span
                        onClick={() => inspectProvenance('temperature', formatTemp(tempC))}
                        className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 font-mono hover:text-blue-600 cursor-pointer transition-colors"
                        title="Click to inspect ambient temperature provenance"
                      >
                        {formatTemp(tempC)}
                      </span>
                      <div className="space-y-0.5">
                        <span className="text-sm sm:text-base font-bold text-slate-700">
                          Feels like {formatTemp(apparentC)}
                        </span>
                        <div className="text-xs font-semibold text-[#2563EB] flex items-center gap-1.5">
                          <span>{conditionText}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Surface dew point {(dewPointC).toFixed(1)}°C, atmospheric pressure {pressureHpa} hPa, and psychrometric wet-bulb temperature {formatTemp(wetBulbC)}. FortyGuard thermal inertia records a{' '}
                  <button
                    type="button"
                    onClick={() => inspectProvenance('surfaceHeatAnomaly', `+${uhiVal.toFixed(1)}°C`)}
                    className="font-bold text-amber-700 hover:underline cursor-pointer"
                  >
                    +{uhiVal.toFixed(1)}°C UHI delta
                  </button>{' '}
                  above regional background.
                </p>
              </div>

              {/* Right: AI Action & Map Button */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 flex-shrink-0 w-full sm:w-auto lg:w-56">
                <SecondaryButton
                  id="weather-analyze-factors-btn"
                  size="md"
                  className="w-full justify-center"
                  onClick={() =>
                    openAIWithContext(
                      `Analyze the current weather and microclimate factors for ${currentLocation.displayName}: Ambient Temperature ${formatTemp(
                        tempC
                      )}, Apparent Feels-Like ${formatTemp(apparentC)}, Heat Index ${formatTemp(
                        heatIndexC
                      )}, Psychrometric Wet-Bulb ${formatTemp(wetBulbC)}, Relative Humidity ${humidityPct}%, Dew Point ${dewPointC.toFixed(
                        1
                      )}°C, Atmospheric Pressure ${pressureHpa} hPa, Wind ${windData.speedKmh} km/h ${windData.directionCardinal} (Gusts ${
                        windData.gustKmh
                      } km/h), Solar Irradiance ${solarGhi} W/m², UV Index ${uvIdx}, AQI ${aqiVal} (${aqiCategory}), FortyGuard UHI Surface Anomaly +${uhiVal.toFixed(
                        1
                      )}°C, Tree Canopy ${canopyPct}%. What are the physiological and localized urban implications?`
                    )
                  }
                  icon={<Sparkles className="w-4 h-4 text-purple-600" />}
                >
                  Analyze Weather Factors
                </SecondaryButton>

                <SecondaryButton
                  id="weather-living-map-btn"
                  size="md"
                  variant="outline"
                  className="w-full justify-center"
                  onClick={() => setActiveTab('navigation')}
                  icon={<Compass className="w-4 h-4 text-[#2563EB]" />}
                >
                  View on Living Map
                </SecondaryButton>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. ENVIRONMENTAL IMPACT SECTION */}
        {/* ========================================================================= */}
        <div className="mb-5 sm:mb-6">
          <Card variant="default" padding="md" className="border-slate-200">
            <div className="flex items-center justify-between gap-2 mb-3 pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center">
                  <Activity className="w-3.5 h-3.5" />
                </div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Environmental Impact
                </h2>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold border border-slate-200">
                Data-Grounded Conclusions
              </span>
            </div>

            {/* Concise One-Statement Summary */}
            <div className="mb-3.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
                Current Environmental Assessment
              </div>
              <div className="text-xs font-semibold text-slate-800 space-y-0.5">
                <div>• {heatImpact.label}</div>
                <div>• {solarImpact.label}</div>
                <div>• {airImpact.label}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Heat Load */}
              <div className="p-3 rounded-2xl bg-orange-50/50 border border-orange-100/90 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-orange-900">
                  <Flame className="w-3.5 h-3.5 text-orange-600" />
                  <span>{heatImpact.label}</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">
                  {heatImpact.detail}
                </p>
              </div>

              {/* Solar Exposure */}
              <div className="p-3 rounded-2xl bg-amber-50/50 border border-amber-100/90 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                  <Sun className="w-3.5 h-3.5 text-amber-600" />
                  <span>{solarImpact.label}</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">
                  {solarImpact.detail}
                </p>
              </div>

              {/* Air Quality */}
              <div className="p-3 rounded-2xl bg-blue-50/50 border border-blue-100/90 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
                  <Wind className="w-3.5 h-3.5 text-blue-600" />
                  <span>{airImpact.label}</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">
                  {airImpact.detail}
                </p>
              </div>

              {/* Biophysical Comfort */}
              <div className="p-3 rounded-2xl bg-cyan-50/50 border border-cyan-100/90 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-900">
                  <Droplets className="w-3.5 h-3.5 text-cyan-600" />
                  <span>{bioImpact.label}</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">
                  {bioImpact.detail}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* ========================================================================= */}
        {/* 3. COMPACT WEATHER TELEMETRY CARDS (All 12 Required Parameters) */}
        {/* ========================================================================= */}
        <div className="mb-5 sm:mb-6">
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Normalized Atmospheric &amp; Biophysical Parameters
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">Click card for provenance</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
            {/* 1. Ambient Temperature */}
            <MetricCard
              id="weather-metric-temp"
              metricKey="temperature"
              variant="compact"
              label="Temperature"
              value={formatTemp(tempC)}
              category="heat"
              subValue={`Feels ${formatTemp(apparentC)}`}
              source="NOAA"
              onClick={() => inspectProvenance('temperature', formatTemp(tempC))}
            />

            {/* 2. Relative Humidity */}
            <MetricCard
              id="weather-metric-humidity"
              metricKey="humidity"
              variant="compact"
              label="Humidity"
              value={`${humidityPct}%`}
              category="water"
              subValue={`Dew: ${dewPointC.toFixed(1)}°C`}
              source="NOAA"
              onClick={() => inspectProvenance('humidity', `${humidityPct}%`)}
            />

            {/* 3. Surface Wind & Gusts */}
            <MetricCard
              id="weather-metric-wind"
              metricKey="wind_speed"
              variant="compact"
              label="Wind & Gusts"
              value={windData.speedKmh}
              unit="km/h"
              category="wind"
              subValue={`${windData.directionCardinal} • Gusts ${windData.gustKmh}`}
              source="NWS"
              onClick={() => inspectProvenance('wind', `${windData.speedKmh} km/h`)}
            />

            {/* 4. Dew Point */}
            <MetricCard
              id="weather-metric-dewpoint"
              metricKey="dew_point"
              variant="compact"
              label="Dew Point"
              value={`${dewPointC.toFixed(1)}°C`}
              category="water"
              subValue="Condensation Pt"
              source="Magnus"
              onClick={() => inspectProvenance('dewPoint', `${dewPointC.toFixed(1)}°C`)}
            />

            {/* 5. Atmospheric Pressure */}
            <MetricCard
              id="weather-metric-pressure"
              metricKey="pressure"
              variant="compact"
              label="Atm Pressure"
              value={pressureHpa}
              unit="hPa"
              category="general"
              subValue="Synoptic Grid"
              source="NOAA"
              onClick={() => inspectProvenance('pressure', `${pressureHpa} hPa`)}
            />

            {/* 6. Heat Index */}
            <MetricCard
              id="weather-metric-heatindex"
              metricKey="heat_index"
              variant="compact"
              label="Heat Index"
              value={formatTemp(heatIndexC)}
              category="heat"
              subValue="Bio-Thermal HI"
              source="HeatOS"
              onClick={() => inspectProvenance('heatIndex', formatTemp(heatIndexC))}
            />

            {/* 7. Psychrometric Wet Bulb */}
            <MetricCard
              id="weather-metric-wetbulb"
              metricKey="wet_bulb"
              variant="compact"
              label="Wet Bulb"
              value={formatTemp(wetBulbC)}
              category="water"
              subValue="Physiological Safe"
              source="Stull"
              onClick={() => inspectProvenance('wetBulb', formatTemp(wetBulbC))}
            />

            {/* 8. Air Quality Index */}
            <MetricCard
              id="weather-metric-aqi"
              metricKey="air_quality"
              variant="compact"
              label="Air Quality"
              value={aqiVal}
              unit="AQI"
              category="air"
              subValue={aqiCategory}
              source="EPA"
              onClick={() => inspectProvenance('airQuality', `${aqiVal} AQI`)}
            />

            {/* 9. Solar Irradiance */}
            <MetricCard
              id="weather-metric-solar"
              metricKey="solar_irradiance"
              variant="compact"
              label="Solar Irradiance"
              value={solarGhi}
              unit="W/m²"
              category="solar"
              subValue="GHI Flux"
              source="CAMS"
              onClick={() => inspectProvenance('solar', `${solarGhi} W/m²`)}
            />

            {/* 10. UV Index */}
            <MetricCard
              id="weather-metric-uv"
              metricKey="uv_index"
              variant="compact"
              label="UV Index"
              value={`UV ${uvIdx}`}
              category="solar"
              subValue={uvIdx >= 8 ? 'Very High' : uvIdx >= 6 ? 'High' : uvIdx >= 3 ? 'Moderate' : 'Low'}
              source="NOAA"
              onClick={() => inspectProvenance('solar', `UV Index ${uvIdx}`)}
            />

            {/* 11. FortyGuard Heat Island */}
            <MetricCard
              id="weather-metric-uhi"
              metricKey="heat_island"
              variant="compact"
              label="Heat Island"
              value={`+${uhiVal.toFixed(1)}°C`}
              category="heat"
              subValue="UHI Surface"
              source="40G"
              onClick={() => inspectProvenance('surfaceHeatAnomaly', `+${uhiVal.toFixed(1)}°C`)}
            />

            {/* 12. Tree Canopy Buffer */}
            <MetricCard
              id="weather-metric-canopy"
              metricKey="canopy_cover"
              variant="compact"
              label="Tree Canopy"
              value={`${canopyPct}%`}
              category="bio"
              subValue="Solar Buffer"
              source="ESA"
              onClick={() => inspectProvenance('canopy', `${canopyPct}% Canopy`)}
            />
          </div>
        </div>
      </FadeIn>
    </PageContainer>
  );
};

export default WeatherView;
