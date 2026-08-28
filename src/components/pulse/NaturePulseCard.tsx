import React, { useState, useEffect } from 'react';
import {
  Activity,
  Flame,
  Wind,
  Droplets,
  Trees,
  ShieldAlert,
  Sun,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  Info,
  ShieldCheck,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import {
  NaturePulseResult,
  PulseDimensionResult,
  PulseStatus,
  DimensionKey,
} from '../../types/naturePulse';
import { DimensionDetailModal } from './DimensionDetailModal';
import { MethodologyModal } from './MethodologyModal';
import { NumberCounter } from '../motion/MotionPrimitives';

interface NaturePulseCardProps {
  pulse: NaturePulseResult | null;
  loading?: boolean;
  onRefresh?: () => void;
  className?: string;
}

export const NaturePulseCard: React.FC<NaturePulseCardProps> = ({
  pulse,
  loading = false,
  onRefresh,
  className = '',
}) => {
  const [selectedDimension, setSelectedDimension] = useState<PulseDimensionResult | null>(null);
  const [isMethodologyOpen, setIsMethodologyOpen] = useState(false);

  // Status visual color and badge helpers
  const getStatusTheme = (status: PulseStatus) => {
    switch (status) {
      case 'HEALTHY':
        return {
          textColor: 'text-emerald-400',
          bgBadge: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
          ringColor: 'from-emerald-500/20 to-emerald-500/5',
          barColor: 'bg-emerald-500',
          glow: 'shadow-emerald-500/10',
        };
      case 'STABLE':
        return {
          textColor: 'text-blue-400',
          bgBadge: 'bg-blue-500/15 border-blue-500/30 text-blue-300',
          ringColor: 'from-blue-500/20 to-blue-500/5',
          barColor: 'bg-blue-500',
          glow: 'shadow-blue-500/10',
        };
      case 'WATCH':
        return {
          textColor: 'text-amber-400',
          bgBadge: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
          ringColor: 'from-amber-500/20 to-amber-500/5',
          barColor: 'bg-amber-500',
          glow: 'shadow-amber-500/10',
        };
      case 'ELEVATED':
        return {
          textColor: 'text-orange-400',
          bgBadge: 'bg-orange-500/15 border-orange-500/30 text-orange-300',
          ringColor: 'from-orange-500/20 to-orange-500/5',
          barColor: 'bg-orange-500',
          glow: 'shadow-orange-500/10',
        };
      case 'CRITICAL':
        return {
          textColor: 'text-rose-400',
          bgBadge: 'bg-rose-500/15 border-rose-500/30 text-rose-300',
          ringColor: 'from-rose-500/20 to-rose-500/5',
          barColor: 'bg-rose-500',
          glow: 'shadow-rose-500/20',
        };
    }
  };

  const getDimensionIcon = (key: DimensionKey) => {
    switch (key) {
      case 'heat':
        return <Flame className="w-4 h-4 text-orange-400" />;
      case 'air':
        return <Wind className="w-4 h-4 text-sky-400" />;
      case 'water':
        return <Droplets className="w-4 h-4 text-blue-400" />;
      case 'nature':
        return <Trees className="w-4 h-4 text-emerald-400" />;
      case 'fire':
        return <ShieldAlert className="w-4 h-4 text-rose-400" />;
      case 'solar':
        return <Sun className="w-4 h-4 text-amber-400" />;
    }
  };

  const getDimensionBadgeStyle = (status: PulseStatus) => {
    switch (status) {
      case 'HEALTHY':
        return 'text-emerald-300 bg-emerald-500/10 border-emerald-500/25';
      case 'STABLE':
        return 'text-blue-300 bg-blue-500/10 border-blue-500/25';
      case 'WATCH':
        return 'text-amber-300 bg-amber-500/10 border-amber-500/25';
      case 'ELEVATED':
        return 'text-orange-300 bg-orange-500/10 border-orange-500/25';
      case 'CRITICAL':
        return 'text-rose-300 bg-rose-500/10 border-rose-500/25 animate-pulse';
    }
  };

  if (loading && !pulse) {
    return (
      <div
        id="nature-pulse-card-loading"
        className={`w-full p-6 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 flex flex-col items-center justify-center min-h-[360px] animate-pulse ${className}`}
      >
        <Activity className="w-8 h-8 text-emerald-500 animate-spin mb-3" />
        <span className="text-xs font-mono tracking-wider uppercase">
          Synthesizing Environmental Pulse...
        </span>
        <span className="text-[11px] text-slate-400 mt-1">
          Evaluating FortyGuard Microclimate & Open Datasets
        </span>
      </div>
    );
  }

  if (!pulse) {
    return null;
  }

  const theme = getStatusTheme(pulse.overallStatus);
  const dimensionKeys: DimensionKey[] = ['heat', 'air', 'water', 'nature', 'fire', 'solar'];

  return (
    <>
      <div
        id="nature-pulse-card"
        className={`relative w-full rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800/90 shadow-xl overflow-hidden text-slate-200 transition-all duration-300 hover:border-slate-700 ${className}`}
      >
        {/* Subtle Ambient Radial Glow */}
        <div
          className={`absolute -top-24 -right-24 w-64 h-64 rounded-full bg-gradient-to-br ${theme.ringColor} blur-3xl pointer-events-none opacity-40`}
        />

        {/* Card Header */}
        <div className="px-5 pt-5 pb-3 border-b border-slate-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold tracking-widest uppercase text-slate-400">
                  ENVIRONMENTAL PULSE
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <p className="text-[11px] text-slate-400 truncate max-w-[200px] sm:max-w-xs font-sans">
                {pulse.location.locationName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              id="pulse-methodology-btn"
              onClick={() => setIsMethodologyOpen(true)}
              title="View Methodology & Transparent Scoring"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition text-xs flex items-center gap-1 font-mono"
            >
              <Info className="w-4 h-4" />
            </button>
            {onRefresh && (
              <button
                id="pulse-refresh-btn"
                onClick={onRefresh}
                disabled={loading}
                title="Refresh Nature Pulse"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {/* Hero Score & Status Banner */}
        <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/40">
          <div className="flex items-baseline gap-3">
            <div className="flex items-baseline gap-1.5">
              <span className={`text-4xl sm:text-5xl font-black font-mono tracking-tight ${theme.textColor}`}>
                <NumberCounter value={pulse.overallScore} duration={0.8} />
              </span>
              <span className="text-xs font-mono text-slate-400">/100</span>
            </div>

            <div className="flex flex-col">
              <span
                className={`px-3 py-1 rounded-full text-xs font-mono font-bold border tracking-wide uppercase self-start ${theme.bgBadge}`}
              >
                {pulse.overallStatusLabel}
              </span>
              <span className="text-[10px] font-mono text-slate-400 mt-1 flex items-center gap-1">
                {pulse.trend === 'IMPROVING' ? (
                  <TrendingUp className="w-3 h-3 text-emerald-400" />
                ) : pulse.trend === 'DEGRADING' ? (
                  <TrendingDown className="w-3 h-3 text-rose-400" />
                ) : (
                  <Minus className="w-3 h-3 text-blue-400" />
                )}
                {pulse.trendDelta}
              </span>
            </div>
          </div>

          {/* Confidence & Active Dimensions Pill */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-slate-300 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{pulse.confidence}% Confidence</span>
            </div>
            <div className="px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-slate-400">
              {pulse.availableDimensionCount}/{pulse.totalDimensionCount} Dimensions
            </div>
          </div>
        </div>

        {/* Natural Language Summary Headline */}
        <div className="px-5 py-2.5 bg-slate-950/40 border-b border-slate-800/40">
          <p className="text-xs text-slate-300 font-medium leading-relaxed">
            {pulse.summaryHeadline}
          </p>
        </div>

        {/* Dimensions List (Mobile-Optimized Single-Column / Tap-to-Inspect) */}
        <div className="p-3 space-y-1.5">
          {dimensionKeys.map((key) => {
            const dim = pulse.dimensions[key];
            if (!dim.isAvailable || dim.score === null) {
              return (
                <div
                  key={key}
                  className="px-3 py-2 rounded-xl bg-slate-950/20 border border-slate-800/30 flex items-center justify-between text-slate-400 opacity-60"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="opacity-40">{getDimensionIcon(key)}</div>
                    <span className="text-xs font-mono font-medium">{dim.shortLabel}</span>
                  </div>
                  <span className="text-[10px] font-mono uppercase bg-slate-800/50 px-2 py-0.5 rounded text-slate-400">
                    UNAVAILABLE
                  </span>
                </div>
              );
            }

            const badgeStyle = getDimensionBadgeStyle(dim.status);

            return (
              <button
                key={key}
                id={`pulse-dimension-btn-${key}`}
                onClick={() => setSelectedDimension(dim)}
                className="w-full group px-3 py-2.5 rounded-xl bg-slate-950/50 hover:bg-slate-800/60 border border-slate-800/60 hover:border-slate-700 transition-all duration-150 flex items-center justify-between text-left"
              >
                {/* Left: Icon & Label */}
                <div className="flex items-center gap-3 min-w-[100px]">
                  <div className="p-1 rounded-md bg-slate-900 border border-slate-800 group-hover:border-slate-700 transition">
                    {getDimensionIcon(key)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-slate-200 group-hover:text-white transition">
                        {dim.shortLabel}
                      </span>
                      {dim.isExperimental && (
                        <span className="px-1 py-0.2 rounded text-[9px] font-mono text-indigo-400 bg-indigo-500/10">
                          EXP
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 block truncate max-w-[140px] sm:max-w-[220px]">
                      {dim.topDrivers[0] || dim.sourceName}
                    </span>
                  </div>
                </div>

                {/* Right: Score Bar, Badge & Chevron */}
                <div className="flex items-center gap-3">
                  {/* Subtle Progress Bar */}
                  <div className="hidden sm:block w-20 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        dim.status === 'HEALTHY'
                          ? 'bg-emerald-500'
                          : dim.status === 'STABLE'
                          ? 'bg-blue-500'
                          : dim.status === 'WATCH'
                          ? 'bg-amber-500'
                          : dim.status === 'ELEVATED'
                          ? 'bg-orange-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(5, dim.score))}%` }}
                    />
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-md text-xs font-mono font-bold uppercase border tracking-wider ${badgeStyle}`}
                  >
                    {dim.statusLabel}
                  </span>

                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white transition group-hover:translate-x-0.5" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer Info & Tap Hint */}
        <div className="px-5 py-2.5 bg-slate-950/60 border-t border-slate-800/40 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span className="flex items-center gap-1 text-slate-400">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            Tap any dimension to inspect empirical signals
          </span>
          <span className="text-[10px]">
            {new Date(pulse.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      {/* Interactive Detail Modal */}
      <DimensionDetailModal
        dimension={selectedDimension}
        isOpen={Boolean(selectedDimension)}
        onClose={() => setSelectedDimension(null)}
        onOpenMethodology={() => {
          setSelectedDimension(null);
          setIsMethodologyOpen(true);
        }}
      />

      {/* Transparent Methodology Modal */}
      <MethodologyModal
        methodologyNotes={pulse.methodologyNotes}
        isOpen={isMethodologyOpen}
        onClose={() => setIsMethodologyOpen(false)}
      />
    </>
  );
};
