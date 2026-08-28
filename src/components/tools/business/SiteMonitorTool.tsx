import React, { useState } from 'react';
import {
  Building,
  MapPin,
  Activity,
  Flame,
  Wind,
  Droplets,
  Sun,
  ShieldAlert,
  Clock,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Zap,
  RefreshCw,
  Bell,
  Check,
  ChevronDown,
} from 'lucide-react';
import { useLocation } from '../../../context/LocationContext';
import { useAIAnalyst } from '../../../context/AIAnalystContext';
import { siteService, MonitoredSite, SiteMonitoringRule } from '../../../services/siteService';

export const SiteMonitorTool: React.FC = () => {
  const { formatTemp } = useLocation();
  const { openAIWithContext } = useAIAnalyst();

  const [sites, setSites] = useState<MonitoredSite[]>(siteService.getAllSites());
  const [selectedSiteId, setSelectedSiteId] = useState<string>(sites[0]?.id || 'site-austin-campus');
  const [savedSuccess, setSavedSuccess] = useState<string | null>(null);

  const currentSite = sites.find((s) => s.id === selectedSiteId) || sites[0];

  const handleToggleRule = (ruleId: string) => {
    siteService.toggleRule(selectedSiteId, ruleId);
    setSites([...siteService.getAllSites()]);
    setSavedSuccess('Rule status updated');
    setTimeout(() => setSavedSuccess(null), 2500);
  };

  const handleThresholdChange = (ruleId: string, value: number) => {
    siteService.updateRuleThreshold(selectedSiteId, ruleId, value);
    setSites([...siteService.getAllSites()]);
  };

  const getRuleCategoryIcon = (category: string) => {
    switch (category) {
      case 'heat_anomaly':
        return <Flame className="w-4 h-4 text-orange-600" />;
      case 'air_quality':
        return <Wind className="w-4 h-4 text-emerald-600" />;
      case 'extreme_temp':
        return <Flame className="w-4 h-4 text-rose-600" />;
      case 'wind':
        return <Wind className="w-4 h-4 text-blue-600" />;
      case 'precipitation':
        return <Droplets className="w-4 h-4 text-cyan-600" />;
      case 'environmental_risk':
        return <Activity className="w-4 h-4 text-purple-600" />;
      default:
        return <Sliders className="w-4 h-4 text-slate-600" />;
    }
  };

  const triggeredCount = currentSite?.monitoringRules.filter((r) => r.enabled && r.isTriggered).length || 0;

  return (
    <div id="site-monitor-tool" className="space-y-6">
      {/* Facility Header & Selector */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 flex-shrink-0">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-md border border-purple-200">
                  SITE MONITORING RULES & WATCHDOGS
                </span>
                <span className="text-slate-300">•</span>
                <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-md border ${
                  triggeredCount > 0
                    ? 'bg-rose-50 text-rose-800 border-rose-200'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                }`}>
                  {triggeredCount > 0 ? `${triggeredCount} ACTIVE RULE BREACHES` : 'ALL RULES NOMINAL'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 mt-1">
                {currentSite?.name}
              </h1>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{currentSite?.location.address} • Climate Zone: {currentSite?.location.climateZone}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Site Switcher */}
            <div className="relative">
              <select
                value={selectedSiteId}
                onChange={(e) => setSelectedSiteId(e.target.value)}
                className="w-full sm:w-64 pl-3 pr-8 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-400 cursor-pointer appearance-none"
              >
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.location.city})
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>

            <button
              onClick={() =>
                openAIWithContext({
                  triggerSource: 'tools',
                  toolId: 'site-monitor',
                  headline: `Site Monitoring Audit for ${currentSite?.name}`,
                  summary: `Evaluating 6 surveillance thresholds (Heat Anomaly, AQI, Extreme Temp, Wind, Precipitation, Environmental Risk) for ${currentSite?.name}.`,
                  location: currentSite?.location.city,
                })
              }
              className="px-3.5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Rule Calibration Advisor</span>
            </button>
          </div>
        </div>

        {savedSuccess && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{savedSuccess}</span>
          </div>
        )}

        {/* 4 Metric Tiles for this Site */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
              Ambient / Feels
            </span>
            <div className="text-xl font-mono font-black text-slate-900">
              {formatTemp(currentSite?.currentTemp || 0)}
            </div>
            <span className="text-[11px] text-slate-500 font-medium block">
              Feels {formatTemp(currentSite?.apparentTemp || 0)}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
              Surface Heat Anomaly
            </span>
            <div className={`text-xl font-mono font-black ${(currentSite?.surfaceAnomaly || 0) >= 3.0 ? 'text-rose-600' : 'text-slate-900'}`}>
              +{(currentSite?.surfaceAnomaly || 0).toFixed(1)}°C
            </div>
            <span className="text-[11px] text-slate-500 font-medium block">
              FortyGuard Mesh Delta
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
              Air Quality
            </span>
            <div className="text-xl font-mono font-black text-slate-900">
              {currentSite?.airQuality} <span className="text-xs text-slate-400 font-normal">AQI</span>
            </div>
            <span className="text-[11px] text-emerald-600 font-medium block">
              {currentSite?.aqiLabel}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
              Environmental Pulse
            </span>
            <div className="text-xl font-mono font-black text-purple-700">
              {currentSite?.pulse}<span className="text-xs text-slate-400 font-normal">/100</span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium block">
              6-Dimension Resilience
            </span>
          </div>
        </div>
      </div>

      {/* 6 Comprehensive Monitoring Rules */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-lg font-black text-slate-900">Active Site Monitoring Rules</h2>
            <p className="text-xs text-slate-500">
              Calibrate deterministic thresholds across 6 core environmental risk vectors
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
            {currentSite?.monitoringRules.filter((r) => r.enabled).length} of 6 Enabled
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentSite?.monitoringRules.map((rule) => {
            const Icon = getRuleCategoryIcon(rule.category);
            const isBreached = rule.enabled && rule.isTriggered;

            return (
              <div
                key={rule.id}
                className={`p-5 rounded-2xl border transition-all space-y-4 ${
                  isBreached
                    ? 'bg-rose-50/40 border-rose-200 shadow-2xs'
                    : rule.enabled
                    ? 'bg-white border-slate-200/90 shadow-2xs'
                    : 'bg-slate-50/70 border-slate-200 opacity-60'
                }`}
              >
                {/* Rule Card Top */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <div className="p-2 rounded-xl bg-slate-100 border border-slate-200/60 mt-0.5">
                      {Icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                          {rule.categoryLabel}
                        </span>
                        {isBreached && (
                          <span className="text-[10px] font-mono font-black uppercase text-rose-700 bg-rose-100 px-1.5 py-0.2 rounded">
                            TRIGGERED
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-extrabold text-slate-900 mt-0.5">
                        {rule.name}
                      </h3>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rule.enabled}
                      onChange={() => handleToggleRule(rule.id)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>

                {/* Values & Slider Calibration */}
                <div className="space-y-2 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-600">
                      Live Telemetry: <strong className="font-mono text-slate-900">{rule.currentValue} {rule.unit}</strong>
                    </span>
                    <span className="font-semibold text-slate-600">
                      Threshold Limit: <strong className="font-mono text-purple-700">{rule.comparison} {rule.threshold} {rule.unit}</strong>
                    </span>
                  </div>

                  <input
                    type="range"
                    min={rule.category === 'heat_anomaly' ? 1.0 : rule.category === 'air_quality' ? 30 : rule.category === 'extreme_temp' ? 25 : rule.category === 'wind' ? 15 : rule.category === 'precipitation' ? 10 : 40}
                    max={rule.category === 'heat_anomaly' ? 8.0 : rule.category === 'air_quality' ? 200 : rule.category === 'extreme_temp' ? 50 : rule.category === 'wind' ? 80 : rule.category === 'precipitation' ? 90 : 95}
                    step={rule.category === 'heat_anomaly' ? 0.5 : 1}
                    value={rule.threshold}
                    disabled={!rule.enabled}
                    onChange={(e) => handleThresholdChange(rule.id, Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600 disabled:opacity-40"
                  />
                </div>

                {/* Action Protocol */}
                <div className="text-xs space-y-1">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                    Automated Action Protocol:
                  </span>
                  <p className="text-slate-700 font-medium bg-slate-100/70 p-2.5 rounded-lg border border-slate-200/60 leading-relaxed">
                    {rule.actionProtocol}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
                  <span>Evaluated: {rule.lastEvaluated}</span>
                  <span className={isBreached ? 'text-rose-600 font-bold' : 'text-emerald-600 font-medium'}>
                    {isBreached ? 'Threshold Exceeded' : 'Within Operating Bounds'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SiteMonitorTool;
