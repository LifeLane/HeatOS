import React, { useState, useEffect } from 'react';
import {
  Activity,
  Flame,
  Wind,
  Droplets,
  Sun,
  ShieldCheck,
  RefreshCw,
  Clock,
  MapPin,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Zap,
  Layers,
  Thermometer,
} from 'lucide-react';
import { useLocation } from '../../../context/LocationContext';
import { useFortyGuard } from '../../../context/FortyGuardContext';
import { useAIAnalyst } from '../../../context/AIAnalystContext';
import { unifiedEnvironmentalStateApi } from '../../../services/environmentalStateApi';
import { EnvironmentalState } from '../../../types/unifiedState';
import Card from '../../ui/Card';
import StatusPill from '../../ui/StatusPill';
import PrimaryButton from '../../ui/PrimaryButton';
import SecondaryButton from '../../ui/SecondaryButton';
import { SourceAttributionBadge } from '../../common/SourceAttributionBadge';
import { safeFormatTime } from '../../../utils/formatters';

export const LiveEnvironmentTool: React.FC = () => {
  const { currentLocation, formatTemp, tempUnit } = useLocation();
  const { connection, config } = useFortyGuard();
  const { openAIWithContext } = useAIAnalyst();

  const [state, setState] = useState<EnvironmentalState | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastRefreshed, setLastRefreshed] = useState<string>('');

  const fetchLiveState = async () => {
    try {
      setLoading(true);
      const snapshot = await unifiedEnvironmentalStateApi.getSnapshot({
        latitude: currentLocation.coordinates.lat,
        longitude: currentLocation.coordinates.lng,
        locationName: currentLocation.name,
        stateCode: currentLocation.stateCode,
        countryCode: currentLocation.countryCode,
      });
      setState(snapshot);
      setLastRefreshed(safeFormatTime(new Date()));
    } catch (err) {
      console.error('Failed to fetch live environment stream:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveState();
    const interval = setInterval(fetchLiveState, 30000);
    return () => clearInterval(interval);
  }, [currentLocation.id]);

  const metrics = [
    {
      label: 'Ambient Air Temperature',
      value: formatTemp(currentLocation.ambientTemp),
      subtext: `Feels like ${formatTemp(currentLocation.apparentTemp)}`,
      icon: Thermometer,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      border: 'border-orange-200',
    },
    {
      label: 'FortyGuard Surface Anomaly',
      value: `${currentLocation.surfaceHeatAnomaly >= 0 ? '+' : ''}${currentLocation.surfaceHeatAnomaly.toFixed(1)}°C`,
      subtext: 'Urban Heat Island delta vs ambient',
      icon: Flame,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      border: 'border-rose-200',
    },
    {
      label: 'Air Quality Index (AQI)',
      value: `${currentLocation.aqi}`,
      subtext: currentLocation.aqi <= 50 ? 'Good' : currentLocation.aqi <= 100 ? 'Moderate' : 'Unhealthy',
      icon: Wind,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
    },
    {
      label: 'Relative Humidity',
      value: `${currentLocation.humidity}%`,
      subtext: 'Atmospheric moisture density',
      icon: Droplets,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
    },
    {
      label: 'UV Radiation Index',
      value: `${currentLocation.uvIndex} / 11`,
      subtext: currentLocation.uvIndex >= 8 ? 'Very High Risk' : currentLocation.uvIndex >= 6 ? 'High' : 'Moderate',
      icon: Sun,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
    },
    {
      label: 'Urban Canopy Coverage',
      value: `${currentLocation.canopyCoverage}%`,
      subtext: 'Tree & green vegetation density',
      icon: Layers,
      color: 'text-emerald-700',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
    },
  ];

  return (
    <div id="live-environment-tool" className="space-y-6">
      {/* Top Banner Control */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-base font-extrabold text-slate-900">
              Live Environment Telemetry Stream
            </h2>
            <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              REAL-TIME
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Spatial monitoring for <strong className="text-slate-800">{currentLocation.displayName}</strong> • Lat: {currentLocation.coordinates.lat.toFixed(3)}, Lng: {currentLocation.coordinates.lng.toFixed(3)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchLiveState}
            disabled={loading}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 text-xs font-bold text-slate-700 hover:text-[#2563EB] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#2563EB]' : ''}`} />
            <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
          </button>
          {lastRefreshed && (
            <span className="text-[11px] font-mono text-slate-400">
              Updated {lastRefreshed}
            </span>
          )}
        </div>
      </div>

      {/* Grid of Key Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div
              key={idx}
              className={`p-4.5 rounded-2xl bg-white border ${m.border} shadow-2xs space-y-2.5`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 font-mono uppercase tracking-wider">
                  {m.label}
                </span>
                <div className={`p-2 rounded-xl ${m.bg} ${m.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 tracking-tight">
                {m.value}
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {m.subtext}
              </p>
            </div>
          );
        })}
      </div>

      {/* FortyGuard Sensor Mesh Status */}
      <div className="bg-gradient-to-br from-slate-900 to-blue-950 rounded-2xl text-white p-5 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-300">
              FortyGuard Hyper-Local Mesh
            </span>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
            {connection.meshStatus.toUpperCase()} • {connection.activeNodes} SENSORS
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Ground-truth thermal spatial modeling in {currentLocation.name} provides 10-meter grid resolution on asphalt, sidewalk, and facade surface anomalies.
        </p>

        <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400 border-t border-slate-800">
          <span>Density: <strong className="text-white">{connection.meshDensity}</strong></span>
          <span>Latency: <strong className="text-white">{connection.latencyMs}ms</strong></span>
          <span>Throughput: <strong className="text-white">{connection.dataThroughput}</strong></span>
        </div>
      </div>
    </div>
  );
};

export default LiveEnvironmentTool;
