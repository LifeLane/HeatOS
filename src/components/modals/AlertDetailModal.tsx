/**
 * HeatOS Phase 9: Alert Detail Inspector Modal
 * 
 * Strict deterministic evidence chain showing What, Where, When, Evidence,
 * Why it matters, Expected duration, Recommended action, and Sources.
 */

import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  ShieldAlert,
  Clock,
  MapPin,
  Activity,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Layers,
  ArrowRight,
  FileText,
  Copy,
  Check,
} from 'lucide-react';
import { useMonitoring } from '../../context/MonitoringContext';
import { AlertTier } from '../../server/monitoring/types';

export const AlertDetailModal: React.FC = () => {
  const {
    selectedAlert,
    isLoadingAlertDetail,
    isAlertModalOpen,
    closeAlertDetail,
    acknowledgeCurrentAlert,
    executeStandardAction,
  } = useMonitoring();

  const [isCopied, setIsCopied] = useState(false);
  const [isAcknowledging, setIsAcknowledging] = useState(false);

  if (!isAlertModalOpen) return null;

  const handleCopyAlert = () => {
    if (!selectedAlert) return;
    const text = `[HeatOS Alert - ${selectedAlert.tier}] ${selectedAlert.headline}
Location: ${selectedAlert.where.locationName} (${selectedAlert.where.latitude}, ${selectedAlert.where.longitude})
Detected: ${new Date(selectedAlert.when.detectedAt).toLocaleString()}
What Happened: ${selectedAlert.whatHappened}
Evidence: Observed ${selectedAlert.evidence.observedValue}°C vs Baseline ${selectedAlert.evidence.baselineValue}°C (Delta: +${selectedAlert.evidence.anomalyDelta}°C)
Why It Matters: ${selectedAlert.whyItMatters.healthRisk}
Recommended Action: ${selectedAlert.recommendedAction.primary}
Sources: ${selectedAlert.sources.map(s => s.sourceName).join(', ')}`;

    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleAcknowledge = async () => {
    if (!selectedAlert) return;
    setIsAcknowledging(true);
    try {
      await acknowledgeCurrentAlert(selectedAlert.eventId);
    } finally {
      setIsAcknowledging(false);
    }
  };

  const getTierBadge = (tier: AlertTier) => {
    switch (tier) {
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            CRITICAL ALARM
          </span>
        );
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            HIGH PRIORITY
          </span>
        );
      case 'WATCH':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-300 border border-yellow-500/40">
            <span className="w-2 h-2 rounded-full bg-yellow-400" />
            ENVIRONMENTAL WATCH
          </span>
        );
      case 'INFORMATION':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40">
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            INFORMATION
          </span>
        );
    }
  };

  return (
    <div
      id="alert-detail-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto"
      onClick={closeAlertDetail}
    >
      <div
        id="alert-detail-modal-container"
        className="relative w-full max-w-3xl bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl overflow-hidden text-zinc-100 my-8"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-zinc-800 bg-zinc-950/60">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              {selectedAlert ? getTierBadge(selectedAlert.tier) : null}
              {selectedAlert?.acknowledged ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Acknowledged
                </span>
              ) : null}
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {isLoadingAlertDetail ? 'Evaluating Alert Telemetry...' : selectedAlert?.headline || 'Environmental Incident Alert'}
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                {selectedAlert?.where.locationName}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-zinc-500" />
                {selectedAlert ? new Date(selectedAlert.when.detectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
              </span>
              <span className="text-zinc-500">ID: {selectedAlert?.eventId}</span>
            </div>
          </div>
          <button
            id="btn-close-alert-modal"
            onClick={closeAlertDetail}
            className="p-2 text-zinc-400 hover:text-white rounded-lg bg-zinc-800/60 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {isLoadingAlertDetail || !selectedAlert ? (
          <div className="p-12 flex flex-col items-center justify-center space-y-4">
            <Activity className="w-8 h-8 text-emerald-400 animate-spin" />
            <p className="text-sm text-zinc-400">Compiling multi-sensor telemetry evidence...</p>
          </div>
        ) : (
          <div className="p-6 space-y-6 max-h-[72vh] overflow-y-auto">
            {/* 1. What Happened */}
            <div className="bg-zinc-800/40 border border-zinc-700/50 rounded-xl p-4.5 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
                <Activity className="w-4 h-4" />
                What Happened?
              </div>
              <p className="text-sm text-zinc-200 leading-relaxed">{selectedAlert.whatHappened}</p>
            </div>

            {/* 2. Structured Evidence Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-zinc-500" />
                  Deterministic Sensor Evidence
                </div>
                <span className="text-[11px] text-zinc-500 font-mono">
                  Persistence: {selectedAlert.evidence.persistenceMinutes} mins
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedAlert.evidence.signals.map((sig, idx) => (
                  <div key={idx} className="bg-zinc-800/60 border border-zinc-700/60 rounded-lg p-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-zinc-300">{sig.name}</span>
                      <span className="text-[11px] px-1.5 py-0.5 rounded bg-zinc-700/60 text-zinc-300 font-mono">
                        {sig.confidence}% conf
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold text-white">
                        {sig.value} {sig.unit}
                      </span>
                      {sig.delta && (
                        <span className="text-xs font-semibold text-rose-400">
                          {sig.delta}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-zinc-500 flex items-center justify-between">
                      <span>Source: {sig.source}</span>
                    </div>
                  </div>
                ))}

                {/* Baseline Departure Card */}
                <div className="bg-zinc-800/60 border border-zinc-700/60 rounded-lg p-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-zinc-300">Baseline Departure</span>
                    <span className="text-[11px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 font-mono">
                      +{selectedAlert.evidence.anomalyDelta}°C
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm text-zinc-400">
                      Norm: {selectedAlert.evidence.baselineValue}°C → Measured: {selectedAlert.evidence.observedValue}°C
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-500">
                    Model: {selectedAlert.evidence.baselineType.replace('_', ' ')}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Why It Matters (Impact) */}
            <div className="bg-zinc-800/40 border border-zinc-700/50 rounded-xl p-4.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
                  <ShieldAlert className="w-4 h-4" />
                  Why It Matters
                </div>
                <span className="text-xs text-zinc-400">
                  Severity Score: <strong className="text-white">{selectedAlert.whyItMatters.severityScore}/100</strong>
                </span>
              </div>
              <div className="space-y-1.5 text-sm text-zinc-300">
                <p>
                  <strong className="text-zinc-200">Health & Human Exposure:</strong> {selectedAlert.whyItMatters.healthRisk}
                </p>
                {selectedAlert.whyItMatters.infrastructureImpact && (
                  <p>
                    <strong className="text-zinc-200">Infrastructure & Energy:</strong> {selectedAlert.whyItMatters.infrastructureImpact}
                  </p>
                )}
                {selectedAlert.whyItMatters.operationalImpact && (
                  <p>
                    <strong className="text-zinc-200">Operations:</strong> {selectedAlert.whyItMatters.operationalImpact}
                  </p>
                )}
              </div>
            </div>

            {/* 4. Expected Duration & Recommended Action */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-4 space-y-1">
                <span className="text-xs font-semibold uppercase text-zinc-400">Expected Duration</span>
                <p className="text-sm font-medium text-white">{selectedAlert.expectedDuration}</p>
              </div>

              <div className="md:col-span-2 bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-4 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase text-emerald-400">Recommended Action</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                    {selectedAlert.recommendedAction.urgency}
                  </span>
                </div>
                <p className="text-sm font-medium text-emerald-100">
                  {selectedAlert.recommendedAction.primary}
                </p>
                {selectedAlert.recommendedAction.secondary && selectedAlert.recommendedAction.secondary.length > 0 && (
                  <ul className="text-xs text-emerald-300/80 list-disc list-inside space-y-0.5 pt-1">
                    {selectedAlert.recommendedAction.secondary.map((sec, i) => (
                      <li key={i}>{sec}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* 5. Authoritative Sources Provenance */}
            <div className="border-t border-zinc-800 pt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-zinc-300">Authoritative Sources:</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedAlert.sources.map((src, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 font-mono text-[11px]">
                      {src.sourceName} ({src.confidence}%)
                    </span>
                  ))}
                </div>
              </div>
              <button
                id="btn-copy-alert-summary"
                onClick={handleCopyAlert}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 text-xs transition-colors"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {isCopied ? 'Copied' : 'Copy Incident'}
              </button>
            </div>
          </div>
        )}

        {/* Modal Actions Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-5 border-t border-zinc-800 bg-zinc-950/80">
          <div className="flex items-center gap-2">
            {!selectedAlert?.acknowledged ? (
              <button
                id="btn-acknowledge-alert"
                onClick={handleAcknowledge}
                disabled={isAcknowledging || !selectedAlert}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                {isAcknowledging ? 'Acknowledging...' : 'Acknowledge Incident'}
              </button>
            ) : (
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                <CheckCircle2 className="w-4 h-4" /> Incident Acknowledged
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-alert-investigate-ai"
              onClick={() => executeStandardAction('INVESTIGATE', { eventId: selectedAlert?.eventId })}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Investigate with AI
            </button>
            <button
              id="btn-alert-view-map"
              onClick={() =>
                executeStandardAction('VIEW_MAP', {
                  locationName: selectedAlert?.where.locationName,
                })
              }
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-zinc-400" />
              View on Map
            </button>
            <button
              id="btn-alert-create-report"
              onClick={() =>
                executeStandardAction('CREATE_REPORT', {
                  latitude: selectedAlert?.where.latitude,
                  longitude: selectedAlert?.where.longitude,
                  locationName: selectedAlert?.where.locationName,
                })
              }
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-zinc-400" />
              Create Brief
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
