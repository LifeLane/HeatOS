import React, { useState } from 'react';
import {
  TrendingUp,
  Clock,
  Flame,
  Sun,
  ShieldAlert,
  Droplets,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Info,
  Calendar,
} from 'lucide-react';
import { useLocation } from '../../../context/LocationContext';
import { useAIAnalyst } from '../../../context/AIAnalystContext';
import Card from '../../ui/Card';
import StatusPill from '../../ui/StatusPill';
import PrimaryButton from '../../ui/PrimaryButton';
import SecondaryButton from '../../ui/SecondaryButton';

export const PeakFinderTool: React.FC = () => {
  const { currentLocation, formatTemp, tempUnit } = useLocation();
  const { openAIWithContext } = useAIAnalyst();

  const [selectedDay, setSelectedDay] = useState<'today' | 'tomorrow'>('today');

  const baseTemp = currentLocation.ambientTemp;
  const multiplier = selectedDay === 'today' ? 1 : 1.05;

  const tempPeak = {
    time: '3:30 PM',
    value: formatTemp((baseTemp + 3.6) * multiplier),
    feelsLike: formatTemp((baseTemp + 5.4) * multiplier),
    severity: (baseTemp + 3.6) > 35 ? 'CRITICAL' : 'HIGH',
    confidence: 95,
    driver: 'Combined solar insolation peak and asphalt thermal re-radiation',
  };

  const wetBulbPeak = {
    time: '2:15 PM',
    value: `${(26.2 * multiplier).toFixed(1)}°C Tw`,
    apparentIndex: `${Math.round(82 * multiplier)}/100`,
    severity: 'ELEVATED',
    confidence: 93,
    driver: 'Coincident high relative humidity and peak ambient heat',
  };

  const uvPeak = {
    time: '1:00 PM',
    value: `UV ${Math.round(currentLocation.uvIndex * multiplier)}`,
    irradiance: `${Math.round(currentLocation.solarIrradiance * multiplier)} W/m²`,
    protectiveWindow: '11:30 AM – 4:00 PM',
    severity: currentLocation.uvIndex > 7 ? 'VERY HIGH' : 'HIGH',
    confidence: 97,
    driver: 'Solar zenith angle and clear atmospheric transmissivity',
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                Peak Environmental Hazard Finder
              </h2>
              <span className="text-xs font-mono font-bold px-2 py-0.5 bg-amber-50 text-amber-800 rounded-full border border-amber-200">
                Window Detection
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Identifies the exact hours of peak thermal, wet-bulb, and UV exposure for <span className="font-semibold text-slate-700">{currentLocation.displayName}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-center">
          <button
            onClick={() => setSelectedDay('today')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              selectedDay === 'today'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Today's Peaks
          </button>
          <button
            onClick={() => setSelectedDay('tomorrow')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              selectedDay === 'tomorrow'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tomorrow's Peaks
          </button>
        </div>
      </div>

      {/* 3 Peak Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Temperature Peak */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-orange-50 text-orange-600">
                <Flame className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Air Temp Peak</span>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
              {tempPeak.severity}
            </span>
          </div>

          <div>
            <div className="text-3xl font-extrabold text-slate-900 font-mono">
              {tempPeak.value}
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Expected at: <strong className="text-slate-800 font-mono">{tempPeak.time}</strong>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-xs space-y-1.5">
            <p className="text-slate-600 leading-relaxed">{tempPeak.driver}</p>
            <span className="text-[11px] font-mono text-slate-400 block">
              Confidence: {tempPeak.confidence}%
            </span>
          </div>
        </div>

        {/* 2. Wet-Bulb & Heat Risk Peak */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <Droplets className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Wet-Bulb Peak</span>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              {wetBulbPeak.severity}
            </span>
          </div>

          <div>
            <div className="text-3xl font-extrabold text-slate-900 font-mono">
              {wetBulbPeak.value}
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Expected at: <strong className="text-slate-800 font-mono">{wetBulbPeak.time}</strong>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-xs space-y-1.5">
            <p className="text-slate-600 leading-relaxed">{wetBulbPeak.driver}</p>
            <span className="text-[11px] font-mono text-slate-400 block">
              Confidence: {wetBulbPeak.confidence}%
            </span>
          </div>
        </div>

        {/* 3. Solar UV & Radiation Peak */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                <Sun className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Solar UV Peak</span>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              {uvPeak.severity}
            </span>
          </div>

          <div>
            <div className="text-3xl font-extrabold text-slate-900 font-mono">
              {uvPeak.value}
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Expected at: <strong className="text-slate-800 font-mono">{uvPeak.time}</strong>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-xs space-y-1.5">
            <div className="flex items-center justify-between text-slate-600">
              <span>Protection Window:</span>
              <strong className="text-slate-900 font-mono">{uvPeak.protectiveWindow}</strong>
            </div>
            <span className="text-[11px] font-mono text-slate-400 block">
              Confidence: {uvPeak.confidence}%
            </span>
          </div>
        </div>
      </div>

      {/* Recommended Tactical Protocol */}
      <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
        <div>
          <h4 className="font-bold text-slate-900 text-sm">Critical Exposure Window: 13:00 – 16:30</h4>
          <p className="text-slate-600 mt-0.5 leading-relaxed">
            Avoid scheduled unshaded heavy outdoor labor and ensure active hydration stations are available between 1:00 PM and 4:30 PM.
          </p>
        </div>

        <PrimaryButton
          id="peak-ask-ai"
          onClick={() => openAIWithContext({
            question: `What operational adjustments and safety measures should be taken during the peak window (${tempPeak.time}, ${tempPeak.value}) for ${currentLocation.displayName}?`,
            sourceModule: 'Peak Finder Tool',
          })}
          className="text-xs py-2 px-3 whitespace-nowrap self-end sm:self-center"
        >
          AI Peak Guidance
        </PrimaryButton>
      </div>
    </div>
  );
};

export default PeakFinderTool;
