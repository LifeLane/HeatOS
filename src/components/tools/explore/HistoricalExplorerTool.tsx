import React, { useState, useEffect } from 'react';
import {
  History,
  TrendingUp,
  Calendar,
  Flame,
  Wind,
  Droplets,
  Activity,
  Trees,
  Clock,
  Database,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
} from 'lucide-react';
import { useLocation } from '../../../context/LocationContext';
import { useAIAnalyst } from '../../../context/AIAnalystContext';
import { unifiedEnvironmentalStateApi } from '../../../services/environmentalStateApi';
import Card from '../../ui/Card';
import StatusPill from '../../ui/StatusPill';
import PrimaryButton from '../../ui/PrimaryButton';
import SecondaryButton from '../../ui/SecondaryButton';

export const HistoricalExplorerTool: React.FC = () => {
  const { currentLocation, formatTemp } = useLocation();
  const { openAIWithContext } = useAIAnalyst();

  const [metric, setMetric] = useState<'temp' | 'surface_anomaly' | 'aqi' | 'humidity' | 'pulse'>('temp');
  const [period, setPeriod] = useState<'24h' | '7d' | '30d'>('7d');

  // Synthetic 7-day historical dataset grounded around active location values
  const baseT = currentLocation.ambientTemp;
  const historyData = [
    { label: 'Day -6', val: baseT - 2.4, anomaly: 2.8, aqi: 42, rh: 62, pulse: 82 },
    { label: 'Day -5', val: baseT - 1.8, anomaly: 3.0, aqi: 48, rh: 59, pulse: 80 },
    { label: 'Day -4', val: baseT - 0.5, anomaly: 3.1, aqi: 52, rh: 55, pulse: 79 },
    { label: 'Day -3', val: baseT + 0.8, anomaly: 3.4, aqi: 56, rh: 52, pulse: 76 },
    { label: 'Day -2', val: baseT + 1.2, anomaly: 3.6, aqi: 60, rh: 48, pulse: 74 },
    { label: 'Yesterday', val: baseT + 1.6, anomaly: 3.8, aqi: 58, rh: 46, pulse: 75 },
    { label: 'Today', val: baseT, anomaly: currentLocation.surfaceHeatAnomaly, aqi: currentLocation.aqi, rh: currentLocation.humidity, pulse: 78 },
  ];

  const getMetricValue = (item: typeof historyData[0]) => {
    if (metric === 'temp') return formatTemp(item.val);
    if (metric === 'surface_anomaly') return `+${item.anomaly.toFixed(1)}°C`;
    if (metric === 'aqi') return `${item.aqi} AQI`;
    if (metric === 'humidity') return `${item.rh}%`;
    return `${item.pulse}/100`;
  };

  const getMetricNumber = (item: typeof historyData[0]) => {
    if (metric === 'temp') return item.val;
    if (metric === 'surface_anomaly') return item.anomaly;
    if (metric === 'aqi') return item.aqi;
    if (metric === 'humidity') return item.rh;
    return item.pulse;
  };

  const values = historyData.map(getMetricNumber);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const avgVal = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 flex-shrink-0">
            <History className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                Historical Environmental Explorer
              </h2>
              <span className="text-xs font-mono font-bold px-2 py-0.5 bg-sky-50 text-sky-800 rounded-full border border-sky-200">
                Time Series
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Longitudinal analysis, historical extremes, and multi-day environmental baselines for <span className="font-semibold text-slate-700">{currentLocation.displayName}</span>
            </p>
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-1.5 self-start sm:self-center">
          {(['24h', '7d', '30d'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                period === p
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Past {p.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Selector Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {[
          { id: 'temp', label: 'Air Temperature', icon: Flame },
          { id: 'surface_anomaly', label: 'Surface Anomaly', icon: TrendingUp },
          { id: 'aqi', label: 'Air Quality (AQI)', icon: Wind },
          { id: 'humidity', label: 'Relative Humidity', icon: Droplets },
          { id: 'pulse', label: 'Environmental Pulse', icon: Activity },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setMetric(tab.id as any)}
              className={`px-3 py-2 rounded-xl font-semibold transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer ${
                metric === tab.id
                  ? 'bg-blue-50 text-[#2563EB] border border-blue-200 shadow-2xs font-bold'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/70'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Time Series Visual Progression */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Historical Trend ({period})</h3>
          <span className="text-xs font-mono text-slate-500">
            Min: <strong className="text-slate-900">{minVal.toFixed(1)}</strong> • Max: <strong className="text-slate-900">{maxVal.toFixed(1)}</strong> • Mean: <strong className="text-slate-900">{avgVal}</strong>
          </span>
        </div>

        {/* Visual Bar Graph */}
        <div className="grid grid-cols-7 gap-2 pt-4">
          {historyData.map((d, idx) => {
            const num = getMetricNumber(d);
            const heightPercent = Math.max(20, Math.min(100, ((num - (minVal * 0.8)) / (maxVal - (minVal * 0.8) || 1)) * 100));

            return (
              <div key={idx} className="flex flex-col items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-slate-700">
                  {getMetricValue(d)}
                </span>
                <div className="w-full h-32 bg-slate-100 rounded-xl flex items-end p-1 overflow-hidden">
                  <div
                    className={`w-full rounded-lg transition-all duration-500 ${
                      idx === historyData.length - 1 ? 'bg-[#2563EB]' : 'bg-slate-400'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-400 font-medium truncate w-full text-center">
                  {d.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HistoricalExplorerTool;
