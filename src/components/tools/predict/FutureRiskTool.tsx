import React from 'react';
import {
  ShieldAlert,
  Clock,
  Flame,
  Sun,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { useLocation } from '../../../context/LocationContext';
import { useAIAnalyst } from '../../../context/AIAnalystContext';

export const FutureRiskTool: React.FC = () => {
  const { currentLocation, formatTemp } = useLocation();
  const { openAIWithContext } = useAIAnalyst();

  const riskWindows = [
    { time: '13:00 - 15:30', level: 'PEAK HEAT EXPOSURE', temp: formatTemp(currentLocation.ambientTemp + 2.5), note: 'Maximum surface solar radiation absorption', color: 'rose' },
    { time: '12:00 - 16:00', level: 'HIGH UV RADIATION', temp: 'UV Index 9.2', note: 'Extreme sunburn risk without SPF/shade', color: 'amber' },
    { time: '17:00 - 19:30', level: 'TRAPPED THERMAL LOAD', temp: '+3.8°C Delta', note: 'Asphalt & concrete reradiation post-sunset', color: 'orange' },
  ];

  return (
    <div id="future-risk-tool" className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-rose-50 text-rose-600">
                <ShieldAlert className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">
                  Future Risk & Critical Exposure Windows
                </h2>
                <p className="text-xs text-slate-500">
                  Projected forward hazards for the next 24-48 hours in {currentLocation.displayName}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() =>
              openAIWithContext({
                triggerSource: 'tools',
                toolId: 'future-risk',
                headline: `Future Risk Windows for ${currentLocation.displayName}`,
                summary: `Evaluating future thermal, UV, and particulate exposure windows for ${currentLocation.name}.`,
                location: currentLocation.name,
              })
            }
            className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Risk Assessment</span>
          </button>
        </div>

        {/* Windows Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {riskWindows.map((rw, idx) => (
            <div key={idx} className="p-4.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-slate-500 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {rw.time}
                </span>
                <span className={`text-[9.5px] font-mono font-bold px-2 py-0.5 rounded-md ${
                  rw.color === 'rose' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-800'
                }`}>
                  {rw.level}
                </span>
              </div>
              <div className="text-xl font-black text-slate-900">{rw.temp}</div>
              <p className="text-xs text-slate-600">{rw.note}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FutureRiskTool;
