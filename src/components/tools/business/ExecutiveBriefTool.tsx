import React from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowRight,
  TrendingUp,
  Clock,
  Building,
} from 'lucide-react';
import { useLocation } from '../../../context/LocationContext';
import { useAIAnalyst } from '../../../context/AIAnalystContext';
import Card from '../../ui/Card';
import StatusPill from '../../ui/StatusPill';
import PrimaryButton from '../../ui/PrimaryButton';
import SecondaryButton from '../../ui/SecondaryButton';

export const ExecutiveBriefTool: React.FC = () => {
  const { currentLocation, formatTemp } = useLocation();
  const { openAIWithContext } = useAIAnalyst();

  const isSevere = currentLocation.ambientTemp > 33 || currentLocation.surfaceHeatAnomaly > 3.0;

  return (
    <div className="space-y-6">
      {/* Executive Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                Executive Environmental Brief
              </h2>
              <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                isSevere ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}>
                {isSevere ? 'AMBER: ATTENTION REQUIRED' : 'GREEN: NOMINAL STATE'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              High-impact 60-second operational synthesis for <span className="font-semibold text-slate-700">{currentLocation.displayName}</span>
            </p>
          </div>
        </div>

        <PrimaryButton
          id="exec-ask-ai"
          onClick={() => openAIWithContext({
            question: `Provide a 3-bullet executive summary and one primary action recommendation for leadership regarding environmental risk in ${currentLocation.displayName}.`,
            sourceModule: 'Executive Brief Tool',
          })}
          className="text-xs py-2.5 px-3.5 whitespace-nowrap self-start sm:self-center flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Executive Audio</span>
        </PrimaryButton>
      </div>

      {/* 3 Things to Know Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center text-xs font-mono font-bold">
            3
          </span>
          Three Things Leadership Needs to Know
        </h3>

        <div className="space-y-3 text-xs text-slate-700">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 flex items-start gap-3">
            <span className="font-mono font-bold text-slate-400 mt-0.5 text-xs">01</span>
            <div>
              <strong className="text-slate-900 block font-bold">
                Thermal Load Peaks at {formatTemp(currentLocation.ambientTemp + 3.4)} between 13:00 and 16:30
              </strong>
              <p className="text-slate-600 mt-0.5 leading-relaxed">
                Apparent temperature reaches {formatTemp(currentLocation.apparentTemp + 4.2)}. Surface heat island adds +{currentLocation.surfaceHeatAnomaly.toFixed(1)}°C to facility roofs and asphalt aprons.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 flex items-start gap-3">
            <span className="font-mono font-bold text-slate-400 mt-0.5 text-xs">02</span>
            <div>
              <strong className="text-slate-900 block font-bold">
                Air Quality and Biophysical Pulse Remain Healthy ({currentLocation.aqi} AQI, 78/100 Pulse)
              </strong>
              <p className="text-slate-600 mt-0.5 leading-relaxed">
                Atmospheric particulate levels and canopy shading buffers provide strong natural resilience against secondary hazards.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 flex items-start gap-3">
            <span className="font-mono font-bold text-slate-400 mt-0.5 text-xs">03</span>
            <div>
              <strong className="text-slate-900 block font-bold">
                Tomorrow Forecasts a +0.7°C Heat Extension
              </strong>
              <p className="text-slate-600 mt-0.5 leading-relaxed">
                The current warming trend continues for the next 36 hours before synoptic cooling returns on Friday.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Decision Card */}
      <div className="p-6 rounded-2xl bg-slate-900 text-white shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider">
            PRIMARY RECOMMENDED ACTION
          </span>
          <span className="text-xs text-slate-400 font-mono">Decision Window: Before 11:30 AM</span>
        </div>

        <h4 className="text-base font-bold text-white">
          Mandate Shifted Exterior Workforce Breaks &amp; Pre-Cool Facility Interiors
        </h4>

        <p className="text-xs text-slate-300 leading-relaxed">
          Shift heavy exterior physical operations to morning hours (prior to 12:00 PM) and activate chiller pre-cooling to reduce peak power costs and protect workforce health during the 14:00 - 17:00 thermal apex.
        </p>
      </div>
    </div>
  );
};

export default ExecutiveBriefTool;
