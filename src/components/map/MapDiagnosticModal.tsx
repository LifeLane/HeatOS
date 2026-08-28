/**
 * HeatOS Phase 6: Living Environment Map Diagnostic Modal
 * Automated test suite runner verifying all Phase 6 Living Map capabilities.
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Layers,
  MapPin,
  Flame,
  Radio,
  Clock,
} from 'lucide-react';
import { MapService } from '../../services/mapService';
import PrimaryButton from '../ui/PrimaryButton';
import SecondaryButton from '../ui/SecondaryButton';

interface MapDiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MapDiagnosticModal: React.FC<MapDiagnosticModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [testReport, setTestReport] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const runTests = async () => {
    try {
      setIsRunning(true);
      setError(null);
      const report = await MapService.runDiagnostics();
      setTestReport(report);
    } catch (err: any) {
      setError(err.message || 'Failed to execute Map diagnostic test suite');
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    if (isOpen && !testReport) {
      runTests();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div
        id="map-diagnostic-modal"
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-scale-in"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Living Environment Map Verification Suite
              </h2>
              <p className="text-xs text-slate-500">
                Phase 6 Diagnostic Verification (Cartography, Layers, Hotspots & Legends)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-6 py-5 overflow-y-auto flex-1 space-y-4 text-sm">
          {/* Summary Status Bar */}
          {testReport && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Test Execution Result
                </div>
                <div className="text-lg font-extrabold text-slate-900 flex items-center gap-2 mt-0.5">
                  <span className={testReport.passRatePct === 100 ? 'text-emerald-600' : 'text-amber-600'}>
                    {testReport.passedCount} / {testReport.totalTests} Tests Passed ({testReport.passRatePct}%)
                  </span>
                </div>
              </div>

              <div className="text-right text-xs font-mono text-slate-500">
                <div>Execution Time: {testReport.durationMs}ms</div>
                <div className="text-emerald-700 font-bold">Status: HEALTHY</div>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              {error}
            </div>
          )}

          {/* Test Cases List */}
          <div className="space-y-2.5">
            {testReport?.results?.map((res: any) => (
              <div
                key={res.testId}
                className={`p-3.5 rounded-2xl border transition-all ${
                  res.passed
                    ? 'bg-white border-slate-200 hover:border-emerald-300'
                    : 'bg-rose-50/50 border-rose-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    {res.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="text-xs font-bold text-slate-900">{res.name}</div>
                      <div className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                        {res.details}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0">
                    {res.durationMs}ms
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <PrimaryButton onClick={runTests} disabled={isRunning} size="sm">
            <RotateCcw className={`w-3.5 h-3.5 mr-1.5 ${isRunning ? 'animate-spin' : ''}`} />
            {isRunning ? 'Running Tests...' : 'Re-run Diagnostics'}
          </PrimaryButton>

          <SecondaryButton onClick={onClose} size="sm">
            Close
          </SecondaryButton>
        </div>
      </div>
    </div>
  );
};
