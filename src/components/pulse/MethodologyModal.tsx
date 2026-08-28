import React from 'react';
import { X, ShieldCheck, Scale, Database, HelpCircle, FileText, CheckCircle2 } from 'lucide-react';
import { PulseMethodologyNotes } from '../../types/naturePulse';

interface MethodologyModalProps {
  methodologyNotes: PulseMethodologyNotes | null;
  isOpen: boolean;
  onClose: () => void;
}

export const MethodologyModal: React.FC<MethodologyModalProps> = ({
  methodologyNotes,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !methodologyNotes) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div
        id="methodology-modal"
        className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-200 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                {methodologyNotes.title}
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                {methodologyNotes.metricName} • Scientific Formulation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300">
          {/* Core Concept */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <h4 className="text-xs font-mono font-bold text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-blue-400" />
              Core Concept: "How is this place doing right now?"
            </h4>
            <p className="text-slate-300 leading-relaxed">
              {methodologyNotes.description}
            </p>
          </div>

          {/* Non-Fabrication Guarantee */}
          <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-2">
            <h4 className="text-xs font-mono font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Strict Missing Data Non-Fabrication Guarantee
            </h4>
            <p className="text-emerald-100/90 leading-relaxed font-sans">
              {methodologyNotes.nonFabricationGuarantee}
            </p>
          </div>

          {/* Dimension Weight Distribution */}
          <div>
            <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-purple-400" />
              Default Dimension Weight Distribution
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {Object.entries(methodologyNotes.dimensionWeights).map(([dim, weight]) => (
                <div
                  key={dim}
                  className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between"
                >
                  <span className="font-mono text-slate-300 capitalize text-xs">
                    {dim}
                  </span>
                  <span className="font-mono font-bold text-purple-300 text-xs">
                    {Math.round(Number(weight) * 100)}%
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 font-mono mt-2 italic">
              * Weights dynamically normalize to 100% when any single dimension is absent or unmeasured.
            </p>
          </div>

          {/* Condition Status Thresholds */}
          <div>
            <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-amber-400" />
              Condition Status Tier Definitions (0–100 Scale)
            </h4>
            <div className="space-y-2 font-mono">
              <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-emerald-300">
                <strong>HEALTHY</strong>: {methodologyNotes.scoringScale.healthy}
              </div>
              <div className="p-2.5 rounded-lg bg-blue-950/20 border border-blue-500/20 text-blue-300">
                <strong>STABLE</strong>: {methodologyNotes.scoringScale.stable}
              </div>
              <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-500/20 text-amber-300">
                <strong>WATCH</strong>: {methodologyNotes.scoringScale.watch}
              </div>
              <div className="p-2.5 rounded-lg bg-orange-950/20 border border-orange-500/20 text-orange-300">
                <strong>ELEVATED</strong>: {methodologyNotes.scoringScale.elevated}
              </div>
              <div className="p-2.5 rounded-lg bg-rose-950/20 border border-rose-500/20 text-rose-300">
                <strong>CRITICAL</strong>: {methodologyNotes.scoringScale.critical}
              </div>
            </div>
          </div>

          {/* Transparency Notice */}
          <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800 text-[11px] text-slate-400">
            {methodologyNotes.transparencyNotice}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-mono transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
