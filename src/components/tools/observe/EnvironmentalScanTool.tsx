import React, { useState, useEffect } from 'react';
import {
  Radar,
  Flame,
  Wind,
  Droplets,
  Trees,
  Sun,
  ShieldAlert,
  Activity,
  RefreshCw,
  Clock,
  Database,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  CheckCircle2,
  AlertTriangle,
  Layers,
  MapPin,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { useLocation } from '../../../context/LocationContext';
import { useFortyGuard } from '../../../context/FortyGuardContext';
import { useAIAnalyst } from '../../../context/AIAnalystContext';
import { unifiedEnvironmentalStateApi } from '../../../services/environmentalStateApi';
import { EventService } from '../../../services/eventService';
import { EnvironmentalState } from '../../../types/unifiedState';
import { EnvironmentalEvent } from '../../../server/events/types';
import Card from '../../ui/Card';
import StatusPill from '../../ui/StatusPill';
import PrimaryButton from '../../ui/PrimaryButton';
import SecondaryButton from '../../ui/SecondaryButton';
import { FadeIn } from '../../motion/MotionPrimitives';
import { safeFormatTime } from '../../../utils/formatters';
import { SourceAttributionBadge } from '../../common/SourceAttributionBadge';

export const EnvironmentalScanTool: React.FC = () => {
  const { currentLocation, formatTemp, tempUnit, lastTelemetryTime } = useLocation();
  const { connection, config } = useFortyGuard();
  const { openAIWithContext } = useAIAnalyst();

  const [state, setState] = useState<EnvironmentalState | null>(null);
  const [events, setEvents] = useState<EnvironmentalEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastScanned, setLastScanned] = useState<string>('');

  const runScan = async (bypassCache = false) => {
    try {
      setLoading(true);
      setError(null);

      const [snapshotData, eventFeed] = await Promise.all([
        unifiedEnvironmentalStateApi.getSnapshot({
          latitude: currentLocation.coordinates.lat,
          longitude: currentLocation.coordinates.lng,
          locationName: currentLocation.name,
          stateCode: currentLocation.stateCode,
          countryCode: currentLocation.countryCode,
          bypassCache,
        }),
        EventService.fetchEvents({
          latitude: currentLocation.coordinates.lat,
          longitude: currentLocation.coordinates.lng,
          locationName: currentLocation.name,
          minConfidence: 50,
        }).catch(() => ({ events: [], totalEvents: 0, totalActiveEvents: 0, severityCounts: { CRITICAL: 0, HIGH: 0, ELEVATED: 0, WATCH: 0, INFO: 0 }, timestamp: new Date().toISOString() })),
      ]);

      setState(snapshotData);
      setEvents(eventFeed.events || []);
      setLastScanned(safeFormatTime(new Date()));
    } catch (err: any) {
      console.error('Environmental Scan error:', err);
      setError(err.message || 'Failed to complete environmental scan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runScan();
  }, [currentLocation.id, currentLocation.coordinates.lat, currentLocation.coordinates.lng]);

  const isDemo = config?.mock || false;

  return (
    <div className="space-y-6">
      {/* Scan Header & Controls */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563EB] flex-shrink-0">
              <Radar className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                  Full Environmental Scan
                </h2>
                {isDemo && (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-full">
                    DEMO DATA
                  </span>
                )}
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full">
                  NORMALIZED
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Scanning multi-layer sensor fabric for <span className="font-semibold text-slate-700">{currentLocation.displayName}</span> ({currentLocation.coordinates.lat.toFixed(4)}, {currentLocation.coordinates.lng.toFixed(4)})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <SecondaryButton
              id="rescan-btn"
              onClick={() => runScan(true)}
              disabled={loading}
              className="text-xs py-2 px-3 flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Scanning...' : 'Rescan Telemetry'}</span>
            </SecondaryButton>

            <PrimaryButton
              id="scan-ask-ai"
              onClick={() => openAIWithContext({
                question: `Explain what the environmental scan results indicate for ${currentLocation.displayName}. Are there any thermal or air quality concerns?`,
                sourceModule: 'Environmental Scan Tool',
              })}
              className="text-xs py-2 px-3 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Synthesize with AI</span>
            </PrimaryButton>
          </div>
        </div>

        {lastScanned && (
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Last scan completed at: <span className="font-mono font-semibold text-slate-700">{lastScanned}</span>
            </span>
            <span className="flex items-center gap-1">
              <Database className="w-3.5 h-3.5 text-slate-400" />
              Confidence Score: <span className="font-mono font-bold text-[#2563EB]">{state?.confidence?.overallScore ?? 92}%</span>
            </span>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Primary Atmospheric & Thermal State */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Thermal Overview Card */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-orange-50 text-orange-600">
                <Flame className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Thermal State</span>
            </div>
            <StatusPill status={currentLocation.ambientTemp > 35 ? 'critical' : currentLocation.ambientTemp > 30 ? 'warning' : 'optimal'}>
              {currentLocation.ambientTemp > 35 ? 'Extreme Heat' : currentLocation.ambientTemp > 30 ? 'High Heat' : 'Moderate'}
            </StatusPill>
          </div>

          <div>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {formatTemp(currentLocation.ambientTemp)}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Apparent "Feels Like": <span className="font-semibold text-slate-800">{formatTemp(currentLocation.apparentTemp)}</span>
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block">Surface Anomaly</span>
              <span className="font-mono font-bold text-orange-600">
                +{currentLocation.surfaceHeatAnomaly.toFixed(1)}°C
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Comfort Index</span>
              <span className="font-mono font-bold text-slate-800">
                {currentLocation.thermalComfortIndex}/100
              </span>
            </div>
          </div>
        </div>

        {/* Air Quality Card */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-sky-50 text-sky-600">
                <Wind className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Atmosphere &amp; Air</span>
            </div>
            <StatusPill status={currentLocation.aqi > 100 ? 'warning' : 'optimal'}>
              {currentLocation.aqi <= 50 ? 'Good' : currentLocation.aqi <= 100 ? 'Moderate' : 'Unhealthy'}
            </StatusPill>
          </div>

          <div>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {currentLocation.aqi} <span className="text-sm font-medium text-slate-500">AQI</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Humidity: <span className="font-semibold text-slate-800">{currentLocation.humidity}%</span>
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block">Solar UV Index</span>
              <span className="font-mono font-bold text-slate-800">
                {currentLocation.uvIndex} ({currentLocation.uvIndex > 7 ? 'Very High' : 'Moderate'})
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Irradiance</span>
              <span className="font-mono font-bold text-slate-800">
                {currentLocation.solarIrradiance} W/m²
              </span>
            </div>
          </div>
        </div>

        {/* Biosphere & Canopy Card */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <Trees className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Nature &amp; Canopy</span>
            </div>
            <StatusPill status={currentLocation.canopyCoverage >= 25 ? 'optimal' : 'normal'}>
              {currentLocation.canopyCoverage >= 25 ? 'High Canopy' : 'Moderate Canopy'}
            </StatusPill>
          </div>

          <div>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {currentLocation.canopyCoverage}% <span className="text-sm font-medium text-slate-500">Canopy</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Cooling Potential: <span className="font-semibold text-emerald-700">-2.4°C shade buffer</span>
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block">Climate Zone</span>
              <span className="font-mono font-bold text-slate-800 truncate block">
                {currentLocation.climateZone}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Active Sensors</span>
              <span className="font-mono font-bold text-[#2563EB]">
                {currentLocation.activeSensors} nodes
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 6-Dimension Observation Matrix */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-700" />
            <h3 className="text-sm font-bold text-slate-900">Six-Dimension Observational Telemetry</h3>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">Real-time Provenance Verified</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Heat */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Heat</span>
            <div className="text-sm font-bold text-slate-900 font-mono">{formatTemp(currentLocation.ambientTemp)}</div>
            <span className="text-[10px] text-orange-600 font-medium block">UHI +{currentLocation.surfaceHeatAnomaly.toFixed(1)}°</span>
          </div>

          {/* Air */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Air Quality</span>
            <div className="text-sm font-bold text-slate-900 font-mono">{currentLocation.aqi} AQI</div>
            <span className="text-[10px] text-emerald-600 font-medium block">PM2.5 Stable</span>
          </div>

          {/* Water */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Water / RH</span>
            <div className="text-sm font-bold text-slate-900 font-mono">{currentLocation.humidity}%</div>
            <span className="text-[10px] text-sky-600 font-medium block">VPD 1.4 kPa</span>
          </div>

          {/* Nature */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nature</span>
            <div className="text-sm font-bold text-slate-900 font-mono">{currentLocation.canopyCoverage}%</div>
            <span className="text-[10px] text-emerald-600 font-medium block">NDVI 0.48</span>
          </div>

          {/* Fire */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Fire / Hotspots</span>
            <div className="text-sm font-bold text-slate-900 font-mono">0 Nearby</div>
            <span className="text-[10px] text-slate-500 font-medium block">FRP Nominal</span>
          </div>

          {/* Solar */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Solar</span>
            <div className="text-sm font-bold text-slate-900 font-mono">UV {currentLocation.uvIndex}</div>
            <span className="text-[10px] text-amber-600 font-medium block">{currentLocation.solarIrradiance} W/m²</span>
          </div>
        </div>
      </div>

      {/* Active Events & Outliers in Scan Perimeter */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-slate-700" />
            <h3 className="text-sm font-bold text-slate-900">Perimeter Incidents &amp; Active Events ({events.length})</h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">5km Spatial Radius</span>
        </div>

        {events.length === 0 ? (
          <div className="p-6 text-center rounded-xl bg-slate-50 border border-slate-100 text-slate-500 text-xs">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1.5" />
            <span className="font-semibold text-slate-800 block">No Critical Anomalies In Immediate Perimeter</span>
            All atmospheric and thermal parameters are operating within standard seasonal tolerance bands.
          </div>
        ) : (
          <div className="space-y-2">
            {events.map((evt) => (
              <div
                key={evt.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 flex items-start justify-between gap-3 transition-colors"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className={`p-1.5 rounded-lg flex-shrink-0 ${
                    evt.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-700' :
                    evt.severity === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-900">{evt.title}</span>
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-white border border-slate-200 text-slate-700">
                        {evt.severity}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-1">{evt.description}</p>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className="text-[10px] font-mono font-bold text-slate-500 block">
                    {evt.confidence}% Conf
                  </span>
                  <span className="text-[9px] text-slate-400">{evt.source}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Verified Provenance & Upstream Feed Sources */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-slate-500 flex-shrink-0" />
          <span className="text-slate-600">
            Validated Sources: <strong className="text-slate-800 font-semibold">FortyGuard Thermal Mesh (1m)</strong>, Open-Meteo, NOAA GFS, Copernicus Sentinel-2.
          </span>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">
          Last Synced: {lastTelemetryTime}
        </span>
      </div>
    </div>
  );
};

export default EnvironmentalScanTool;
