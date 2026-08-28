/**
 * HeatOS Phase 7: Event Detail Inspection Modal
 */

import React from 'react';
import {
  X,
  MapPin,
  Clock,
  ShieldCheck,
  Activity,
  Layers,
  AlertTriangle,
  HeartPulse,
  Building,
  Trees,
  Database,
  ExternalLink,
} from 'lucide-react';
import { EnvironmentalEvent } from '../../server/events/types';
import { EventSeverityBadge } from './EventSeverityBadge';

interface EventDetailModalProps {
  event: EnvironmentalEvent | null;
  onClose: () => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({ event, onClose }) => {
  if (!event) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-start justify-between gap-4 sticky top-0 bg-white/95 backdrop-blur-md z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <EventSeverityBadge severity={event.severity} size="md" />
              <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
                {event.type.replace(/_/g, ' ')}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
              {event.summary.headline}
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 font-mono">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{event.location.locationName}</span>
              <span>•</span>
              <span>{event.confidence}% Confidence</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6 text-xs text-slate-700">
          {/* Summary Block */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
            <div className="font-bold text-slate-900 text-sm">Event Narrative & Etiology</div>
            <div>
              <span className="font-bold text-slate-800">What changed: </span>
              <span>{event.summary.whatChanged}</span>
            </div>
            <div>
              <span className="font-bold text-slate-800">Why it occurred: </span>
              <span>{event.summary.why}</span>
            </div>
            <div>
              <span className="font-bold text-slate-800">Timing & Progression: </span>
              <span>{event.summary.when}</span>
            </div>
          </div>

          {/* Structured Evidence & Baseline */}
          <div>
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-blue-600" />
              <span>Structured Evidence & Physical Telemetry</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3">
              {event.evidence.signals.map((sig, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1"
                >
                  <div className="text-[11px] font-bold text-slate-500">{sig.metricName}</div>
                  <div className="text-base font-black text-slate-900 font-mono">
                    {sig.observedValue}
                  </div>
                  {sig.baselineValue && (
                    <div className="text-[10px] text-slate-500 font-mono">
                      Baseline: {sig.baselineValue}
                    </div>
                  )}
                  <div className="text-[10px] font-bold text-slate-400 pt-1 border-t border-slate-100">
                    Source: {sig.sourceName}
                  </div>
                </div>
              ))}
            </div>

            {/* Baseline comparison card */}
            {event.evidence.baselineComparison && (
              <div className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-100 text-xs space-y-1.5">
                <div className="font-bold text-blue-950 flex items-center justify-between">
                  <span>Baseline Comparative Model</span>
                  <span className="text-[10px] font-mono text-blue-700 uppercase">
                    {event.evidence.baselineComparison.baselineType.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="text-blue-900 font-medium">
                  Observed deviation of +{event.evidence.baselineComparison.delta.toFixed(1)}{' '}
                  {event.evidence.baselineComparison.unit} against reference baseline (
                  {event.evidence.baselineComparison.baselineValue}{' '}
                  {event.evidence.baselineComparison.unit}).
                </div>
                {event.evidence.baselineComparison.referenceDescription && (
                  <div className="text-[11px] text-blue-700 italic">
                    {event.evidence.baselineComparison.referenceDescription}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Impact Analysis */}
          <div>
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-orange-600" />
              <span>Potential Impact Assessment (Score: {event.impact.severityScore}/100)</span>
            </h4>

            <div className="space-y-2">
              <div className="p-3 rounded-2xl bg-rose-50/40 border border-rose-100 flex items-start gap-2.5">
                <HeartPulse className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-rose-950 block">Public Health & Safety</span>
                  <span className="text-rose-900">{event.impact.healthRisk}</span>
                </div>
              </div>

              {event.impact.infrastructureImpact && (
                <div className="p-3 rounded-2xl bg-amber-50/40 border border-amber-100 flex items-start gap-2.5">
                  <Building className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-950 block">Municipal Infrastructure</span>
                    <span className="text-amber-900">{event.impact.infrastructureImpact}</span>
                  </div>
                </div>
              )}

              {event.impact.ecologicalImpact && (
                <div className="p-3 rounded-2xl bg-emerald-50/40 border border-emerald-100 flex items-start gap-2.5">
                  <Trees className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-emerald-950 block">Urban Ecology & Canopy</span>
                    <span className="text-emerald-900">{event.impact.ecologicalImpact}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Plan */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-950 text-white space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-blue-200 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-300" />
                <span>Action Directives</span>
              </span>
              <span className="text-[10px] font-mono font-bold bg-white/20 text-white px-2 py-0.5 rounded-full">
                {event.recommendedAction.urgency} URGENCY
              </span>
            </div>
            <div className="text-sm font-bold">{event.recommendedAction.primary}</div>
            {event.recommendedAction.secondary && event.recommendedAction.secondary.length > 0 && (
              <ul className="space-y-1 text-xs text-blue-100 list-disc list-inside pt-1 border-t border-white/10">
                {event.recommendedAction.secondary.map((act, i) => (
                  <li key={i}>{act}</li>
                ))}
              </ul>
            )}
          </div>

          {/* Data Sources Provenance */}
          <div className="pt-3 border-t border-slate-100">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5" />
              <span>Contributing Telemetry Data Sources</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {event.sources.map((src, i) => (
                <div
                  key={i}
                  className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-mono flex items-center gap-2"
                >
                  <span className="font-bold text-slate-800">{src.sourceName}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-500">{src.confidence}% Confidence</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-3xl flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-all cursor-pointer shadow-2xs"
          >
            Close Inspection
          </button>
        </div>
      </div>
    </div>
  );
};
