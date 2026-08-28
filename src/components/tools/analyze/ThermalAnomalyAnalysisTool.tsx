import React from 'react';
import {
  Flame,
  Zap,
  TrendingUp,
  AlertTriangle,
  Layers,
  Activity,
  Sparkles,
} from 'lucide-react';
import { useLocation } from '../../../context/LocationContext';
import { useFortyGuard } from '../../../context/FortyGuardContext';
import { useAIAnalyst } from '../../../context/AIAnalystContext';

export const ThermalAnomalyAnalysisTool: React.FC = () => {
  const { currentLocation, formatTemp } = useLocation();
  const { connection } = useFortyGuard();
  const { openAIWithContext } = useAIAnalyst();

  const anomaly = currentLocation.surfaceHeatAnomaly;
  const isHighAnomaly = anomaly >= 3.0;

  return (
    <div id="thermal-anomaly-analysis-tool" className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-rose-50 text-rose-600">
                <Flame className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">
                  Thermal Anomaly & Urban Heat Island Analysis
                </h2>
                <p className="text-xs text-slate-500">
                  Surface vs ambient temperature variance derived from FortyGuard sensor mesh
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() =>
              openAIWithContext({
                triggerSource: 'tools',
                toolId: 'thermal-anomaly-analysis',
                headline: `Thermal Anomaly Analysis in ${currentLocation.displayName}`,
                summary: `Surface heat delta is ${anomaly >= 0 ? '+' : ''}${anomaly.toFixed(1)}°C relative to baseline ambient air.`,
                location: currentLocation.name,
              })
            }
            className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Anomaly Diagnosis</span>
          </button>
        </div>

        {/* Big Anomaly Metric */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-800">
              Surface Heat Delta (ΔT)
            </span>
            <div className="text-3xl font-black text-rose-700">
              {anomaly >= 0 ? '+' : ''}{anomaly.toFixed(1)}°C
            </div>
            <p className="text-xs text-rose-900/80">
              {isHighAnomaly ? 'Severe Urban Heat Island effect' : 'Moderate surface radiative excess'}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600">
              Ambient Air Baseline
            </span>
            <div className="text-3xl font-black text-slate-900">
              {formatTemp(currentLocation.ambientTemp)}
            </div>
            <p className="text-xs text-slate-500">
              Reference meteorological station reading
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600">
              Surface Radiative Est.
            </span>
            <div className="text-3xl font-black text-slate-900">
              {formatTemp(currentLocation.ambientTemp + anomaly)}
            </div>
            <p className="text-xs text-slate-500">
              Asphalt / pavement contact temperature
            </p>
          </div>
        </div>

        {/* Physical Drivers Analysis */}
        <div className="p-4.5 rounded-xl bg-slate-900 text-white space-y-2.5">
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-blue-300">
            Biophysical Drivers & Heat Retention Factors
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
            <div className="bg-white/5 p-3 rounded-lg border border-white/10">
              <span className="text-slate-400 block mb-1">Tree Canopy Shade:</span>
              <strong className="text-white font-mono">{currentLocation.canopyCoverage}% Coverage</strong>
            </div>
            <div className="bg-white/5 p-3 rounded-lg border border-white/10">
              <span className="text-slate-400 block mb-1">Solar Irradiance:</span>
              <strong className="text-white font-mono">{currentLocation.solarIrradiance} W/m²</strong>
            </div>
            <div className="bg-white/5 p-3 rounded-lg border border-white/10">
              <span className="text-slate-400 block mb-1">Mesh Confidence:</span>
              <strong className="text-emerald-400 font-mono">98.4% Ground-Truth</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThermalAnomalyAnalysisTool;
