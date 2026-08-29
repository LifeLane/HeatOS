import React, { useState, useEffect } from 'react';
import {
  Flame,
  Wind,
  Map as MapIcon,
  Sparkles,
  ArrowRight,
  TrendingUp,
  MapPin,
  RefreshCw,
  Activity,
  Layers,
  Info,
  Thermometer,
  Sun,
  Droplets
} from 'lucide-react';
import { useLocation } from '../../context/LocationContext';
import { useFortyGuard } from '../../context/FortyGuardContext';
import { useNavigation } from '../../context/NavigationContext';
import { useAIAnalyst } from '../../context/AIAnalystContext';
import { useExplanation } from '../../context/ExplanationContext';
import PageContainer from '../ui/PageContainer';
import Card from '../ui/Card';
import MetricCard from '../ui/MetricCard';
import { AnimatedTelemetryCards } from '../dashboard/AnimatedTelemetryCards';
import { FadeIn, CardEntrance, NumberCounter } from '../motion/MotionPrimitives';
import { naturePulseApi } from '../../services/naturePulseApi';
import { EventService } from '../../services/eventService';
import { NaturePulseResult } from '../../types/naturePulse';
import { EnvironmentalEvent } from '../../server/events/types';

export const DashboardView: React.FC = () => {
  const {
    currentLocation,
    formatTemp,
    tempUnit,
    toggleTempUnit,
    lastTelemetryTime,
    refreshEnvironmentalData,
    isLoadingEnvironmental,
    inspectProvenance,
    connectionStatus,
    statusLabel,
    normalizedState,
  } = useLocation();

  const { connection } = useFortyGuard();
  const { setActiveTab, setIsLocationModalOpen, openTool } = useNavigation();
  const { openAIWithContext } = useAIAnalyst();
  const explanation = useExplanation();

  const [pulse, setPulse] = useState<NaturePulseResult | null>(null);
  const [pulseLoading, setPulseLoading] = useState<boolean>(true);
  const [recentAlerts, setRecentAlerts] = useState<EnvironmentalEvent[]>([]);

  useEffect(() => {
    let isMounted = true;
    const loadDashboardData = async () => {
      try {
        setPulseLoading(true);
        const pulseData = await naturePulseApi.getPulse({
          latitude: currentLocation.coordinates.lat,
          longitude: currentLocation.coordinates.lng,
          locationName: currentLocation.name,
          stateCode: currentLocation.stateCode,
          countryCode: currentLocation.countryCode,
        });
        if (isMounted) setPulse(pulseData);
      } catch (err) {
        console.error('Error fetching pulse:', err);
      } finally {
        if (isMounted) setPulseLoading(false);
      }

      try {
        const eventFeed = await EventService.fetchEvents({
          latitude: currentLocation.coordinates.lat,
          longitude: currentLocation.coordinates.lng,
          locationName: currentLocation.name,
          minConfidence: 60,
        });
        if (isMounted) {
          setRecentAlerts(eventFeed.events.slice(0, 3));
        }
      } catch (err) {
        console.error('Error fetching events:', err);
      }
    };
    loadDashboardData();
    return () => { isMounted = false; };
  }, [currentLocation.id, currentLocation.coordinates.lat, currentLocation.coordinates.lng]);

  const getConditionText = () => {
    if (currentLocation.ambientTemp > 35) return 'CRITICAL HEAT EXPOSURE';
    if (currentLocation.ambientTemp > 30) return 'HIGH HEAT EXPOSURE';
    if (currentLocation.ambientTemp > 24) return 'MODERATE HEAT EXPOSURE';
    return 'LOW IMMEDIATE HEAT STRESS';
  };

  const getConditionColor = () => {
    if (currentLocation.ambientTemp > 35) return 'text-red-600 bg-red-50 border-red-200';
    if (currentLocation.ambientTemp > 30) return 'text-orange-600 bg-orange-50 border-orange-200';
    if (currentLocation.ambientTemp > 24) return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-emerald-700 bg-emerald-50 border-emerald-200';
  };

  const pulseScore = pulse?.overallScore ?? currentLocation.thermalComfortIndex ?? 72;
  const pulseStatus = (pulse?.overallStatusLabel || pulse?.overallStatus || 'STABLE').toUpperCase();

  const handleAskHeatOS = () => {
    openAIWithContext(
      `Analyze current environmental telemetry in ${currentLocation.name}: Ambient ${formatTemp(
        currentLocation.ambientTemp
      )}, Surface Anomaly +${currentLocation.surfaceHeatAnomaly.toFixed(
        1
      )}°C, AQI ${currentLocation.aqi}. Status: ${getConditionText()}.`
    );
  };

  return (
    <PageContainer maxWidth="5xl">
      <FadeIn>
        {/* ========================================================================= */}
        {/* HERO SECTION */}
        {/* ========================================================================= */}
        <div className="mb-6 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 md:p-10 flex flex-col items-center text-center">
            <h1 className="text-sm font-bold tracking-widest text-slate-400 uppercase mb-4">
              RIGHT NOW
            </h1>
            
            <div className="flex flex-col items-center mb-6">
              <button
                type="button"
                onClick={() => explanation.explainMetric('ambientTemp', formatTemp(currentLocation.ambientTemp))}
                className="group text-7xl md:text-8xl font-black tracking-tighter text-slate-900 mb-2 font-mono hover:text-blue-600 transition-colors cursor-pointer focus:outline-hidden"
                title="Click to view full ambient temperature explanation & sensor mesh provenance"
              >
                {formatTemp(currentLocation.ambientTemp)}
                <span className="block text-[11px] font-sans font-semibold tracking-normal text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  Click to inspect signal provenance &rarr;
                </span>
              </button>
              <button
                type="button"
                onClick={() => explanation.explainMetric('feelsLike', formatTemp(currentLocation.apparentTemp))}
                className="text-lg md:text-xl font-medium text-slate-500 mb-4 font-mono hover:text-blue-600 transition-colors cursor-pointer focus:outline-hidden"
                title="Click to inspect perceived heat & biometeorological model"
              >
                PERCEIVED HEAT {formatTemp(currentLocation.apparentTemp)}
              </button>
              <button
                type="button"
                onClick={() => explanation.explainMetric('thermalComfortIndex', getConditionText())}
                className={`px-4 py-2 rounded-full border text-sm font-bold cursor-pointer hover:shadow-xs transition-all ${getConditionColor()}`}
                title="Click to inspect thermal comfort classification"
              >
                {getConditionText()}
              </button>
            </div>

            {/* KEY INTELLIGENCE */}
            <div className="w-full max-w-2xl bg-slate-50 hover:bg-slate-100/80 rounded-xl p-6 border border-slate-100 mb-8 space-y-3 transition-colors">
              <button
                type="button"
                onClick={() =>
                  explanation.explainForecastEvent({
                    title: 'Thermal Peak Approaching',
                    time: '14:00–17:00',
                    temperature: formatTemp(currentLocation.ambientTemp + 2.5),
                    anomaly: `+${(currentLocation.surfaceHeatAnomaly + 1.2).toFixed(1)}°C`,
                    why: 'High shortwave solar irradiance combined with low-albedo paved urban surfaces drives peak diurnal heat accumulation between 14:00 and 17:00.',
                  })
                }
                className="w-full flex items-center justify-center gap-2 text-slate-700 font-medium hover:text-blue-600 transition-colors cursor-pointer group"
                title="Click to view thermal peak forecast explanation"
              >
                <TrendingUp className="w-5 h-5 text-orange-500 group-hover:scale-110 transition-transform" />
                <span className="font-mono text-sm tracking-tight font-bold">THERMAL PEAK APPROACHING · 14:00–17:00</span>
                <span className="text-[11px] text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity font-semibold ml-1">&rarr;</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  explanation.explainMetric(
                    'surfaceHeatAnomaly',
                    `+${currentLocation.surfaceHeatAnomaly.toFixed(1)}°C`
                  )
                }
                className="w-full flex items-center justify-center gap-2 text-slate-700 font-medium hover:text-blue-600 transition-colors cursor-pointer group"
                title="Click to view local heat signal explanation & satellite baseline"
              >
                <Flame className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform" />
                <span className="font-mono text-sm tracking-tight font-bold">LOCAL HEAT SIGNAL · +{currentLocation.surfaceHeatAnomaly.toFixed(1)}°C ABOVE BASELINE</span>
                <span className="text-[11px] text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity font-semibold ml-1">&rarr;</span>
              </button>
            </div>

            {/* PRIMARY ACTIONS */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
              <button
                onClick={() => setActiveTab('navigation')}
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <MapIcon className="w-5 h-5" />
                <span>EXPLORE THE LIVING MAP</span>
              </button>
              <button
                onClick={handleAskHeatOS}
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-5 h-5 text-blue-300" />
                <span>ASK HEATOS</span>
              </button>
            </div>
            
            {/* HACKATHON QUICK LINKS */}
            <div className="mt-8 pt-6 border-t border-slate-100 w-full max-w-3xl">
              <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4">FROM SIGNAL TO ACTION</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  onClick={() => {
                    setActiveTab('tools');
                    openTool('cool-route-navigation', 'EXPLORE');
                  }}
                  className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-colors flex flex-col items-center text-center gap-2 cursor-pointer"
                >
                  <MapIcon className="w-5 h-5 text-blue-600" />
                  <span className="text-xs font-bold text-slate-700 uppercase">COOLROUTE</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab('tools');
                    openTool('urban-heat-sandbox', 'EXPLORE');
                  }}
                  className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-emerald-50 hover:border-emerald-200 transition-colors flex flex-col items-center text-center gap-2 cursor-pointer"
                >
                  <Layers className="w-5 h-5 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-700 uppercase">MITIGATION SANDBOX</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab('tools');
                    openTool('vulnerability-alert-system', 'MONITOR');
                  }}
                  className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-rose-50 hover:border-rose-200 transition-colors flex flex-col items-center text-center gap-2 cursor-pointer"
                >
                  <Activity className="w-5 h-5 text-rose-600" />
                  <span className="text-xs font-bold text-slate-700 uppercase">RISK WATCH</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab('tools');
                    openTool('heat-action-plan', 'ACT');
                  }}
                  className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-amber-50 hover:border-amber-200 transition-colors flex flex-col items-center text-center gap-2 cursor-pointer"
                >
                  <Flame className="w-5 h-5 text-amber-600" />
                  <span className="text-xs font-bold text-slate-700 uppercase">HEAT ACTION</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ANIMATED TELEMETRY (Heat Index, Air Quality, Humidity) */}
        {/* ========================================================================= */}
        <AnimatedTelemetryCards />

        {/* ========================================================================= */}
        {/* COMPACT METRICS GRID */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <CardEntrance delay={0.1}>
            <MetricCard
              metricKey="air_quality"
              label="AIR QUALITY"
              value={currentLocation.aqi.toString()}
              unit="AQI"
              icon={<Wind className="w-4 h-4" />}
              delta="-4 AQI/hr"
              deltaType="down"
              deltaLabel="AIR TREND"
              sparkline={[60, 58, 54, 52, 48, 45, 42]}
              category="air"
              status={currentLocation.aqi > 50 ? 'warning' : 'optimal'}
              onClick={() => inspectProvenance('airQuality', currentLocation.aqi.toString())}
            />
          </CardEntrance>
          <CardEntrance delay={0.2}>
            <MetricCard
              metricKey="humidity"
              label="HUMIDITY"
              value={currentLocation.humidity.toString()}
              unit="%"
              icon={<Activity className="w-4 h-4" />}
              delta="-1.5%/hr"
              deltaType="down"
              deltaLabel="MOISTURE TREND"
              sparkline={[65, 66, 64, 63, 61, 60, 58]}
              category="water"
              status={currentLocation.humidity > 60 ? 'high' : 'optimal'}
              onClick={() => inspectProvenance('humidity', `${currentLocation.humidity}%`)}
            />
          </CardEntrance>
          <CardEntrance delay={0.3}>
            <MetricCard
              metricKey="uv_index"
              label="UV EXPOSURE"
              value={currentLocation.uvIndex.toString()}
              unit=""
              icon={<Flame className="w-4 h-4" />}
              deltaType="up"
              deltaLabel="Solar exposure"
              status={currentLocation.uvIndex > 6 ? 'critical' : currentLocation.uvIndex > 3 ? 'high' : 'optimal'}
              onClick={() => inspectProvenance('uv', currentLocation.uvIndex.toString())}
            />
          </CardEntrance>
          <CardEntrance delay={0.4}>
            <MetricCard
              metricKey="canopy_cover"
              label="CANOPY COVER"
              value={currentLocation.canopyCoverage.toString()}
              unit="%"
              icon={<Layers className="w-4 h-4" />}
              status="optimal"
              onClick={() => inspectProvenance('canopy', `${currentLocation.canopyCoverage}%`)}
            />
          </CardEntrance>
          
          <CardEntrance delay={0.5}>
            <MetricCard
              metricKey="wind_speed"
              label="WIND"
              value={normalizedState?.currentConditions?.wind?.value?.speedKmh || 12}
              unit="km/h"
              icon={<Wind className="w-4 h-4" />}
              deltaType="neutral"
              deltaLabel={normalizedState?.currentConditions?.wind?.value?.directionCardinal || 'NW'}
              status="optimal"
              onClick={() => inspectProvenance('wind', `${normalizedState?.currentConditions?.wind?.value?.speedKmh || 12} km/h`)}
            />
          </CardEntrance>
          <CardEntrance delay={0.6}>
            <MetricCard
              metricKey="heat_index"
              label="HEAT STRESS"
              value={normalizedState?.currentConditions?.heatIndex?.value || currentLocation.ambientTemp + 1}
              unit="°C"
              icon={<Thermometer className="w-4 h-4" />}
              delta="+1.2°C/hr"
              deltaType="up"
              deltaLabel="HEAT TREND"
              sparkline={[28, 29, 29.5, 30.2, 31, 31.8, 32.5]}
              category="heat"
              status={currentLocation.ambientTemp > 30 ? 'high' : 'optimal'}
              onClick={() => inspectProvenance('heatIndex', `${normalizedState?.currentConditions?.heatIndex?.value || currentLocation.ambientTemp + 1}°C`)}
            />
          </CardEntrance>
          <CardEntrance delay={0.7}>
            <MetricCard
              metricKey="solar_irradiance"
              label="SOLAR IRRADIANCE"
              value={normalizedState?.currentConditions?.solarIrradiance?.value || 850}
              unit="W/m²"
              icon={<Sun className="w-4 h-4" />}
              deltaType="neutral"
              deltaLabel="GHI Flux"
              status={currentLocation.uvIndex > 6 ? 'high' : 'optimal'}
              onClick={() => inspectProvenance('solar', `${normalizedState?.currentConditions?.solarIrradiance?.value || 850} W/m²`)}
            />
          </CardEntrance>
          <CardEntrance delay={0.8}>
            <MetricCard
              metricKey="dew_point"
              label="DEW POINT"
              value={normalizedState?.currentConditions?.dewPoint?.value || 14}
              unit="°C"
              icon={<Droplets className="w-4 h-4" />}
              deltaType="down"
              deltaLabel="Condensation Pt"
              status="optimal"
              onClick={() => inspectProvenance('dewPoint', `${normalizedState?.currentConditions?.dewPoint?.value || 14}°C`)}
            />
          </CardEntrance>
        </div>

      </FadeIn>
    </PageContainer>
  );
};

export default DashboardView;
