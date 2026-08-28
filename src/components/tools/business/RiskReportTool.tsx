import React, { useState } from 'react';
import {
  FileText,
  ShieldAlert,
  Building,
  TrendingDown,
  TrendingUp,
  Sparkles,
  Printer,
  Copy,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Wind,
  Droplets,
  DollarSign,
  Activity,
  Layers,
} from 'lucide-react';
import { useLocation } from '../../../context/LocationContext';
import { useAIAnalyst } from '../../../context/AIAnalystContext';
import { siteService } from '../../../services/siteService';

export const RiskReportTool: React.FC = () => {
  const { currentLocation, formatTemp } = useLocation();
  const { openAIWithContext } = useAIAnalyst();

  const [copied, setCopied] = useState(false);
  const [selectedSiteId, setSelectedSiteId] = useState<string>('current');

  const sites = siteService.getAllSites();
  const activeSite = selectedSiteId === 'current'
    ? {
        name: currentLocation.displayName,
        city: currentLocation.name,
        country: currentLocation.country,
        temp: currentLocation.ambientTemp,
        apparentTemp: currentLocation.apparentTemp,
        surfaceAnomaly: currentLocation.surfaceHeatAnomaly,
        pulse: Math.round(75 + (100 - currentLocation.ambientTemp * 2)),
      }
    : (() => {
        const s = sites.find((x) => x.id === selectedSiteId) || sites[0];
        return {
          name: s.name,
          city: s.location.city,
          country: s.location.country,
          temp: s.currentTemp,
          apparentTemp: s.apparentTemp,
          surfaceAnomaly: s.surfaceAnomaly,
          pulse: s.pulse,
        };
      })();

  const riskMetrics = [
    {
      title: 'Physical Heat Stress & Asset Exposure',
      score: activeSite.temp > 35 ? '88 / 100' : '64 / 100',
      rating: activeSite.temp > 35 ? 'HIGH RISK' : 'MODERATE RISK',
      badgeColor: activeSite.temp > 35 ? 'bg-rose-100 text-rose-800 border-rose-200' : 'bg-amber-100 text-amber-800 border-amber-200',
      description: `Surface thermal anomaly (+${activeSite.surfaceAnomaly.toFixed(1)}°C) accelerates roof membrane degradation and elevates HVAC condenser intake temperatures.`,
      isDemo: true,
    },
    {
      title: 'TCFD / ESG Scope 1 & 2 Energy Cost Inflation',
      score: `+$${Math.round(8500 + activeSite.surfaceAnomaly * 2400)}/mo`,
      rating: 'SURGE COST',
      badgeColor: 'bg-orange-100 text-orange-800 border-orange-200',
      description: 'Estimated additional chiller electricity load required to counteract urban microclimate heat islanding.',
      isDemo: true,
    },
    {
      title: 'Occupational Health & Labor Productivity Loss',
      score: activeSite.temp > 35 ? '-14.2% Output' : '-4.8% Output',
      rating: activeSite.temp > 35 ? 'CRITICAL IMPACT' : 'MINIMAL IMPACT',
      badgeColor: activeSite.temp > 35 ? 'bg-rose-100 text-rose-800 border-rose-200' : 'bg-emerald-100 text-emerald-800 border-emerald-200',
      description: 'OSHA work-rest cycles required during high wet-bulb temperature exposure windows on loading aprons.',
      isDemo: true,
    },
    {
      title: 'Supply Chain & Cold Chain Microclimate Strain',
      score: '92 / 100',
      rating: 'ACCEPTABLE',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      description: 'Refrigerated container staging areas maintained within safe ambient envelope thresholds.',
      isDemo: true,
    },
  ];

  const handleCopy = () => {
    const text = `PHYSICAL CLIMATE RISK AUDIT: ${activeSite.name}
Generated: ${new Date().toLocaleString()}
Ambient Temp: ${formatTemp(activeSite.temp)} | Surface Anomaly: +${activeSite.surfaceAnomaly.toFixed(1)}°C
Environmental Pulse: ${activeSite.pulse}/100

1. Physical Heat Stress: ${riskMetrics[0].score} (${riskMetrics[0].rating})
2. Energy Cost Inflation: ${riskMetrics[1].score} (${riskMetrics[1].rating})
3. Labor Productivity Exposure: ${riskMetrics[2].score} (${riskMetrics[2].rating})
4. Supply Chain Strain: ${riskMetrics[3].score} (${riskMetrics[3].rating})

Source: HeatOS Environmental Intelligence Workbench & FortyGuard Mesh.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div id="risk-report-tool" className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-md border border-purple-200">
                CLIMATE RISK & ESG AUDIT
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-mono text-slate-500">
                TCFD Aligned
              </span>
              <span className="text-[10px] font-mono font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                Explicit Benchmark Sample Data
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              Enterprise Physical Climate Risk Report
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-2xl">
              Quantitative risk modeling evaluating physical facility vulnerability, cooling degree day financial exposure, and labor productivity buffers.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Report</span>
            </button>

            <button
              onClick={handleCopy}
              className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border border-purple-200"
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
            </button>

            <button
              onClick={() =>
                openAIWithContext({
                  triggerSource: 'tools',
                  toolId: 'risk-report',
                  headline: `Enterprise Climate Risk Audit for ${activeSite.name}`,
                  summary: `Synthesizing quantitative TCFD physical risk indices, cooling energy surge costs, and labor safety factors for ${activeSite.name}.`,
                  location: activeSite.city,
                })
              }
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
            >
              <Sparkles className="w-4 h-4" />
              <span>AI ESG Synthesis</span>
            </button>
          </div>
        </div>

        {/* Site Switcher */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase">Target Facility:</span>
            <select
              value={selectedSiteId}
              onChange={(e) => setSelectedSiteId(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none cursor-pointer"
            >
              <option value="current">{currentLocation.displayName} (Active View)</option>
              {sites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.location.city})
                </option>
              ))}
            </select>
          </div>

          <div className="text-[11px] font-mono text-slate-400">
            Prov: FortyGuard Thermal Mesh + Open Data Fabric
          </div>
        </div>
      </div>

      {/* Risk Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {riskMetrics.map((rm, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-3 hover:border-purple-300 transition-all flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-extrabold text-slate-900 leading-snug">
                  {rm.title}
                </h3>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border whitespace-nowrap ${rm.badgeColor}`}>
                  {rm.rating}
                </span>
              </div>

              <div className="text-2xl font-mono font-black text-slate-900">
                {rm.score}
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {rm.description}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Standard: TCFD Metric 4.2</span>
              <span className="text-purple-600 font-semibold bg-purple-50 px-1.5 py-0.5 rounded">Sample Benchmark</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RiskReportTool;
