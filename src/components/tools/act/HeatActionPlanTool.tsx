import React, { useState } from 'react';
import {
  Clock,
  Flame,
  Sun,
  Droplets,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Download,
  Share2,
} from 'lucide-react';
import { useLocation } from '../../../context/LocationContext';
import { useAIAnalyst } from '../../../context/AIAnalystContext';
import Card from '../../ui/Card';
import StatusPill from '../../ui/StatusPill';
import PrimaryButton from '../../ui/PrimaryButton';
import SecondaryButton from '../../ui/SecondaryButton';
import { safeFormatDate } from '../../../utils/formatters';

export const HeatActionPlanTool: React.FC = () => {
  const { currentLocation, formatTemp } = useLocation();
  const { openAIWithContext } = useAIAnalyst();

  const [copied, setCopied] = useState(false);

  const diurnalPhases = [
    {
      time: '08:00 – 12:00',
      phase: 'PREPARATION & BASELINE',
      status: 'NORMAL',
      tempRange: `${formatTemp(currentLocation.ambientTemp - 3)} – ${formatTemp(currentLocation.ambientTemp)}`,
      protocol: 'Complete heavy outdoor physical tasks early. Check shade structures and replenish chilled water stations. Pre-cool facility interiors to buffer afternoon grid peaks.',
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    },
    {
      time: '12:00 – 14:00',
      phase: 'ELEVATED SOLAR LOAD & HYDRATION',
      status: 'MONITOR',
      tempRange: `${formatTemp(currentLocation.ambientTemp)} – ${formatTemp(currentLocation.ambientTemp + 2)}`,
      protocol: 'Enforce mandatory 10-minute shade and hydration breaks every 50 minutes. Activate misting fans at high-occupancy transit hubs. UV Index reaches peak 8+.',
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
    },
    {
      time: '14:00 – 17:00',
      phase: 'CRITICAL HEAT ISLAND PEAK',
      status: 'CURTAIL OUTDOOR WORK',
      tempRange: `${formatTemp(currentLocation.ambientTemp + 2)} – ${formatTemp(currentLocation.ambientTemp + 4)}`,
      protocol: 'Halt non-essential direct-sun physical operations. Maximum asphalt re-radiation occurs during this window (+3.4°C anomaly). Move vulnerable individuals into climate-controlled cooling shelters.',
      badgeClass: 'bg-rose-50 text-rose-800 border-rose-200',
    },
    {
      time: '17:00 – 20:00',
      phase: 'DECLINING INSOLATION & FLUSHING',
      status: 'TRANSITION',
      tempRange: `${formatTemp(currentLocation.ambientTemp + 1)} – ${formatTemp(currentLocation.ambientTemp - 1)}`,
      protocol: 'Solar angles decrease, but thermal mass in masonry continues to radiate. Resume moderate activities in shaded zones. Prepare buildings for nighttime ventilation purge.',
      badgeClass: 'bg-blue-50 text-blue-800 border-blue-200',
    },
    {
      time: '20:00 – 06:00',
      phase: 'NIGHTTIME THERMAL RECOVERY',
      status: 'RECOVERY',
      tempRange: `${formatTemp(currentLocation.ambientTemp - 2)} – ${formatTemp(currentLocation.ambientTemp - 6)}`,
      protocol: 'Inspect night cooling rates. If ambient remains above 24°C, maintain indoor HVAC circulation to avoid nocturnal heat accumulation in human physiology.',
      badgeClass: 'bg-slate-100 text-slate-800 border-slate-200',
    },
  ];

  const handleCopyPlan = () => {
    const text = `HEAT ACTION PLAN - ${currentLocation.displayName}\nDate: ${safeFormatDate(new Date())}\nCurrent Ambient: ${formatTemp(currentLocation.ambientTemp)}\n\n` +
      diurnalPhases.map((p) => `[${p.time}] ${p.phase} (${p.status})\n${p.protocol}\n`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 flex-shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                Chronological Heat Action Plan
              </h2>
              <span className="text-xs font-mono font-bold px-2 py-0.5 bg-orange-50 text-orange-800 rounded-full border border-orange-200">
                Diurnal Schedule
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Standardized operational protocol for municipal, enterprise, and community heat management in <span className="font-semibold text-slate-700">{currentLocation.displayName}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <SecondaryButton
            id="copy-plan-btn"
            onClick={handleCopyPlan}
            className="text-xs py-2 px-3 flex items-center gap-1.5"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copied ? 'Copied to Clipboard!' : 'Export Plan'}</span>
          </SecondaryButton>

          <PrimaryButton
            id="plan-ask-ai"
            onClick={() => openAIWithContext({
              question: `Review and tailor this chronological Heat Action Plan for ${currentLocation.displayName} with current temperature ${formatTemp(currentLocation.ambientTemp)}.`,
              sourceModule: 'Heat Action Plan Tool',
            })}
            className="text-xs py-2 px-3 flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Customize</span>
          </PrimaryButton>
        </div>
      </div>

      {/* Chronological Timeline */}
      <div className="space-y-4 relative before:absolute before:inset-0 before:left-6 before:w-0.5 before:bg-slate-200 before:hidden sm:before:block">
        {diurnalPhases.map((phase, idx) => (
          <div
            key={idx}
            className="relative bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs sm:ml-12 space-y-2.5"
          >
            {/* Timeline node icon */}
            <div className="hidden sm:flex absolute -left-12 top-5 w-6 h-6 rounded-full bg-slate-900 text-white items-center justify-center text-[10px] font-mono font-bold">
              {idx + 1}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-slate-900 font-mono">
                  {phase.time}
                </span>
                <span className="text-xs font-bold text-slate-600">— {phase.phase}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-500">
                  {phase.tempRange}
                </span>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${phase.badgeClass}`}>
                  {phase.status}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed pt-1 border-t border-slate-100">
              {phase.protocol}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HeatActionPlanTool;
