/**
 * HeatOS Phase 7: Event Engine Diagnostic Test Runner Modal
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  RefreshCw,
  Cpu,
  AlertTriangle,
} from 'lucide-react';
import { EventService } from '../../services/eventService';
import { EventEngineTestReport, EventEngineTestResult } from '../../server/events/types';

interface EventDiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EventDiagnosticModal: React.FC<EventDiagnosticModalProps> = ({ isOpen, onClose }) => {
  const [report, setReport] = useState<EventEngineTestReport | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const runTests = async () => {
    setIsRunning(true);
    setError(null);
    try {
      const data = await EventService.runDiagnostics();
      setReport(data);
    } catch (err: any) {
      setError(err.message || 'Failed to run Event Engine diagnostics');
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    if (isOpen && !report && !isRunning) {
      runTests();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-700">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                Phase 7: Environmental Event Engine Diagnostics
              </h2>
              <p className="text-xs text-slate-500 font-mono">
                Automated Verification Suite (Anomaly, Convergence, Noise Rejection)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={runTests}
              disabled={isRunning}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all disabled:opacity-50 cursor-pointer shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
              <span>{isRunning ? 'Running Tests...' : 'Re-Run Suite'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4">
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Test Summary Scorecard */}
          {report && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Total Tests
                </span>
                <span className="text-xl font-black text-slate-900 font-mono">
                  {report.totalTests}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
                  Passed
                </span>
                <span className="text-xl font-black text-emerald-900 font-mono">
                  {report.passedCount}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200">
                <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block">
                  Pass Rate
                </span>
                <span className="text-xl font-black text-blue-900 font-mono">
                  {report.passRatePct}%
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Duration
                </span>
                <span className="text-xl font-black text-slate-900 font-mono">
                  {report.durationMs}ms
                </span>
              </div>
            </div>
          )}

          {/* Test Items List */}
          <div className="space-y-2.5">
            {report?.results.map((test: EventEngineTestResult) => (
              <div
                key={test.testId}
                className={`p-3.5 rounded-2xl border transition-all ${
                  test.passed
                    ? 'bg-emerald-50/20 border-emerald-200/80'
                    : 'bg-rose-50/30 border-rose-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    {test.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                        <span>{test.name}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                          {test.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{test.details}</p>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-slate-400 shrink-0">
                    {test.durationMs}ms
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-3xl flex justify-between items-center text-xs text-slate-500 font-mono">
          <span>HeatOS Verification Suite v7.0</span>
          <button
            onClick={onClose}
            className="px-4 py-2 font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-all cursor-pointer shadow-2xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
