/**
 * HeatOS: Map Sidebar & Details Panel
 * Desktop: sleek right-side / left-side collapsible multi-tab operational dashboard.
 * Mobile: responsive bottom sheet / drawer with touch gestures.
 * Provides Overview, Active Alerts & Anomalies, Nature Route Planner, and FortyGuard Analytics.
 */

import React, { useState } from 'react';
import {
  Layers,
  Flame,
  AlertTriangle,
  Trees,
  Wind,
  Droplets,
  Sun,
  ShieldAlert,
  Navigation as NavIcon,
  Sparkles,
  Wrench,
  Eye,
  LineChart,
  X,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Thermometer,
  Activity,
  CheckCircle2,
  Compass,
  Radio,
  Clock,
  Info,
  Maximize2,
} from 'lucide-react';
import { MapLayerKey, MapLayerData, MapHotspotNode } from '../../server/map/types';
import { EnvironmentalEvent } from '../../server/events/types';
import { NatureRoutePlanner } from './NatureRoutePlanner';
import { NatureRouteOption } from './natureRouting';
import { useAIAnalyst } from '../../context/AIAnalystContext';
import { useNavigation } from '../../context/NavigationContext';

export type SidebarTabKey = 'overview' | 'alerts' | 'routes' | 'fortyguard';

interface MapSidebarPanelProps {
  locationName: string;
  country?: string;
  latitude: number;
  longitude: number;
  tempC?: number;
  feelsLikeC?: number;
  heatRiskScore?: number;
  pulseScore?: number;
  pulseStatus?: string;
  activeLayer: MapLayerKey;
  layerData?: MapLayerData;
  activeAlerts: EnvironmentalEvent[];
  selectedHotspot?: MapHotspotNode | null;
  selectedAlert?: EnvironmentalEvent | null;
  selectedRoute: NatureRouteOption | null;
  isOpen: boolean;
  onToggleOpen: () => void;
  onSelectRoute: (route: NatureRouteOption | null) => void;
  onSelectAlert: (alert: EnvironmentalEvent) => void;
  onSelectHotspot: (hotspot: MapHotspotNode) => void;
  onFlyTo: (lat: number, lng: number) => void;
}

export const MapSidebarPanel: React.FC<MapSidebarPanelProps> = ({
  locationName,
  country,
  latitude,
  longitude,
  tempC = 27.2,
  feelsLikeC = 29.4,
  heatRiskScore = 52,
  pulseScore = 78,
  pulseStatus = 'STABLE',
  activeLayer,
  layerData,
  activeAlerts,
  selectedHotspot,
  selectedAlert,
  selectedRoute,
  isOpen,
  onToggleOpen,
  onSelectRoute,
  onSelectAlert,
  onSelectHotspot,
  onFlyTo,
}) => {
  const [activeTab, setActiveTab] = useState<SidebarTabKey>('overview');
  const { openAIAnalystWithContext } = useAIAnalyst();
  const { setActiveTab: setAppTab, openTool } = useNavigation();

  const handleAskAI = (contextPrompt?: string) => {
    openAIAnalystWithContext({
      prompt:
        contextPrompt ||
        `Provide an environmental and thermal resilience assessment for ${locationName} (${latitude.toFixed(4)}°N, ${Math.abs(longitude).toFixed(4)}°W). Current temperature is ${tempC}°C, Heat Risk score is ${heatRiskScore}/100, and Nature Pulse is ${pulseScore}/100. Recommend shade corridors, green infrastructure improvements, and safe activity windows.`,
      topic: `${locationName} Environmental Intelligence`,
      location: locationName,
    });
  };

  return (
    <>
      {/* Desktop Toggle Button when closed */}
      {!isOpen && (
        <button
          type="button"
          onClick={onToggleOpen}
          className="hidden lg:flex absolute right-4 top-20 z-20 px-3.5 py-2 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-800/90 text-slate-200 hover:text-white shadow-2xl items-center gap-2 text-xs font-bold transition-all cursor-pointer"
        >
          <Layers className="w-4 h-4 text-blue-400" />
          <span>Location Details & Routes</span>
          <ChevronLeft className="w-4 h-4 text-slate-400" />
        </button>
      )}

      {/* Main Container */}
      <div
        id="map-sidebar-panel"
        className={`fixed lg:absolute z-30 inset-x-0 bottom-0 lg:inset-y-0 lg:left-auto lg:right-0 lg:w-[420px] max-h-[85vh] lg:max-h-full bg-slate-900/95 backdrop-blur-xl border-t lg:border-t-0 lg:border-l border-slate-800 shadow-2xl text-slate-100 flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? 'translate-y-0 lg:translate-x-0' : 'translate-y-full lg:translate-x-full'
        }`}
      >
        {/* Drag handle for mobile */}
        <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto my-2.5 lg:hidden shrink-0" />

        {/* Header with Title & Tabs */}
        <div className="px-4 py-3.5 border-b border-slate-800/80 shrink-0">
          <div className="flex items-start justify-between gap-3 mb-2.5">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-blue-400 uppercase tracking-wider mb-0.5">
                <MapPin className="w-3.5 h-3.5" />
                <span>{country ? `${locationName}, ${country}` : 'Environmental Telemetry Node'}</span>
              </div>
              <h2 className="text-base font-black text-slate-100 truncate leading-snug">
                {locationName}
              </h2>
              <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                {latitude.toFixed(4)}°N, {Math.abs(longitude).toFixed(4)}°{longitude < 0 ? 'W' : 'E'}
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => handleAskAI()}
                className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer shadow-md"
                title="Ask Nature Analyst AI"
              >
                <Sparkles className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onToggleOpen}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Close sidebar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="grid grid-cols-4 gap-1 p-1 bg-slate-950/80 rounded-xl border border-slate-800/80 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`py-1.5 px-2 rounded-lg font-bold transition-all text-center truncate cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Overview
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('alerts')}
              className={`py-1.5 px-2 rounded-lg font-bold transition-all text-center flex items-center justify-center gap-1 truncate cursor-pointer ${
                activeTab === 'alerts'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Alerts</span>
              {activeAlerts.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-mono">
                  {activeAlerts.length}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('routes')}
              className={`py-1.5 px-2 rounded-lg font-bold transition-all text-center flex items-center justify-center gap-1 truncate cursor-pointer ${
                activeTab === 'routes'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Trees className="w-3.5 h-3.5" />
              <span>Routes</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('fortyguard')}
              className={`py-1.5 px-2 rounded-lg font-bold transition-all text-center truncate cursor-pointer ${
                activeTab === 'fortyguard'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              FortyGuard
            </button>
          </div>
        </div>

        {/* Scrollable Tab Body */}
        <div className="px-4 py-4 space-y-4 overflow-y-auto flex-1 no-scrollbar text-sm">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Primary Metric Tiles */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 shadow-lg">
                  <div className="flex items-center justify-between text-xs text-orange-400 font-medium mb-1">
                    <span>Ambient Thermal</span>
                    <Thermometer className="w-4 h-4 text-orange-400" />
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black font-mono tracking-tight text-white">
                      {tempC.toFixed(1)}°
                    </span>
                    <span className="text-xs font-bold text-slate-400">C</span>
                  </div>
                  <div className="text-[11px] font-bold text-orange-300 mt-1">
                    Feels like {feelsLikeC.toFixed(1)}°C
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 shadow-lg">
                  <div className="flex items-center justify-between text-xs text-purple-400 font-medium mb-1">
                    <span>Nature Pulse</span>
                    <Activity className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black font-mono tracking-tight text-purple-200">
                      {pulseScore}
                    </span>
                    <span className="text-xs text-purple-400 font-mono">/100</span>
                  </div>
                  <div className="text-[11px] font-bold text-purple-300 mt-1 uppercase tracking-wider">
                    {pulseStatus}
                  </div>
                </div>
              </div>

              {/* Heat Vulnerability & Risk Index */}
              <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2.5 shadow-lg">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200">Heat Stress Vulnerability</span>
                  <span
                    className={`font-mono font-black text-xs px-2 py-0.5 rounded-full ${
                      heatRiskScore > 75
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : heatRiskScore > 50
                        ? 'bg-orange-950 text-orange-300 border border-orange-800'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}
                  >
                    {heatRiskScore}/100 • {heatRiskScore > 75 ? 'CRITICAL' : heatRiskScore > 50 ? 'HIGH' : 'SAFE'}
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      heatRiskScore > 75
                        ? 'bg-gradient-to-r from-orange-500 to-rose-600'
                        : heatRiskScore > 50
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                        : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                    }`}
                    style={{ width: `${heatRiskScore}%` }}
                  />
                </div>
                <div className="text-[11px] text-slate-400 leading-relaxed">
                  Synthesized from FortyGuard surface temperature mesh, solar radiant load, urban canopy deficit, and prevailing ventilation channels.
                </div>
              </div>

              {/* Selected Hotspot Details */}
              {selectedHotspot && (
                <div className="p-3.5 rounded-2xl bg-orange-950/40 border border-orange-800/60 space-y-2">
                  <div className="flex items-center justify-between text-xs text-orange-300 font-bold">
                    <span className="flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-orange-400" />
                      Active Hotspot: {selectedHotspot.name}
                    </span>
                    <span className="font-mono font-black">{selectedHotspot.primaryValue}{selectedHotspot.primaryUnit}</span>
                  </div>
                  <div className="text-xs text-slate-300">
                    {selectedHotspot.topChangeDescription}
                  </div>
                </div>
              )}

              {/* Data Provenance & Freshness */}
              <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-800 text-xs space-y-1.5">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Environmental Fabric:</span>
                  <span className="font-bold text-slate-200 truncate">FortyGuard Microclimate Mesh</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Data Freshness:</span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800">
                    <Radio className="w-2.5 h-2.5 animate-pulse text-emerald-400" />
                    LIVE TELEMETRY
                  </span>
                </div>
              </div>

              {/* Quick Operation Triggers */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleAskAI()}
                  className="p-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Ask HeatOS</span>
                </button>
                <button
                  type="button"
                  onClick={() => openTool('heat-risk-analyzer', 'heat_analytics')}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700 active:scale-95 transition-all cursor-pointer"
                >
                  <Wrench className="w-4 h-4 text-blue-400" />
                  <span>Run Diagnostics</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: ALERTS & ANOMALIES */}
          {activeTab === 'alerts' && (
            <div className="space-y-3">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Active Environmental Anomalies</span>
                <span className="text-rose-400 font-mono">{activeAlerts.length} Recorded</span>
              </div>

              {activeAlerts.length === 0 ? (
                <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 text-center text-xs text-slate-400">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                  No severe environmental anomalies active in this immediate spatial radius.
                </div>
              ) : (
                activeAlerts.map((alert) => {
                  const alertLat = alert.location?.latitude ?? (alert as any).spatialContext?.latitude ?? latitude;
                  const alertLng = alert.location?.longitude ?? (alert as any).spatialContext?.longitude ?? longitude;
                  const alertHeadline = alert.summary?.headline || (alert as any).title || 'Environmental Anomaly';
                  const alertDescription =
                    alert.summary?.whatChanged ||
                    alert.summary?.why ||
                    (alert as any).description ||
                    alert.impact?.healthRisk ||
                    'Active anomaly signal registered.';
                  const alertRadius = alert.location?.radiusMeters || (alert as any).spatialContext?.radiusMeters || 500;
                  const isCritical = alert.severity?.toLowerCase() === 'critical' || alert.severity === 'HIGH';

                  return (
                    <div
                      key={alert.id}
                      onClick={() => {
                        onSelectAlert(alert);
                        onFlyTo(alertLat, alertLng);
                      }}
                      className="p-3.5 rounded-2xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/70 hover:border-rose-500/80 transition-all cursor-pointer space-y-2 shadow-md"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                              isCritical ? 'bg-rose-500 animate-ping' : 'bg-amber-500'
                            }`}
                          />
                          <span className="font-bold text-xs text-slate-100">
                            {alertHeadline}
                          </span>
                        </div>
                        <span
                          className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase ${
                            isCritical
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}
                        >
                          {alert.severity}
                        </span>
                      </div>

                      <div className="text-xs text-slate-300 leading-relaxed">
                        {alertDescription}
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-700/60">
                        <span>Radius: {alertRadius}m</span>
                        <span className="text-rose-400 font-bold">Fly to Marker →</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 3: NATURE-FRIENDLY ROUTES & TRIP PLANNING */}
          {activeTab === 'routes' && (
            <NatureRoutePlanner
              currentLocationName={locationName}
              latitude={latitude}
              longitude={longitude}
              currentTempC={tempC}
              selectedRoute={selectedRoute}
              onSelectRoute={onSelectRoute}
              onFlyToDestination={onFlyTo}
            />
          )}

          {/* TAB 4: FORTYGUARD ANALYTICS */}
          {activeTab === 'fortyguard' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-purple-950/30 border border-purple-800/60 space-y-2">
                <div className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-purple-400" />
                  FortyGuard Microclimate Sensor Grid
                </div>
                <div className="text-xs text-slate-300 leading-relaxed">
                  Sub-meter urban resolution model calibrated with ambient sensors, satellite radiometric channels, and albedo analysis.
                </div>
              </div>

              {layerData?.statistics && (
                <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
                  <div className="text-xs font-bold text-slate-200">Layer Thermal Bounds</div>
                  <div className="grid grid-cols-3 gap-2 text-center font-mono text-xs">
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-[10px] text-slate-400">Min</div>
                      <div className="font-bold text-emerald-400">{layerData.statistics.min}{layerData.statistics.unit}</div>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-[10px] text-slate-400">Mean</div>
                      <div className="font-bold text-amber-400">{layerData.statistics.mean}{layerData.statistics.unit}</div>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-[10px] text-slate-400">Max</div>
                      <div className="font-bold text-rose-400">{layerData.statistics.max}{layerData.statistics.unit}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
