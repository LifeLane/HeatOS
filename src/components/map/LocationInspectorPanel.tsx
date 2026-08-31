/**
 * HeatOS: Environmental Location Inspector
 * 
 * Activated when a user taps a location or hotspot on the Living Environmental Map.
 * Provides:
 * 1. ENVIRONMENTAL SNAPSHOT (Location, Temperature, Heat Anomaly, Air Quality, Wind, Humidity, Environmental Pulse)
 * 2. HEATOS INTELLIGENCE (Concise contextual interpretation)
 * 3. Actions: Explain (AI Analyst), Forecast, Create Alert
 */

import React, { useState } from 'react';
import {
  X,
  MapPin,
  Flame,
  Activity,
  Wind,
  Droplets,
  Sun,
  ShieldAlert,
  Sparkles,
  LineChart,
  Bell,
  Thermometer,
  Trees,
  Compass,
  ArrowUpRight,
  Info,
} from 'lucide-react';
import { MapHotspotNode } from '../../server/map/types';
import { useNavigation } from '../../context/NavigationContext';
import { useAIAnalyst } from '../../context/AIAnalystContext';
import { useExplanation } from '../../context/ExplanationContext';

export interface LocationSnapshotData {
  locationName: string;
  subRegion?: string;
  latitude: number;
  longitude: number;
  temperatureC: number;
  feelsLikeC: number;
  heatAnomalyC: number;
  airQualityAqi: number;
  airQualityStatus: string;
  windSpeedKmh: number;
  windDirection: string;
  humidityPct: number;
  environmentalPulseScore: number;
  environmentalPulseStatus: string;
  solarUvIndex?: number;
  canopyCoveragePct?: number;
  hotspot?: MapHotspotNode | null;
  timeHorizonLabel?: string;
}

interface LocationInspectorPanelProps {
  data: LocationSnapshotData | null;
  onClose: () => void;
  onFlyTo?: (lat: number, lng: number) => void;
}

export const LocationInspectorPanel: React.FC<LocationInspectorPanelProps> = ({
  data,
  onClose,
  onFlyTo,
}) => {
  const { setActiveTab } = useNavigation();
  const { openAIAnalystWithContext } = useAIAnalyst();
  const explanation = useExplanation();

  // Mobile Bottom Sheet State: 'peek' | 'half' | 'expanded'
  const [sheetState, setSheetState] = useState<'peek' | 'half' | 'expanded'>('half');
  const touchStartY = React.useRef<number | null>(null);

  if (!data) return null;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    if (deltaY > 60) {
      // Swiping down
      if (sheetState === 'expanded') setSheetState('half');
      else if (sheetState === 'half') setSheetState('peek');
      else onClose();
    } else if (deltaY < -60) {
      // Swiping up
      if (sheetState === 'peek') setSheetState('half');
      else if (sheetState === 'half') setSheetState('expanded');
    }
    touchStartY.current = null;
  };

  const {
    locationName,
    subRegion,
    latitude,
    longitude,
    temperatureC,
    feelsLikeC,
    heatAnomalyC,
    airQualityAqi,
    airQualityStatus,
    windSpeedKmh,
    windDirection,
    humidityPct,
    environmentalPulseScore,
    environmentalPulseStatus,
    solarUvIndex = 6,
    canopyCoveragePct = 24,
    timeHorizonLabel,
  } = data;

  // Generate concise, mathematically grounded contextual interpretation
  const generateContextualInterpretation = (): string => {
    const anomalyStr =
      heatAnomalyC > 0
        ? `+${heatAnomalyC.toFixed(1)}°C microclimate elevation`
        : `${heatAnomalyC.toFixed(1)}°C cooling buffer`;
    
    if (heatAnomalyC >= 3.0) {
      return `High impervious surface density and limited canopy cover (${canopyCoveragePct}%) are driving a ${anomalyStr} above ambient baseline. Elevated solar irradiance (UV ${solarUvIndex}) combined with low wind dispersion (${windSpeedKmh} km/h) creates localized thermal trapping.`;
    }
    if (heatAnomalyC > 0.5) {
      return `Moderate urban heat island effect with a ${anomalyStr}. Moderate vegetation canopy (${canopyCoveragePct}%) provides partial evaporative buffering, while steady ventilation (${windSpeedKmh} km/h ${windDirection}) mitigates severe stagnant air trapping.`;
    }
    return `Vegetation canopy and permeable terrain provide effective natural cooling, maintaining conditions ${Math.abs(heatAnomalyC).toFixed(1)}°C below paved urban corridors. Atmospheric stability is optimal with ${environmentalPulseScore}/100 environmental pulse.`;
  };

  const contextualInterpretation = generateContextualInterpretation();

  // Action Handlers
  const handleExplain = () => {
    explanation.explainMapLocation({
      locationName,
      latitude,
      longitude,
      temperatureC,
      heatAnomalyC,
      airQualityAqi,
      canopyCoveragePct,
      contextualInterpretation,
    });
  };

  const handleForecast = () => {
    setActiveTab('forecast');
  };

  const handleCreateAlert = () => {
    setActiveTab('alerts');
  };

  // Mobile height styling based on sheetState
  const getMobileHeightClass = () => {
    switch (sheetState) {
      case 'peek':
        return 'h-[175px]';
      case 'expanded':
        return 'h-[82vh]';
      case 'half':
      default:
        return 'h-[48vh]';
    }
  };

  return (
    <div
      id="environmental-location-inspector"
      className={`fixed lg:absolute z-30 inset-x-0 bottom-0 lg:inset-y-0 lg:left-auto lg:right-0 lg:w-[380px] ${getMobileHeightClass()} lg:h-full lg:max-h-full bg-white/95 backdrop-blur-xl border-t lg:border-t-0 lg:border-l border-slate-200/90 shadow-2xl text-slate-900 flex flex-col transition-all duration-300 ease-out`}
    >
      {/* Mobile Sheet Drag Handle & State Controls */}
      <div
        className="pt-2 pb-1 lg:hidden shrink-0 cursor-grab active:cursor-grabbing select-none flex flex-col items-center"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mb-1" />
        <div className="flex items-center gap-1.5 text-[9.5px] font-mono text-slate-400">
          <button
            type="button"
            onClick={() => setSheetState('peek')}
            className={`px-1.5 py-0.5 rounded ${sheetState === 'peek' ? 'bg-slate-200 font-bold text-slate-800' : 'hover:text-slate-600'}`}
          >
            Peek
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => setSheetState('half')}
            className={`px-1.5 py-0.5 rounded ${sheetState === 'half' ? 'bg-slate-200 font-bold text-slate-800' : 'hover:text-slate-600'}`}
          >
            Half
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => setSheetState('expanded')}
            className={`px-1.5 py-0.5 rounded ${sheetState === 'expanded' ? 'bg-slate-200 font-bold text-slate-800' : 'hover:text-slate-600'}`}
          >
            Expand
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="px-4 sm:px-5 py-2.5 sm:py-3.5 border-b border-slate-100 flex items-start justify-between gap-3 shrink-0">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5 sm:mb-1">
            <span className="p-1 rounded-md bg-blue-50 text-blue-600">
              <MapPin className="w-3.5 h-3.5" />
            </span>
            <span className="text-[10.5px] font-mono font-bold tracking-wider text-slate-500 uppercase">
              {timeHorizonLabel ? `${timeHorizonLabel} PROJECTION` : 'LIVE INSPECTOR'}
            </span>
          </div>
          <h2 className="text-sm sm:text-base font-black text-slate-900 leading-snug truncate">
            {locationName}
          </h2>
          <div className="text-[10px] sm:text-[11px] font-mono text-slate-500">
            {latitude.toFixed(4)}°N, {Math.abs(longitude).toFixed(4)}°{longitude < 0 ? 'W' : 'E'}
            {subRegion && ` • ${subRegion}`}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            id="close-location-inspector-btn"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close Inspector"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="px-5 py-4 space-y-4 overflow-y-auto flex-1 no-scrollbar">
        {/* SECTION 1: ENVIRONMENTAL SNAPSHOT */}
        <div>
          <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center justify-between">
            <span>ENVIRONMENTAL SNAPSHOT</span>
            <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
              FortyGuard Mesh
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {/* 1. Temperature */}
            <div
              onClick={() => explanation.explainMetric('ambientTemp', `${temperatureC.toFixed(1)}°C`)}
              className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 hover:border-blue-300 transition-all cursor-pointer group"
              title="Click to explain temperature provenance"
            >
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span className="group-hover:text-blue-600 font-medium">Temperature</span>
                <Thermometer className="w-3.5 h-3.5 text-orange-500" />
              </div>
              <div className="text-xl font-mono font-black text-slate-900 group-hover:text-blue-700">
                {temperatureC.toFixed(1)}°C
              </div>
              <div className="text-[11px] font-semibold text-slate-500 mt-0.5">
                Feels like {feelsLikeC.toFixed(1)}°C
              </div>
            </div>

            {/* 2. Heat Anomaly */}
            <div
              onClick={() => explanation.explainMetric('surfaceHeatAnomaly', `${heatAnomalyC >= 0 ? '+' : ''}${heatAnomalyC.toFixed(1)}°C`)}
              className="p-3 rounded-2xl bg-orange-50/60 hover:bg-orange-50 border border-orange-200/80 hover:border-orange-300 transition-all cursor-pointer group"
              title="Click to explain heat island provenance"
            >
              <div className="flex items-center justify-between text-xs text-orange-700 mb-1">
                <span className="font-semibold">Heat Anomaly</span>
                <Flame className="w-3.5 h-3.5 text-orange-600" />
              </div>
              <div className="text-xl font-mono font-black text-orange-950 group-hover:text-orange-700">
                {heatAnomalyC >= 0 ? `+${heatAnomalyC.toFixed(1)}°C` : `${heatAnomalyC.toFixed(1)}°C`}
              </div>
              <div className="text-[11px] font-semibold text-orange-800 mt-0.5">
                {heatAnomalyC > 2.5 ? 'High UHI Elevation' : 'Baseline Corridor'}
              </div>
            </div>

            {/* 3. Air Quality */}
            <div
              onClick={() => explanation.explainMetric('airQuality', `AQI ${airQualityAqi}`)}
              className="p-3 rounded-2xl bg-teal-50/60 hover:bg-teal-50 border border-teal-200/80 hover:border-teal-300 transition-all cursor-pointer group"
              title="Click to explain air quality provenance"
            >
              <div className="flex items-center justify-between text-xs text-teal-700 mb-1">
                <span className="font-semibold">Air Quality</span>
                <Activity className="w-3.5 h-3.5 text-teal-600" />
              </div>
              <div className="text-xl font-mono font-black text-teal-950 group-hover:text-teal-700">
                {airQualityAqi} <span className="text-xs font-normal text-teal-700">AQI</span>
              </div>
              <div className="text-[11px] font-semibold text-teal-800 mt-0.5">
                {airQualityStatus}
              </div>
            </div>

            {/* 4. Wind */}
            <div
              onClick={() => explanation.explainMetric('wind', `${windSpeedKmh} km/h ${windDirection}`)}
              className="p-3 rounded-2xl bg-blue-50/60 hover:bg-blue-50 border border-blue-200/80 hover:border-blue-300 transition-all cursor-pointer group"
              title="Click to explain wind provenance"
            >
              <div className="flex items-center justify-between text-xs text-blue-700 mb-1">
                <span className="font-semibold">Wind</span>
                <Wind className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="text-xl font-mono font-black text-blue-950 group-hover:text-blue-700">
                {windSpeedKmh} <span className="text-xs font-normal text-blue-700">km/h</span>
              </div>
              <div className="text-[11px] font-semibold text-blue-800 mt-0.5">
                {windDirection} Flow
              </div>
            </div>

            {/* 5. Humidity */}
            <div
              onClick={() => explanation.explainMetric('humidity', `${humidityPct}%`)}
              className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 hover:border-blue-300 transition-all cursor-pointer group"
              title="Click to explain humidity provenance"
            >
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span className="group-hover:text-blue-600 font-medium">Humidity</span>
                <Droplets className="w-3.5 h-3.5 text-cyan-600" />
              </div>
              <div className="text-xl font-mono font-black text-slate-900 group-hover:text-blue-700">
                {humidityPct}%
              </div>
              <div className="text-[11px] font-semibold text-slate-500 mt-0.5">
                Relative Humidity
              </div>
            </div>

            {/* 6. Environmental Pulse */}
            <div
              onClick={() => explanation.explainMetric('pulse', `${environmentalPulseScore}/100`)}
              className="p-3 rounded-2xl bg-emerald-50/60 hover:bg-emerald-50 border border-emerald-200/80 hover:border-emerald-300 transition-all cursor-pointer group"
              title="Click to explain environmental pulse methodology"
            >
              <div className="flex items-center justify-between text-xs text-emerald-700 mb-1">
                <span className="font-semibold">Env. Pulse</span>
                <Trees className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-mono font-black text-emerald-950 group-hover:text-emerald-700">
                {environmentalPulseScore} <span className="text-xs font-normal text-emerald-700">/100</span>
              </div>
              <div className="text-[11px] font-semibold text-emerald-800 mt-0.5 uppercase">
                {environmentalPulseStatus}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: HEATOS INTELLIGENCE */}
        <div
          onClick={() =>
            explanation.explainAIInsight(
              `${locationName} Microclimate Thermal Analysis`,
              contextualInterpretation,
              [
                `Ambient Temperature: ${temperatureC.toFixed(1)}°C`,
                `Surface Anomaly: ${heatAnomalyC >= 0 ? '+' : ''}${heatAnomalyC.toFixed(1)}°C`,
                `Canopy Cover: ${canopyCoveragePct}%`,
                `Solar UV Index: ${solarUvIndex}`,
                `Ventilation: ${windSpeedKmh} km/h ${windDirection}`,
              ]
            )
          }
          className="p-3.5 rounded-2xl bg-slate-900 text-white shadow-md border border-slate-800 space-y-2 hover:border-purple-500/50 transition-all cursor-pointer group"
          title="Click to inspect AI synthesis methodology & provenance"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-400">
              <Sparkles className="w-3.5 h-3.5 text-purple-400 group-hover:rotate-12 transition-transform" />
              <span>HEATOS INTELLIGENCE</span>
            </div>
            <span className="text-[9px] font-mono font-bold text-purple-300 bg-purple-900/60 px-1.5 py-0.5 rounded border border-purple-700/50">
              CLICK TO EXPLAIN
            </span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed font-normal">
            {contextualInterpretation}
          </p>
        </div>

        {/* SECTION 3: ACTIONS */}
        <div className="space-y-2 pt-1">
          <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
            ACTIONS
          </div>
          <div className="grid grid-cols-3 gap-2">
            {/* Explain (AI Analyst) */}
            <button
              id="inspector-action-explain-btn"
              type="button"
              onClick={handleExplain}
              className="px-3 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex flex-col items-center justify-center gap-1 shadow-xs active:scale-95 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Explain</span>
            </button>

            {/* Outlook */}
            <button
              id="inspector-action-forecast-btn"
              type="button"
              onClick={handleForecast}
              className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex flex-col items-center justify-center gap-1 border border-slate-200/80 active:scale-95 transition-all cursor-pointer"
            >
              <LineChart className="w-3.5 h-3.5 text-orange-600" />
              <span>Outlook</span>
            </button>

            {/* Create Alert */}
            <button
              id="inspector-action-alert-btn"
              type="button"
              onClick={handleCreateAlert}
              className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex flex-col items-center justify-center gap-1 border border-slate-200/80 active:scale-95 transition-all cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5 text-rose-600" />
              <span>Create Alert</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationInspectorPanel;
