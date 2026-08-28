import React, { useState } from 'react';
import {
  CheckSquare,
  Clock,
  ShieldAlert,
  Flame,
  Building,
  Heart,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Filter,
  Sparkles,
} from 'lucide-react';
import { useLocation } from '../../../context/LocationContext';
import { useAIAnalyst } from '../../../context/AIAnalystContext';
import Card from '../../ui/Card';
import StatusPill from '../../ui/StatusPill';
import PrimaryButton from '../../ui/PrimaryButton';
import SecondaryButton from '../../ui/SecondaryButton';

interface ActionItem {
  id: string;
  title: string;
  domain: 'Operations' | 'Public Health' | 'HVAC / Energy' | 'Personal';
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'ADVISORY';
  timeframe: 'Immediate (0-2h)' | 'Peak Window (12-16h)' | 'Evening Recovery';
  description: string;
  evidence: string;
  completed: boolean;
  confidence: number;
}

export const ActionPlannerTool: React.FC = () => {
  const { currentLocation, formatTemp } = useLocation();
  const { openAIWithContext } = useAIAnalyst();

  const [selectedDomain, setSelectedDomain] = useState<string>('ALL');

  const [actions, setActions] = useState<ActionItem[]>([
    {
      id: 'act-1',
      title: 'Curtail Unshaded Heavy Physical Work (13:00 – 16:30)',
      domain: 'Operations',
      priority: 'CRITICAL',
      timeframe: 'Peak Window (12-16h)',
      description: 'Enforce OSHA heat stress work-rest cycles (45 min work / 15 min shade rest) for all exterior ground crews.',
      evidence: `Forecast peak temp of ${formatTemp(currentLocation.ambientTemp + 3.4)} and solar UV index > 8.`,
      completed: false,
      confidence: 96,
    },
    {
      id: 'act-2',
      title: 'Pre-Cool Facility Interiors & Pre-Charge Chilled Water Storage',
      domain: 'HVAC / Energy',
      priority: 'HIGH',
      timeframe: 'Immediate (0-2h)',
      description: 'Lower thermostat setpoints by 1.5°C before 11:00 AM to shift peak electrical demand away from high-tariff grid hours.',
      evidence: 'Surface heat island re-radiation expected to peak at +3.4°C anomaly this afternoon.',
      completed: false,
      confidence: 94,
    },
    {
      id: 'act-3',
      title: 'Deploy Hydration & Electrolyte Stations at Key Transit Points',
      domain: 'Public Health',
      priority: 'HIGH',
      timeframe: 'Peak Window (12-16h)',
      description: 'Ensure active water distribution and misting points are staffed at high-density unshaded intersections.',
      evidence: `Ambient humidity at ${currentLocation.humidity}% with apparent heat index reaching ${formatTemp(currentLocation.apparentTemp + 3.0)}.`,
      completed: false,
      confidence: 95,
    },
    {
      id: 'act-4',
      title: 'Open Nighttime Ventilation Dampers for Thermal Discharge',
      domain: 'HVAC / Energy',
      priority: 'MEDIUM',
      timeframe: 'Evening Recovery',
      description: 'Cycle ambient cool evening air after 20:00 to purge daytime concrete thermal absorption.',
      evidence: 'Projected night ambient drop to 22°C creates a +6°C cooling gradient.',
      completed: false,
      confidence: 90,
    },
    {
      id: 'act-5',
      title: 'Wear Broad-Spectrum UV Protection & UV 400 Eyewear',
      domain: 'Personal',
      priority: 'ADVISORY',
      timeframe: 'Immediate (0-2h)',
      description: 'Apply SPF 50+ sunscreen and wear light-colored, loose-fitting breathable clothing when in direct sun.',
      evidence: `UV Index currently ${currentLocation.uvIndex} (${currentLocation.solarIrradiance} W/m²).`,
      completed: true,
      confidence: 98,
    },
  ]);

  const toggleComplete = (id: string) => {
    setActions((prev) =>
      prev.map((a) => (a.id === id ? { ...a, completed: !a.completed } : a))
    );
  };

  const filteredActions = selectedDomain === 'ALL'
    ? actions
    : actions.filter((a) => a.domain === selectedDomain);

  const completedCount = actions.filter((a) => a.completed).length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 flex-shrink-0">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                Operational Environmental Action Planner
              </h2>
              <span className="text-xs font-mono font-bold px-2 py-0.5 bg-rose-50 text-rose-800 rounded-full border border-rose-200">
                {completedCount}/{actions.length} Completed
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Grounded, prioritized mitigation protocols tailored for <span className="font-semibold text-slate-700">{currentLocation.displayName}</span>
            </p>
          </div>
        </div>

        <PrimaryButton
          id="action-ask-ai"
          onClick={() => openAIWithContext({
            question: `Generate a customized operational action plan for ${currentLocation.displayName} considering the current temp of ${formatTemp(currentLocation.ambientTemp)} and heat anomaly of +${currentLocation.surfaceHeatAnomaly}°C.`,
            sourceModule: 'Action Planner Tool',
          })}
          className="text-xs py-2.5 px-3.5 whitespace-nowrap self-start sm:self-center flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Generate Plan with AI</span>
        </PrimaryButton>
      </div>

      {/* Domain Filters */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 flex-shrink-0">Domain:</span>
        {['ALL', 'Operations', 'Public Health', 'HVAC / Energy', 'Personal'].map((d) => (
          <button
            key={d}
            onClick={() => setSelectedDomain(d)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex-shrink-0 cursor-pointer ${
              selectedDomain === d
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80 shadow-2xs'
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Actions Checklist */}
      <div className="space-y-3">
        {filteredActions.map((act) => (
          <div
            key={act.id}
            onClick={() => toggleComplete(act.id)}
            className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
              act.completed
                ? 'bg-slate-50/70 border-slate-200/60 opacity-60'
                : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-xs'
            }`}
          >
            <div className="flex items-start gap-3.5">
              <div className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-colors flex-shrink-0 ${
                act.completed ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'
              }`}>
                {act.completed && <CheckCircle2 className="w-4 h-4" />}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className={`text-xs sm:text-sm font-bold ${act.completed ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                    {act.title}
                  </h3>
                  <span className={`text-[9px] font-mono font-bold px-2 py-0.2 rounded-full border ${
                    act.priority === 'CRITICAL' ? 'bg-rose-50 text-rose-800 border-rose-200' :
                    act.priority === 'HIGH' ? 'bg-orange-50 text-orange-800 border-orange-200' :
                    act.priority === 'MEDIUM' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                    'bg-blue-50 text-blue-800 border-blue-200'
                  }`}>
                    {act.priority}
                  </span>
                  <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.2 rounded">
                    {act.domain}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{act.description}</p>

                <div className="pt-1 text-[11px] text-slate-500 flex items-center gap-2 flex-wrap">
                  <span className="flex items-center gap-1 font-mono font-medium text-slate-700">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {act.timeframe}
                  </span>
                  <span>•</span>
                  <span className="text-slate-500">Evidence: <em className="text-slate-700">{act.evidence}</em></span>
                </div>
              </div>
            </div>

            <div className="text-right flex-shrink-0 hidden sm:block">
              <span className="text-[10px] font-mono font-bold text-slate-400">
                {act.confidence}% Conf
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActionPlannerTool;
