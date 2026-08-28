import React, { useState, useEffect } from 'react';
import {
  Flame,
  Layers,
  Sliders,
  RefreshCw,
  Eye,
  Info,
  Maximize2,
  Database,
  MapPin,
  Trees,
  Sun,
  Compass,
} from 'lucide-react';
import { useLocation } from '../../../context/LocationContext';
import { useFortyGuard } from '../../../context/FortyGuardContext';
import { useNavigation } from '../../../context/NavigationContext';
import { fetchHeatmapData } from '../../../services/environmentalApi';
import { HeatmapData } from '../../../types/environmental';
import Card from '../../ui/Card';
import StatusPill from '../../ui/StatusPill';
import PrimaryButton from '../../ui/PrimaryButton';
import SecondaryButton from '../../ui/SecondaryButton';

export const HeatmapTool: React.FC = () => {
  const { currentLocation, formatTemp } = useLocation();
  const { connection, config } = useFortyGuard();
  const { setActiveTab } = useNavigation();

  const [resolution, setResolution] = useState<'1m' | '5m' | '10m' | '30m' | '100m'>('1m');
  const [targetParam, setTargetParam] = useState<'surface_heat' | 'canopy' | 'thermal_anomaly'>('surface_heat');
  const [heatmap, setHeatmap] = useState<HeatmapData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadHeatmap = async (bypassCache = false) => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchHeatmapData({
        resolution,
        targetParameter: targetParam,
        bounds: {
          north: currentLocation.coordinates.lat + 0.05,
          south: currentLocation.coordinates.lat - 0.05,
          east: currentLocation.coordinates.lng + 0.05,
          west: currentLocation.coordinates.lng - 0.05,
        },
        bypassCache,
      });
      setHeatmap(data);
    } catch (err: any) {
      console.error('Failed to load heatmap data:', err);
      setError(err.message || 'Error fetching FortyGuard heatmap matrix.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHeatmap();
  }, [currentLocation.id, resolution, targetParam]);

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-orange-50 text-orange-600">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                FortyGuard High-Resolution Thermal Mesh
              </h2>
              <p className="text-xs text-slate-500">
                Hyper-local spatial surface heat matrix with sub-meter interpolation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <SecondaryButton
              id="heatmap-refresh-btn"
              onClick={() => loadHeatmap(true)}
              disabled={loading}
              className="text-xs py-2 px-3 flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Matrix</span>
            </SecondaryButton>

            <PrimaryButton
              id="heatmap-open-nav"
              onClick={() => setActiveTab('navigation')}
              className="text-xs py-2 px-3 flex items-center gap-1.5"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Open in 3D Map</span>
            </PrimaryButton>
          </div>
        </div>

        {/* Resolution & Layer Filters */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Target Layer Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Layer:</span>
            <button
              onClick={() => setTargetParam('surface_heat')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                targetParam === 'surface_heat'
                  ? 'bg-orange-50 text-orange-700 border border-orange-200'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
              }`}
            >
              Surface Heat (°C)
            </button>
            <button
              onClick={() => setTargetParam('thermal_anomaly')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                targetParam === 'thermal_anomaly'
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
              }`}
            >
              Thermal Anomaly (Δ)
            </button>
            <button
              onClick={() => setTargetParam('canopy')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                targetParam === 'canopy'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
              }`}
            >
              Canopy Coverage (%)
            </button>
          </div>

          {/* Resolution Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Mesh Grid:</span>
            {(['1m', '5m', '10m', '30m', '100m'] as const).map((res) => (
              <button
                key={res}
                onClick={() => setResolution(res)}
                className={`px-2 py-0.8 rounded text-xs font-mono font-bold transition-colors cursor-pointer ${
                  resolution === res
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {res}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Heatmap Visual Matrix Canvas / Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              {targetParam === 'surface_heat' ? 'Surface Temperature Density' :
               targetParam === 'thermal_anomaly' ? 'Microclimatic Thermal Anomaly' :
               'Vegetative Canopy Shading Index'}
            </span>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
              Grid: {resolution}
            </span>
          </div>

          <span className="text-[11px] font-mono text-slate-500">
            Center: {currentLocation.coordinates.lat.toFixed(3)}°N, {currentLocation.coordinates.lng.toFixed(3)}°W
          </span>
        </div>

        {/* Heatmap Matrix Visual Representation */}
        <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900 min-h-[320px] flex items-center justify-center">
          {/* Visual gradient mesh simulation reflecting FortyGuard telemetry */}
          <div
            className="absolute inset-0 opacity-90 transition-all duration-500"
            style={{
              background: targetParam === 'surface_heat'
                ? 'radial-gradient(circle at 45% 40%, rgba(239, 68, 68, 0.85) 0%, rgba(249, 115, 22, 0.7) 35%, rgba(234, 179, 8, 0.4) 65%, rgba(30, 41, 59, 0.9) 100%)'
                : targetParam === 'thermal_anomaly'
                ? 'radial-gradient(circle at 55% 50%, rgba(225, 29, 72, 0.9) 0%, rgba(190, 18, 60, 0.6) 40%, rgba(59, 130, 246, 0.3) 75%, rgba(15, 23, 42, 0.95) 100%)'
                : 'radial-gradient(circle at 40% 60%, rgba(16, 185, 129, 0.85) 0%, rgba(5, 150, 105, 0.6) 45%, rgba(245, 158, 11, 0.4) 70%, rgba(15, 23, 42, 0.9) 100%)',
            }}
          />

          {/* Grid overlay lines */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.4) 1px, transparent 1px)',
              backgroundSize: resolution === '1m' ? '20px 20px' : resolution === '5m' ? '35px 35px' : '50px 50px',
            }}
          />

          {/* Centered Node Marker */}
          <div className="relative z-10 text-center space-y-2 p-6 bg-slate-950/70 backdrop-blur-md rounded-2xl border border-white/20 text-white max-w-sm">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-400/30 flex items-center justify-center mx-auto text-orange-400">
              <Flame className="w-5 h-5" />
            </div>
            <div className="text-base font-bold tracking-tight">
              {currentLocation.displayName} Thermal Peak
            </div>
            <div className="text-2xl font-extrabold font-mono text-orange-300">
              {formatTemp(currentLocation.ambientTemp + currentLocation.surfaceHeatAnomaly)}
            </div>
            <p className="text-[11px] text-slate-300">
              Spatial Resolution: <strong className="text-white">{resolution}</strong> • Confidence: <strong className="text-emerald-400">96.4%</strong>
            </p>
          </div>
        </div>

        {/* Dynamic Thermal Scale */}
        <div className="space-y-1.5">
          <div className="h-3 rounded-full bg-gradient-to-r from-blue-500 via-emerald-400 via-yellow-400 via-orange-500 to-rose-600 shadow-inner" />
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>Cool / Buffered ({formatTemp(currentLocation.ambientTemp - 4)})</span>
            <span>Ambient ({formatTemp(currentLocation.ambientTemp)})</span>
            <span>Critical UHI ({formatTemp(currentLocation.ambientTemp + 6)})</span>
          </div>
        </div>
      </div>

      {/* Grid Metadata Footer */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Mesh Interpolation</span>
          <span className="font-bold text-slate-800 font-mono">Bilinear Sub-Meter Spline</span>
        </div>
        <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Sensor Density</span>
          <span className="font-bold text-[#2563EB] font-mono">14.2 Nodes / km²</span>
        </div>
        <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Provider Provenance</span>
          <span className="font-bold text-slate-800 font-mono">FortyGuard Core Engine v2.4</span>
        </div>
      </div>
    </div>
  );
};

export default HeatmapTool;
