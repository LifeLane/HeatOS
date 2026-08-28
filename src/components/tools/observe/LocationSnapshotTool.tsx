import React from 'react';
import {
  MapPin,
  ShieldAlert,
  Flame,
  Sun,
  Wind,
  Droplets,
  Trees,
  Activity,
  Layers,
  Compass,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { useLocation } from '../../../context/LocationContext';
import { useAIAnalyst } from '../../../context/AIAnalystContext';
import Card from '../../ui/Card';
import StatusPill from '../../ui/StatusPill';
import PrimaryButton from '../../ui/PrimaryButton';

export const LocationSnapshotTool: React.FC = () => {
  const { currentLocation, formatTemp } = useLocation();
  const { openAIWithContext } = useAIAnalyst();

  return (
    <div id="location-snapshot-tool" className="space-y-6">
      {/* Primary Snapshot Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-blue-50 text-[#2563EB]">
                <MapPin className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  {currentLocation.displayName}
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  {currentLocation.climateZone} • Elevation {currentLocation.elevation}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                openAIWithContext({
                  triggerSource: 'tools',
                  toolId: 'location-snapshot',
                  headline: `Location Snapshot: ${currentLocation.displayName}`,
                  summary: `Ambient ${formatTemp(currentLocation.ambientTemp)}, Anomaly ${currentLocation.surfaceHeatAnomaly}°C, AQI ${currentLocation.aqi}.`,
                  location: currentLocation.name,
                })
              }
              className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#2563EB] text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Ask AI About This Location</span>
            </button>
          </div>
        </div>

        {/* 4-Box Key Indices */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-mono font-bold text-slate-500 uppercase">Thermal Comfort</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{currentLocation.thermalComfortIndex}/100</div>
            <span className="text-[11px] text-slate-500">Biophysical Index</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-mono font-bold text-slate-500 uppercase">Surface Anomaly</span>
            <div className="text-2xl font-black text-rose-600 mt-1">
              {currentLocation.surfaceHeatAnomaly >= 0 ? '+' : ''}{currentLocation.surfaceHeatAnomaly.toFixed(1)}°C
            </div>
            <span className="text-[11px] text-slate-500">Urban Heat Island</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-mono font-bold text-slate-500 uppercase">Air Quality</span>
            <div className="text-2xl font-black text-emerald-600 mt-1">{currentLocation.aqi} AQI</div>
            <span className="text-[11px] text-slate-500">Ground PM2.5 & O3</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-mono font-bold text-slate-500 uppercase">Canopy Cover</span>
            <div className="text-2xl font-black text-teal-600 mt-1">{currentLocation.canopyCoverage}%</div>
            <span className="text-[11px] text-slate-500">Vegetation Shade</span>
          </div>
        </div>

        {/* Spatial Coordinate & Sensor Footprint */}
        <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
          <div>
            <span className="text-slate-400">Coordinates: </span>
            <span className="text-blue-300 font-bold">{currentLocation.coordinates.lat.toFixed(4)}°N, {currentLocation.coordinates.lng.toFixed(4)}°W</span>
          </div>
          <div>
            <span className="text-slate-400">Active Micro-Zones: </span>
            <span className="text-emerald-400 font-bold">{currentLocation.activeZones} Districts</span>
          </div>
          <div>
            <span className="text-slate-400">Telemetry Nodes: </span>
            <span className="text-amber-400 font-bold">{currentLocation.activeSensors} Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationSnapshotTool;
