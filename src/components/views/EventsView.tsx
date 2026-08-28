/**
 * HeatOS Phase 7: Environmental Event Engine View
 * 
 * Signature proactive event stream delivering change detection,
 * multi-source compound convergence, structured evidence, and targeted action pathways.
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
  Info,
  Cpu,
  RefreshCw,
  Search,
  Sparkles,
} from 'lucide-react';
import { useLocation } from '../../context/LocationContext';
import { useNavigation } from '../../context/NavigationContext';
import PageContainer from '../ui/PageContainer';
import Card from '../ui/Card';
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

export const EventsView: React.FC = () => {
  const { currentLocation } = useLocation();
  const { setActiveTab } = useNavigation();

  // State Management
  const [feed, setFeed] = useState<EventFeedResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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

  // Filter events client-side based on Category & Search
  const filteredEvents = (feed?.events || []).filter((event) => {
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

  return (
    <PageContainer maxWidth="7xl">
      <FadeIn>
        {/* ------------------------------------------------------------- */}
        {/* VIEW HEADER */}
        {/* ------------------------------------------------------------- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                Environmental Event Engine
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-xs font-mono font-bold">
                PHASE 7
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Automated anomaly detection, compound multi-factor convergence, and actionable
              guidance for {currentLocation.name}.
            </p>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsDiagnosticModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs cursor-pointer"
            >
              <Cpu className="w-4 h-4 text-indigo-600" />
              <span>Run Diagnostics</span>
            </button>

            <button
              onClick={() => setActiveTab('map')}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-2xs cursor-pointer"
            >
              <span>Living Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* FILTER BAR */}
        {/* ------------------------------------------------------------- */}
        <div className="mb-6">
          <EventFilters
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedSeverities={selectedSeverities}
            onToggleSeverity={handleToggleSeverity}
            minConfidence={minConfidence}
            onConfidenceChange={setMinConfidence}
            totalEvents={feed?.totalActiveEvents || 0}
            severityCounts={
              feed?.severityCounts || { CRITICAL: 0, HIGH: 0, ELEVATED: 0, WATCH: 0, INFO: 0 }
            }
            isRefreshing={isRefreshing}
            onRefresh={() => loadEvents(true)}
          />
        </div>

        {/* ------------------------------------------------------------- */}
        {/* ERROR STATE */}
        {/* ------------------------------------------------------------- */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => loadEvents(true)}
              className="font-bold underline hover:text-rose-950 cursor-pointer shrink-0"
            >
              Retry Detection
            </button>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* LOADING SKELETON */}
        {/* ------------------------------------------------------------- */}
        {isLoading && !feed && (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="p-5 rounded-2xl bg-white border border-slate-200 animate-pulse space-y-3"
              >
                <div className="h-4 bg-slate-100 rounded w-1/4" />
                <div className="h-6 bg-slate-100 rounded w-3/4" />
                <div className="h-16 bg-slate-50 rounded" />
              </div>
            ))}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* ACTIVE EVENTS FEED */}
        {/* ------------------------------------------------------------- */}
        {!isLoading && filteredEvents.length > 0 && (
          <div className="space-y-4">
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onInspect={(evt) => setSelectedEventForModal(evt)}
              />
            ))}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* EMPTY STATE */}
        {/* ------------------------------------------------------------- */}
        {!isLoading && filteredEvents.length === 0 && (
          <Card padding="lg" className="p-8 sm:p-12 text-center bg-white border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              No Matching Environmental Incidents Detected
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
              Active telemetry streams for {currentLocation.name} indicate no anomalies exceeding the
              selected filter thresholds.
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                onClick={() => {
                  setActiveCategory('ALL');
                  setSearchQuery('');
                  setSelectedSeverities(['CRITICAL', 'HIGH', 'ELEVATED', 'WATCH', 'INFO']);
                  setMinConfidence(60);
                }}
                className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          </Card>
        )}

        {/* ------------------------------------------------------------- */}
        {/* MODALS */}
        {/* ------------------------------------------------------------- */}
        <EventDetailModal
          event={selectedEventForModal}
          onClose={() => setSelectedEventForModal(null)}
        />

        <EventDiagnosticModal
          isOpen={isDiagnosticModalOpen}
          onClose={() => setIsDiagnosticModalOpen(false)}
        />
      </FadeIn>
    </PageContainer>
  );
};

export default EventsView;
