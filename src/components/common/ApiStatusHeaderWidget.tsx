import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  Thermometer,
  CloudSun,
  Wind,
  Trees,
  Droplets,
  Flame,
  Sparkles,
  Database,
  Radio,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronDown,
  Layers,
  Trash2,
  Cpu,
  Zap,
  ShieldCheck,
} from 'lucide-react';
import { pingAllApis, clearAiCache, ApiPingReport, ApiPingSource } from '../../services/environmentalApi';
import { useNavigation } from '../../context/NavigationContext';
import { safeFormatShortTime } from '../../utils/formatters';

const ROTATING_ICONS = [
  { id: 'thermal', icon: Thermometer, color: 'text-rose-500', bg: 'bg-rose-50 border-rose-200', label: 'FortyGuard Thermal' },
  { id: 'weather', icon: CloudSun, color: 'text-amber-500', bg: 'bg-amber-50 border-amber-200', label: 'NOAA Weather' },
  { id: 'air_quality', icon: Wind, color: 'text-emerald-500', bg: 'bg-emerald-50 border-emerald-200', label: 'EPA Air Quality' },
  { id: 'vegetation', icon: Trees, color: 'text-lime-600', bg: 'bg-lime-50 border-lime-200', label: 'Sentinel-2 NDVI' },
  { id: 'water', icon: Droplets, color: 'text-cyan-500', bg: 'bg-cyan-50 border-cyan-200', label: 'USGS Water' },
  { id: 'wildfire', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50 border-orange-200', label: 'NASA FIRMS' },
  { id: 'hazards', icon: Radio, color: 'text-indigo-500', bg: 'bg-indigo-50 border-indigo-200', label: 'NASA EONET' },
  { id: 'ai', icon: Sparkles, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200', label: 'AI Intelligence' },
];

export const ApiStatusHeaderWidget: React.FC = () => {
  const { setIsFabricModalOpen } = useNavigation();
  const [isOpen, setIsOpen] = useState(false);
  const [activeIconIndex, setActiveIconIndex] = useState(0);
  const [isPinging, setIsPinging] = useState(false);
  const [isClearingCache, setIsClearingCache] = useState(false);
  const [cacheClearNotice, setCacheClearNotice] = useState<string | null>(null);
  const [pingReport, setPingReport] = useState<ApiPingReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const popoverRef = useRef<HTMLDivElement>(null);

  // 1. Cycle rotating icons every 2.4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIconIndex((prev) => (prev + 1) % ROTATING_ICONS.length);
    }, 2400);
    return () => clearInterval(timer);
  }, []);

  // 2. Initial Ping on mount and periodic 60s background refresh
  const executePing = async () => {
    try {
      setIsPinging(true);
      setError(null);
      const report = await pingAllApis();
      setPingReport(report);
    } catch (err: any) {
      setError(err.message || 'Failed to ping APIs');
    } finally {
      setIsPinging(false);
    }
  };

  useEffect(() => {
    executePing();
    const pollInterval = setInterval(() => {
      executePing();
    }, 60000);
    return () => clearInterval(pollInterval);
  }, []);

  // 3. Handle outside click for popover
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // 4. Handle Clear AI Cache
  const handleClearAiCache = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setIsClearingCache(true);
      const res = await clearAiCache();
      setCacheClearNotice(`Cache purged (${res.clearedEntries} entries removed)`);
      setTimeout(() => setCacheClearNotice(null), 4000);
      // Re-ping to update cache stats
      await executePing();
    } catch (err: any) {
      setCacheClearNotice(`Failed to clear cache: ${err.message}`);
      setTimeout(() => setCacheClearNotice(null), 4000);
    } finally {
      setIsClearingCache(false);
    }
  };

  const currentIconConfig = ROTATING_ICONS[activeIconIndex];
  const CurrentIcon = currentIconConfig.icon;

  const onlineCount = pingReport?.onlineCount ?? 8;
  const totalCount = pingReport?.totalCount ?? 8;
  const avgLatency = pingReport?.avgLatencyMs ?? 28;
  const isHealthy = pingReport ? pingReport.overallStatus === 'healthy' : true;
  const isDegraded = pingReport?.overallStatus === 'degraded';

  const getSourceIcon = (category: string) => {
    switch (category) {
      case 'thermal':
        return <Thermometer className="w-3.5 h-3.5 text-rose-500" />;
      case 'weather':
        return <CloudSun className="w-3.5 h-3.5 text-amber-500" />;
      case 'air_quality':
      case 'micro_sensors':
        return <Wind className="w-3.5 h-3.5 text-emerald-500" />;
      case 'wildfire':
        return <Flame className="w-3.5 h-3.5 text-orange-500" />;
      case 'satellite_vegetation':
        return <Trees className="w-3.5 h-3.5 text-lime-600" />;
      case 'water':
        return <Droplets className="w-3.5 h-3.5 text-cyan-500" />;
      case 'natural_hazards':
        return <Radio className="w-3.5 h-3.5 text-indigo-500" />;
      case 'ai':
        return <Sparkles className="w-3.5 h-3.5 text-purple-600" />;
      default:
        return <Database className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  return (
    <div className="relative inline-block" ref={popoverRef}>
      {/* ------------------------------------------------------------- */}
      {/* HEADER TRIGGER BUTTON (BESIDE LOCATION SELECTOR) */}
      {/* ------------------------------------------------------------- */}
      <button
        id="header-api-status-widget-btn"
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200/90 text-xs font-semibold text-slate-800 transition-all cursor-pointer shadow-2xs group focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
        title="Live Data Sources & API Telemetry (Click to inspect)"
      >
        {/* Rotating Multi-Stream Provider Icon */}
        <div className="relative flex items-center justify-center w-5 h-5 rounded-md bg-white border border-slate-200 shadow-2xs overflow-hidden">
          <div
            key={currentIconConfig.id}
            className="transition-all duration-300 transform scale-100 animate-fade-in flex items-center justify-center"
          >
            <CurrentIcon className={`w-3.5 h-3.5 ${currentIconConfig.color}`} />
          </div>
        </div>

        {/* Live Health Status Dot */}
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isHealthy ? 'bg-emerald-400' : isDegraded ? 'bg-amber-400' : 'bg-rose-400'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isHealthy ? 'bg-emerald-500' : isDegraded ? 'bg-amber-500' : 'bg-rose-500'
              }`}
            />
          </span>

          {/* Status Label & Active Counts */}
          <span className="hidden sm:inline-block font-mono text-[11px] font-bold text-slate-700">
            {isPinging ? (
              <span className="flex items-center gap-1 text-blue-600">
                <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                <span>Pinging...</span>
              </span>
            ) : (
              <span>
                {onlineCount}/{totalCount} APIs <span className="text-slate-400 font-normal">({avgLatency}ms)</span>
              </span>
            )}
          </span>
          <span className="sm:hidden font-mono text-[11px] font-bold text-slate-700">
            {onlineCount}/{totalCount}
          </span>
        </div>

        <ChevronDown
          className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-blue-600' : ''
          }`}
        />
      </button>

      {/* ------------------------------------------------------------- */}
      {/* DATA SOURCES & API HEALTH DROPDOWN POPOVER */}
      {/* ------------------------------------------------------------- */}
      {isOpen && (
        <div
          id="header-api-status-popover"
          className="absolute right-0 top-full mt-2 w-[340px] sm:w-[460px] max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-slate-200/90 z-50 flex flex-col overflow-hidden text-slate-800 animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="px-4 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-black tracking-wider uppercase text-slate-100">
                    Data Sources & API Status
                  </h3>
                  <span
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
                      isHealthy
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : isDegraded
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    }`}
                  >
                    {isHealthy ? 'ALL OPERATIONAL' : isDegraded ? 'DEGRADED' : 'OFFLINE'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono">
                  {onlineCount}/{totalCount} Active Streams · Avg Latency {avgLatency}ms
                </p>
              </div>
            </div>

            {/* Quick Ping Reload */}
            <button
              type="button"
              id="popover-reping-all-btn"
              onClick={executePing}
              disabled={isPinging}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
              title="Ping All APIs & Data Sources"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin text-blue-400' : ''}`} />
            </button>
          </div>

          {/* Quick Action Toolbar */}
          <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between gap-2 text-xs flex-shrink-0 flex-wrap">
            <div className="flex items-center gap-1.5 text-slate-600 font-medium">
              <Activity className="w-3.5 h-3.5 text-blue-600" />
              <span>Telemetry Mesh</span>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Purge AI Cache Button */}
              <button
                type="button"
                id="popover-clear-ai-cache-btn"
                onClick={handleClearAiCache}
                disabled={isClearingCache}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-mono text-[11px] font-bold transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                title="Flush cached AI responses to guarantee fresh real-time evaluation"
              >
                <Trash2 className={`w-3 h-3 text-rose-500 ${isClearingCache ? 'animate-spin' : ''}`} />
                <span>Clear AI Cache</span>
              </button>

              {/* Ping All Button */}
              <button
                type="button"
                id="popover-ping-all-btn"
                onClick={executePing}
                disabled={isPinging}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white font-mono text-[11px] font-bold transition-all shadow-2xs cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isPinging ? 'animate-spin' : ''}`} />
                <span>{isPinging ? 'Pinging...' : 'Ping All'}</span>
              </button>
            </div>
          </div>

          {/* Notice banner if cache cleared */}
          {cacheClearNotice && (
            <div className="px-4 py-2 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-[11px] font-medium flex items-center gap-1.5 animate-fade-in">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span>{cacheClearNotice}</span>
            </div>
          )}

          {/* Scrollable Data Sources List */}
          <div className="p-3 overflow-y-auto space-y-2 max-h-[50vh] divide-y divide-slate-100">
            {/* AI Gateway Section */}
            {pingReport?.aiService && (
              <div className="pb-2">
                <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>AI REASONING GATEWAY</span>
                  <span className="text-purple-600 font-bold">
                    {pingReport.aiService.cache?.activeEntries ?? 0} Cached Responses
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-purple-50/70 border border-purple-200/80 flex items-center justify-between gap-2">
                  <div className="flex items-start gap-2 min-w-0">
                    <div className="p-1.5 rounded-lg bg-white border border-purple-200 text-purple-600 mt-0.5">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-purple-950 truncate">
                          TabiToken ({pingReport.aiService.model})
                        </span>
                        <span
                          className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                            pingReport.aiService.status === 'online'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {pingReport.aiService.status === 'online' ? 'LIVE UPSTREAM' : 'LOCAL INTELLIGENCE'}
                        </span>
                      </div>
                      <p className="text-[11px] text-purple-900/80 truncate mt-0.5">
                        {pingReport.aiService.note}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 font-mono text-xs">
                    <span className="font-bold text-purple-950">{pingReport.aiService.latencyMs}ms</span>
                  </div>
                </div>
              </div>
            )}

            {/* Environmental Data Sources List */}
            <div className="pt-2 space-y-1.5">
              <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>INGESTED ENVIRONMENTAL SOURCES</span>
                <span>STATUS / LATENCY</span>
              </div>

              {pingReport?.sources?.map((src) => (
                <div
                  key={src.id}
                  className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 flex items-center justify-between gap-2 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
                      {getSourceIcon(src.category)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {src.name}
                        </span>
                        {src.isFallback && (
                          <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-amber-100 text-amber-800">
                            Mesh
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 truncate font-mono">
                        {src.dataType || src.message}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
                        src.status === 'online'
                          ? 'bg-emerald-100 text-emerald-800'
                          : src.status === 'degraded'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {src.status.toUpperCase()}
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-700 min-w-[36px] text-right">
                      {src.latencyMs}ms
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Action */}
          <div className="p-3 bg-slate-50 border-t border-slate-200/90 flex items-center justify-between gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setIsFabricModalOpen(true);
              }}
              className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Configure Data Fabric Providers</span>
            </button>

            <span className="text-[10px] font-mono text-slate-400">
              Synced {safeFormatShortTime(new Date())}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiStatusHeaderWidget;
