import React, { useState } from 'react';
import {
  Sliders,
  Flame,
  Wind,
  Droplets,
  Sun,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useLocation } from '../../../context/LocationContext';

export const ThresholdBuilderTool: React.FC = () => {
  const { currentLocation } = useLocation();

  const [heatThreshold, setHeatThreshold] = useState<number>(35);
  const [anomalyThreshold, setAnomalyThreshold] = useState<number>(3.0);
  const [aqiThreshold, setAqiThreshold] = useState<number>(100);
  const [uvThreshold, setUvThreshold] = useState<number>(8);
  const [saved, setSaved] = useState<boolean>(false);

  const handleApply = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div id="threshold-builder-tool" className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 text-[#2563EB]">
              <Sliders className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">
                Environmental Threshold & Sensitivity Builder
              </h2>
              <p className="text-xs text-slate-500">
                Calibrate alert trigger sensitivity and multi-parameter threshold limits
              </p>
            </div>
          </div>
        </div>

        {saved && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Threshold limits applied to local surveillance telemetry rules!</span>
          </div>
        )}

        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-rose-600" /> Ambient Temperature Alarm
              </span>
              <span className="font-mono font-bold text-rose-600">{heatThreshold}°C</span>
            </div>
            <input
              type="range"
              min="25"
              max="50"
              value={heatThreshold}
              onChange={(e) => setHeatThreshold(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#2563EB]"
            />
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-orange-600" /> Surface Heat Anomaly Trigger (ΔT)
              </span>
              <span className="font-mono font-bold text-orange-600">+{anomalyThreshold.toFixed(1)}°C</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="8.0"
              step="0.5"
              value={anomalyThreshold}
              onChange={(e) => setAnomalyThreshold(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#2563EB]"
            />
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Wind className="w-3.5 h-3.5 text-emerald-600" /> Air Quality (AQI) Spike Limit
              </span>
              <span className="font-mono font-bold text-emerald-600">{aqiThreshold} AQI</span>
            </div>
            <input
              type="range"
              min="50"
              max="300"
              step="10"
              value={aqiThreshold}
              onChange={(e) => setAqiThreshold(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#2563EB]"
            />
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-amber-600" /> UV Radiation Exposure Limit
              </span>
              <span className="font-mono font-bold text-amber-600">{uvThreshold} UV</span>
            </div>
            <input
              type="range"
              min="3"
              max="12"
              value={uvThreshold}
              onChange={(e) => setUvThreshold(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#2563EB]"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={handleApply}
            className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Apply Sensitivity Rules
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThresholdBuilderTool;
