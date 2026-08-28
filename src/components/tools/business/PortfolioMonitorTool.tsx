import React, { useState, useMemo } from 'react';
import {
  Layers,
  Building2,
  ShieldAlert,
  Flame,
  Activity,
  ArrowRight,
  TrendingUp,
  MapPin,
  Sparkles,
  LayoutGrid,
  List,
  Search,
  RefreshCw,
  Sliders,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import { useLocation } from '../../../context/LocationContext';
import { useNavigation } from '../../../context/NavigationContext';
import { useAIAnalyst } from '../../../context/AIAnalystContext';
import { siteService, MonitoredSite } from '../../../services/siteService';

export const PortfolioMonitorTool: React.FC = () => {
  const { formatTemp } = useLocation();
  const { openTool } = useNavigation();
  const { openAIWithContext } = useAIAnalyst();

  const [sites, setSites] = useState<MonitoredSite[]>(siteService.getAllSites());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSyncAll = () => {
    setIsSyncing(true);
    setTimeout(() => {
      siteService.syncAllSites();
      setSites([...siteService.getAllSites()]);
      setIsSyncing(false);
    }, 800);
  };

  const filteredSites = useMemo(() => {
    return sites.filter((site) => {
      const matchesSearch =
        site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        site.location.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        site.location.country.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRisk = riskFilter === 'ALL' || site.heatRisk === riskFilter;
      return matchesSearch && matchesRisk;
    });
  }, [sites, searchQuery, riskFilter]);

  // Aggregate Portfolio Statistics
  const totalSites = sites.length;
  const avgPulse = Math.round(sites.reduce((acc, s) => acc + s.pulse, 0) / (totalSites || 1));
  const totalAlerts = sites.reduce((acc, s) => acc + s.activeAlertsCount, 0);
  const peakAnomaly = Math.max(...sites.map((s) => s.surfaceAnomaly));
  const criticalSitesCount = sites.filter((s) => s.status === 'CRITICAL' || s.status === 'ACTION_REQUIRED').length;

  const getHeatRiskBadge = (risk: string) => {
    switch (risk) {
      case 'CRITICAL':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'ELEVATED':
      case 'MODERATE':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CRITICAL':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'ACTION_REQUIRED':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'WARNING':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <div id="portfolio-monitor-tool" className="space-y-6">
      {/* Portfolio Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-md border border-purple-200">
                ENTERPRISE PORTFOLIO VIEW
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-mono text-slate-500">
                {totalSites} Monitored Commercial Sites
              </span>
              <span className="text-[10px] font-mono font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                Sample & Active Records
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              Multi-Site Portfolio Risk Matrix
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-2xl">
              Compact aggregate matrix evaluating environmental vulnerabilities, thermal anomaly exposures, active alert volumes, and sync statuses across all facilities.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleSyncAll}
              disabled={isSyncing}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-purple-600' : ''}`} />
              <span>{isSyncing ? 'Refreshing...' : 'Refresh Portfolio'}</span>
            </button>

            <button
              onClick={() =>
                openAIWithContext({
                  triggerSource: 'tools',
                  toolId: 'portfolio-monitor',
                  headline: 'Enterprise Portfolio Heat Risk Assessment',
                  summary: `Ranking ${totalSites} commercial facilities by thermal vulnerability. ${criticalSitesCount} sites currently require mitigation actions.`,
                  location: 'Global Portfolio',
                })
              }
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Portfolio Brief</span>
            </button>
          </div>
        </div>

        {/* Portfolio Top Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-3 border-t border-slate-100">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">
              Monitored Sites
            </span>
            <div className="text-xl font-mono font-black text-slate-900 mt-0.5">
              {totalSites}
            </div>
            <span className="text-[11px] text-slate-500 font-medium">100% Online</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">
              Avg Portfolio Pulse
            </span>
            <div className="text-xl font-mono font-black text-purple-700 mt-0.5">
              {avgPulse}<span className="text-xs text-slate-400 font-normal">/100</span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Biophysical Score</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">
              Total Active Alerts
            </span>
            <div className={`text-xl font-mono font-black mt-0.5 ${totalAlerts > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
              {totalAlerts}
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Across Portfolio</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">
              Peak Thermal Anomaly
            </span>
            <div className="text-xl font-mono font-black text-orange-600 mt-0.5">
              +{peakAnomaly.toFixed(1)}°C
            </div>
            <span className="text-[11px] text-slate-500 font-medium">FortyGuard Hotspot</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 col-span-2 sm:col-span-1">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">
              Action Required
            </span>
            <div className={`text-xl font-mono font-black mt-0.5 ${criticalSitesCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
              {criticalSitesCount} Facilities
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Requires Mitigation</span>
          </div>
        </div>

        {/* Search, Filter & View Mode Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search site, city, country..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400 font-medium"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between">
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
              {(['ALL', 'CRITICAL', 'HIGH', 'MODERATE', 'OPTIMAL'] as const).map((risk) => (
                <button
                  key={risk}
                  onClick={() => setRiskFilter(risk)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    riskFilter === risk
                      ? 'bg-purple-900 text-white shadow-2xs'
                      : 'bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80'
                  }`}
                >
                  {risk}
                </button>
              ))}
            </div>

            <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'grid' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Compact Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'list' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Compact List View"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredSites.map((site) => {
            const riskBadge = getHeatRiskBadge(site.heatRisk);
            const statusBadge = getStatusBadge(site.status);

            return (
              <div
                key={site.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4.5 space-y-3.5 hover:border-purple-300 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-1.5">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                        {site.facilityType}
                      </span>
                      <h3 className="text-sm font-extrabold text-slate-900 leading-snug">
                        {site.name}
                      </h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{site.location.city}, {site.location.country}</span>
                      </p>
                    </div>

                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border whitespace-nowrap ${statusBadge}`}>
                      {site.status.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Compact Metrics Row */}
                  <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <div>
                      <span className="text-[9px] font-mono text-slate-400 block uppercase">Temp</span>
                      <span className="font-mono font-bold text-slate-900">{formatTemp(site.currentTemp)}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-mono text-slate-400 block uppercase">Pulse</span>
                      <span className="font-mono font-bold text-purple-700">{site.pulse}/100</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-mono text-slate-400 block uppercase">Anomaly</span>
                      <span className="font-mono font-bold text-orange-600">+{site.surfaceAnomaly.toFixed(1)}°</span>
                    </div>
                  </div>
                </div>

                {/* Risk, Alerts & Last Sync */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${riskBadge}`}>
                      {site.heatRisk}
                    </span>

                    {site.activeAlertsCount > 0 ? (
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3" />
                        <span>{site.activeAlertsCount} Alert{site.activeAlertsCount > 1 ? 's' : ''}</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>0 Alerts</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>Updated: {site.lastSync}</span>
                    <button
                      onClick={() => openTool('site-monitor', 'BUSINESS')}
                      className="text-purple-600 hover:text-purple-800 font-bold flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>Rules</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Site & Location</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Heat Risk</th>
                  <th className="py-3 px-3">Pulse</th>
                  <th className="py-3 px-3">Temp</th>
                  <th className="py-3 px-3">Surface UHI</th>
                  <th className="py-3 px-3">Active Alerts</th>
                  <th className="py-3 px-3">Last Sync</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSites.map((site) => {
                  const riskBadge = getHeatRiskBadge(site.heatRisk);
                  const statusBadge = getStatusBadge(site.status);

                  return (
                    <tr key={site.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <div>{site.name}</div>
                        <div className="text-[11px] font-normal text-slate-500">{site.location.city}, {site.location.country}</div>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border whitespace-nowrap ${statusBadge}`}>
                          {site.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border whitespace-nowrap ${riskBadge}`}>
                          {site.heatRisk}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-mono font-bold text-purple-700">
                        {site.pulse}/100
                      </td>
                      <td className="py-3.5 px-3 font-mono font-bold text-slate-900">
                        {formatTemp(site.currentTemp)}
                      </td>
                      <td className="py-3.5 px-3 font-mono font-bold text-orange-600">
                        +{site.surfaceAnomaly.toFixed(1)}°C
                      </td>
                      <td className="py-3.5 px-3">
                        {site.activeAlertsCount > 0 ? (
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                            {site.activeAlertsCount} Alerts
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono font-bold text-emerald-600">
                            0 Alerts
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 font-mono text-[11px] text-slate-400">
                        {site.lastSync}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openTool('site-monitor', 'BUSINESS')}
                            className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold transition-colors cursor-pointer"
                          >
                            Rules
                          </button>
                          <button
                            onClick={() => openTool('environmental-brief', 'BUSINESS')}
                            className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold transition-colors cursor-pointer border border-slate-200"
                          >
                            Brief
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioMonitorTool;
