import React from 'react';
import {
  Flame,
  Wind,
  Droplets,
  Trees,
  ShieldAlert,
  Sun,
  X,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { PulseDimensionResult, PulseStatus } from '../../types/naturePulse';
import { safeFormatTime } from '../../utils/formatters';

interface DimensionDetailModalProps {
  dimension: PulseDimensionResult | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenMethodology: () => void;
}

export const DimensionDetailModal: React.FC<DimensionDetailModalProps> = ({
  dimension,
  isOpen,
  onClose,
  onOpenMethodology,
}) => {
  if (!isOpen || !dimension) return null;

  const getDimensionIcon = () => {
    switch (dimension.key) {
      case 'heat':
        return <Flame className="w-5 h-5 text-orange-400" />;
      case 'air':
        return <Wind className="w-5 h-5 text-sky-400" />;
      case 'water':
        return <Droplets className="w-5 h-5 text-blue-400" />;
      case 'nature':
        return <Trees className="w-5 h-5 text-emerald-400" />;
      case 'fire':
        return <ShieldAlert className="w-5 h-5 text-rose-400" />;
      case 'solar':
        return <Sun className="w-5 h-5 text-amber-400" />;
    }
  };

  const getStatusBadge = (status: PulseStatus, statusLabel: string) => {
    switch (status) {
      case 'HEALTHY':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            {statusLabel}
          </span>
        );
      case 'STABLE':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
            {statusLabel}
          </span>
        );
      case 'WATCH':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            {statusLabel}
          </span>
        );
      case 'ELEVATED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-orange-500/20 text-orange-300 border border-orange-500/30">
            {statusLabel}
          </span>
        );
      case 'CRITICAL':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse">
            {statusLabel}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div
        id="dimension-detail-modal"
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-200 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700">
              {getDimensionIcon()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  {dimension.label}
                </h3>
                {dimension.isExperimental && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    EXPERIMENTAL
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Dimension Telemetry & Provenance
              </p>
            </div>
          </div>
          <button
            id="close-dimension-detail-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Score & Status Hero Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                Dimension Score
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white font-mono">
                  {dimension.score !== null ? dimension.score : '—'}
                </span>
                <span className="text-xs text-slate-400 font-mono">/ 100</span>
              </div>
            </div>

            <div className="text-right flex flex-col items-end gap-1.5">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                Condition Status
              </span>
              {getStatusBadge(dimension.status, dimension.statusLabel)}
            </div>
          </div>

          {/* Trend & Confidence Badges */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                Trend Trajectory
              </span>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                {dimension.trend === 'IMPROVING' ? (
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                ) : dimension.trend === 'DEGRADING' ? (
                  <TrendingDown className="w-4 h-4 text-rose-400" />
                ) : (
                  <Minus className="w-4 h-4 text-blue-400" />
                )}
                <span>{dimension.trendLabel}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                Data Confidence
              </span>
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-200">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{dimension.confidence}% Verified</span>
              </div>
            </div>
          </div>

          {/* Top Real-World Drivers */}
          <div>
            <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Primary Empirical Drivers
            </h4>
            <div className="space-y-2">
              {dimension.topDrivers.map((driver, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-slate-950/40 border border-slate-800/60 text-xs text-slate-300 flex items-start gap-2.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <span>{driver}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Raw Measured Signals */}
          {Object.keys(dimension.rawSignals).length > 0 && (
            <div>
              <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                Measured Telemetry Signals
              </h4>
              <div className="grid grid-cols-2 gap-2 bg-slate-950/50 p-3 rounded-xl border border-slate-800/60">
                {Object.entries(dimension.rawSignals).map(([key, val]) => (
                  <div key={key} className="flex flex-col">
                    <span className="text-[10px] font-mono text-slate-400 truncate">
                      {key}
                    </span>
                    <span className="text-xs font-mono font-semibold text-slate-200">
                      {val !== null && val !== undefined ? String(val) : '—'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Methodology & Non-Fabrication Guarantee */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-slate-300 font-semibold font-mono text-[11px]">
                <Info className="w-3.5 h-3.5 text-blue-400" />
                Methodology & Source
              </div>
              <button
                onClick={onOpenMethodology}
                className="text-[11px] text-blue-400 hover:text-blue-300 font-mono underline flex items-center gap-1"
              >
                View Full Docs
              </button>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400">
              {dimension.methodologySummary}
            </p>
            <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>Source: <strong className="text-slate-300">{dimension.sourceName}</strong></span>
              <span>Observed: {safeFormatTime(dimension.timestamp)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-mono transition"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
