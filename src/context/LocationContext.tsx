import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { LocationData } from '../types';
import { EnvironmentalState } from '../types/environmental';
import {
  NormalizedEnvironmentalState,
  ConnectionHealthStatus,
  MetricProvenance,
} from '../types/normalizedEnvironmentalState';
import {
  globalEnvironmentalDataService,
  DiagnosticSuiteReport,
} from '../services/environmentalDataService';

export const SUPPORTED_LOCATIONS: LocationData[] = [
  {
    id: 'nyc',
    name: 'New York',
    state: 'NY',
    country: 'USA',
    displayName: 'New York, USA',
    coordinates: { lat: 40.7128, lng: -74.006 },
    elevation: '10m ASL',
    climateZone: 'Humid Subtropical (Cfa)',
    activeSensors: 342,
    activeZones: 18,
    thermalComfortIndex: 72,
    surfaceHeatAnomaly: +2.8,
    ambientTemp: 24.5,
    apparentTemp: 26.2,
    aqi: 38,
    humidity: 58,
    uvIndex: 6,
    solarIrradiance: 680,
    canopyCoverage: 22,
    status: 'moderate',
    statusText: 'Moderate Thermal Load',
  },
  {
    id: 'austin',
    name: 'Austin',
    state: 'TX',
    country: 'USA',
    displayName: 'Austin, USA',
    coordinates: { lat: 30.2672, lng: -97.7431 },
    elevation: '149m ASL',
    climateZone: 'Humid Subtropical / High Insolation',
    activeSensors: 218,
    activeZones: 14,
    thermalComfortIndex: 58,
    surfaceHeatAnomaly: +4.6,
    ambientTemp: 34.2,
    apparentTemp: 38.1,
    aqi: 44,
    humidity: 49,
    uvIndex: 9,
    solarIrradiance: 890,
    canopyCoverage: 31,
    status: 'warning',
    statusText: 'High Urban Heat Island Load',
  },
  {
    id: 'phoenix',
    name: 'Phoenix',
    state: 'AZ',
    country: 'USA',
    displayName: 'Phoenix, USA',
    coordinates: { lat: 33.4484, lng: -112.074 },
    elevation: '331m ASL',
    climateZone: 'Hot Desert (BWh)',
    activeSensors: 290,
    activeZones: 16,
    thermalComfortIndex: 41,
    surfaceHeatAnomaly: +6.2,
    ambientTemp: 41.5,
    apparentTemp: 43.0,
    aqi: 68,
    humidity: 18,
    uvIndex: 11,
    solarIrradiance: 980,
    canopyCoverage: 11,
    status: 'critical',
    statusText: 'Extreme Thermal Exposure',
  },
  {
    id: 'miami',
    name: 'Miami',
    state: 'FL',
    country: 'USA',
    displayName: 'Miami, USA',
    coordinates: { lat: 25.7617, lng: -80.1918 },
    elevation: '2m ASL',
    climateZone: 'Tropical Monsoon (Am)',
    activeSensors: 195,
    activeZones: 12,
    thermalComfortIndex: 64,
    surfaceHeatAnomaly: +1.9,
    ambientTemp: 31.0,
    apparentTemp: 37.4,
    aqi: 28,
    humidity: 78,
    uvIndex: 10,
    solarIrradiance: 790,
    canopyCoverage: 19,
    status: 'moderate',
    statusText: 'High Moisture & Thermal Stress',
  },
  {
    id: 'la',
    name: 'Los Angeles',
    state: 'CA',
    country: 'USA',
    displayName: 'Los Angeles, USA',
    coordinates: { lat: 34.0522, lng: -118.2437 },
    elevation: '87m ASL',
    climateZone: 'Mediterranean (Csa)',
    activeSensors: 310,
    activeZones: 20,
    thermalComfortIndex: 78,
    surfaceHeatAnomaly: +2.1,
    ambientTemp: 26.8,
    apparentTemp: 27.5,
    aqi: 55,
    humidity: 46,
    uvIndex: 8,
    solarIrradiance: 820,
    canopyCoverage: 18,
    status: 'optimal',
    statusText: 'Stable Thermal Condition',
  },
  {
    id: 'chicago',
    name: 'Chicago',
    state: 'IL',
    country: 'USA',
    displayName: 'Chicago, USA',
    coordinates: { lat: 41.8781, lng: -87.6298 },
    elevation: '181m ASL',
    climateZone: 'Hot-Summer Humid Continental (Dfa)',
    activeSensors: 240,
    activeZones: 15,
    thermalComfortIndex: 81,
    surfaceHeatAnomaly: +1.2,
    ambientTemp: 21.4,
    apparentTemp: 21.0,
    aqi: 32,
    humidity: 52,
    uvIndex: 5,
    solarIrradiance: 610,
    canopyCoverage: 26,
    status: 'optimal',
    statusText: 'Optimal Living Environment',
  },
  {
    id: 'seattle',
    name: 'Seattle',
    state: 'WA',
    country: 'USA',
    displayName: 'Seattle, USA',
    coordinates: { lat: 47.6062, lng: -122.3321 },
    elevation: '53m ASL',
    climateZone: 'Warm-Summer Mediterranean (Csb)',
    activeSensors: 180,
    activeZones: 11,
    thermalComfortIndex: 88,
    surfaceHeatAnomaly: +0.4,
    ambientTemp: 19.8,
    apparentTemp: 19.5,
    aqi: 22,
    humidity: 62,
    uvIndex: 4,
    solarIrradiance: 540,
    canopyCoverage: 34,
    status: 'optimal',
    statusText: 'High Canopy & Cooling Buffer',
  },
];

interface LocationContextType {
  currentLocation: LocationData;
  locations: LocationData[];
  normalizedState: NormalizedEnvironmentalState | null;
  environmentalState: EnvironmentalState | null; // Backwards compatible representation
  connectionStatus: ConnectionHealthStatus;
  statusLabel: string;
  isCached: boolean;
  isDegraded: boolean;
  isOffline: boolean;
  isLoadingEnvironmental: boolean;
  environmentalError: string | null;
  refreshEnvironmentalData: (bypassCache?: boolean) => Promise<void>;
  setLocation: (locationId: string) => void;
  tempUnit: 'C' | 'F';
  toggleTempUnit: () => void;
  formatTemp: (celsius: number) => string;
  isLive: boolean;
  toggleLive: () => void;
  lastTelemetryTime: string;
  getMetricProvenance: (metricKey: string) => MetricProvenance | null;
  activeProvenanceMetric: { key: string; formattedValue?: string } | null;
  inspectProvenance: (metricKey: string, formattedValue?: string) => void;
  closeProvenanceModal: () => void;
  runDiagnostics: () => Promise<DiagnosticSuiteReport>;
  diagnosticReport: DiagnosticSuiteReport | null;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLocation, setCurrentLocation] = useState<LocationData>(SUPPORTED_LOCATIONS[0]);
  const [normalizedState, setNormalizedState] = useState<NormalizedEnvironmentalState | null>(null);
  const [environmentalState, setEnvironmentalState] = useState<EnvironmentalState | null>(null);
  const [isLoadingEnvironmental, setIsLoadingEnvironmental] = useState<boolean>(false);
  const [environmentalError, setEnvironmentalError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionHealthStatus>('LIVE');
  const [statusLabel, setStatusLabel] = useState<string>('LIVE');
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>('C');
  const [isLive, setIsLive] = useState<boolean>(true);
  const [lastTelemetryTime, setLastTelemetryTime] = useState<string>('Just now');
  const [activeProvenanceMetric, setActiveProvenanceMetric] = useState<{ key: string; formattedValue?: string } | null>(null);
  const [diagnosticReport, setDiagnosticReport] = useState<DiagnosticSuiteReport | null>(null);

    const detectLocation = async () => {
    if (!navigator.geolocation) return;
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          
          if (data && data.address && data.address.country_code === 'us') {
            // User is in USA, create a dynamic location
            const dynamicLocation = {
              ...SUPPORTED_LOCATIONS[0],
              id: 'local_usa',
              name: data.address.city || data.address.town || data.address.county || 'Local Area',
              state: data.address.state || 'USA',
              country: 'USA',
              displayName: `${data.address.city || data.address.town || 'Local Area'}, ${data.address.state || 'USA'}`,
              coordinates: { lat: latitude, lng: longitude }
            };
            setCurrentLocation(dynamicLocation);
          } else {
            // User is NOT in USA, default to NYC
            setCurrentLocation(SUPPORTED_LOCATIONS[0]);
          }
        } catch (err) {
          console.error("Location detection failed", err);
          setCurrentLocation(SUPPORTED_LOCATIONS[0]); // fallback
        }
      },
      (error) => {
        console.warn("Geolocation denied/failed", error);
        setCurrentLocation(SUPPORTED_LOCATIONS[0]); // fallback
      }
    );
  };
  
  useEffect(() => {
    detectLocation();
  }, []);

  const loadEnvironmentalData = useCallback(async (location: LocationData, bypassCache = false) => {
    setIsLoadingEnvironmental(true);
    setEnvironmentalError(null);
    setStatusLabel('SYNCING');

    try {
      const state = await globalEnvironmentalDataService.getEnvironmentalState(location, {
        bypassCache,
      });

      setNormalizedState(state);
      setConnectionStatus(state.metadata.connectionStatus);
      setStatusLabel(state.metadata.statusLabel);
      setLastTelemetryTime(state.metadata.timestamps.syncedAt);

      // Also construct backwards-compatible legacy EnvironmentalState
      const legacyState: EnvironmentalState = {
        location: {
          lat: location.coordinates.lat,
          lng: location.coordinates.lng,
          name: location.name,
        },
        timestamp: state.metadata.timestamps.observedAt,
        temperature: {
          ambient: state.currentConditions.temperature.value,
          apparent: state.currentConditions.feelsLike.value,
          surface: state.spatialMetrics.surfaceTemp.value,
          unit: 'C',
        },
        feelsLike: state.currentConditions.feelsLike.value,
        heatIndex: state.currentConditions.heatIndex.value,
        wetBulbTemperature: state.currentConditions.wetBulb.value,
        humidity: state.currentConditions.humidity.value,
        precipitation: {
          probability: state.currentConditions.precipitation.value.chancePct,
          intensityMmPerHour: state.currentConditions.precipitation.value.intensityMmPerHour,
        },
        cloudCover: state.currentConditions.cloudCoverPct,
        wind: {
          speedKmh: state.currentConditions.wind.value.speedKmh,
          directionDeg: state.currentConditions.wind.value.directionDeg,
          gustKmh: state.currentConditions.wind.value.gustKmh,
        },
        airQuality: {
          aqi: state.currentConditions.airQuality.value.aqi,
          pm25: state.currentConditions.airQuality.value.pm25,
          pm10: state.currentConditions.airQuality.value.pm10,
        },
        solar: {
          irradianceWm2: state.currentConditions.solarIrradiance.value,
          uvIndex: state.currentConditions.uvIndex.value,
        },
        thermalRisk: {
          score: state.spatialMetrics.thermalRiskScore.value,
          level: state.spatialMetrics.surfaceHeatAnomaly.value > 5 ? 'extreme' : state.spatialMetrics.surfaceHeatAnomaly.value > 3 ? 'high' : 'moderate',
          anomalyDeltaC: state.spatialMetrics.surfaceHeatAnomaly.value,
        },
        canopy: {
          coveragePercentage: state.spatialMetrics.canopyCoveragePct.value,
        },
        forecast: state.forecast.map((f) => ({
          timestamp: f.timestamp,
          temperature: f.temperatureC,
          heatIndex: f.feelsLikeC,
          humidity: f.humidityPct,
          uvIndex: f.uvIndex,
        })),
        source: 'fortyguard',
        freshness: state.metadata.isCached ? 'cached' : 'live',
        dataAge: state.metadata.timestamps.dataAgeMs,
      };

      setEnvironmentalState(legacyState);

      // Sync normalized environmental telemetry into the current location state
      setCurrentLocation((prev) => ({
        ...prev,
        ambientTemp: state.currentConditions.temperature.value,
        apparentTemp: state.currentConditions.feelsLike.value,
        surfaceHeatAnomaly: state.spatialMetrics.surfaceHeatAnomaly.value,
        humidity: state.currentConditions.humidity.value,
        aqi: state.currentConditions.airQuality.value.aqi,
        uvIndex: state.currentConditions.uvIndex.value,
        solarIrradiance: state.currentConditions.solarIrradiance.value,
        canopyCoverage: state.spatialMetrics.canopyCoveragePct.value,
        thermalComfortIndex: state.spatialMetrics.thermalComfortIndex.value,
        status: state.spatialMetrics.surfaceHeatAnomaly.value > 5 ? 'critical' : state.spatialMetrics.surfaceHeatAnomaly.value > 3 ? 'warning' : 'optimal',
      }));
    } catch (err: any) {
      setEnvironmentalError(err.message || 'Failed to sync environmental telemetry');
      setConnectionStatus('DEGRADED');
      setStatusLabel('SYNC DELAY');
    } finally {
      setIsLoadingEnvironmental(false);
    }
  }, []);

  // Fetch normalized FortyGuard data on location change
  useEffect(() => {
    loadEnvironmentalData(currentLocation);
  }, [currentLocation.id, loadEnvironmentalData]);

  // Periodic polling heartbeat
  useEffect(() => {
    if (!isLive) return;
    const timer = setInterval(() => {
      loadEnvironmentalData(currentLocation);
    }, 30000);
    return () => clearInterval(timer);
  }, [isLive, currentLocation, loadEnvironmentalData]);


  // Handle network online/offline events for intermittent connectivity
  useEffect(() => {
    const handleOnline = () => loadEnvironmentalData(currentLocation, true);
    const handleOffline = () => loadEnvironmentalData(currentLocation, false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [currentLocation, loadEnvironmentalData]);


  const setLocation = (locationId: string) => {
    const loc = SUPPORTED_LOCATIONS.find((l) => l.id === locationId);
    if (loc) {
      setCurrentLocation(loc);
    }
  };

  const toggleTempUnit = () => {
    setTempUnit((prev) => (prev === 'C' ? 'F' : 'C'));
  };

  const formatTemp = (celsius: number): string => {
    if (tempUnit === 'F') {
      const f = (celsius * 9) / 5 + 32;
      return `${f.toFixed(1)}°F`;
    }
    return `${celsius.toFixed(1)}°C`;
  };

  const toggleLive = () => {
    setIsLive((prev) => !prev);
  };

  const refreshEnvironmentalData = async (bypassCache = true) => {
    await loadEnvironmentalData(currentLocation, bypassCache);
  };

  const getMetricProvenance = (metricKey: string): MetricProvenance | null => {
    return globalEnvironmentalDataService.getMetricProvenance(normalizedState, metricKey);
  };

  const inspectProvenance = (metricKey: string, formattedValue?: string) => {
    setActiveProvenanceMetric({ key: metricKey, formattedValue });
  };

  const closeProvenanceModal = () => {
    setActiveProvenanceMetric(null);
  };

  const runDiagnostics = async (): Promise<DiagnosticSuiteReport> => {
    const report = await globalEnvironmentalDataService.runDiagnosticTests(currentLocation);
    setDiagnosticReport(report);
    return report;
  };

  return (
    <LocationContext.Provider
      value={{
        currentLocation,
        locations: SUPPORTED_LOCATIONS,
        normalizedState,
        environmentalState,
        connectionStatus,
        statusLabel,
        isCached: connectionStatus === 'CACHED',
        isDegraded: connectionStatus === 'DEGRADED',
        isOffline: connectionStatus === 'OFFLINE',
        isLoadingEnvironmental,
        environmentalError,
        refreshEnvironmentalData,
        setLocation,
        tempUnit,
        toggleTempUnit,
        formatTemp,
        isLive,
        toggleLive,
        lastTelemetryTime,
        getMetricProvenance,
        activeProvenanceMetric,
        inspectProvenance,
        closeProvenanceModal,
        runDiagnostics,
        diagnosticReport,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

// Aliased hook for environmental data specifically
export const useEnvironmentalData = () => {
  return useLocation();
};
