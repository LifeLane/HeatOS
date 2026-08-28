/**
 * HeatOS Phase 9: Monitoring & Decision Support View
 * 
 * Commercial monitoring workspace for Places, Sites, Assets, and Regions.
 * Features:
 * - Commercial Experience Mode Switcher (Explore, Monitor, Act, Analyze)
 * - Watchlist Grid & Table with Pulse, Heat, Alerts, and Trends
 * - Deterministic Alert Stream (Critical, High, Watch, Info)
 * - Standard Action Dispatcher (Investigate, Map, Brief, Acknowledge)
 * - Live Phase 9 Self-Diagnostic Verification
 */

import React, { useState } from 'react';
import {
  Bookmark,
  BookmarkCheck,
  Activity,
  AlertTriangle,
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
  Layers,
  Search,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Info,
  Clock,
} from 'lucide-react';
import { useMonitoring } from '../../context/MonitoringContext';
import { useLocation } from '../../context/LocationContext';
import {
  WatchedLocation,
  CommercialPersonaMode,
  AlertTier,
  WatchedEntityType,
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
        return 'bg-rose-500/15 text-rose-400 border-rose-500/40';
      case 'HIGH':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/40';
      case 'WATCH':
        return 'bg-yellow-500/15 text-yellow-300 border-yellow-500/40';
      case 'INFORMATION':
        return 'bg-sky-500/15 text-sky-400 border-sky-500/40';
      default:
        return 'bg-zinc-800 text-zinc-400 border-zinc-700';
    }
  };

  const getPulseColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-sky-400';
    if (score >= 45) return 'text-amber-400';
    return 'text-rose-400';
  };

  return (
    <div id="monitoring-view-container" className="space-y-6 pb-12">
      {/* Header & Commercial Persona Mode Selector */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 md:p-6 backdrop-blur-md shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Decision Support Engine
              </span>
              <span className="text-xs text-zinc-500">•</span>
              <span className="text-xs text-zinc-400 font-mono">HeatOS Phase 9 Monitoring</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Environmental Monitoring & Watchlist</h1>
            <p className="text-sm text-zinc-300 max-w-3xl leading-relaxed">
              Track places, critical infrastructure assets, facility sites, and microclimate events with deterministic alert thresholds and rapid action dispatch.
            </p>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-zinc-950/80 border border-zinc-800 rounded-xl self-start lg:self-center">
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
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
                  }`}
                >
                  {labels[mode]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Persona Mode Context Banner */}
        <div className="mt-4 pt-4 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-emerald-400">{personaConfig.bannerBadge}:</span>
            <span className="text-zinc-300">{personaConfig.tagline}</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-400">
            <span className="hidden sm:inline">Focus:</span>
            <div className="flex flex-wrap gap-1">
              {personaConfig.focusMetrics.map((m, i) => (
                <span key={i} className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-[11px]">
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-medium">
            <span>Watched Entities</span>
            <BookmarkCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{totalWatched}</div>
          <div className="text-[11px] text-zinc-400">Cities, Assets, Sites & Campuses</div>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-medium">
            <span>Active High/Crit Alerts</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className={`text-2xl font-extrabold ${criticalHighAlerts > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {criticalHighAlerts}
          </div>
          <div className="text-[11px] text-zinc-400">Deterministic Threshold Alarms</div>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-medium">
            <span>Average Nature Pulse</span>
            <Activity className="w-4 h-4 text-sky-400" />
          </div>
          <div className={`text-2xl font-extrabold ${getPulseColor(avgPulseScore)}`}>
            {avgPulseScore}<span className="text-sm font-normal text-zinc-500">/100</span>
          </div>
          <div className="text-[11px] text-zinc-400">Multi-factor environmental vitality</div>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-medium">
            <span>Peak UHI Surface Delta</span>
            <Thermometer className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-amber-400">+{highestUhi.toFixed(1)}°C</div>
          <div className="text-[11px] text-zinc-400">Max surface-to-air heat retention</div>
        </div>
      </div>

      {/* Watchlist Controls Bar */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              id="input-watchlist-search"
              type="text"
              placeholder="Search watched sites..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500/60"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1 bg-zinc-950 border border-zinc-800 p-0.5 rounded-lg text-xs">
            {['ALL', 'CITY', 'SITE', 'ASSET', 'REGION'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  selectedCategory === cat ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-400 hover:text-zinc-200'
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
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-zinc-800 hover:bg-zinc-750 text-zinc-300 border border-zinc-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingWatchlist ? 'animate-spin text-emerald-400' : ''}`} />
            Sync Mesh
          </button>

          {/* Quick Add Supported Location Menu */}
          <div className="relative">
            <button
              id="btn-add-place-dropdown"
              onClick={() => setShowAddMenu(!showAddMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Watch Location
            </button>

            {showAddMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl p-2 z-30 space-y-1">
                <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 border-b border-zinc-800">
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
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                          isAlreadyWatched
                            ? 'text-zinc-500 bg-zinc-950/40 cursor-not-allowed'
                            : 'text-zinc-200 hover:bg-zinc-800 hover:text-white'
                        }`}
                      >
                        <span>{loc.displayName}</span>
                        {isAlreadyWatched ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500/60" />
                        ) : (
                          <Plus className="w-3.5 h-3.5 text-zinc-500" />
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
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-zinc-400 px-1">
          <span>Monitored Locations & Sites ({filteredWatchlist.length})</span>
          <span className="text-zinc-500">Continuous 30s Telemetry Cycle</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWatchlist.map(item => (
            <div
              key={item.id}
              id={`card-watched-${item.id}`}
              className="bg-zinc-900/90 border border-zinc-800/90 hover:border-zinc-700/90 rounded-xl p-5 space-y-4 transition-all shadow-md flex flex-col justify-between"
            >
              {/* Card Header */}
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-zinc-800 text-zinc-300 border border-zinc-700">
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
                    <h3 className="text-base font-bold text-white mt-1.5 tracking-tight">{item.name}</h3>
                    {item.organization && (
                      <p className="text-xs text-zinc-400 line-clamp-1">{item.organization}</p>
                    )}
                  </div>

                  {/* Pulse Score Circle */}
                  <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-zinc-950 border border-zinc-800 text-center min-w-[54px]">
                    <span className="text-[9px] font-bold uppercase text-zinc-500">Pulse</span>
                    <span className={`text-xl font-extrabold ${getPulseColor(item.pulseScore)}`}>
                      {item.pulseScore}
                    </span>
                  </div>
                </div>

                {/* Microclimate Stats Pill */}
                <div className="grid grid-cols-3 gap-2 bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800/60 text-center">
                  <div>
                    <span className="text-[10px] text-zinc-400 block">Ambient</span>
                    <span className="text-sm font-bold text-white">{item.ambientTempC}°C</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 block">UHI Delta</span>
                    <span className="text-sm font-bold text-amber-400">+{item.uhiDeltaC}°C</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 block">Wet-Bulb</span>
                    <span className="text-sm font-bold text-sky-400">{item.wetBulbC}°C</span>
                  </div>
                </div>

                {/* Trend Indicator */}
                <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
                  <div className="flex items-center gap-1.5 font-medium">
                    <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                    <span>{item.trendLabel}</span>
                  </div>
                  <span className="text-[11px] text-zinc-500 font-mono">
                    {new Date(item.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {/* Card Actions Footer */}
              <div className="pt-3 border-t border-zinc-800 flex items-center justify-between gap-1 text-xs">
                <div className="flex items-center gap-1.5">
                  <button
                    id={`btn-brief-${item.id}`}
                    onClick={() => openEnvironmentalBrief(item.latitude, item.longitude, item.name)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-zinc-200 border border-zinc-700 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 text-zinc-400" />
                    Brief
                  </button>
                  <button
                    id={`btn-investigate-${item.id}`}
                    onClick={() => executeStandardAction('INVESTIGATE', { locationName: item.name })}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-zinc-200 border border-zinc-700 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    AI
                  </button>
                  <button
                    id={`btn-map-${item.id}`}
                    onClick={() => executeStandardAction('VIEW_MAP', { locationName: item.name })}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-zinc-200 border border-zinc-700 transition-colors"
                  >
                    <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                    Map
                  </button>
                </div>

                <button
                  id={`btn-unwatch-${item.id}`}
                  onClick={() => removePlaceFromWatch(item.id)}
                  title="Remove from watchlist"
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Global Deterministic Alert Stream */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 md:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <h2 className="text-lg font-bold text-white tracking-tight">Active Environmental Alert Stream</h2>
            </div>
            <p className="text-xs text-zinc-400">
              Deterministic incident tiers generated purely from verified sensor convergence.
            </p>
          </div>
          <span className="text-xs font-mono text-zinc-400 px-2 py-1 rounded bg-zinc-950 border border-zinc-800">
            {allActiveAlerts.length} Active Alarms
          </span>
        </div>

        {allActiveAlerts.length === 0 ? (
          <div className="p-8 text-center bg-zinc-950/40 border border-zinc-800/60 rounded-xl space-y-2">
            <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="text-sm font-medium text-zinc-300">All watched sites within nominal thermal parameters</p>
            <p className="text-xs text-zinc-500">Zero critical or high threshold departures active.</p>
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
                className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-zinc-950/70 hover:bg-zinc-800/60 border border-zinc-800 hover:border-zinc-700 rounded-xl transition-all cursor-pointer gap-3"
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider self-start border ${getTierColor(
                      alert.tier
                    )}`}
                  >
                    {alert.tier}
                  </span>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                        {alert.headline}
                      </h4>
                      {alert.acknowledged && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-medium">
                          ACK
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-zinc-500" />
                        {alert.locationName}
                      </span>
                      <span>•</span>
                      <span>{alert.primaryMetric}: <strong className="text-zinc-200">{alert.observedValue}</strong></span>
                      {alert.baselineDelta && (
                        <>
                          <span>•</span>
                          <span className="text-amber-400">{alert.baselineDelta} vs norm</span>
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
                      className="px-2.5 py-1 text-xs font-semibold rounded bg-emerald-600/80 hover:bg-emerald-600 text-white transition-colors"
                    >
                      Acknowledge
                    </button>
                  )}
                  <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Phase 9 Diagnostic Verification Console */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Phase 9 System Verification Suite
            </h3>
            <p className="text-xs text-zinc-400">
              Validates multi-site monitoring, deterministic alert tiering, brief generation, and actions.
            </p>
          </div>
          <button
            id="btn-run-phase9-tests"
            onClick={handleRunDiagnostic}
            disabled={isRunningTests}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-semibold transition-colors self-start sm:self-auto"
          >
            <Activity className={`w-3.5 h-3.5 ${isRunningTests ? 'animate-spin text-emerald-400' : ''}`} />
            {isRunningTests ? 'Executing Diagnostics...' : 'Run Phase 9 Verification'}
          </button>
        </div>

        {testResults && (
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-2">
              <span className="text-emerald-400 font-bold">Status: {testResults.status}</span>
              <span className="text-zinc-400">
                Passed: {testResults.passed}/{testResults.totalTests}
              </span>
            </div>
            <div className="space-y-1.5">
              {testResults.tests.map((t: any) => (
                <div key={t.testId} className="flex items-center justify-between text-[11px]">
                  <span className="text-zinc-300">{t.description}</span>
                  <span className={t.passed ? 'text-emerald-400 font-bold' : 'text-rose-400'}>
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
