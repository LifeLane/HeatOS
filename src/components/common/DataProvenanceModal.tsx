import React from 'react';
import {
  ShieldCheck,
  X,
  Database,
  ExternalLink,
  Layers,
  Clock,
  Sparkles,
  Compass,
  CheckCircle2,
} from 'lucide-react';
import { MetricProvenance } from '../../types/normalizedEnvironmentalState';
import { safeFormatShortTime } from '../../utils/formatters';

interface DataProvenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  provenance: MetricProvenance | null;
  metricValue?: string | number;
}

export const DataProvenanceModal: React.FC<DataProvenanceModalProps> = ({
  isOpen,
  onClose,
  provenance,
  metricValue,
}) => {
  if (!isOpen || !provenance) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        id="provenance-modal"
        className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 leading-tight">Data Provenance</h3>
              <p className="text-[11px] text-slate-500 font-medium">{provenance.metricLabel}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 space-y-4">
          {/* Main Metric Banner */}
          {metricValue !== undefined && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Observed Value</p>
                <p className="text-xl font-black text-slate-900 font-mono mt-0.5">{metricValue}</p>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" />
                  {provenance.confidence}% Confidence
                </span>
              </div>
            </div>
          )}

          {/* Source Attribution Cards */}
          <div className="space-y-2.5">
            <div className="p-3 rounded-xl border border-slate-200/80 bg-white">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Primary Provider</p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm font-bold text-slate-800">{provenance.sourceName}</span>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  {provenance.freshness}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{provenance.institution}</p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl border border-slate-200/80 bg-white">
                <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                  <Layers className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Resolution</span>
                </div>
                <p className="text-xs font-semibold text-slate-700 truncate">{provenance.spatialResolution}</p>
              </div>

              <div className="p-3 rounded-xl border border-slate-200/80 bg-white">
                <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Observed</span>
                </div>
                <p className="text-xs font-semibold text-slate-700 truncate">
                  {safeFormatShortTime(provenance.timestamp)}
                </p>
              </div>
            </div>

            {provenance.isEstimate && (
              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-amber-900 text-xs flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Algorithmic Synthesis: </span>
                  Derived via HeatOS Intelligence utilizing standard physical and psychrometric formulations.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50/90 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>HeatOS Provenance & Quality Assurance</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-slate-900 text-white font-medium text-xs hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
