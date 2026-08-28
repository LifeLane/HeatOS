/**
 * HeatOS: Universal Metric Explanation Component
 * 
 * Reusable explanation, provenance, and contextual information dialog:
 * - Desktop: Centered modal dialog (max-w-xl / max-w-2xl, Escape to close, focus managed)
 * - Mobile: Responsive bottom sheet (w-full, max-h-[88vh], drag handle, scrollable body, safe padding)
 * - Supports: Metric cards, badges, scores, forecast events, alert conditions, map inspector, tool results, AI insights
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  X,
  Flame,
  Wind,
  Droplets,
  Trees,
  Sun,
  AlertTriangle,
  Activity,
  Gauge,
  Thermometer,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Database,
  Layers,
  Clock,
  Compass,
  CheckCircle2,
  HelpCircle,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  ArrowRight,
  Info,
  Zap,
  MapPin,
  LineChart,
} from 'lucide-react';
import { useExplanation } from '../../context/ExplanationContext';
import { useAIAnalyst } from '../../context/AIAnalystContext';
import { ExplanationDataType, ExplanationMetadata } from '../../types/explanation';
import StatusPill from '../ui/StatusPill';

export interface MetricExplanationProps {
  // Can be rendered standalone with props or consume global ExplanationContext
  metadata?: ExplanationMetadata | null;
  isOpen?: boolean;
  onClose?: () => void;
}

export const MetricExplanation: React.FC<MetricExplanationProps> = ({
  metadata: propMetadata,
  isOpen: propIsOpen,
  onClose: propOnClose,
}) => {
  const context = useExplanation();
  const { openAIWithContext } = useAIAnalyst();

  // Resolve whether using explicit props or context
  const isOpen = propIsOpen !== undefined ? propIsOpen : context.isOpen;
  const metadata = propMetadata !== undefined ? propMetadata : context.activeExplanation;
  const handleClose = propOnClose || context.closeExplanation;

  const [copied, setCopied] = useState<boolean>(false);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [touchCurrentY, setTouchCurrentY] = useState<number | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Keyboard accessibility: Escape to close & Tab trapping
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
        return;
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  // Focus management: Focus close button on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Prevent background scrolling while open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen || !metadata) return null;

  // Copy structured summary to clipboard
  const handleCopySummary = () => {
    const summaryText = `[HeatOS Environmental Telemetry]\n${metadata.label}: ${metadata.value} ${metadata.unit || ''}\nData Type: ${metadata.dataType}\nSource: ${metadata.source || 'HeatOS Network'}\n\nWhat It Means: ${metadata.whatItMeans}\n${metadata.whyItMatters ? `Why It Matters: ${metadata.whyItMatters}\n` : ''}`;
    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Deep dive with AI Analyst
  const handleAskAI = () => {
    openAIWithContext({
      topic: `${metadata.label} Analysis`,
      prompt: `Provide a detailed biophysical assessment of ${metadata.label} (${metadata.value} ${metadata.unit || ''}). Data Type is ${metadata.dataType} from ${metadata.source || 'HeatOS'}. Explain the environmental mechanics, immediate risks, and actionable recommendations.`,
    });
    handleClose();
  };

  // Resolve Icon
  const renderIcon = () => {
    const iconType = metadata.iconType || 'heat';
    const baseClass = 'w-5 h-5';

    switch (iconType) {
      case 'heat':
        return <Flame className={`${baseClass} text-orange-600`} />;
      case 'air':
        return <Wind className={`${baseClass} text-teal-600`} />;
      case 'water':
        return <Droplets className={`${baseClass} text-cyan-600`} />;
      case 'nature':
        return <Trees className={`${baseClass} text-emerald-600`} />;
      case 'solar':
        return <Sun className={`${baseClass} text-amber-600`} />;
      case 'fire':
        return <AlertTriangle className={`${baseClass} text-rose-600`} />;
      case 'wind':
        return <Wind className={`${baseClass} text-blue-600`} />;
      case 'pressure':
        return <Gauge className={`${baseClass} text-slate-600`} />;
      case 'pulse':
        return <Activity className={`${baseClass} text-blue-600`} />;
      case 'ai':
        return <Sparkles className={`${baseClass} text-purple-600`} />;
      case 'alert':
        return <ShieldAlert className={`${baseClass} text-rose-600`} />;
      case 'map':
        return <MapPin className={`${baseClass} text-blue-600`} />;
      default:
        return <Activity className={`${baseClass} text-blue-600`} />;
    }
  };

  // Resolve Data Type Pill Color
  const getDataTypeBadge = (type: ExplanationDataType) => {
    switch (type) {
      case 'MEASURED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold tracking-wider uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            MEASURED OBSERVATION
          </span>
        );
      case 'CALCULATED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold tracking-wider uppercase bg-blue-50 text-blue-800 border border-blue-200">
            <Activity className="w-3 h-3 text-blue-600" />
            CALCULATED INDEX
          </span>
        );
      case 'MODELED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold tracking-wider uppercase bg-amber-50 text-amber-900 border border-amber-200">
            <LineChart className="w-3 h-3 text-amber-600" />
            MODELED PROJECTION
          </span>
        );
      case 'DERIVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold tracking-wider uppercase bg-cyan-50 text-cyan-900 border border-cyan-200">
            <Layers className="w-3 h-3 text-cyan-700" />
            HEATOS DERIVED INDICATOR
          </span>
        );
      case 'AI INTERPRETATION':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold tracking-wider uppercase bg-purple-50 text-purple-900 border border-purple-200">
            <Sparkles className="w-3 h-3 text-purple-600" />
            AI SYNTHESIS
          </span>
        );
      default:
        return null;
    }
  };

  // Touch handlers for mobile bottom-sheet pull-to-dismiss
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchCurrentY(e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (touchStartY !== null && touchCurrentY !== null) {
      const diff = touchCurrentY - touchStartY;
      if (diff > 80) {
        handleClose();
      }
    }
    setTouchStartY(null);
    setTouchCurrentY(null);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="explanation-dialog-title"
      className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      {/* DIALOG CONTAINER */}
      <div
        ref={modalRef}
        id="universal-metric-explanation"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="w-full sm:max-w-xl md:max-w-2xl bg-white rounded-t-3xl sm:rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden flex flex-col max-h-[88vh] sm:max-h-[85vh] text-slate-900 transition-all duration-300 animate-in slide-in-from-bottom-6 sm:zoom-in-95"
      >
        {/* MOBILE DRAG HANDLE */}
        <div className="w-12 h-1.5 bg-slate-300/80 rounded-full mx-auto my-2.5 sm:hidden shrink-0" />

        {/* ------------------------------------------------------------- */}
        {/* 1. HEADER: Icon, Metric Name, Value, Status, Close Button */}
        {/* ------------------------------------------------------------- */}
        <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-slate-100 bg-slate-50/70 flex items-start justify-between gap-3 shrink-0">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-center shrink-0 shadow-2xs">
              {renderIcon()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2
                  id="explanation-dialog-title"
                  className="text-base sm:text-lg font-black text-slate-900 leading-snug tracking-tight truncate"
                >
                  {metadata.label}
                </h2>
                {metadata.status && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-200/70 text-slate-700">
                    {metadata.status}
                  </span>
                )}
              </div>

              {/* Observed / Projected Value */}
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-slate-900">
                  {metadata.value}
                </span>
                {metadata.unit && (
                  <span className="text-sm font-bold font-mono text-slate-400">
                    {metadata.unit}
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            id="close-explanation-dialog-btn"
            onClick={handleClose}
            aria-label="Close Explanation"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* 2. SCROLLABLE CONTENT BODY */}
        {/* ------------------------------------------------------------- */}
        <div className="px-5 py-5 sm:px-6 sm:py-5 overflow-y-auto space-y-4 text-slate-800 leading-relaxed min-w-0">
          {/* Freshness & Metadata Row */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 font-mono text-slate-500">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{metadata.timestamp || 'Real-time feed'}</span>
            </div>

            <div>{getDataTypeBadge(metadata.dataType)}</div>
          </div>

          {/* SECTION A: WHAT IT MEANS */}
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-1.5">
            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              What It Means
            </h3>
            <p className="text-sm text-slate-800 font-medium leading-relaxed">
              {metadata.whatItMeans}
            </p>
          </div>

          {/* SECTION B: WHY THIS MATTERS */}
          {metadata.whyItMatters && (
            <div className="p-4 rounded-2xl bg-blue-50/40 border border-blue-100 space-y-1.5">
              <h3 className="text-[11px] font-bold text-blue-800 uppercase tracking-wider flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-blue-600" />
                Why This Matters
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                {metadata.whyItMatters}
              </p>
            </div>
          )}

          {/* SECTION C: SOURCE & DATA PROVENANCE (Only shown if known) */}
          {metadata.source && (
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 space-y-2.5">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <span>Data Provenance & Source</span>
                <Database className="w-3.5 h-3.5 text-slate-400" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">
                    Primary Provider
                  </span>
                  <span className="font-bold text-slate-800">{metadata.source}</span>
                  {metadata.sourceInstitution && (
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {metadata.sourceInstitution}
                    </p>
                  )}
                </div>

                <div className="space-y-1 sm:border-l sm:border-slate-100 sm:pl-3">
                  {metadata.spatialResolution && (
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">
                        Spatial Resolution
                      </span>
                      <span className="font-semibold text-slate-700">
                        {metadata.spatialResolution}
                      </span>
                    </div>
                  )}

                  {metadata.confidence && (
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">
                        Confidence Rating
                      </span>
                      <span className="font-bold text-emerald-700">
                        {metadata.confidence}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SECTION D: HEATOS DERIVED INDICATOR / CALCULATION */}
          {metadata.calculation && metadata.calculation.isDerived && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-cyan-800 uppercase tracking-wider">
                <Layers className="w-3.5 h-3.5 text-cyan-700" />
                <span>HeatOS Derived Calculation Concept</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                {metadata.calculation.concept}
              </p>

              {metadata.calculation.inputSignals && metadata.calculation.inputSignals.length > 0 && (
                <div className="pt-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Input Signals Combined
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {metadata.calculation.inputSignals.map((sig, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[11px] font-semibold text-slate-700"
                      >
                        {sig}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {metadata.calculation.transparencyNote && (
                <p className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-200/60">
                  Note: {metadata.calculation.transparencyNote}
                </p>
              )}
            </div>
          )}

          {/* SECTION E: AI SYNTHESIS & SIGNALS USED */}
          {metadata.aiSynthesis && metadata.aiSynthesis.isAISynthesis && (
            <div className="p-4 rounded-2xl bg-purple-50/40 border border-purple-200/70 space-y-2.5">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-purple-900 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                <span>AI Synthesis Engine</span>
              </div>

              <p className="text-xs text-purple-950 font-medium leading-relaxed">
                {metadata.aiSynthesis.disclaimer}
              </p>

              {metadata.aiSynthesis.basedOnSignals && metadata.aiSynthesis.basedOnSignals.length > 0 && (
                <div className="pt-1.5 border-t border-purple-100">
                  <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block mb-1.5">
                    Live Signals Ingested For Interpretation
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {metadata.aiSynthesis.basedOnSignals.map((sig, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-md bg-white border border-purple-200 text-xs font-semibold text-purple-900"
                      >
                        {sig}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SECTION F: SPECIALIZED ALERT DETAILS */}
          {metadata.alertDetails && (
            <div className="p-4 rounded-2xl bg-rose-50/40 border border-rose-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-rose-900 uppercase tracking-wider">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                  <span>Alert Diagnostic Breakdown</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-100 text-rose-900">
                  {metadata.alertDetails.severity}
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-800">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-xl bg-white border border-rose-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">
                      Current Value
                    </span>
                    <span className="font-black text-rose-700 font-mono text-sm">
                      {metadata.alertDetails.currentValue}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-rose-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">
                      Trigger Threshold
                    </span>
                    <span className="font-bold text-slate-700 font-mono text-sm">
                      {metadata.alertDetails.threshold}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">
                    Why It Triggered
                  </span>
                  <p className="text-xs text-slate-800 font-medium">
                    {metadata.alertDetails.whyItTriggered}
                  </p>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">
                    What To Watch Next
                  </span>
                  <p className="text-xs text-slate-800 font-medium">
                    {metadata.alertDetails.whatToWatchNext}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION G: SPECIALIZED FORECAST EVENT DETAILS */}
          {metadata.forecastDetails && (
            <div className="p-4 rounded-2xl bg-amber-50/40 border border-amber-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-900 uppercase tracking-wider">
                  <LineChart className="w-3.5 h-3.5 text-amber-600" />
                  <span>Forecast Event Mechanics</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-900">
                  {metadata.forecastDetails.confidence}% Model Confidence
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-800">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">
                    What Is Expected?
                  </span>
                  <p className="text-xs text-slate-900 font-bold">
                    {metadata.forecastDetails.whatIsExpected}
                  </p>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">
                    Why? (Physical Drivers)
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed font-normal">
                    {metadata.forecastDetails.why}
                  </p>
                </div>

                {metadata.forecastDetails.keySignals && (
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold mb-1">
                      Key Driving Signals
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {metadata.forecastDetails.keySignals.map((sig, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded bg-white border border-amber-200 text-[11px] font-semibold text-amber-950"
                        >
                          {sig}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SECTION H: MAP INSPECTOR (WHY THIS AREA?) */}
          {metadata.mapInspectorDetails && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2.5">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-900 uppercase tracking-wider">
                <Compass className="w-3.5 h-3.5 text-blue-600" />
                <span>Why This Area?</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
                {metadata.mapInspectorDetails.whyThisArea}
              </p>

              {metadata.mapInspectorDetails.urbanMorphology && (
                <div className="pt-2 border-t border-slate-200/60 text-xs text-slate-600">
                  <span className="font-bold text-slate-700">Urban Morphology: </span>
                  {metadata.mapInspectorDetails.urbanMorphology}
                </div>
              )}
            </div>
          )}

          {/* SECTION I: RECOMMENDED ACTION */}
          {metadata.recommendedAction && (
            <div className="p-3.5 rounded-2xl bg-emerald-50/40 border border-emerald-200/80 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider block mb-0.5">
                  Action Protocol
                </span>
                <p className="text-xs text-emerald-950 font-medium leading-relaxed">
                  {metadata.recommendedAction}
                </p>
              </div>
            </div>
          )}

          {/* SECTION J: LIMITATIONS & UNCERTAINTIES */}
          {metadata.limitations && (
            <div className="p-3 rounded-xl bg-slate-50/60 border border-slate-200/60 text-slate-500 text-[11px] space-y-1">
              <span className="font-bold uppercase tracking-wider text-slate-400 block">
                Physical Boundaries & Limitations
              </span>
              <p>{metadata.limitations}</p>
            </div>
          )}

          {/* SECTION K: RELATED METRICS */}
          {metadata.relatedMetrics && metadata.relatedMetrics.length > 0 && (
            <div className="pt-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Explore Related Indicators
              </span>
              <div className="flex flex-wrap gap-2">
                {metadata.relatedMetrics.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => context.explainMetric(item.key, item.value)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors cursor-pointer border border-slate-200/80"
                  >
                    <span>{item.label}</span>
                    {item.value && (
                      <span className="font-mono text-slate-500 text-[11px]">
                        ({item.value})
                      </span>
                    )}
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ------------------------------------------------------------- */}
        {/* 3. FOOTER ACTIONS: Ask AI, Copy, Close */}
        {/* ------------------------------------------------------------- */}
        <div className="px-5 py-3.5 sm:px-6 sm:py-4 bg-slate-50/90 border-t border-slate-100 flex items-center justify-between gap-2 shrink-0 pb-safe">
          <button
            type="button"
            onClick={handleCopySummary}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-bold">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Summary</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="explanation-ask-ai-btn"
              onClick={handleAskAI}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>Ask AI Analyst</span>
            </button>

            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricExplanation;
