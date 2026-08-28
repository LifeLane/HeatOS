import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  CheckCircle2,
  AlertTriangle,
  Flame,
  CloudSun,
  Wind,
  Trees,
  Droplets,
  ExternalLink,
  Shield,
  Layers,
  Activity,
  Play,
  RotateCw,
  Info,
  Clock,
  Radio,
} from 'lucide-react';
import {
  fetchFabricProviders,
  toggleFabricProvider,
  fetchFabricTestSuiteReport,
} from '../../services/environmentalApi';
import { unifiedEnvironmentalStateApi } from '../../services/environmentalStateApi';
import { ProviderConfigInfo } from '../../types/environmental';

interface OpenDataFabricModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshData?: () => void;
}

export const OpenDataFabricModal: React.FC<OpenDataFabricModalProps> = ({
  isOpen,
  onClose,
  onRefreshData,
}) => {
  const [providers, setProviders] = useState<ProviderConfigInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [testRunning, setTestRunning] = useState(false);
  const [testReport, setTestReport] = useState<any>(null);
  const [testMode, setTestMode] = useState<'fabric' | 'state'>('state');
  const [activeTab, setActiveTab] = useState<'providers' | 'tests' | 'architecture'>('providers');
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const loadProviders = async () => {
    try {
      setLoading(true);
      const res = await fetchFabricProviders();
      if (res.success) {
        setProviders(res.providers);
      }
    } catch (err) {
      console.error('Failed to load fabric providers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadProviders();
    }
  }, [isOpen]);

  const handleToggle = async (providerId: string, currentEnabled: boolean) => {
    try {
      setTogglingId(providerId);
      await toggleFabricProvider(providerId, !currentEnabled);
      setProviders((prev) =>
        prev.map((p) => (p.id === providerId ? { ...p, enabled: !currentEnabled } : p))
      );
      if (onRefreshData) onRefreshData();
    } catch (err) {
      console.error('Toggle failed', err);
    } finally {
      setTogglingId(null);
    }
  };

  const handleRunTests = async (mode = testMode) => {
    try {
      setTestRunning(true);
      if (mode === 'state') {
        const report = await unifiedEnvironmentalStateApi.runTests();
        setTestReport({
          ...report,
          allPassed: report.passedCount === report.totalTests,
        });
      } else {
        const report = await fetchFabricTestSuiteReport();
        setTestReport(report);
      }
    } catch (err) {
      console.error('Failed to run test suite', err);
    } finally {
      setTestRunning(false);
    }
  };

  if (!isOpen) return null;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'thermal':
        return <Activity className="w-4 h-4 text-amber-400" />;
      case 'weather':
        return <CloudSun className="w-4 h-4 text-sky-400" />;
      case 'air_quality':
        return <Wind className="w-4 h-4 text-emerald-400" />;
      case 'wildfire':
        return <Flame className="w-4 h-4 text-orange-400" />;
      case 'satellite_vegetation':
        return <Trees className="w-4 h-4 text-lime-400" />;
      case 'water':
        return <Droplets className="w-4 h-4 text-cyan-400" />;
      default:
        return <Database className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div
      id="open-data-fabric-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        id="open-data-fabric-modal-content"
        className="w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-700/60 rounded-xl shadow-2xl flex flex-col overflow-hidden text-slate-100 font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold tracking-tight text-white">
                  Open Environmental Data Fabric
                </h2>
                <span className="px-2 py-0.5 text-xs font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded">
                  Phase 3
                </span>
              </div>
              <p className="text-xs text-slate-400">
                FortyGuard Thermal Core + Multi-Source Open Environmental Context
              </p>
            </div>
          </div>
          <button
            id="close-fabric-modal-btn"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-4 px-6 border-b border-slate-800 bg-slate-900/50">
          <button
            id="tab-providers-btn"
            onClick={() => setActiveTab('providers')}
            className={`py-3 text-sm font-medium border-b-2 transition flex items-center gap-2 ${
              activeTab === 'providers'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-4 h-4" />
            Active Providers ({providers.length})
          </button>
          <button
            id="tab-architecture-btn"
            onClick={() => setActiveTab('architecture')}
            className={`py-3 text-sm font-medium border-b-2 transition flex items-center gap-2 ${
              activeTab === 'architecture'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            Data Architecture & Principles
          </button>
          <button
            id="tab-tests-btn"
            onClick={() => setActiveTab('tests')}
            className={`py-3 text-sm font-medium border-b-2 transition flex items-center gap-2 ${
              activeTab === 'tests'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-4 h-4" />
            Diagnostic Test Suite
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'providers' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <Info className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>
                    Each provider runs in isolated catch boundaries. Toggle any provider to test
                    fault-tolerant failover in real-time.
                  </span>
                </div>
                <button
                  id="refresh-providers-btn"
                  onClick={loadProviders}
                  disabled={loading}
                  className="px-2.5 py-1 text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 flex items-center gap-1.5 transition"
                >
                  <RotateCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {providers.map((p) => {
                  const isFortyGuard = p.id === 'fortyguard';
                  const healthStatus = p.health?.status || (p.enabled ? 'online' : 'offline');

                  return (
                    <div
                      key={p.id}
                      id={`provider-card-${p.id}`}
                      className={`p-4 rounded-xl border transition flex flex-col justify-between ${
                        p.enabled
                          ? isFortyGuard
                            ? 'bg-amber-950/10 border-amber-500/30'
                            : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                          : 'bg-slate-950/20 border-slate-800/40 opacity-60'
                      }`}
                    >
                      <div>
                        {/* Provider Header */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-slate-800 rounded border border-slate-700">
                              {getCategoryIcon(p.category)}
                            </div>
                            <div>
                              <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
                                {p.name}
                                {isFortyGuard && (
                                  <span className="px-1.5 py-0.2 text-[10px] uppercase font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded">
                                    Primary Thermal
                                  </span>
                                )}
                              </h3>
                              <span className="text-[11px] font-mono text-slate-400 capitalize">
                                Category: {p.category.replace('_', ' ')}
                              </span>
                            </div>
                          </div>

                          {/* Toggle Switch */}
                          <button
                            id={`toggle-${p.id}-btn`}
                            onClick={() => handleToggle(p.id, p.enabled)}
                            disabled={togglingId === p.id}
                            className={`px-2.5 py-1 text-xs font-mono rounded border transition ${
                              p.enabled
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                                : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                            }`}
                          >
                            {togglingId === p.id ? 'Updating...' : p.enabled ? 'Enabled' : 'Disabled'}
                          </button>
                        </div>

                        {/* Health & Latency */}
                        <div className="flex items-center gap-3 my-2.5 text-xs font-mono">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                healthStatus === 'online'
                                  ? 'bg-emerald-400 animate-pulse'
                                  : healthStatus === 'degraded'
                                  ? 'bg-amber-400'
                                  : 'bg-red-400'
                              }`}
                            />
                            <span className="capitalize text-slate-300">{healthStatus}</span>
                          </div>
                          {p.health?.latencyMs !== undefined && (
                            <span className="text-slate-400">
                              Latency: {p.health.latencyMs}ms
                            </span>
                          )}
                          <span className="text-slate-400">
                            TTL: {Math.round(p.cachePolicy.defaultTtlMs / 60000)}m
                          </span>
                        </div>

                        {/* Coverage & Types */}
                        <div className="space-y-1 my-2 text-xs">
                          <p className="text-slate-300">
                            <span className="text-slate-500">Coverage:</span>{' '}
                            {p.coverage.region} ({p.coverage.spatialResolution})
                          </p>
                          <p className="text-slate-300 truncate">
                            <span className="text-slate-500">License:</span>{' '}
                            {p.attribution.license}
                          </p>
                        </div>
                      </div>

                      {/* Footer Attribution Link */}
                      <div className="pt-2.5 mt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                        <span className="text-slate-400 truncate max-w-[200px]">
                          {p.attribution.name}
                        </span>
                        <a
                          href={p.attribution.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sky-400 hover:text-sky-300 flex items-center gap-1 font-mono text-[11px]"
                        >
                          Official Source <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'architecture' && (
            <div className="space-y-6 text-sm text-slate-300">
              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
                <h3 className="font-semibold text-white text-base">The HeatOS Core Principle</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2">
                  <div className="p-3 bg-amber-950/20 border border-amber-500/30 rounded-lg">
                    <p className="text-xs font-mono uppercase text-amber-400 font-bold mb-1">
                      1. Primary Thermal
                    </p>
                    <p className="text-xs text-slate-300 font-semibold">FortyGuard</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      High-resolution microclimate, thermal anomaly, and 1m–10m mesh analytics.
                    </p>
                  </div>
                  <div className="p-3 bg-sky-950/20 border border-sky-500/30 rounded-lg">
                    <p className="text-xs font-mono uppercase text-sky-400 font-bold mb-1">
                      2. Environmental Context
                    </p>
                    <p className="text-xs text-slate-300 font-semibold">Open Data Fabric</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      NOAA synoptic weather, EPA air quality, NASA wildfire, Sentinel NDVI, USGS water.
                    </p>
                  </div>
                  <div className="p-3 bg-purple-950/20 border border-purple-500/30 rounded-lg">
                    <p className="text-xs font-mono uppercase text-purple-400 font-bold mb-1">
                      3. Interpretation
                    </p>
                    <p className="text-xs text-slate-300 font-semibold">AI Environmental Copilot</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Translates complex telemetry into human-actionable microclimate insights.
                    </p>
                  </div>
                  <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-lg">
                    <p className="text-xs font-mono uppercase text-emerald-400 font-bold mb-1">
                      4. Decision Layer
                    </p>
                    <p className="text-xs text-slate-300 font-semibold">HeatOS Core</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Urban heat resilience, pedestrian comfort guidance, and municipal cooling decisions.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-semibold text-white flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    Complete Failure Isolation
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    If EPA fails, HeatOS continues. If NOAA fails, HeatOS continues. If FortyGuard is
                    temporarily unreachable, HeatOS identifies that the primary thermal layer is
                    degraded and seamlessly serves calibrated telemetry without crashing.
                  </p>
                </div>

                <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-semibold text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    Provider-Specific Caching
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Each provider maintains dedicated cache keys and TTLs (e.g. 5m for FortyGuard,
                    10m for NOAA, 15m for EPA, 24h for satellite NDVI), preventing redundant network
                    requests and rate-limit violations.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tests' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-950/60 rounded-xl border border-slate-800">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {testMode === 'state' ? 'PHASE 4' : 'PHASE 3'}
                    </span>
                    <h3 className="text-sm font-semibold text-white">
                      {testMode === 'state'
                        ? 'Unified Environmental State Test Suite'
                        : 'Open Data Fabric Diagnostic Suite'}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400">
                    {testMode === 'state'
                      ? '10 automated tests: Multi-source synthesis, Missing data UNAVAILABLE, FortyGuard priority, Freshness decay, Window mismatches, Spatial resolution, & Confidence.'
                      : '8 automated tests: Failure isolation, provider rate limits, cache TTL, normalization, and source attribution retention.'}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <div className="flex rounded-lg bg-slate-900 p-0.5 border border-slate-800 text-xs">
                    <button
                      onClick={() => {
                        setTestMode('state');
                        setTestReport(null);
                      }}
                      className={`px-2.5 py-1 rounded-md font-mono text-[11px] transition ${
                        testMode === 'state'
                          ? 'bg-emerald-600 text-white font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Unified State (Phase 4)
                    </button>
                    <button
                      onClick={() => {
                        setTestMode('fabric');
                        setTestReport(null);
                      }}
                      className={`px-2.5 py-1 rounded-md font-mono text-[11px] transition ${
                        testMode === 'fabric'
                          ? 'bg-emerald-600 text-white font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Data Fabric (Phase 3)
                    </button>
                  </div>

                  <button
                    id="run-fabric-tests-btn"
                    onClick={() => handleRunTests(testMode)}
                    disabled={testRunning}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-mono rounded-lg shadow-lg flex items-center gap-1.5 transition shrink-0"
                  >
                    {testRunning ? (
                      <>
                        <RotateCw className="w-3.5 h-3.5 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5" />
                        Run Tests
                      </>
                    )}
                  </button>
                </div>
              </div>

              {testReport && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono">
                    <span className="text-slate-300">
                      Results: {testReport.passedCount} / {testReport.totalTests} Passed
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded font-bold ${
                        testReport.allPassed
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {testReport.allPassed ? 'ALL TESTS PASSED' : 'TESTS FAILED'}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {testReport.results?.map((res: any, idx: number) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg border flex items-center justify-between text-xs ${
                          res.passed
                            ? 'bg-emerald-950/10 border-emerald-500/20 text-slate-200'
                            : 'bg-red-950/20 border-red-500/30 text-red-200'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {res.passed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                          )}
                          <span className="font-medium">{res.name}</span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0 font-mono text-[11px] text-slate-400">
                          <span>{res.durationMs}ms</span>
                          <span
                            className={res.passed ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}
                          >
                            {res.passed ? 'PASSED' : 'FAILED'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
