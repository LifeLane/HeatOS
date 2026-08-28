/**
 * HeatOS Phase 8: Nature Analyst AI Diagnostics Modal
 * 
 * Interactive diagnostic testing interface for the 8-point AI verification suite.
 */

import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  X,
  Clock,
  ShieldCheck,
  Cpu,
  Database,
  ArrowRight,
} from 'lucide-react';
import { AiAnalystService } from '../../services/aiAnalystService';
import { AITestReport } from '../../server/ai/types';
import PrimaryButton from '../ui/PrimaryButton';
import SecondaryButton from '../ui/SecondaryButton';

interface AIDiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIDiagnosticsModal: React.FC<AIDiagnosticsModalProps> = ({ isOpen, onClose }) => {
  const [report, setReport] = useState<AITestReport | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRunTests = async () => {
    setIsRunning(true);
    setError(null);
    try {
      const data = await AiAnalystService.runDiagnostics();
      setReport(data);
    } catch (err: any) {
      setError(err.message || 'Failed to execute AI diagnostics');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-50/50 via-white to-blue-50/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-600 text-white shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold text-slate-900">
                  Nature Analyst AI Diagnostic Suite
                </h3>
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-mono font-bold">
                  Phase 8
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                8-Point Verification: Router, Grounding, Citations, 4-Part Structure, and Fallback Resilience.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Executive Overview Card */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Test Suite Status
              </div>
              <div className="text-base font-bold text-slate-900 mt-0.5">
                {report
                  ? `${report.passedTests} of ${report.totalTests} Tests Verified Passing (${report.durationMs}ms)`
                  : 'Ready to run automated verification tests'}
              </div>
              <p className="text-xs text-slate-600 mt-1 max-w-lg">
                Evaluates Agent Router intent resolution, multi-source citation verification, 4-part structure integrity, and zero-hallucination guardrails.
              </p>
            </div>
            <PrimaryButton
              id="run-ai-tests-btn"
              onClick={handleRunTests}
              isLoading={isRunning}
              icon={<RefreshCw className="w-4 h-4" />}
            >
              {report ? 'Re-Run Suite' : 'Execute Test Suite'}
            </PrimaryButton>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Test Results List */}
          {report && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Verification Results ({report.passedTests}/{report.totalTests} Passing)
              </h4>
              <div className="space-y-2.5">
                {report.results.map((test) => (
                  <div
                    key={test.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      test.passed
                        ? 'bg-emerald-50/40 border-emerald-200/80'
                        : 'bg-rose-50/40 border-rose-200/80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        {test.passed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-600 mt-0.5 flex-shrink-0" />
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">
                              {test.name}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-mono text-slate-600">
                              {test.category}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1">{test.details}</p>
                          {test.evidence && (
                            <pre className="mt-2 p-2 rounded-lg bg-slate-900 text-slate-100 text-[10px] font-mono overflow-x-auto max-w-xl">
                              {JSON.stringify(test.evidence, null, 2)}
                            </pre>
                          )}
                        </div>
                      </div>
                      <span className="text-[11px] font-mono text-slate-500 whitespace-nowrap">
                        {test.durationMs}ms
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>HeatOS AI Grounding Standard</span>
          </div>
          <SecondaryButton id="close-ai-diag-btn" onClick={onClose} size="sm">
            Close
          </SecondaryButton>
        </div>
      </div>
    </div>
  );
};

export default AIDiagnosticsModal;
