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
    if (currentLocation.ambientTemp > 35) return 'Extreme Solar Load';
    if (currentLocation.ambientTemp > 30) return 'Elevated Thermal Load';
    if (currentLocation.ambientTemp > 24) return 'Comfortable Living State';
    return 'Temperate Baseline';
  };

  const getConditionColor = () => {
    if (currentLocation.ambientTemp > 35) return 'text-red-600 bg-red-50 border-red-200';
    if (currentLocation.ambientTemp > 30) return 'text-orange-600 bg-orange-50 border-orange-200';
    if (currentLocation.ambientTemp > 24) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    return 'text-blue-600 bg-blue-50 border-blue-200';
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
              CURRENT ENVIRONMENT
            </h1>
            
            <div className="flex flex-col items-center mb-6">
              <div className="text-7xl md:text-8xl font-black tracking-tighter text-slate-900 mb-2 font-mono">
                {formatTemp(currentLocation.ambientTemp)}
              </div>
              <div className="text-lg md:text-xl font-medium text-slate-500 mb-6 font-mono">
                Feels like {formatTemp(currentLocation.apparentTemp)}
              </div>
              <div className={`px-4 py-2 rounded-full border text-sm font-bold ${getConditionColor()}`}>
                Status: {getConditionText()}
              </div>
            </div>

            {/* KEY INTELLIGENCE */}
            <div className="w-full max-w-2xl bg-slate-50 rounded-xl p-6 border border-slate-100 mb-8 space-y-3">
              <div className="flex items-center justify-center gap-2 text-slate-700 font-medium">
                <TrendingUp className="w-5 h-5 text-orange-500" />
                <span>Thermal peak approaching between 14:00–17:00.</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-slate-700 font-medium">
                <Flame className="w-5 h-5 text-red-500" />
                <span>Urban heat anomaly: +{currentLocation.surfaceHeatAnomaly.toFixed(1)}°C</span>
              </div>
            </div>

            {/* PRIMARY ACTIONS */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
              <button
                onClick={() => setActiveTab('navigation')}
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold transition-all shadow-xs flex items-center justify-center gap-2"
              >
                <MapIcon className="w-5 h-5" />
                <span>Explore Living Map</span>
              </button>
              <button
                onClick={handleAskHeatOS}
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all shadow-xs flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5 text-blue-300" />
                <span>Ask HeatOS</span>
              </button>
            </div>
            
            {/* HACKATHON QUICK LINKS */}
            <div className="mt-8 pt-6 border-t border-slate-100 w-full max-w-3xl">
              <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4">FortyGuard Hackathon Features</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  onClick={() => {
                    setActiveTab('tools');
                    openTool('cool-route-navigation', 'EXPLORE');
                  }}
                  className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-colors flex flex-col items-center text-center gap-2"
                >
                  <MapIcon className="w-5 h-5 text-blue-600" />
                  <span className="text-xs font-bold text-slate-700">CoolRoute</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab('tools');
                    openTool('urban-heat-sandbox', 'EXPLORE');
                  }}
                  className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-emerald-50 hover:border-emerald-200 transition-colors flex flex-col items-center text-center gap-2"
                >
                  <Layers className="w-5 h-5 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-700">Mitigation Simulator</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab('tools');
                    openTool('vulnerability-alert-system', 'MONITOR');
                  }}
                  className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-rose-50 hover:border-rose-200 transition-colors flex flex-col items-center text-center gap-2"
                >
                  <Activity className="w-5 h-5 text-rose-600" />
                  <span className="text-xs font-bold text-slate-700">Vulnerability Alerts</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab('tools');
                    openTool('heat-action-plan', 'ACT');
                  }}
                  className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-amber-50 hover:border-amber-200 transition-colors flex flex-col items-center text-center gap-2"
                >
                  <Flame className="w-5 h-5 text-amber-600" />
                  <span className="text-xs font-bold text-slate-700">Heat Action Plans</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* COMPACT METRICS GRID */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <CardEntrance delay={0.1}>
            <MetricCard
              label="Air Quality"
              value={currentLocation.aqi.toString()}
              unit="AQI"
              icon={<Wind className="w-4 h-4" />}
              deltaType="neutral"
              deltaLabel={normalizedState?.currentConditions?.airQuality?.value?.category || 'PM2.5 normal'}
              status={currentLocation.aqi > 50 ? 'warning' : 'optimal'}
              onClick={() => inspectProvenance('airQuality', currentLocation.aqi.toString())}
            />
          </CardEntrance>
          <CardEntrance delay={0.2}>
            <MetricCard
              label="Humidity"
              value={currentLocation.humidity.toString()}
              unit="%"
              icon={<Activity className="w-4 h-4" />}
              deltaType="down"
              status={currentLocation.humidity > 60 ? 'high' : 'optimal'}
              onClick={() => inspectProvenance('humidity', `${currentLocation.humidity}%`)}
            />
          </CardEntrance>
          <CardEntrance delay={0.3}>
            <MetricCard
              label="UV Index"
              value={currentLocation.uvIndex.toString()}
              unit=""
              icon={<Flame className="w-4 h-4" />}
              deltaType="up"
              deltaLabel="High solar load"
              status={currentLocation.uvIndex > 6 ? 'critical' : currentLocation.uvIndex > 3 ? 'high' : 'optimal'}
              onClick={() => inspectProvenance('uv', currentLocation.uvIndex.toString())}
            />
          </CardEntrance>
          <CardEntrance delay={0.4}>
            <MetricCard
              label="Canopy Cover"
              value={currentLocation.canopyCoverage.toString()}
              unit="%"
              icon={<Layers className="w-4 h-4" />}
              status="optimal"
              onClick={() => inspectProvenance('canopy', `${currentLocation.canopyCoverage}%`)}
            />
          </CardEntrance>
          
          <CardEntrance delay={0.5}>
            <MetricCard
              label="Wind Speed"
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
              label="Heat Index"
              value={normalizedState?.currentConditions?.heatIndex?.value || currentLocation.ambientTemp + 1}
              unit="°C"
              icon={<Thermometer className="w-4 h-4" />}
              deltaType="up"
              deltaLabel="Feels like"
              status={currentLocation.ambientTemp > 30 ? 'high' : 'optimal'}
              onClick={() => inspectProvenance('heatIndex', `${normalizedState?.currentConditions?.heatIndex?.value || currentLocation.ambientTemp + 1}°C`)}
            />
          </CardEntrance>
          <CardEntrance delay={0.7}>
            <MetricCard
              label="Solar Irradiance"
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
              label="Dew Point"
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
