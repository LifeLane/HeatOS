/**
 * HeatOS Phase 9: Monitoring & Decision Support View
 * 
 * Commercial monitoring workspace for Places, Sites, Assets, and Regions.
 * Styled with pristine light theme consistency, responsive desktop padding,
 * and high-contrast typography.
 */

import React, { useState } from 'react';
import {
  BookmarkCheck,
  ShieldAlert,
  ShieldCheck,
  FileText,
  Sparkles,
  MapPin,
  RefreshCw,
  Plus,
  Trash2,
  TrendingUp,
  Thermometer,
  Search,
  CheckCircle2,
  ChevronRight,
  Activity,
} from 'lucide-react';
import { useMonitoring } from '../../context/MonitoringContext';
import { useLocation } from '../../context/LocationContext';
import { useExplanation } from '../../context/ExplanationContext';
import {
  CommercialPersonaMode,
  AlertTier,
} from '../../server/monitoring/types';
import { runMonitoringTestSuite } from '../../services/monitoringApi';

export const MonitoringView: React.FC = () => {
  const {
    watchlist,
    isLoadingWatchlist,
    refreshWatchlist,
    removePlaceFromWatch,
    addPlaceToWatch,
    openAlertDetail,
    openEnvironmentalBrief,
    commercialPersonaMode,
    setCommercialPersonaMode,
    personaConfig,
    executeStandardAction,
    acknowledgeCurrentAlert,
  } = useMonitoring();

  const { supportedLocations } = useLocation();
  const explanation = useExplanation();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [testResults, setTestResults] = useState<any | null>(null);
  const [isRunningTests, setIsRunningTests] = useState(false);

  // Filter watchlist
  const filteredWatchlist = watchlist.filter(item => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.organization && item.organization.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.tags && item.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesCategory =
      selectedCategory === 'ALL' || item.category.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  // Calculate high-level KPIs
  const totalWatched = watchlist.length;
  const criticalHighAlerts = watchlist.reduce(
    (acc, curr) => acc + curr.activeAlerts.filter(a => a.tier === 'CRITICAL' || a.tier === 'HIGH').length,
    0
  );
  const avgPulseScore =
    watchlist.length > 0 ? Math.round(watchlist.reduce((acc, curr) => acc + curr.pulseScore, 0) / watchlist.length) : 0;
  const highestUhi =
    watchlist.length > 0 ? Math.max(...watchlist.map(w => w.uhiDeltaC)) : 0;

  // Flatten active alerts for the global stream
  const allActiveAlerts = watchlist.flatMap(w =>
    w.activeAlerts.map(a => ({ ...a, locationLat: w.latitude, locationLng: w.longitude }))
  );

  const handleRunDiagnostic = async () => {
    setIsRunningTests(true);
    try {
      const results = await runMonitoringTestSuite();
      setTestResults(results);
    } catch (err) {
      console.error('Failed to run test suite:', err);
    } finally {
      setIsRunningTests(false);
    }
  };

  const getTierColor = (tier: AlertTier | 'NONE') => {
    switch (tier) {
      case 'CRITICAL':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'HIGH':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'WATCH':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      case 'INFORMATION':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getPulseColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 45) return 'text-amber-600';
    return 'text-rose-600';
  };

  return (
    <div id="monitoring-view-container" className="space-y-6 pb-16 max-w-7xl mx-auto px-4 sm:px-6">
      {/* Header & Commercial Persona Mode Selector */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 md:p-7 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                ENVIRONMENTAL WATCH
              </span>
              <span className="text-xs text-slate-300">•</span>
              <span className="text-xs text-slate-500 font-mono">OPERATIONAL MONITORING</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Environmental Watch</h1>
            <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
              Track the places, assets, and environmental signals that can affect operations. Continuously watch environmental conditions across sites, assets, and critical locations.
            </p>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 border border-slate-200 rounded-xl self-start lg:self-center">
            {(['PERSONAL', 'BUSINESS', 'OPERATIONS', 'RESEARCH'] as CommercialPersonaMode[]).map(mode => {
              const active = commercialPersonaMode === mode;
              const labels: Record<CommercialPersonaMode, string> = {
                PERSONAL: 'Personal (Explore)',
                BUSINESS: 'Business (Monitor)',
                OPERATIONS: 'Operations (Act)',
                RESEARCH: 'Research (Analyze)',
              };
              return (
                <button
                  key={mode}
                  id={`btn-mode-${mode.toLowerCase()}`}
                  onClick={() => setCommercialPersonaMode(mode)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    active
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  {labels[mode]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Persona Mode Context Banner */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-blue-700">{personaConfig.bannerBadge}:</span>
            <span className="text-slate-700 font-medium">{personaConfig.tagline}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <span className="hidden sm:inline">Focus:</span>
            <div className="flex flex-wrap gap-1">
              {personaConfig.focusMetrics.map((m, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => explanation.explainMetric(m, undefined, { label: m })}
                  className="px-2 py-0.5 rounded bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-mono text-[11px] border border-slate-200 hover:border-blue-300 transition-colors cursor-pointer"
                  title={`Inspect ${m} metric calculation & provenance`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          type="button"
          id="kpi-locations-under-watch"
          onClick={() =>
            explanation.explainMetric('locationsUnderWatch', totalWatched, {
              label: 'Locations Under Watch',
              whatItMeans: `${totalWatched} active commercial sites, municipal zones, logistics campuses & critical infrastructure assets monitored under continuous 30-second synchronization.`,
            })
          }
          className="bg-white hover:bg-blue-50/40 border border-slate-200/80 hover:border-blue-300 rounded-xl p-4 sm:p-5 space-y-1.5 shadow-xs text-left transition-all cursor-pointer group"
          title="Click to view metric provenance & explanation"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium group-hover:text-blue-600 transition-colors">
            <span>LOCATIONS UNDER WATCH</span>
            <BookmarkCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 group-hover:text-blue-600 font-mono transition-colors">
            {totalWatched}
          </div>
          <div className="text-[11px] text-slate-500">Cities, Assets, Sites & Campuses</div>
        </button>

        <button
          type="button"
          id="kpi-active-high-risk-signals"
          onClick={() =>
            explanation.explainMetric('activeHighRiskSignals', criticalHighAlerts, {
              label: 'Active High-Risk Signals',
              whatItMeans: `${criticalHighAlerts} active deterministic alarms currently triggered across monitored facilities based on empirical physical thresholds.`,
            })
          }
          className="bg-white hover:bg-rose-50/40 border border-slate-200/80 hover:border-rose-300 rounded-xl p-4 sm:p-5 space-y-1.5 shadow-xs text-left transition-all cursor-pointer group"
          title="Click to view alarm explanation & physical thresholds"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium group-hover:text-rose-600 transition-colors">
            <span>ACTIVE HIGH-RISK SIGNALS</span>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <div
            className={`text-2xl sm:text-3xl font-black font-mono transition-colors ${
              criticalHighAlerts > 0 ? 'text-rose-600 group-hover:text-rose-700' : 'text-emerald-600 group-hover:text-emerald-700'
            }`}
          >
            {criticalHighAlerts}
          </div>
          <div className="text-[11px] text-slate-500">Deterministic Threshold Alarms</div>
        </button>

        <button
          type="button"
          id="kpi-environmental-pulse"
          onClick={() =>
            explanation.explainMetric('environmentalPulse', `${avgPulseScore}/100`, {
              label: 'Network Environmental Pulse Score',
              whatItMeans: `Network-wide average environmental vitality of ${avgPulseScore}/100 synthesized across 6 ecological dimensions (Heat, Air, Water, Nature, Fire, Solar).`,
            })
          }
          className="bg-white hover:bg-blue-50/40 border border-slate-200/80 hover:border-blue-300 rounded-xl p-4 sm:p-5 space-y-1.5 shadow-xs text-left transition-all cursor-pointer group"
          title="Click to view 6-dimension pulse calculation & weighting"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium group-hover:text-blue-600 transition-colors">
            <span>ENVIRONMENTAL PULSE</span>
            <Activity className="w-4 h-4 text-blue-600" />
          </div>
          <div className={`text-2xl sm:text-3xl font-black font-mono transition-colors ${getPulseColor(avgPulseScore)}`}>
            {avgPulseScore}
            <span className="text-sm font-normal text-slate-400">/100</span>
          </div>
          <div className="text-[11px] text-slate-500">Multi-factor environmental vitality</div>
        </button>

        <button
          type="button"
          id="kpi-peak-heat-delta"
          onClick={() =>
            explanation.explainMetric('peakHeatDelta', `+${highestUhi.toFixed(1)}°C`, {
              label: 'Peak Heat Delta (UHI)',
              whatItMeans: `Peak surface-to-air urban heat island delta of +${highestUhi.toFixed(1)}°C measured across active monitored locations compared to regional baseline.`,
            })
          }
          className="bg-white hover:bg-amber-50/40 border border-slate-200/80 hover:border-amber-300 rounded-xl p-4 sm:p-5 space-y-1.5 shadow-xs text-left transition-all cursor-pointer group"
          title="Click to view Urban Heat Island physical calculation"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium group-hover:text-amber-600 transition-colors">
            <span>PEAK HEAT DELTA</span>
            <Thermometer className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 group-hover:text-amber-700 font-mono transition-colors">
            +{highestUhi.toFixed(1)}°C
          </div>
          <div className="text-[11px] text-slate-500">Max surface-to-air heat retention</div>
        </button>
      </div>

      {/* Watchlist Controls Bar */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="input-watchlist-search"
              type="text"
              placeholder="Search watched sites..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 p-1 rounded-lg text-xs">
            {['ALL', 'CITY', 'SITE', 'ASSET', 'REGION'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                  selectedCategory === cat ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            id="btn-refresh-watchlist"
            onClick={() => refreshWatchlist()}
            disabled={isLoadingWatchlist}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors shadow-2xs uppercase"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingWatchlist ? 'animate-spin text-blue-600' : ''}`} />
            SYNC LOCATIONS
          </button>

          {/* Quick Add Supported Location Menu */}
          <div className="relative">
            <button
              id="btn-add-place-dropdown"
              onClick={() => setShowAddMenu(!showAddMenu)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-xs uppercase"
            >
              <Plus className="w-3.5 h-3.5" />
              WATCH LOCATION
            </button>

            {showAddMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl p-2 z-30 space-y-1">
                <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  Select Place to Monitor
                </div>
                <div className="max-h-60 overflow-y-auto space-y-0.5">
                  {supportedLocations.map(loc => {
                    const isAlreadyWatched = watchlist.some(
                      w => w.name.toLowerCase() === loc.displayName.toLowerCase()
                    );
                    return (
                      <button
                        key={loc.id}
                        onClick={() => {
                          addPlaceToWatch({
                            name: loc.displayName,
                            category: 'city',
                            organization: 'HeatOS Living Network',
                            latitude: loc.coordinates.lat,
                            longitude: loc.coordinates.lng,
                            stateCode: loc.state,
                            countryCode: loc.country,
                            tags: ['Monitored City', loc.climateZone],
                          });
                          setShowAddMenu(false);
                        }}
                        disabled={isAlreadyWatched}
                        className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                          isAlreadyWatched
                            ? 'text-slate-400 bg-slate-50/50 cursor-not-allowed'
                            : 'text-slate-800 hover:bg-blue-50 hover:text-blue-900 font-medium'
                        }`}
                      >
                        <span>{loc.displayName}</span>
                        {isAlreadyWatched ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Plus className="w-3.5 h-3.5 text-slate-400" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Watchlist Cards Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
          <span>Monitored Locations & Sites ({filteredWatchlist.length})</span>
          <span className="text-slate-400 font-mono">Continuous 30s Telemetry Cycle</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredWatchlist.map(item => (
            <div
              key={item.id}
              id={`card-watched-${item.id}`}
              className="bg-white border border-slate-200/80 hover:border-blue-300 rounded-2xl p-5 space-y-4 transition-all shadow-xs flex flex-col justify-between group"
            >
              {/* Card Header */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                        {item.category}
                      </span>
                      {item.highestAlertTier !== 'NONE' && (
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getTierColor(
                            item.highestAlertTier
                          )}`}
                        >
                          {item.highestAlertTier}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mt-1.5 tracking-tight group-hover:text-blue-600 transition-colors">{item.name}</h3>
                    {item.organization && (
                      <p className="text-xs text-slate-500 line-clamp-1">{item.organization}</p>
                    )}
                  </div>

                  {/* Pulse Score Circle */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      explanation.explainMetric('environmentalPulse', `${item.pulseScore}/100`, {
                        label: `${item.name} • Environmental Pulse`,
                        whatItMeans: `Overall environmental vitality score of ${item.pulseScore}/100 for ${item.name} synthesized across 6 physical dimensions.`,
                      });
                    }}
                    className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 hover:bg-blue-50/70 border border-slate-200/80 hover:border-blue-300 text-center min-w-[56px] transition-all cursor-pointer group/pulse"
                    title="Click to inspect Pulse score calculation"
                  >
                    <span className="text-[9px] font-bold uppercase text-slate-400 group-hover/pulse:text-blue-600 transition-colors">Pulse</span>
                    <span className={`text-xl font-black font-mono ${getPulseColor(item.pulseScore)}`}>
                      {item.pulseScore}
                    </span>
                  </button>
                </div>

                {/* Microclimate Stats Pill */}
                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200/80 text-center">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      explanation.explainMetric('ambientTemp', `${item.ambientTempC}°C`, {
                        label: `${item.name} • Ambient Temperature`,
                      });
                    }}
                    className="p-1.5 rounded-lg hover:bg-white hover:shadow-2xs transition-all cursor-pointer text-center group/metric"
                    title="Inspect Ambient Air Temperature"
                  >
                    <span className="text-[10px] font-semibold text-slate-500 group-hover/metric:text-blue-600 uppercase block transition-colors">Ambient</span>
                    <span className="text-sm font-bold text-slate-900 font-mono block">{item.ambientTempC}°C</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      explanation.explainMetric('surfaceHeatAnomaly', `+${item.uhiDeltaC}°C`, {
                        label: `${item.name} • UHI Heat Delta`,
                      });
                    }}
                    className="p-1.5 rounded-lg hover:bg-white hover:shadow-2xs transition-all cursor-pointer text-center group/metric"
                    title="Inspect Surface Heat Anomaly (UHI Delta)"
                  >
                    <span className="text-[10px] font-semibold text-slate-500 group-hover/metric:text-amber-600 uppercase block transition-colors">UHI Delta</span>
                    <span className="text-sm font-bold text-amber-600 font-mono block">+{item.uhiDeltaC}°C</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      explanation.explainMetric('wetBulb', `${item.wetBulbC}°C`, {
                        label: `${item.name} • Wet-Bulb Temperature`,
                      });
                    }}
                    className="p-1.5 rounded-lg hover:bg-white hover:shadow-2xs transition-all cursor-pointer text-center group/metric"
                    title="Inspect Wet-Bulb Temperature"
                  >
                    <span className="text-[10px] font-semibold text-slate-500 group-hover/metric:text-blue-600 uppercase block transition-colors">Wet-Bulb</span>
                    <span className="text-sm font-bold text-blue-600 font-mono block">{item.wetBulbC}°C</span>
                  </button>
                </div>

                {/* Trend Indicator */}
                <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                  <div className="flex items-center gap-1.5 font-medium">
                    <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
                    <span>{item.trendLabel}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {new Date(item.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {/* Card Actions Footer */}
              <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between gap-1 text-xs">
                <div className="flex items-center gap-1.5">
                  <button
                    id={`btn-brief-${item.id}`}
                    onClick={() => openEnvironmentalBrief(item.latitude, item.longitude, item.name)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors font-semibold"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    Brief
                  </button>
                  <button
                    id={`btn-investigate-${item.id}`}
                    onClick={() => executeStandardAction('INVESTIGATE', { locationName: item.name })}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors font-semibold"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    AI
                  </button>
                  <button
                    id={`btn-map-${item.id}`}
                    onClick={() => executeStandardAction('VIEW_MAP', { locationName: item.name })}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors font-semibold"
                  >
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    Map
                  </button>
                </div>

                <button
                  id={`btn-unwatch-${item.id}`}
                  onClick={() => removePlaceFromWatch(item.id)}
                  title="Remove from watchlist"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Global Deterministic Alert Stream */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 md:p-7 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Active Environmental Alert Stream</h2>
            </div>
            <p className="text-xs text-slate-600">
              Deterministic incident tiers generated purely from verified sensor convergence.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-700 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200">
            {allActiveAlerts.length} Active Alarms
          </span>
        </div>

        {allActiveAlerts.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
            <ShieldCheck className="w-8 h-8 text-emerald-600 mx-auto" />
            <p className="text-sm font-bold text-slate-800">All watched sites within nominal thermal parameters</p>
            <p className="text-xs text-slate-500">Zero critical or high threshold departures active.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {allActiveAlerts.map(alert => (
              <div
                key={alert.id}
                id={`alert-row-${alert.id}`}
                onClick={() =>
                  openAlertDetail(alert.eventId, alert.locationLat, alert.locationLng, alert.locationName)
                }
                className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 hover:bg-blue-50/50 border border-slate-200/80 hover:border-blue-200 rounded-xl transition-all cursor-pointer gap-3"
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider self-start border ${getTierColor(
                      alert.tier
                    )}`}
                  >
                    {alert.tier}
                  </span>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {alert.headline}
                      </h4>
                      {alert.acknowledged && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                          ACK
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                      <span className="flex items-center gap-1 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {alert.locationName}
                      </span>
                      <span>•</span>
                      <span>{alert.primaryMetric}: <strong className="text-slate-900 font-mono">{alert.observedValue}</strong></span>
                      {alert.baselineDelta && (
                        <>
                          <span>•</span>
                          <span className="text-amber-600 font-semibold">{alert.baselineDelta} vs norm</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {!alert.acknowledged && (
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        acknowledgeCurrentAlert(alert.eventId);
                      }}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-2xs"
                    >
                      Acknowledge
                    </button>
                  )}
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Phase 9 Diagnostic Verification Console */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 md:p-6 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Phase 9 System Verification Suite
            </h3>
            <p className="text-xs text-slate-600">
              Validates multi-site monitoring, deterministic alert tiering, brief generation, and actions.
            </p>
          </div>
          <button
            id="btn-run-phase9-tests"
            onClick={handleRunDiagnostic}
            disabled={isRunningTests}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs font-semibold transition-colors self-start sm:self-auto shadow-2xs"
          >
            <Activity className={`w-3.5 h-3.5 ${isRunningTests ? 'animate-spin text-blue-600' : ''}`} />
            {isRunningTests ? 'Executing Diagnostics...' : 'Run Phase 9 Verification'}
          </button>
        </div>

        {testResults && (
          <div className="bg-slate-900 text-slate-100 border border-slate-800 rounded-xl p-4 space-y-3 font-mono text-xs shadow-inner">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-emerald-400 font-bold">Status: {testResults.status}</span>
              <span className="text-slate-400">
                Passed: {testResults.passed}/{testResults.totalTests}
              </span>
            </div>
            <div className="space-y-1.5">
              {testResults.tests.map((t: any) => (
                <div key={t.testId} className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-300">{t.description}</span>
                  <span className={t.passed ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    {t.passed ? 'PASSED' : 'FAILED'} ({t.durationMs}ms)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
