/**
 * HeatOS: Temporal Horizon & Forecast Playback Control for Living Environmental Map
 * Supports NOW, +2H, +4H, +6H, +12H, +24H with clean status communication.
 */

import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Clock, Sparkles } from 'lucide-react';
import { MapTimeHorizon } from '../../server/map/types';

interface TimePlaybackControlProps {
  currentHorizon: MapTimeHorizon;
  onSelectHorizon: (horizon: MapTimeHorizon) => void;
}

interface HorizonStep {
  key: MapTimeHorizon;
  label: string;
  subLabel: string;
  type: 'OBSERVED' | 'FORECAST';
}

const HORIZONS: HorizonStep[] = [
  { key: 'now', label: 'NOW', subLabel: 'Real-Time Telemetry', type: 'OBSERVED' },
  { key: '+2h', label: '+2H', subLabel: 'Point Forecast Projection', type: 'FORECAST' },
  { key: '+4h', label: '+4H', subLabel: 'Diurnal Peak Projection', type: 'FORECAST' },
  { key: '+6h', label: '+6H', subLabel: 'Evening Dissipation Projection', type: 'FORECAST' },
  { key: '+12h', label: '+12H', subLabel: 'Overnight Baseline Projection', type: 'FORECAST' },
  { key: '+24h', label: '+24H', subLabel: 'Next-Day Diurnal Projection', type: 'FORECAST' },
];

export const TimePlaybackControl: React.FC<TimePlaybackControlProps> = ({
  currentHorizon,
  onSelectHorizon,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  // Playback timer
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      const currentIndex = HORIZONS.findIndex((h) => h.key === currentHorizon);
      const nextIndex = (currentIndex + 1) % HORIZONS.length;
      onSelectHorizon(HORIZONS[nextIndex].key);
    }, 2500);

    return () => clearInterval(interval);
  }, [isPlaying, currentHorizon, onSelectHorizon]);

  const activeStep = HORIZONS.find((h) => h.key === currentHorizon) || HORIZONS[0];

  return (
    <div
      id="time-playback-control"
      className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-1.5 sm:p-2 shadow-lg shadow-slate-900/5 flex flex-row flex-wrap items-center justify-center gap-1.5 sm:gap-2.5 select-none transition-all"
    >
      {/* Play/Pause & Reset Control */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => setIsPlaying(!isPlaying)}
          title={isPlaying ? 'Pause Timeline' : 'Play Timeline Forecast'}
          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
            isPlaying
              ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
        </button>

        <button
          type="button"
          onClick={() => {
            setIsPlaying(false);
            onSelectHorizon('now');
          }}
          title="Reset to Real-Time (NOW)"
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-all cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Step Pills */}
      <div className="flex items-center gap-1 bg-slate-100 p-0.5 sm:p-1 rounded-xl border border-slate-200/80 overflow-x-auto max-w-full no-scrollbar">
        {HORIZONS.map((h) => {
          const isSelected = h.key === currentHorizon;
          return (
            <button
              key={h.key}
              type="button"
              onClick={() => {
                setIsPlaying(false);
                onSelectHorizon(h.key);
              }}
              className={`px-2 py-1 rounded-lg text-xs font-mono font-bold whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
                isSelected
                  ? h.type === 'OBSERVED'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-orange-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <span>{h.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Horizon Provenance Tag */}
      <div className="hidden md:flex items-center gap-1.5 text-[11px] text-slate-500 px-2 border-l border-slate-200">
        <Clock className="w-3.5 h-3.5 text-[#2563EB]" />
        <span className="font-medium text-slate-700">{activeStep.subLabel}</span>
      </div>
    </div>
  );
};

export default TimePlaybackControl;
