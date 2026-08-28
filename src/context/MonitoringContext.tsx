/**
 * HeatOS Phase 9: Monitoring Context
 * 
 * Central state management for My Places (Watchlist), Deterministic Alerts,
 * Alert Detail Inspector, Environmental Brief, Commercial Personas, and Action Dispatcher.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  WatchedLocation,
  AlertDetailView,
  EnvironmentalBrief,
  CommercialPersonaMode,
  StandardActionType,
  PersonaModeConfig,
  COMMERCIAL_PERSONA_CONFIGS,
} from '../server/monitoring/types';
import {
  fetchWatchlist,
  evaluateCustomWatchlist,
  fetchAlertDetail,
  acknowledgeAlert as apiAcknowledgeAlert,
  generateEnvironmentalBrief,
} from '../services/monitoringApi';
import { useLocation } from './LocationContext';
import { useNavigation } from './NavigationContext';

interface MonitoringContextType {
  // Watchlist state
  watchlist: WatchedLocation[];
  isLoadingWatchlist: boolean;
  isEvaluating: boolean;
  refreshWatchlist: () => Promise<void>;
  addPlaceToWatch: (place: Partial<WatchedLocation>) => Promise<void>;
  removePlaceFromWatch: (idOrName: string) => void;
  isPlaceWatched: (nameOrId: string) => boolean;
  toggleWatchCurrentLocation: () => Promise<void>;
  
  // Alert inspector modal
  selectedAlert: AlertDetailView | null;
  isLoadingAlertDetail: boolean;
  isAlertModalOpen: boolean;
  openAlertDetail: (alertId: string, lat?: number, lng?: number, name?: string) => Promise<void>;
  closeAlertDetail: () => void;
  acknowledgeCurrentAlert: (alertId: string) => Promise<boolean>;
  
  // Environmental brief modal
  selectedBrief: EnvironmentalBrief | null;
  isLoadingBrief: boolean;
  isBriefModalOpen: boolean;
  openEnvironmentalBrief: (lat?: number, lng?: number, name?: string) => Promise<void>;
  closeEnvironmentalBrief: () => void;
  
  // Commercial Experience Persona mode
  commercialPersonaMode: CommercialPersonaMode;
  setCommercialPersonaMode: (mode: CommercialPersonaMode) => void;
  personaConfig: typeof COMMERCIAL_PERSONA_CONFIGS[CommercialPersonaMode];
  
  // Standard Action Dispatcher
  executeStandardAction: (actionType: StandardActionType, payload?: any) => Promise<void>;
}

const MonitoringContext = createContext<MonitoringContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'heatos_watched_places_v1';
const PERSONA_MODE_KEY = 'heatos_commercial_mode_v1';

export const MonitoringProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentLocation, selectLocationByName, supportedLocations } = useLocation();
  const { setActiveTab } = useNavigation();

  // Watchlist state
  const [watchlist, setWatchlist] = useState<WatchedLocation[]>([]);
  const [isLoadingWatchlist, setIsLoadingWatchlist] = useState<boolean>(true);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);

  // Commercial Persona Mode
  const [commercialPersonaMode, setCommercialPersonaModeState] = useState<CommercialPersonaMode>(() => {
    try {
      const saved = localStorage.getItem(PERSONA_MODE_KEY);
      if (saved && ['PERSONAL', 'BUSINESS', 'OPERATIONS', 'RESEARCH'].includes(saved)) {
        return saved as CommercialPersonaMode;
      }
    } catch {}
    return 'BUSINESS'; // Default to enterprise monitoring
  });

  const setCommercialPersonaMode = (mode: CommercialPersonaMode) => {
    setCommercialPersonaModeState(mode);
    try {
      localStorage.setItem(PERSONA_MODE_KEY, mode);
    } catch {}
  };

  const personaConfig = useMemo(() => {
    return COMMERCIAL_PERSONA_CONFIGS[commercialPersonaMode] || COMMERCIAL_PERSONA_CONFIGS.BUSINESS;
  }, [commercialPersonaMode]);

  // Alert Detail State
  const [selectedAlert, setSelectedAlert] = useState<AlertDetailView | null>(null);
  const [isLoadingAlertDetail, setIsLoadingAlertDetail] = useState<boolean>(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState<boolean>(false);

  // Environmental Brief State
  const [selectedBrief, setSelectedBrief] = useState<EnvironmentalBrief | null>(null);
  const [isLoadingBrief, setIsLoadingBrief] = useState<boolean>(false);
  const [isBriefModalOpen, setIsBriefModalOpen] = useState<boolean>(false);

  // Load watchlist on mount
  const refreshWatchlist = useCallback(async () => {
    setIsLoadingWatchlist(true);
    try {
      // Check local storage for custom items
      let localSaved: Partial<WatchedLocation>[] = [];
      try {
        const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (raw) localSaved = JSON.parse(raw);
      } catch {}

      if (localSaved.length > 0) {
        const evaluated = await evaluateCustomWatchlist(localSaved);
        setWatchlist(evaluated);
      } else {
        const defaultList = await fetchWatchlist();
        setWatchlist(defaultList);
      }
    } catch (err) {
      console.error('Error refreshing watchlist:', err);
    } finally {
      setIsLoadingWatchlist(false);
    }
  }, []);

  useEffect(() => {
    refreshWatchlist();
  }, [refreshWatchlist]);

  // Check if place is watched
  const isPlaceWatched = useCallback((nameOrId: string): boolean => {
    if (!nameOrId) return false;
    const lower = nameOrId.toLowerCase();
    return watchlist.some(w => w.id.toLowerCase() === lower || w.name.toLowerCase() === lower);
  }, [watchlist]);

  // Add place to watchlist
  const addPlaceToWatch = async (place: Partial<WatchedLocation>) => {
    setIsEvaluating(true);
    try {
      const newEntry: Partial<WatchedLocation> = {
        id: place.id || `watch_${Date.now()}`,
        name: place.name || currentLocation.displayName,
        category: place.category || 'site',
        organization: place.organization || 'HeatOS Workspace',
        latitude: place.latitude ?? currentLocation.coordinates.lat,
        longitude: place.longitude ?? currentLocation.coordinates.lng,
        stateCode: place.stateCode || currentLocation.state,
        countryCode: place.countryCode || currentLocation.country,
        tags: place.tags || ['Custom Watch'],
        addedAt: new Date().toISOString(),
      };

      const updatedList = [...watchlist.filter(w => w.name.toLowerCase() !== newEntry.name?.toLowerCase()), newEntry];
      
      // Save locally
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedList));
      } catch {}

      // Re-evaluate with server
      const evaluated = await evaluateCustomWatchlist(updatedList);
      setWatchlist(evaluated);
    } catch (err) {
      console.error('Failed to add place to watch:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  // Remove place from watchlist
  const removePlaceFromWatch = (idOrName: string) => {
    const lower = idOrName.toLowerCase();
    const filtered = watchlist.filter(w => w.id.toLowerCase() !== lower && w.name.toLowerCase() !== lower);
    setWatchlist(filtered);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
    } catch {}
  };

  // Toggle current location
  const toggleWatchCurrentLocation = async () => {
    if (isPlaceWatched(currentLocation.displayName) || isPlaceWatched(currentLocation.name)) {
      removePlaceFromWatch(currentLocation.displayName);
    } else {
      await addPlaceToWatch({
        name: currentLocation.displayName,
        category: 'city',
        organization: 'HeatOS Living Network',
        latitude: currentLocation.coordinates.lat,
        longitude: currentLocation.coordinates.lng,
        stateCode: currentLocation.state,
        countryCode: currentLocation.country,
        tags: ['Monitored City', currentLocation.climateZone],
      });
    }
  };

  // Open Alert Detail Inspector
  const openAlertDetail = async (alertId: string, lat?: number, lng?: number, name?: string) => {
    setIsAlertModalOpen(true);
    setIsLoadingAlertDetail(true);
    try {
      const latitude = lat ?? currentLocation.coordinates.lat;
      const longitude = lng ?? currentLocation.coordinates.lng;
      const locationName = name || currentLocation.displayName;

      const detail = await fetchAlertDetail(alertId, latitude, longitude, locationName);
      setSelectedAlert(detail);
    } catch (err) {
      console.error('Failed to load alert detail:', err);
    } finally {
      setIsLoadingAlertDetail(false);
    }
  };

  const closeAlertDetail = () => {
    setIsAlertModalOpen(false);
    setSelectedAlert(null);
  };

  // Acknowledge alert
  const acknowledgeCurrentAlert = async (alertId: string): Promise<boolean> => {
    const ok = await apiAcknowledgeAlert(alertId, `${personaConfig.title} Lead`);
    if (ok) {
      if (selectedAlert && selectedAlert.eventId === alertId) {
        setSelectedAlert({ ...selectedAlert, acknowledged: true });
      }
      setWatchlist(prev =>
        prev.map(w => ({
          ...w,
          activeAlerts: w.activeAlerts.map(a =>
            a.eventId === alertId ? { ...a, acknowledged: true, acknowledgedAt: new Date().toISOString() } : a
          ),
        }))
      );
    }
    return ok;
  };

  // Open Environmental Brief
  const openEnvironmentalBrief = async (lat?: number, lng?: number, name?: string) => {
    setIsBriefModalOpen(true);
    setIsLoadingBrief(true);
    try {
      const latitude = lat ?? currentLocation.coordinates.lat;
      const longitude = lng ?? currentLocation.coordinates.lng;
      const locationName = name || currentLocation.displayName;

      const brief = await generateEnvironmentalBrief(latitude, longitude, locationName, commercialPersonaMode);
      setSelectedBrief(brief);
    } catch (err) {
      console.error('Failed to generate brief:', err);
    } finally {
      setIsLoadingBrief(false);
    }
  };

  const closeEnvironmentalBrief = () => {
    setIsBriefModalOpen(false);
    setSelectedBrief(null);
  };

  // Standard Action Dispatcher
  const executeStandardAction = async (actionType: StandardActionType, payload?: any) => {
    switch (actionType) {
      case 'INVESTIGATE':
        // Navigate to Nature Analyst AI tab with context
        setActiveTab('ai');
        closeAlertDetail();
        break;

      case 'VIEW_MAP':
        // Navigate to Spatial Map tab
        if (payload?.locationName) {
          selectLocationByName(payload.locationName);
        }
        setActiveTab('map');
        closeAlertDetail();
        break;

      case 'VIEW_EVENT':
        // Open Alert Detail Modal
        if (payload?.eventId) {
          await openAlertDetail(payload.eventId, payload.latitude, payload.longitude, payload.locationName);
        }
        break;

      case 'VIEW_FORECAST':
        // Navigate to Pulse / Diurnal tab
        if (payload?.locationName) {
          selectLocationByName(payload.locationName);
        }
        setActiveTab('pulse');
        closeAlertDetail();
        break;

      case 'VIEW_LOCATION':
        // Switch location and open home
        if (payload?.locationName) {
          selectLocationByName(payload.locationName);
        }
        setActiveTab('home');
        break;

      case 'REFRESH_DATA':
        await refreshWatchlist();
        break;

      case 'ACKNOWLEDGE':
        if (payload?.alertId) {
          await acknowledgeCurrentAlert(payload.alertId);
        }
        break;

      case 'CREATE_REPORT':
        await openEnvironmentalBrief(payload?.latitude, payload?.longitude, payload?.locationName);
        break;

      default:
        console.warn('Unhandled action type:', actionType);
    }
  };

  return (
    <MonitoringContext.Provider
      value={{
        watchlist,
        isLoadingWatchlist,
        isEvaluating,
        refreshWatchlist,
        addPlaceToWatch,
        removePlaceFromWatch,
        isPlaceWatched,
        toggleWatchCurrentLocation,
        selectedAlert,
        isLoadingAlertDetail,
        isAlertModalOpen,
        openAlertDetail,
        closeAlertDetail,
        acknowledgeCurrentAlert,
        selectedBrief,
        isLoadingBrief,
        isBriefModalOpen,
        openEnvironmentalBrief,
        closeEnvironmentalBrief,
        commercialPersonaMode,
        setCommercialPersonaMode,
        personaConfig,
        executeStandardAction,
      }}
    >
      {children}
    </MonitoringContext.Provider>
  );
};

export const useMonitoring = (): MonitoringContextType => {
  const context = useContext(MonitoringContext);
  if (!context) {
    throw new Error('useMonitoring must be used within a MonitoringProvider');
  }
  return context;
};
