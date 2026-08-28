import React, { useState } from 'react';
import {
  Building2,
  MapPin,
  Activity,
  Flame,
  Wind,
  ShieldAlert,
  Clock,
  Plus,
  RefreshCw,
  Search,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Layers,
  Filter,
  FileText,
} from 'lucide-react';
import { useLocation } from '../../../context/LocationContext';
import { useNavigation } from '../../../context/NavigationContext';
import { useAIAnalyst } from '../../../context/AIAnalystContext';
import { siteService, MonitoredSite } from '../../../services/siteService';

export const MySitesTool: React.FC = () => {
  const { formatTemp, currentLocation } = useLocation();
  const { openTool } = useNavigation();
  const { openAIWithContext } = useAIAnalyst();

  const [sites, setSites] = useState<MonitoredSite[]>(siteService.getAllSites());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTION_REQUIRED' | 'CRITICAL' | 'STABLE' | 'OPTIMAL'>('ALL');
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedSite, setSelectedSite] = useState<MonitoredSite | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSiteName, setNewSiteName] = useState('');
  const [newSiteAddress, setNewSiteAddress] = useState('');

  const handleSyncAll = () => {
    setIsSyncing(true);
    setTimeout(() => {
      siteService.syncAllSites();
      setSites([...siteService.getAllSites()]);
      setIsSyncing(false);
    }, 900);
  };

  const handleAddCurrentLocation = () => {
    const newSite = siteService.addSite({
      name: `${currentLocation.displayName} Monitored Facility`,
      location: {
        city: currentLocation.name,
        state: currentLocation.state,
        country: currentLocation.country,
        address: `${currentLocation.displayName} Central District`,
        coordinates: { lat: currentLocation.coordinates.lat, lng: currentLocation.coordinates.lng },
        climateZone: currentLocation.climateZone,
      },
      pulse: Math.round(75 + (100 - currentLocation.ambientTemp * 2)),
      currentTemp: currentLocation.ambientTemp,
      apparentTemp: currentLocation.apparentTemp,
      surfaceAnomaly: currentLocation.surfaceHeatAnomaly,
      heatRisk: currentLocation.ambientTemp > 38 ? 'CRITICAL' : currentLocation.ambientTemp > 33 ? 'HIGH' : 'MODERATE',
      airQuality: currentLocation.aqi,
      aqiLabel: currentLocation.aqi > 100 ? 'Unhealthy' : currentLocation.aqi > 50 ? 'Moderate' : 'Good',
      windSpeed: 16,
      precipitationProb: 15,
      activeAlertsCount: currentLocation.surfaceHeatAnomaly > 3.0 ? 1 : 0,
      activeAlerts: currentLocation.surfaceHeatAnomaly > 3.0 ? [
        { id: `alt-cust-${Date.now()}`, title: `Surface heat island anomaly exceedance (+${currentLocation.surfaceHeatAnomaly.toFixed(1)}°C)`, severity: 'warning', category: 'heat', timestamp: 'Just now' }
      ] : [],
      status: currentLocation.ambientTemp > 35 ? 'ACTION_REQUIRED' : 'STABLE',
      facilityType: 'Operations Center',
      isDemo: false,
      monitoringRules: [
        { id: `r1-${Date.now()}`, category: 'heat_anomaly', categoryLabel: 'Heat Anomaly', name: 'Surface Anomaly Trigger', threshold: 3.0, unit: '°C', comparison: '>=', enabled: true, isTriggered: currentLocation.surfaceHeatAnomaly >= 3.0, currentValue: currentLocation.surfaceHeatAnomaly, lastEvaluated: 'Just now', actionProtocol: 'Engage microclimate misting' },
        { id: `r2-${Date.now()}`, category: 'extreme_temp', categoryLabel: 'Extreme Temperature', name: 'Ambient High Temp Alarm', threshold: 35.0, unit: '°C', comparison: '>=', enabled: true, isTriggered: currentLocation.ambientTemp >= 35.0, currentValue: currentLocation.ambientTemp, lastEvaluated: 'Just now', actionProtocol: 'Enforce worker hydration breaks' },
        { id: `r3-${Date.now()}`, category: 'air_quality', categoryLabel: 'Air Quality', name: 'Air Quality PM2.5 Limit', threshold: 100, unit: 'AQI', comparison: '>=', enabled: true, isTriggered: currentLocation.aqi >= 100, currentValue: currentLocation.aqi, lastEvaluated: 'Just now', actionProtocol: 'Switch air handlers to recirculation' },
        { id: `r4-${Date.now()}`, category: 'wind', categoryLabel: 'Wind', name: 'High Wind Velocity Trigger', threshold: 45, unit: 'km/h', comparison: '>=', enabled: false, isTriggered: false, currentValue: 16, lastEvaluated: 'Just now', actionProtocol: 'Secure loose outdoor items' },
        { id: `r5-${Date.now()}`, category: 'precipitation', categoryLabel: 'Precipitation', name: 'Storm Precipitation Alert', threshold: 60, unit: '%', comparison: '>=', enabled: true, isTriggered: false, currentValue: 15, lastEvaluated: 'Just now', actionProtocol: 'Check drainage channels' },
        { id: `r6-${Date.now()}`, category: 'environmental_risk', categoryLabel: 'Environmental Risk', name: 'Composite Resilience Minimum', threshold: 70, unit: '/100', comparison: '<', enabled: true, isTriggered: false, currentValue: 78, lastEvaluated: 'Just now', actionProtocol: 'Review site readiness plan' },
      ],
    });
    setSites([...siteService.getAllSites()]);
    setShowAddModal(false);
  };

  const filteredSites = sites.filter((site) => {
    const matchesSearch =
      site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      site.location.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      site.location.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      site.facilityType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || site.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
        return { label: 'CRITICAL ALERT', bg: 'bg-rose-50 text-rose-700 border-rose-200' };
      case 'ACTION_REQUIRED':
        return { label: 'ACTION REQUIRED', bg: 'bg-orange-50 text-orange-700 border-orange-200' };
      case 'WARNING':
        return { label: 'ELEVATED RISK', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
      default:
        return { label: 'NOMINAL STABLE', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    }
  };

  return (
    <div id="my-sites-tool" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-md border border-purple-200">
                BUSINESS FACILITY MANAGEMENT
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-mono text-slate-500">
                {sites.length} Monitored Facilities
              </span>
              <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                Sample & Custom Enterprise Records
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              My Monitored Sites
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-2xl">
              Centralized operational cockpit for commercial facilities, logistics centers, campuses, and real estate assets tracking real-time biophysical risk.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleSyncAll}
              disabled={isSyncing}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-purple-600' : ''}`} />
              <span>{isSyncing ? 'Syncing Telemetry...' : 'Sync All Telemetry'}</span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Monitored Site</span>
            </button>

            <button
              onClick={() =>
                openAIWithContext({
                  triggerSource: 'tools',
                  toolId: 'my-sites',
                  headline: 'Enterprise Multi-Site Risk Synthesis',
                  summary: `Synthesizing ${sites.length} commercial monitored sites across global microclimates. Identifying top thermal risks and active threshold breaches.`,
                  location: 'Enterprise Portfolio',
                })
              }
              className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer border border-purple-200"
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Portfolio Audit</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search site name, city, country, or facility type..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400 font-medium"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 scrollbar-none">
            {(['ALL', 'ACTION_REQUIRED', 'CRITICAL', 'STABLE', 'OPTIMAL'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === status
                    ? 'bg-purple-900 text-white shadow-2xs'
                    : 'bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                {status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sites Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSites.map((site) => {
          const statusBadge = getStatusBadge(site.status);
          const heatRiskBadge = getHeatRiskBadge(site.heatRisk);

          return (
            <div
              key={site.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4 hover:border-purple-300 hover:shadow-xs transition-all flex flex-col justify-between"
            >
              {/* Site Card Header */}
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {site.facilityType}
                      </span>
                      {site.isDemo && (
                        <span className="text-[10px] font-mono font-semibold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">
                          Demo Site
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-extrabold text-slate-900 mt-1 leading-snug">
                      {site.name}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span>{site.location.city}, {site.location.state ? `${site.location.state}, ` : ''}{site.location.country}</span>
                    </p>
                  </div>

                  <span className={`text-[10px] font-mono font-bold px-2 py-1 rounded-md border whitespace-nowrap ${statusBadge.bg}`}>
                    {statusBadge.label}
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 truncate" title={site.location.address}>
                  {site.location.address}
                </p>
              </div>

              {/* Telemetry Snapshot Matrix */}
              <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <div>
                  <span className="text-[10px] font-mono font-semibold text-slate-400 block uppercase">
                    Ambient / Feels
                  </span>
                  <div className="font-extrabold text-slate-900 text-sm mt-0.5">
                    {formatTemp(site.currentTemp)} <span className="text-[11px] text-slate-500 font-normal">({formatTemp(site.apparentTemp)})</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-mono font-semibold text-slate-400 block uppercase">
                    Surface Anomaly
                  </span>
                  <div className={`font-extrabold text-sm mt-0.5 ${site.surfaceAnomaly >= 3.0 ? 'text-rose-600' : 'text-slate-800'}`}>
                    +{site.surfaceAnomaly.toFixed(1)}°C <span className="text-[10px] text-slate-500 font-normal">UHI</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-mono font-semibold text-slate-400 block uppercase">
                    Environmental Pulse
                  </span>
                  <div className="font-extrabold text-slate-900 text-sm mt-0.5 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{site.pulse}<span className="text-slate-400 text-xs font-normal">/100</span></span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-mono font-semibold text-slate-400 block uppercase">
                    Air Quality (AQI)
                  </span>
                  <div className="font-extrabold text-slate-900 text-sm mt-0.5">
                    {site.airQuality} <span className="text-[10px] text-slate-500 font-normal">AQI</span>
                  </div>
                </div>
              </div>

              {/* Active Alerts Bar */}
              <div className="flex items-center justify-between text-xs pt-1">
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${heatRiskBadge}`}>
                    {site.heatRisk} HEAT RISK
                  </span>
                  {site.activeAlertsCount > 0 ? (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
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

                <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Sync: {site.lastSync}</span>
                </span>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => openTool('site-monitor', 'BUSINESS')}
                  className="flex-1 py-2 px-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Site Monitor</span>
                </button>

                <button
                  onClick={() => openTool('environmental-brief', 'BUSINESS')}
                  className="py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer border border-slate-200"
                  title="Generate Environmental Brief"
                >
                  <FileText className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => openTool('risk-report', 'BUSINESS')}
                  className="py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer border border-slate-200"
                  title="Physical Risk Audit"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Site Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 max-w-md w-full space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Add Monitored Site</h3>
                  <p className="text-xs text-slate-500">Deploy continuous environmental surveillance</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100 space-y-2">
              <div className="text-xs font-bold text-purple-900">
                Link Currently Active Location
              </div>
              <p className="text-xs text-purple-700 leading-relaxed">
                Add <strong>{currentLocation.displayName}</strong> ({formatTemp(currentLocation.ambientTemp)}, AQI {currentLocation.aqi}) as an active monitored facility.
              </p>
              <button
                onClick={handleAddCurrentLocation}
                className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs mt-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add {currentLocation.displayName} to My Sites</span>
              </button>
            </div>

            <div className="text-center">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                OR RESET SAMPLE PORTFOLIO
              </span>
            </div>

            <button
              onClick={() => {
                siteService.resetToDemoSites();
                setSites([...siteService.getAllSites()]);
                setShowAddModal(false);
              }}
              className="w-full py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              Reset to 12 Global Benchmark Demo Sites
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MySitesTool;
