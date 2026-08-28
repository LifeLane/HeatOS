import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Sparkles,
  Calendar,
} from 'lucide-react';
import { useLocation } from '../../../context/LocationContext';
import { useAIAnalyst } from '../../../context/AIAnalystContext';

export const EnvironmentalTrendTool: React.FC = () => {
  const { currentLocation, formatTemp } = useLocation();
  const { openAIWithContext } = useAIAnalyst();

  const trendData = [
    { label: 'Surface Heat Delta', change: '+0.8°C', dir: 'up', note: 'Higher diurnal heat absorption in pavement zones' },
    { label: 'Ambient Temperature', change: '+1.4°C', dir: 'up', note: 'Approaching peak mid-afternoon solar elevation' },
    { label: 'Air Quality (AQI)', change: '-4 AQI', dir: 'down', note: 'Favorable boundary layer ventilation' },
    { label: 'Relative Humidity', change: '-6%', dir: 'down', note: 'Dry air mass intrusion dropping moisture index' },
    { label: 'UV Index', change: '+2.1', dir: 'up', note: 'Approaching solar noon peak irradiance' },
  ];

  return (
    <div id="environmental-trend-tool" className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
                <TrendingUp className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">
                  Environmental Trend & Trajectory Engine
                </h2>
                <p className="text-xs text-slate-500">
                  Rate of change and dynamic parameter evolution in {currentLocation.displayName}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() =>
              openAIWithContext({
                triggerSource: 'tools',
                toolId: 'environmental-trend',
                headline: `Environmental Trend for ${currentLocation.displayName}`,
                summary: `Evaluating multi-parameter trajectory over the last 6-12 hours in ${currentLocation.name}.`,
                location: currentLocation.name,
              })
            }
            className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Trend Forecast</span>
          </button>
        </div>

        {/* Trends List */}
        <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
          {trendData.map((item, idx) => (
            <div key={idx} className="p-4 bg-white flex items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-slate-900 block">{item.label}</span>
                <p className="text-xs text-slate-500 mt-0.5">{item.note}</p>
              </div>
              <div className="flex items-center gap-2 font-mono">
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 ${
                    item.dir === 'up'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {item.dir === 'up' ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                  {item.change}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EnvironmentalTrendTool;
