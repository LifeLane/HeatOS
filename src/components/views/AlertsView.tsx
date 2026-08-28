/**
 * HeatOS: Environmental Monitoring View
 * 
 * Evolution from passive alert list into an active Environmental Monitoring Command System:
 * - Deterministic Active Hazards Feed with full filtering & multi-factor convergence
 * - "ENVIRONMENT CLEAR" state displaying live multi-channel surveillance (Heat, Air, Water, Wind, Precipitation, Anomalies)
 * - Proactive "CREATE MONITOR" builder for user-defined spatial triggers and thresholds
 * - Every alert supports: View, Explain with AI, Locate on map, Forecast, and Dismiss
 */

import React, { useState, useEffect } from 'react';
import {
  Bell,
  AlertTriangle,
  Flame,
  Wind,
  Droplets,
  Layers,
  CheckCircle2,
  Clock,
  MapPin,
  ArrowRight,
  Filter,
  ShieldAlert,
  ShieldCheck,
  Info,
  RefreshCw,
  Search,
  Sparkles,
  Sun,
  Activity,
  Plus,
  Compass,
  TrendingUp,
  Sliders,
  Trash2,
  Power,
  SlidersHorizontal,
  CloudRain,
  Eye,
  Radio,
  Cpu,
} from 'lucide-react';
import { useLocation } from '../../context/LocationContext';
import { useNavigation } from '../../context/NavigationContext';
import { useAIAnalyst } from '../../context/AIAnalystContext';
import PageContainer from '../ui/PageContainer';
import Card from '../ui/Card';
import StatusPill from '../ui/StatusPill';
import PrimaryButton from '../ui/PrimaryButton';
import SecondaryButton from '../ui/SecondaryButton';
import { FadeIn } from '../motion/MotionPrimitives';
import { EventService } from '../../services/eventService';
import {
  EnvironmentalEvent,
  EventFeedResponse,
  EventSeverity,
  EnvironmentalEventType,
} from '../../server/events/types';
import { EventCard } from '../events/EventCard';
import { EventFilters, EventCategoryFilter } from '../events/EventFilters';
import { EventDetailModal } from '../events/EventDetailModal';
import { EventDiagnosticModal } from '../events/EventDiagnosticModal';
import { CreateMonitorModal } from '../events/CreateMonitorModal';
import {
  MonitorService,
  EnvironmentalCustomMonitor,
} from '../../services/monitorService';

export const AlertsView: React.FC = () => {
  const { currentLocation, formatTemp, tempUnit } = useLocation();
  const { setActiveTab, setSelectedZone, openTool } = useNavigation();
  const { openAIWithContext } = useAIAnalyst();

  // State Management
  const [feed, setFeed] = useState<EventFeedResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Sub-Navigation Tabs: 'hazards' | 'channels' | 'monitors'
  const [activeSubTab, setActiveSubTab] = useState<'hazards' | 'channels' | 'monitors'>('hazards');

  // Dismissed Alert IDs state (persisted locally)
  const [dismissedAlertIds, setDismissedAlertIds] = useState<string[]>([]);
  const [showDismissed, setShowDismissed] = useState<boolean>(false);

  // Custom User Monitors State
  const [customMonitors, setCustomMonitors] = useState<EnvironmentalCustomMonitor[]>([]);
  const [isCreateMonitorOpen, setIsCreateMonitorOpen] = useState<boolean>(false);

  // Filters
  const [activeCategory, setActiveCategory] = useState<EventCategoryFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSeverities, setSelectedSeverities] = useState<EventSeverity[]>([
    'CRITICAL',
    'HIGH',
    'ELEVATED',
    'WATCH',
    'INFO',
  ]);
  const [minConfidence, setMinConfidence] = useState<number>(60);

  // Modals
  const [selectedEventForModal, setSelectedEventForModal] = useState<EnvironmentalEvent | null>(
    null
  );
  const [isDiagnosticModalOpen, setIsDiagnosticModalOpen] = useState<boolean>(false);

  // Load Custom Monitors on Mount
  useEffect(() => {
    setCustomMonitors(MonitorService.getMonitors());
  }, []);

  // Load events from Event Engine
  const loadEvents = async (bypassCache: boolean = false) => {
    if (feed) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const response = await EventService.fetchEvents({
        latitude: currentLocation.coordinates.lat,
        longitude: currentLocation.coordinates.lng,
        locationName: currentLocation.name,
        minConfidence,
        bypassCache,
      });
      setFeed(response);
    } catch (err: any) {
      setError(err.message || 'Failed to evaluate environmental events.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [currentLocation.coordinates.lat, currentLocation.coordinates.lng, minConfidence]);

  const handleToggleSeverity = (sev: EventSeverity) => {
    if (selectedSeverities.includes(sev)) {
      if (selectedSeverities.length > 1) {
        setSelectedSeverities(selectedSeverities.filter((s) => s !== sev));
      }
    } else {
      setSelectedSeverities([...selectedSeverities, sev]);
    }
  };

  const handleDismissAlert = (eventId: string) => {
    if (dismissedAlertIds.includes(eventId)) {
      setDismissedAlertIds(dismissedAlertIds.filter((id) => id !== eventId));
    } else {
      setDismissedAlertIds([...dismissedAlertIds, eventId]);
    }
  };

  const handleCreatedMonitor = (newMon: EnvironmentalCustomMonitor) => {
    const saved = MonitorService.createMonitor(newMon);
    setCustomMonitors(MonitorService.getMonitors());
    setActiveSubTab('monitors');
  };

  const handleDeleteMonitor = (id: string) => {
    MonitorService.deleteMonitor(id);
    setCustomMonitors(MonitorService.getMonitors());
  };

  const handleToggleMonitor = (id: string) => {
    MonitorService.toggleMonitor(id);
    setCustomMonitors(MonitorService.getMonitors());
  };

  // Grounded AI explanation handler - uses actual alert context
  const handleExplainAI = (event: EnvironmentalEvent) => {
    const baselineText = event.evidence.baselineComparison
      ? `Observed delta: +${event.evidence.baselineComparison.delta.toFixed(1)}${event.evidence.baselineComparison.unit} vs ${event.evidence.baselineComparison.baselineType}.`
      : '';
    const driversText = event.drivers.length > 0 ? `Drivers: ${event.drivers.join(', ')}.` : '';
    const signalsText = event.evidence.signals
      .map((s) => `${s.metricName}=${s.observedValue}`)
      .join(', ');

    const groundedQuestion = `Explain the environmental hazard "${event.summary.headline}" in ${event.location.locationName}. What changed: ${event.summary.whatChanged}. Why: ${event.summary.why}. ${driversText} ${baselineText} Telemetry signals: ${signalsText}. What safety or mitigation steps are advised?`;

    openAIWithContext({
      question: groundedQuestion,
      contextTitle: `Alert Analysis: ${event.summary.headline}`,
      sourceModule: 'Alerts',
      metadata: {
        eventId: event.id,
        severity: event.severity,
        location: event.location.locationName,
        confidence: event.confidence,
      },
    });
  };

  // Locate on map handler
  const handleLocateOnMap = (event: EnvironmentalEvent) => {
    setActiveTab('navigation');
  };

  // Forecast handler
  const handleForecast = (event: EnvironmentalEvent) => {
    setActiveTab('forecast');
  };

  // Filter events client-side based on Category, Severity, Search, and Dismissed status
  const allEvents = feed?.events || [];
  const filteredEvents = allEvents.filter((event) => {
    // Dismissed check
    if (!showDismissed && dismissedAlertIds.includes(event.id)) {
      return false;
    }

    // 1. Severity Filter
    if (!selectedSeverities.includes(event.severity)) {
      return false;
    }

    // 2. Category Filter
    if (activeCategory === 'THERMAL') {
      if (
        event.type !== 'HEAT_ANOMALY' &&
        event.type !== 'RAPID_HEAT_INCREASE' &&
        event.type !== 'EXTREME_HEAT'
      )
        return false;
    } else if (activeCategory === 'ATMOSPHERIC') {
      if (event.type !== 'AIR_QUALITY_CHANGE' && event.type !== 'FIRE_ACTIVITY') return false;
    } else if (activeCategory === 'ECOLOGICAL') {
      if (event.type !== 'WATER_STRESS' && event.type !== 'VEGETATION_STRESS') return false;
    } else if (activeCategory === 'COMPOUND') {
      if (event.type !== 'MULTI_FACTOR_EVENT') return false;
    } else if (activeCategory === 'QUALITY') {
      if (event.type !== 'DATA_QUALITY_EVENT') return false;
    }

    // 3. Search Query
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      const matchHeadline = event.summary.headline.toLowerCase().includes(q);
      const matchLocation = event.location.locationName.toLowerCase().includes(q);
      const matchDrivers = event.drivers.some((d) => d.toLowerCase().includes(q));
      const matchAction = event.recommendedAction.primary.toLowerCase().includes(q);
      if (!matchHeadline && !matchLocation && !matchDrivers && !matchAction) {
        return false;
      }
    }

    return true;
  });

  const activeHazardCount = allEvents.filter((e) => !dismissedAlertIds.includes(e.id)).length;

  return (
    <PageContainer maxWidth="7xl">
      <FadeIn>
        {/* ============================================================= */}
        {/* HEADER: ENVIRONMENTAL MONITORING COMMAND */}
        {/* ============================================================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-orange-50 text-orange-600 border border-orange-200/80 flex items-center justify-center shadow-2xs">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                  Environmental Monitoring
                </h1>
                <StatusPill status="optimal" label="ACTIVE SURVEILLANCE" size="sm" />
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Proactive anomaly detection, multi-factor hazard surveillance, and threshold monitoring for {currentLocation.displayName}.
              </p>
            </div>
          </div>

          {/* Top Actions: Create Monitor, Explain with AI, Refresh */}
          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => {
                setActiveTab('tools');
                openTool('vulnerability-alert-system', 'MONITOR');
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 transition-all shadow-xs cursor-pointer"
              id="btn-vulnerability-cta"
            >
              <Activity className="w-4 h-4" />
              <span>Vulnerability Alerts</span>
            </button>
            {/* CREATE MONITOR (Primary) */}
            <button
              id="btn-create-monitor-top"
              onClick={() => setIsCreateMonitorOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white shadow-2xs transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Monitor</span>
            </button>

            {/* AI Action */}
            <SecondaryButton
              id="alerts-ask-ai-btn"
              onClick={() =>
                openAIWithContext({
                  question: `Provide an environmental monitoring overview and safety recommendations for ${currentLocation.displayName}. Are there any active thermal anomalies, air quality departures, or moisture stress?`,
                  sourceModule: 'Alerts',
                })
              }
              size="sm"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-purple-600" />
              Explain With AI
            </SecondaryButton>

            {/* Refresh */}
            <SecondaryButton
              id="alerts-refresh-btn"
              onClick={() => loadEvents(true)}
              disabled={isRefreshing}
              size="sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </SecondaryButton>
          </div>
        </div>

        {/* ============================================================= */}
        {/* SUB-NAVIGATION TABS: Hazards, Live Channels, Custom Monitors */}
        {/* ============================================================= */}
        <div className="flex items-center justify-between border-b border-slate-200/80 mb-5 pb-2 overflow-x-auto scrollbar-none gap-2">
          <div className="flex items-center gap-1.5">
            {/* Tab 1: Hazards Feed */}
            <button
              id="tab-hazards-feed"
              onClick={() => setActiveSubTab('hazards')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'hazards'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Active Hazard Feed</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  activeSubTab === 'hazards' ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {activeHazardCount}
              </span>
            </button>

            {/* Tab 2: Live Channels Telemetry */}
            <button
              id="tab-live-channels"
              onClick={() => setActiveSubTab('channels')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'channels'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-emerald-600" />
              <span>Live Channel Surveillance</span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800">
                6 LIVE
              </span>
            </button>

            {/* Tab 3: Custom Monitors */}
            <button
              id="tab-custom-monitors"
              onClick={() => setActiveSubTab('monitors')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'monitors'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
              }`}
            >
              <Bell className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Custom Monitors</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  activeSubTab === 'monitors' ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {customMonitors.length}
              </span>
            </button>
          </div>

          {/* Dismissed toggle */}
          {dismissedAlertIds.length > 0 && activeSubTab === 'hazards' && (
            <button
              onClick={() => setShowDismissed(!showDismissed)}
              className="text-[11px] font-bold text-slate-500 hover:text-slate-800 shrink-0 cursor-pointer"
            >
              {showDismissed ? 'Hide Dismissed' : `Show Dismissed (${dismissedAlertIds.length})`}
            </button>
          )}
        </div>

        {/* ============================================================= */}
        {/* TAB 1: ACTIVE HAZARDS STREAM */}
        {/* ============================================================= */}
        {activeSubTab === 'hazards' && (
          <div className="space-y-5">
            {/* Filters and Search Bar (Preserved in full) */}
            <EventFilters
              activeCategory={activeCategory}
              onSelectCategory={setActiveCategory}
              selectedSeverities={selectedSeverities}
              onToggleSeverity={handleToggleSeverity}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              minConfidence={minConfidence}
              onConfidenceChange={setMinConfidence}
              totalEvents={feed?.totalActiveEvents || 0}
              severityCounts={
                feed?.severityCounts || { CRITICAL: 0, HIGH: 0, ELEVATED: 0, WATCH: 0, INFO: 0 }
              }
              isRefreshing={isRefreshing}
              onRefresh={() => loadEvents(true)}
            />

            {/* Main Event Stream / Empty State */}
            {isLoading ? (
              <div className="py-20 text-center">
                <div className="w-8 h-8 rounded-full border-2 border-[#2563EB] border-t-transparent animate-spin mx-auto mb-3" />
                <p className="text-xs text-slate-500 font-medium">
                  Scanning environmental telemetry feeds...
                </p>
              </div>
            ) : filteredEvents.length === 0 ? (
              /* ============================================================= */
              /* BETTER EMPTY STATE: "ENVIRONMENT CLEAR" + LIVE MONITORING */
              /* ============================================================= */
              <div className="space-y-5">
                {/* 1. ENVIRONMENT CLEAR CARD */}
                <Card padding="lg" className="bg-white border-slate-200/90 text-center py-8 sm:py-10">
                  <div className="w-14 h-14 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 border border-emerald-200/80 shadow-xs">
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                  <div className="text-xs font-mono font-black uppercase tracking-widest text-emerald-700 mb-1">
                    ALL CHANNELS NOMINAL
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-1">
                    ENVIRONMENT CLEAR
                  </h2>
                  <p className="text-sm font-semibold text-slate-700 mb-1">
                    No active environmental alerts for this location. HeatOS is continuously monitoring conditions.
                  </p>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mb-5">
                    All monitored channels are within nominal baselines. No abnormal microclimate spikes detected in {currentLocation.displayName}.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <button
                      onClick={() => setIsCreateMonitorOpen(true)}
                      className="px-4 py-2 text-xs font-bold rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white shadow-2xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>CREATE MONITOR</span>
                    </button>
                    <SecondaryButton
                      size="sm"
                      onClick={() => {
                        setActiveCategory('ALL');
                        setSearchQuery('');
                        setSelectedSeverities(['CRITICAL', 'HIGH', 'ELEVATED', 'WATCH', 'INFO']);
                      }}
                    >
                      Reset Filter Criteria
                    </SecondaryButton>
                  </div>
                </Card>

                {/* 2. LIVE MONITORING SURVEILLANCE CHANNELS */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <Radio className="w-4 h-4 text-emerald-600" />
                      <h3 className="text-xs font-mono font-black uppercase tracking-wider text-slate-800">
                        MONITORING
                      </h3>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Continuous 30s Telemetry Cycle
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {/* Channel 1: Heat */}
                    <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-orange-50 text-orange-600">
                            <Flame className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-bold text-slate-900">Heat</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          NOMINAL
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                        <div>
                          <span className="text-[10px] text-slate-400 block">Ambient</span>
                          <span className="font-bold text-slate-900">{formatTemp(currentLocation.ambientTemp)}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">Surface Anomaly</span>
                          <span className="font-bold text-emerald-700">+{currentLocation.surfaceHeatAnomaly.toFixed(1)}°C</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        No urban heat island spike or nocturnal thermal plateau detected.
                      </p>
                    </div>

                    {/* Channel 2: Air */}
                    <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-teal-50 text-teal-600">
                            <Wind className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-bold text-slate-900">Air</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          OPTIMAL
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                        <div>
                          <span className="text-[10px] text-slate-400 block">Air Quality</span>
                          <span className="font-bold text-slate-900">{currentLocation.aqi} AQI</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">PM2.5 Index</span>
                          <span className="font-bold text-emerald-700">Good</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Particulate density and ozone concentration within clean air safety thresholds.
                      </p>
                    </div>

                    {/* Channel 3: Water */}
                    <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                            <Droplets className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-bold text-slate-900">Water</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          BALANCED
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                        <div>
                          <span className="text-[10px] text-slate-400 block">Humidity</span>
                          <span className="font-bold text-slate-900">{currentLocation.humidity}%</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">Hydro-Stress</span>
                          <span className="font-bold text-emerald-700">Low</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Vapor pressure and soil/canopy moisture equilibrium steady.
                      </p>
                    </div>

                    {/* Channel 4: Wind */}
                    <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-sky-50 text-sky-600">
                            <Wind className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-bold text-slate-900">Wind</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          CALM
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                        <div>
                          <span className="text-[10px] text-slate-400 block">Speed</span>
                          <span className="font-bold text-slate-900">14 km/h</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">Ventilation</span>
                          <span className="font-bold text-emerald-700">Moderate</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Urban canyon air circulation actively dispersing ground-level heat.
                      </p>
                    </div>

                    {/* Channel 5: Precipitation */}
                    <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                            <CloudRain className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-bold text-slate-900">Precipitation</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          DRY
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                        <div>
                          <span className="text-[10px] text-slate-400 block">Rainfall Rate</span>
                          <span className="font-bold text-slate-900">0.0 mm/h</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">Probability</span>
                          <span className="font-bold text-slate-600">10%</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        No storm fronts or convective cloud clusters within radar envelope.
                      </p>
                    </div>

                    {/* Channel 6: Environmental Anomalies */}
                    <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
                            <Activity className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-bold text-slate-900">Environmental Anomalies</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          STABLE
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                        <div>
                          <span className="text-[10px] text-slate-400 block">Variance Score</span>
                          <span className="font-bold text-slate-900">0.12 (Low)</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">Convergence</span>
                          <span className="font-bold text-emerald-700">Aligned</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Zero cross-sensor divergence or sudden thermal shifts identified.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3. SYSTEM STATUS CARD */}
                <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-md">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                        System Status: Operational
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">
                      FortyGuard Microclimate Mesh Active • 248 Nodes Online • Anomaly Models v7.4.0 • False-Positive Filter Engaged
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-mono text-slate-300 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Telemetry Sync: 100% Nominal</span>
                  </div>
                </div>
              </div>
            ) : (
              /* ALERTS CARDS GRID */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    isDismissed={dismissedAlertIds.includes(event.id)}
                    onInspect={() => setSelectedEventForModal(event)}
                    onExplainAI={handleExplainAI}
                    onLocateOnMap={handleLocateOnMap}
                    onForecast={handleForecast}
                    onDismiss={handleDismissAlert}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================================================= */}
        {/* TAB 2: LIVE CHANNELS SURVEILLANCE (DEDICATED FULL VIEW) */}
        {/* ============================================================= */}
        {activeSubTab === 'channels' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-mono font-bold uppercase text-emerald-700">
                      Continuous Multi-Channel Surveillance
                    </span>
                  </div>
                  <h2 className="text-lg font-black text-slate-900">
                    Real-time Environmental Channels ({currentLocation.displayName})
                  </h2>
                  <p className="text-xs text-slate-500">
                    Live telemetry parameters monitored continuously for anomaly departure.
                  </p>
                </div>
                <button
                  onClick={() => setIsCreateMonitorOpen(true)}
                  className="px-3.5 py-2 text-xs font-bold rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white shadow-2xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Monitor for Channel</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                {/* 1. Heat Channel */}
                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Flame className="w-4 h-4 text-orange-600" />
                      <span className="text-xs font-bold text-slate-900">Heat & Microclimate</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      NOMINAL
                    </span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between font-mono">
                      <span className="text-slate-500">Ambient Temperature:</span>
                      <span className="font-bold text-slate-900">{formatTemp(currentLocation.ambientTemp)}</span>
                    </div>
                    <div className="flex justify-between font-mono">
                      <span className="text-slate-500">Apparent (Feels Like):</span>
                      <span className="font-bold text-slate-900">{formatTemp(currentLocation.apparentTemp)}</span>
                    </div>
                    <div className="flex justify-between font-mono">
                      <span className="text-slate-500">Surface Heat Delta:</span>
                      <span className="font-bold text-amber-600">+{currentLocation.surfaceHeatAnomaly.toFixed(1)}°C</span>
                    </div>
                  </div>
                </div>

                {/* 2. Air Quality Channel */}
                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wind className="w-4 h-4 text-teal-600" />
                      <span className="text-xs font-bold text-slate-900">Air & Atmospheric</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      GOOD
                    </span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between font-mono">
                      <span className="text-slate-500">EPA Air Quality Index:</span>
                      <span className="font-bold text-slate-900">{currentLocation.aqi} AQI</span>
                    </div>
                    <div className="flex justify-between font-mono">
                      <span className="text-slate-500">Ozone / PM2.5:</span>
                      <span className="font-bold text-emerald-700">Low Exposure</span>
                    </div>
                    <div className="flex justify-between font-mono">
                      <span className="text-slate-500">Atmospheric Pressure:</span>
                      <span className="font-bold text-slate-900">1013.2 hPa</span>
                    </div>
                  </div>
                </div>

                {/* 3. Water & Humidity */}
                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-bold text-slate-900">Water & Hydro-Stress</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      STEADY
                    </span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between font-mono">
                      <span className="text-slate-500">Relative Humidity:</span>
                      <span className="font-bold text-slate-900">{currentLocation.humidity}%</span>
                    </div>
                    <div className="flex justify-between font-mono">
                      <span className="text-slate-500">Dew Point:</span>
                      <span className="font-bold text-slate-900">{formatTemp(16)}</span>
                    </div>
                    <div className="flex justify-between font-mono">
                      <span className="text-slate-500">Canopy Transpiration:</span>
                      <span className="font-bold text-emerald-700">Active</span>
                    </div>
                  </div>
                </div>

                {/* 4. Wind & Ventilation */}
                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wind className="w-4 h-4 text-sky-600" />
                      <span className="text-xs font-bold text-slate-900">Wind & Airflow</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      MODERATE
                    </span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between font-mono">
                      <span className="text-slate-500">Wind Velocity:</span>
                      <span className="font-bold text-slate-900">14 km/h SW</span>
                    </div>
                    <div className="flex justify-between font-mono">
                      <span className="text-slate-500">Gust Peak:</span>
                      <span className="font-bold text-slate-900">22 km/h</span>
                    </div>
                    <div className="flex justify-between font-mono">
                      <span className="text-slate-500">Thermal Dispersion:</span>
                      <span className="font-bold text-emerald-700">Favorable</span>
                    </div>
                  </div>
                </div>

                {/* 5. Precipitation */}
                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CloudRain className="w-4 h-4 text-indigo-600" />
                      <span className="text-xs font-bold text-slate-900">Precipitation & Rain</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      NO RAIN
                    </span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between font-mono">
                      <span className="text-slate-500">Precipitation Rate:</span>
                      <span className="font-bold text-slate-900">0.0 mm/hr</span>
                    </div>
                    <div className="flex justify-between font-mono">
                      <span className="text-slate-500">Storm Risk (24h):</span>
                      <span className="font-bold text-emerald-700">Minimal (5%)</span>
                    </div>
                    <div className="flex justify-between font-mono">
                      <span className="text-slate-500">Cloud Reflectance:</span>
                      <span className="font-bold text-slate-900">20% Cover</span>
                    </div>
                  </div>
                </div>

                {/* 6. Environmental Anomalies */}
                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-purple-600" />
                      <span className="text-xs font-bold text-slate-900">Environmental Anomalies</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      NOMINAL
                    </span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between font-mono">
                      <span className="text-slate-500">Microclimate Anomaly:</span>
                      <span className="font-bold text-emerald-700">None Active</span>
                    </div>
                    <div className="flex justify-between font-mono">
                      <span className="text-slate-500">False-Positive Filter:</span>
                      <span className="font-bold text-slate-900">Active (Engaged)</span>
                    </div>
                    <div className="flex justify-between font-mono">
                      <span className="text-slate-500">Cross-Sensor Drift:</span>
                      <span className="font-bold text-emerald-700">&lt; 0.05%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* System Status Banner */}
            <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Cpu className="w-5 h-5 text-emerald-400" />
                  <div>
                    <h3 className="text-sm font-bold">System Status: Operational</h3>
                    <p className="text-xs text-slate-400">
                      FortyGuard microclimate mesh continuous telemetry & anomaly synthesis
                    </p>
                  </div>
                </div>
                <StatusPill status="optimal" label="HEALTH: 100%" size="sm" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono pt-2 border-t border-slate-800">
                <div>
                  <span className="text-slate-500 block text-[10px]">Mesh Density</span>
                  <span className="text-slate-200 font-bold">12.4 nodes / km²</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Active Sensors</span>
                  <span className="text-slate-200 font-bold">{currentLocation.activeSensors} Online</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Latency</span>
                  <span className="text-emerald-400 font-bold">18 ms</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Engine</span>
                  <span className="text-slate-200 font-bold">v7.4.0 PROD</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================= */}
        {/* TAB 3: CUSTOM USER MONITORS */}
        {/* ============================================================= */}
        {activeSubTab === 'monitors' && (
          <div className="space-y-5">
            {/* Monitor Header & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs">
              <div className="space-y-0.5">
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#2563EB]" />
                  <span>Custom Environmental Monitors ({customMonitors.length})</span>
                </h2>
                <p className="text-xs text-slate-500">
                  User-defined spatial triggers that notify you when environmental conditions exceed your specified thresholds.
                </p>
              </div>

              <button
                id="btn-create-monitor-tab"
                onClick={() => setIsCreateMonitorOpen(true)}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white shadow-2xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Monitor</span>
              </button>
            </div>

            {/* Custom Monitors List */}
            {customMonitors.length === 0 ? (
              <Card padding="lg" className="text-center py-12 bg-white border-slate-200">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center mx-auto mb-3 border border-blue-100">
                  <Bell className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">
                  No active monitors configured
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                  Create a monitor to track temperature, heat risk, air quality, or custom thresholds.
                </p>
                <button
                  onClick={() => setIsCreateMonitorOpen(true)}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-[#2563EB] text-white hover:bg-blue-700 transition-colors shadow-2xs cursor-pointer"
                >
                  Create Your First Monitor
                </button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {customMonitors.map((mon) => {
                  const isActive = mon.status === 'active';
                  return (
                    <div
                      key={mon.id}
                      id={`custom-monitor-${mon.id}`}
                      className={`p-5 rounded-2xl border transition-all shadow-2xs flex flex-col justify-between ${
                        isActive
                          ? 'bg-white border-slate-200/90 hover:border-blue-300'
                          : 'bg-slate-50/60 border-slate-200 opacity-60'
                      }`}
                    >
                      <div className="space-y-3">
                        {/* Monitor Header */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-blue-50 text-[#2563EB] border border-blue-100">
                                {mon.signalLabel}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                                  mon.severity === 'CRITICAL'
                                    ? 'bg-rose-50 text-rose-800 border border-rose-200'
                                    : mon.severity === 'HIGH'
                                    ? 'bg-orange-50 text-orange-800 border border-orange-200'
                                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                                }`}
                              >
                                {mon.severity}
                              </span>
                            </div>
                            <h3 className="text-sm font-bold text-slate-900 mt-1.5 leading-snug">
                              {mon.name}
                            </h3>
                            <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{mon.location}</span>
                            </div>
                          </div>

                          {/* Active / Paused Pill */}
                          <button
                            type="button"
                            onClick={() => handleToggleMonitor(mon.id)}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase transition-colors cursor-pointer ${
                              isActive
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-slate-200 text-slate-600'
                            }`}
                            title="Click to toggle active / paused"
                          >
                            {isActive ? 'ACTIVE' : 'PAUSED'}
                          </button>
                        </div>

                        {/* Monitor Rules Box */}
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs">
                          <div className="flex justify-between font-mono">
                            <span className="text-slate-500">Condition:</span>
                            <span className="font-bold text-slate-900">
                              {mon.conditionLabel} {mon.threshold}
                            </span>
                          </div>
                          <div className="flex justify-between font-mono">
                            <span className="text-slate-500">Duration:</span>
                            <span className="font-bold text-slate-900">{mon.duration}</span>
                          </div>
                          <div className="flex justify-between font-mono">
                            <span className="text-slate-500">Notification:</span>
                            <span className="font-bold text-slate-700">{mon.notificationLabel}</span>
                          </div>
                          {mon.currentObservedValue && (
                            <div className="flex justify-between font-mono pt-1 border-t border-slate-200">
                              <span className="text-slate-500">Current Value:</span>
                              <span className="font-extrabold text-emerald-700">
                                {mon.currentObservedValue} (Safe)
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Monitor Actions Footer */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-4 text-xs">
                        <button
                          type="button"
                          onClick={() => handleToggleMonitor(mon.id)}
                          className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                        >
                          <Power className="w-3.5 h-3.5" />
                          <span>{isActive ? 'Pause' : 'Resume'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteMonitor(mon.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete monitor"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ============================================================= */}
        {/* MODALS */}
        {/* ============================================================= */}
        {/* 1. Inspect Alert Detail Modal */}
        {selectedEventForModal && (
          <EventDetailModal
            event={selectedEventForModal}
            onClose={() => setSelectedEventForModal(null)}
          />
        )}

        {/* 2. Create Environmental Monitor Modal */}
        <CreateMonitorModal
          isOpen={isCreateMonitorOpen}
          onClose={() => setIsCreateMonitorOpen(false)}
          onCreated={handleCreatedMonitor}
          defaultLocationName={currentLocation.displayName}
          defaultCoordinates={{
            lat: currentLocation.coordinates.lat,
            lng: currentLocation.coordinates.lng,
          }}
        />

        {/* 3. Event Diagnostic Verification Modal */}
        <EventDiagnosticModal
          isOpen={isDiagnosticModalOpen}
          onClose={() => setIsDiagnosticModalOpen(false)}
        />
      </FadeIn>
    </PageContainer>
  );
};

export default AlertsView;
