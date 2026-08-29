/**
 * HeatOS Phase 9: Environmental Brief Report Modal
 * 
 * Generates an executive, single-screen decision-support brief
 * summarizing Location, Pulse, Changes, Events, Forecast, Actions, and Provenance.
 */

import React, { useState } from 'react';
import {
  X,
  FileText,
  Copy,
  Printer,
  Check,
  Download,
  Activity,
  MapPin,
  Calendar,
  Layers,
  ShieldCheck,
  AlertTriangle,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { useMonitoring } from '../../context/MonitoringContext';
import { safeFormatDateTime } from '../../utils/formatters';

export const EnvironmentalBriefModal: React.FC = () => {
  const { selectedBrief, isLoadingBrief, isBriefModalOpen, closeEnvironmentalBrief, executeStandardAction } = useMonitoring();
  const [copied, setCopied] = useState(false);

  if (!isBriefModalOpen) return null;

  const handleCopyMarkdown = () => {
    if (!selectedBrief) return;

    const md = `# HeatOS Environmental Intelligence Brief
**Location:** ${selectedBrief.locationName} (${selectedBrief.coordinates.latitude}, ${selectedBrief.coordinates.longitude})
**Generated At:** ${safeFormatDateTime(selectedBrief.generatedAt)}
**Operating Mode:** ${selectedBrief.personaMode}

---

## 1. Executive Summary
${selectedBrief.executiveSummary}

**Nature Pulse Score:** ${selectedBrief.pulse.score}/100 (${selectedBrief.pulse.status})
- Heat Dimension: ${selectedBrief.pulse.subscores.heat}/100
- Air Quality Dimension: ${selectedBrief.pulse.subscores.air}/100
- Water & Moisture: ${selectedBrief.pulse.subscores.water}/100
- Canopy & Ecology: ${selectedBrief.pulse.subscores.nature}/100

---

## 2. Current Biophysical Snapshot
- Ambient Temperature: ${selectedBrief.currentConditions.ambientTemp.toFixed(1)}°C
- Surface Temperature: ${selectedBrief.currentConditions.surfaceTemp.toFixed(1)}°C
- Urban Heat Island Delta: +${selectedBrief.currentConditions.uhiDelta.toFixed(1)}°C
- Air Quality Index (AQI): ${selectedBrief.currentConditions.aqi}
- Relative Humidity: ${selectedBrief.currentConditions.humidity}%
- Wet-Bulb Temperature: ${selectedBrief.currentConditions.wetBulb.toFixed(1)}°C
- Canopy Coverage: ${selectedBrief.currentConditions.canopyCoveragePct}%

---

## 3. Important Environmental Changes
${selectedBrief.importantChanges.map(c => `- **${c.title}**: ${c.rateOfChange} (${c.significance})`).join('\n')}

---

## 4. Active Events & Alert Tiers
${selectedBrief.activeEvents.length > 0
  ? selectedBrief.activeEvents.map(e => `- [${e.tier}] **${e.headline}** (Impact: ${e.impact}) -> Action: ${e.action}`).join('\n')
  : '- No active warning or critical alert tiers detected.'}

---

## 5. 24h Diurnal Forecast & Risk Trajectory
- Peak Window: ${selectedBrief.forecast.peakTime} (Forecast Peak: ${selectedBrief.forecast.forecastPeakTemp}°C)
- Nocturnal Minimum: ${selectedBrief.forecast.nocturnalLowTemp}°C
- Trajectory: ${selectedBrief.forecast.riskTrajectory}

---

## 6. Recommended Action Blueprint
${selectedBrief.recommendedActions.map(a => `### ${a.priority}: ${a.targetDomain}
*Action:* ${a.action}
*Expected Impact / ROI:* ${a.expectedROIorImpact}`).join('\n\n')}

---

## 7. Data Provenance & Verified Sources
${selectedBrief.dataSources.map(s => `- **${s.providerName}** [${s.category}] - Freshness: ${s.freshness} (Confidence: ${s.confidence}%)`).join('\n')}
`;

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      id="environmental-brief-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
      onClick={closeEnvironmentalBrief}
    >
      <div
        id="environmental-brief-modal-container"
        className="relative w-full max-w-4xl bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl overflow-hidden text-zinc-100 my-8"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800 bg-zinc-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Environmental Brief</span>
                <span className="text-xs text-zinc-500">|</span>
                <span className="text-xs text-zinc-400">{selectedBrief?.personaMode} MODE</span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                {isLoadingBrief ? 'Compiling Environmental Brief...' : `${selectedBrief?.locationName} Executive Brief`}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-copy-brief-md"
              onClick={handleCopyMarkdown}
              disabled={isLoadingBrief || !selectedBrief}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-700 text-xs font-medium transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied MD' : 'Copy MD'}
            </button>
            <button
              id="btn-print-brief"
              onClick={handlePrint}
              disabled={isLoadingBrief || !selectedBrief}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-700 text-xs font-medium transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Print
            </button>
            <button
              id="btn-close-brief-modal"
              onClick={closeEnvironmentalBrief}
              className="p-2 text-zinc-400 hover:text-white rounded-lg bg-zinc-800/60 hover:bg-zinc-800 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        {isLoadingBrief || !selectedBrief ? (
          <div className="p-16 flex flex-col items-center justify-center space-y-4">
            <Activity className="w-8 h-8 text-emerald-400 animate-spin" />
            <p className="text-sm text-zinc-400">Synthesizing state, pulse, events, and forecast into executive brief...</p>
          </div>
        ) : (
          <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            {/* Header Meta & Pulse Badge */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4.5 bg-zinc-800/40 border border-zinc-700/60 rounded-xl">
              <div className="md:col-span-3 space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                  <span>
                    {selectedBrief.locationName} ({selectedBrief.coordinates.latitude.toFixed(4)},{' '}
                    {selectedBrief.coordinates.longitude.toFixed(4)})
                  </span>
                  <span>•</span>
                  <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                  <span>{safeFormatDateTime(selectedBrief.generatedAt)}</span>
                </div>
                <p className="text-sm text-zinc-200 leading-relaxed">{selectedBrief.executiveSummary}</p>
              </div>

              {/* Pulse Score Box */}
              <div className="flex flex-col items-center justify-center p-3 bg-zinc-900/80 border border-zinc-700 rounded-lg text-center">
                <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Nature Pulse</span>
                <div className="text-3xl font-extrabold text-emerald-400">{selectedBrief.pulse.score}</div>
                <span className="text-xs font-medium text-zinc-300">{selectedBrief.pulse.status}</span>
              </div>
            </div>

            {/* Biophysical Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-center">
              <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-3">
                <span className="text-[11px] text-zinc-400 block">Ambient Temp</span>
                <span className="text-lg font-bold text-white">{selectedBrief.currentConditions.ambientTemp}°C</span>
              </div>
              <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-3">
                <span className="text-[11px] text-zinc-400 block">Surface Temp</span>
                <span className="text-lg font-bold text-white">{selectedBrief.currentConditions.surfaceTemp}°C</span>
              </div>
              <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-3">
                <span className="text-[11px] text-zinc-400 block">UHI Delta</span>
                <span className="text-lg font-bold text-amber-400">+{selectedBrief.currentConditions.uhiDelta}°C</span>
              </div>
              <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-3">
                <span className="text-[11px] text-zinc-400 block">Air Quality (AQI)</span>
                <span className="text-lg font-bold text-white">{selectedBrief.currentConditions.aqi}</span>
              </div>
              <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-3">
                <span className="text-[11px] text-zinc-400 block">Wet-Bulb Temp</span>
                <span className="text-lg font-bold text-sky-400">{selectedBrief.currentConditions.wetBulb}°C</span>
              </div>
              <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-3">
                <span className="text-[11px] text-zinc-400 block">Canopy Cover</span>
                <span className="text-lg font-bold text-emerald-400">{selectedBrief.currentConditions.canopyCoveragePct}%</span>
              </div>
            </div>

            {/* Important Environmental Changes & Forecast */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Important Changes */}
              <div className="bg-zinc-800/40 border border-zinc-700/50 rounded-xl p-4.5 space-y-3">
                <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Key Environmental Shifts
                </div>
                <div className="space-y-2.5">
                  {selectedBrief.importantChanges.map((chg, i) => (
                    <div key={i} className="text-xs space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-zinc-200">{chg.title}</span>
                        <span className="font-mono text-amber-400">{chg.rateOfChange}</span>
                      </div>
                      <p className="text-zinc-400">{chg.significance}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 24h Forecast */}
              <div className="bg-zinc-800/40 border border-zinc-700/50 rounded-xl p-4.5 space-y-3">
                <div className="text-xs font-semibold uppercase tracking-wider text-sky-400 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Forecast & Diurnal Trajectory
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-zinc-800">
                    <span className="text-zinc-400">Peak Thermal Window:</span>
                    <strong className="text-white">{selectedBrief.forecast.peakTime}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-zinc-800">
                    <span className="text-zinc-400">Forecast Peak Temp:</span>
                    <strong className="text-rose-400">{selectedBrief.forecast.forecastPeakTemp}°C</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-zinc-800">
                    <span className="text-zinc-400">Nocturnal Low:</span>
                    <strong className="text-emerald-400">{selectedBrief.forecast.nocturnalLowTemp}°C</strong>
                  </div>
                  <p className="text-zinc-400 pt-1 leading-relaxed">{selectedBrief.forecast.diurnalSummary}</p>
                </div>
              </div>
            </div>

            {/* Phased Action Blueprint */}
            <div className="space-y-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                Action Blueprint & Mitigation Priorities
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {selectedBrief.recommendedActions.map((act, i) => (
                  <div key={i} className="bg-zinc-800/60 border border-zinc-700/60 rounded-xl p-4 space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block">
                      {act.priority}
                    </span>
                    <div className="text-xs font-semibold text-zinc-300">{act.targetDomain}</div>
                    <p className="text-xs text-zinc-200 leading-relaxed">{act.action}</p>
                    <div className="text-[11px] text-amber-300/90 font-medium pt-1 border-t border-zinc-700/50">
                      Impact: {act.expectedROIorImpact}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Authoritative Sources */}
            <div className="border-t border-zinc-800 pt-4 space-y-2">
              <span className="text-xs font-semibold text-zinc-400 block">Authoritative Data Mesh & Provenance:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                {selectedBrief.dataSources.map((ds, i) => (
                  <div key={i} className="bg-zinc-800/40 border border-zinc-700/50 rounded-lg p-2.5 space-y-1">
                    <div className="text-xs font-semibold text-zinc-200">{ds.providerName}</div>
                    <div className="text-[11px] text-zinc-400 font-mono">
                      {ds.freshness} • {ds.confidence}% Conf
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-4 border-t border-zinc-800 bg-zinc-950/80 text-xs text-zinc-400">
          <span>HeatOS Commercial Decision Engine • Grounded Intelligence</span>
          <button
            id="btn-brief-investigate-ai"
            onClick={() => {
              closeEnvironmentalBrief();
              executeStandardAction('INVESTIGATE');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Discuss with Nature Analyst AI
          </button>
        </div>
      </div>
    </div>
  );
};
