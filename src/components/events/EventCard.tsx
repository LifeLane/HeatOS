/**
 * HeatOS: Event Card Component
 * 
 * Environmental Monitoring alert card supporting:
 * - View (Inspect structured evidence)
 * - Explain with AI (Uses actual alert context & physical drivers)
 * - Locate on map (Navigates to map & centers spatial node)
 * - Forecast (Navigates to diurnal forecast trajectory)
 * - Dismiss / Acknowledge (Dismisses or acknowledges alert)
 */

import React, { useState } from 'react';
import {
  Clock,
  MapPin,
  Flame,
  Wind,
  Droplets,
  Trees,
  Zap,
  Layers,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  ArrowRight,
  Info,
  CheckCircle2,
  ExternalLink,
  Activity,
  Sparkles,
  Compass,
  TrendingUp,
  XCircle,
  Eye,
  RotateCcw,
} from 'lucide-react';
import { EnvironmentalEvent, EnvironmentalEventType } from '../../server/events/types';
import { EventSeverityBadge } from './EventSeverityBadge';
import Card from '../ui/Card';
import { useExplanation } from '../../context/ExplanationContext';
import { safeFormatRelativeTime } from '../../utils/formatters';
import { useNavigation } from '../../context/NavigationContext';

interface EventCardProps {
  event: EnvironmentalEvent;
  onInspect?: (event: EnvironmentalEvent) => void;
  onExplainAI?: (event: EnvironmentalEvent) => void;
  onLocateOnMap?: (event: EnvironmentalEvent) => void;
  onForecast?: (event: EnvironmentalEvent) => void;
  onDismiss?: (eventId: string) => void;
  isDismissed?: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  onInspect,
  onExplainAI,
  onLocateOnMap,
  onForecast,
  onDismiss,
  isDismissed = false,
}) => {
  const explanation = useExplanation();
  const { setActiveTab, setSelectedEvent } = useNavigation();
  const [isEvidenceExpanded, setIsEvidenceExpanded] = useState<boolean>(false);

  const handleInspect = () => {
    if (onInspect) {
      onInspect(event);
    } else {
      explanation.explainAlert(event);
    }
  };

  const handleExplainAI = () => {
    if (onExplainAI) {
      onExplainAI(event);
    } else {
      explanation.explainAlert(event);
    }
  };

  const handleLocateOnMap = () => {
    if (onLocateOnMap) {
      onLocateOnMap(event);
    } else {
      setSelectedEvent(event);
      setActiveTab('navigation');
    }
  };

  const handleForecast = () => {
    if (onForecast) {
      onForecast(event);
    } else {
      setActiveTab('forecast');
    }
  };

  const getEventIcon = (type: EnvironmentalEventType) => {
    switch (type) {
      case 'HEAT_ANOMALY':
      case 'RAPID_HEAT_INCREASE':
      case 'EXTREME_HEAT':
        return <Flame className="w-4 h-4 text-orange-600" />;
      case 'AIR_QUALITY_CHANGE':
        return <Wind className="w-4 h-4 text-teal-600" />;
      case 'FIRE_ACTIVITY':
        return <Zap className="w-4 h-4 text-rose-600" />;
      case 'WATER_STRESS':
        return <Droplets className="w-4 h-4 text-blue-600" />;
      case 'VEGETATION_STRESS':
        return <Trees className="w-4 h-4 text-emerald-600" />;
      case 'MULTI_FACTOR_EVENT':
        return <Layers className="w-4 h-4 text-purple-600" />;
      case 'ENVIRONMENTAL_SHIFT':
        return <Activity className="w-4 h-4 text-indigo-600" />;
      case 'DATA_QUALITY_EVENT':
      default:
        return <Info className="w-4 h-4 text-slate-600" />;
    }
  };

  const formatRelativeTime = (isoString: string) => {
    return safeFormatRelativeTime(isoString, 'Just now');
  };

  return (
    <Card
      id={`event-card-${event.id}`}
      className={`p-4 sm:p-5 transition-all duration-200 hover:shadow-md flex flex-col justify-between w-full min-w-0 overflow-hidden ${
        isDismissed
          ? 'opacity-60 bg-slate-50 border-slate-200'
          : event.severity === 'CRITICAL'
          ? 'border-rose-200 bg-rose-50/15'
          : event.severity === 'HIGH'
          ? 'border-orange-200 bg-orange-50/10'
          : 'border-slate-200/90 bg-white'
      }`}
    >
      <div className="w-full min-w-0">
        {/* ------------------------------------------------------------- */}
        {/* HEADER: SEVERITY BADGE + TYPE + TIMESTAMP + CONFIDENCE */}
        {/* ------------------------------------------------------------- */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 w-full">
          <div className="flex items-center gap-2 min-w-0 flex-wrap">
            <EventSeverityBadge severity={event.severity} />
            <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 truncate">
              {getEventIcon(event.type)}
              <span>{event.type.replace(/_/g, ' ')}</span>
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 shrink-0">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{formatRelativeTime(event.detectedAt)}</span>
            </span>
            <span className="text-slate-300">•</span>
            <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full text-[10px]">
              {event.confidence}% Conf
            </span>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* HEADLINE & LOCATION */}
        {/* ------------------------------------------------------------- */}
        <div className="mb-3 w-full min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight break-words">
              {event.summary.headline}
            </h3>
            {isDismissed && (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-200 text-slate-700 shrink-0">
                DISMISSED
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1 flex-wrap">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="font-medium text-slate-700">{event.location.locationName}</span>
            {event.location.district && (
              <>
                <span className="text-slate-300">•</span>
                <span className="text-slate-500">{event.location.district}</span>
              </>
            )}
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* STRUCTURED EVENT CORE: WHAT / WHY / TIMING */}
        {/* ------------------------------------------------------------- */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 mb-3 space-y-2 text-xs leading-relaxed w-full min-w-0">
          {/* WHAT CHANGED */}
          <div className="break-words">
            <span className="font-bold text-slate-900">What changed: </span>
            <span className="text-slate-700">{event.summary.whatChanged}</span>
          </div>

          {/* WHY (DRIVERS) */}
          <div className="break-words">
            <span className="font-bold text-slate-900">Why: </span>
            <span className="text-slate-700">{event.summary.why}</span>
          </div>

          {/* TIMING & PEAK */}
          <div className="text-[11px] text-slate-600 font-mono break-words">
            <span className="font-bold text-slate-800">Timing: </span>
            <span>{event.summary.when}</span>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* KEY SIGNALS & CONVERGENCE PILLS */}
        {/* ------------------------------------------------------------- */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-3.5 w-full min-w-0">
          {event.evidence.signals.map((sig, idx) => (
            <div
              key={idx}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white border border-slate-200/90 text-xs font-mono shadow-2xs max-w-full flex-wrap"
            >
              <span className="text-slate-500 text-[11px] break-words">{sig.metricName}:</span>
              <span className="font-bold text-slate-900 shrink-0">{sig.observedValue}</span>
              {sig.delta !== undefined && sig.delta !== 0 && (
                <span
                  className={`text-[10px] font-bold shrink-0 ${
                    sig.delta > 0 ? 'text-rose-600' : 'text-emerald-600'
                  }`}
                >
                  ({sig.delta > 0 ? `+${sig.delta}` : sig.delta})
                </span>
              )}
            </div>
          ))}
        </div>

        {/* ------------------------------------------------------------- */}
        {/* RECOMMENDED ACTION & IMPACT */}
        {/* ------------------------------------------------------------- */}
        <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200/80 mb-3 space-y-1.5 w-full min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-blue-900">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="text-[11px] font-bold tracking-wider uppercase font-mono">RECOMMENDED ACTION</span>
            </div>
            <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-blue-200/80 text-blue-800 shrink-0">
              {event.recommendedAction.urgency}
            </span>
          </div>
          <p className="text-xs text-slate-800 font-medium leading-relaxed break-words">
            {event.recommendedAction.primary}
          </p>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* EVIDENCE DRAWER TOGGLE & SOURCES */}
        {/* ------------------------------------------------------------- */}
        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 w-full min-w-0">
          <button
            type="button"
            onClick={() => setIsEvidenceExpanded(!isEvidenceExpanded)}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer transition-colors shrink-0"
          >
            <span>{isEvidenceExpanded ? 'Hide Structured Evidence' : 'Inspect Structured Evidence'}</span>
            {isEvidenceExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono flex-wrap">
            <span className="shrink-0">Sources:</span>
            {event.sources.map((src, i) => (
              <span
                key={i}
                title={`${src.sourceName} (${src.confidence}% confidence)`}
                className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold text-[10px]"
              >
                {src.sourceId}
              </span>
            ))}
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* EXPANDED STRUCTURED EVIDENCE PANEL */}
        {/* ------------------------------------------------------------- */}
        {isEvidenceExpanded && (
          <div className="mb-4 pt-3 border-t border-slate-200/80 space-y-3 text-xs animate-fade-in w-full min-w-0">
            {/* Baseline Comparison */}
            {event.evidence.baselineComparison && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 w-full min-w-0">
                <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Baseline Comparison Analysis
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Baseline Type</span>
                    <span className="font-bold text-slate-800">
                      {event.evidence.baselineComparison.baselineType.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Baseline Value</span>
                    <span className="font-bold text-slate-800">
                      {event.evidence.baselineComparison.baselineValue} {event.evidence.baselineComparison.unit}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Observed</span>
                    <span className="font-bold text-slate-800">
                      {event.evidence.baselineComparison.observedValue} {event.evidence.baselineComparison.unit}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Delta</span>
                    <span className="font-extrabold text-rose-600">
                      +{event.evidence.baselineComparison.delta.toFixed(1)} {event.evidence.baselineComparison.unit}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Noise Rejection */}
            {event.evidence.noiseRejectionRationale && (
              <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80 text-[11px] text-emerald-900 leading-relaxed break-words">
                <span className="font-bold">False-Positive Audit: </span>
                {event.evidence.noiseRejectionRationale}
              </div>
            )}

            {/* Physical Drivers */}
            <div className="w-full min-w-0">
              <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Contributing Environmental Drivers
              </div>
              <ul className="space-y-1 text-slate-700 text-xs list-disc list-inside break-words">
                {event.drivers.map((drv, i) => (
                  <li key={i}>{drv}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* ALERT ACTIONS: View, Explain with AI, Locate on Map, Forecast, Dismiss */}
      {/* ------------------------------------------------------------- */}
      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 w-full min-w-0">
        <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
          {/* 1. View Detail Modal */}
          <button
            type="button"
            id={`btn-view-${event.id}`}
            onClick={handleInspect}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer shrink-0"
            title="Inspect full structured evidence and baseline details"
          >
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            <span>View</span>
          </button>

          {/* 2. Explain with AI */}
          <button
            type="button"
            id={`btn-explain-ai-${event.id}`}
            onClick={handleExplainAI}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-lg bg-blue-50 hover:bg-blue-100 text-[#2563EB] border border-blue-200/60 transition-colors cursor-pointer shrink-0"
            title="Explain drivers and provenance with Universal Explanation"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>Explain with AI</span>
          </button>

          {/* 3. Locate on Map */}
          <button
            type="button"
            id={`btn-locate-map-${event.id}`}
            onClick={handleLocateOnMap}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer shrink-0"
            title="Locate hazard on Living Environmental Map"
          >
            <Compass className="w-3.5 h-3.5 text-slate-500" />
            <span>Locate on map</span>
          </button>

          {/* 4. Forecast */}
          <button
            type="button"
            id={`btn-forecast-${event.id}`}
            onClick={handleForecast}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer shrink-0"
            title="View diurnal forecast progression"
          >
            <TrendingUp className="w-3.5 h-3.5 text-slate-500" />
            <span>Forecast</span>
          </button>
        </div>

        {/* 5. Dismiss / Acknowledge */}
        {onDismiss && (
          <button
            type="button"
            id={`btn-dismiss-${event.id}`}
            onClick={() => onDismiss(event.id)}
            className={`p-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1 shrink-0 ${
              isDismissed
                ? 'text-slate-600 hover:bg-slate-200 bg-slate-100'
                : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
            }`}
            title={isDismissed ? 'Restore alert to active feed' : 'Dismiss alert'}
          >
            {isDismissed ? (
              <>
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="text-[10px]">Restore</span>
              </>
            ) : (
              <>
                <XCircle className="w-3.5 h-3.5" />
                <span className="text-[10px]">Dismiss</span>
              </>
            )}
          </button>
        )}
      </div>
    </Card>
  );
};

export default EventCard;
