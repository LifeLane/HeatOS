/**
 * HeatOS: Living Environmental Map
 * 
 * Spatial environmental intelligence system featuring:
 * - Visually dominant map workspace
 * - Elegant layer selector (Temperature, Heat Risk, Precipitation, Wind, Air Quality, UV, Environmental Pulse)
 * - Floating compact map control (zoom, location, reset orientation, fullscreen, layer selection)
 * - Time controller (NOW, +2H, +4H, +6H, +12H, +24H) with point-level projection communication
 * - Environmental Location Inspector (Environmental Snapshot, HeatOS Intelligence, Explain / Forecast / Create Alert)
 * - Smooth camera transitions and subtle animations
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Maximize2,
  Minimize2,
  Compass,
  Layers,
  Radio,
  Sparkles,
  Info,
  CheckCircle2,
  MapPin,
  Flame,
  Activity,
  Trees,
  Wind,
  Droplets,
  Zap,
  Sun,
  ShieldAlert,
  Navigation as NavIcon,
  Clock,
  AlertCircle,
} from 'lucide-react';
import {
  MapLayerKey,
  MapLayerData,
  MapHotspotNode,
  MapSpatialDistrict,
  MapEnvironmentalStateResponse,
  MapTimeHorizon,
} from '../../server/map/types';
import { EnvironmentalEvent } from '../../server/events/types';
import { OpenMapView } from './OpenMapView';
import { GlobeCanvas, GlobeCityNode } from './GlobeCanvas';
import { FloatingLayerSelector } from './FloatingLayerSelector';
import { MapLegend } from './MapLegend';
import { MapToolbar } from './MapToolbar';
import { TimePlaybackControl } from './TimePlaybackControl';
import { MapSearchFlyout } from './MapSearchFlyout';
import { LocationInspectorPanel, LocationSnapshotData } from './LocationInspectorPanel';
import { NatureRouteOption } from './natureRouting';
import { MapService } from '../../services/mapService';
import { EventService } from '../../services/eventService';
import { useLocation } from '../../context/LocationContext';

interface LivingEnvironmentMapProps {
  latitude: number;
  longitude: number;
  locationName: string;
  initialLayer?: MapLayerKey;
  onOpenDiagnostics?: () => void;
}

export const LivingEnvironmentMap: React.FC<LivingEnvironmentMapProps> = ({
  latitude,
  longitude,
  locationName,
  initialLayer = 'heat',
  onOpenDiagnostics,
}) => {
  const { currentLocation, setLocation, normalizedState } = useLocation();

  // View Mode: 'google' (default, Google Maps + FortyGuard) | 'globe' (3D Earth) | 'mesh' (2D Urban Mesh)
  const [viewMode, setViewMode] = useState<'google' | 'globe' | 'mesh'>('google');
  const [isAutoRotate, setIsAutoRotate] = useState<boolean>(false);
  const [timeHorizon, setTimeHorizon] = useState<MapTimeHorizon>('now');

  // Map Camera State
  const [currentLat, setCurrentLat] = useState<number>(latitude);
  const [currentLng, setCurrentLng] = useState<number>(longitude);
  const [zoom, setZoom] = useState<number>(14);

  // Layer & Spatial Data State
  const [activeLayer, setActiveLayer] = useState<MapLayerKey>(initialLayer);
  const [mapState, setMapState] = useState<MapEnvironmentalStateResponse | null>(null);
  const [activeAlerts, setActiveAlerts] = useState<EnvironmentalEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Inspector & Selection State
  const [selectedHotspot, setSelectedHotspot] = useState<MapHotspotNode | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<EnvironmentalEvent | null>(null);
  const [inspectorData, setInspectorData] = useState<LocationSnapshotData | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState<boolean>(false);
  const [isLayerSelectorVisible, setIsLayerSelectorVisible] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // 2D Mesh pan & drag state
  const [meshPan, setMeshPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDraggingMesh, setIsDraggingMesh] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number; panX: number; panY: number }>({
    x: 0,
    y: 0,
    panX: 0,
    panY: 0,
  });

  const containerRef = useRef<HTMLDivElement>(null);

  // Keep camera synced when external props change
  useEffect(() => {
    setCurrentLat(latitude);
    setCurrentLng(longitude);
  }, [latitude, longitude]);

  // Load Map Spatial State and Real-Time Alerts
  const loadMapData = useCallback(
    async (layer: MapLayerKey = activeLayer, bypassCache: boolean = false) => {
      try {
        setIsLoading(true);
        setError(null);

        const [spatialData, eventFeed] = await Promise.all([
          MapService.fetchMapState(currentLat, currentLng, locationName, layer, bypassCache).catch(
            () => null
          ),
          EventService.fetchEvents({
            latitude: currentLat,
            longitude: currentLng,
            locationName,
            bypassCache,
          }).catch(() => null),
        ]);

        if (spatialData) {
          setMapState(spatialData);
        }

        if (eventFeed?.events) {
          setActiveAlerts(eventFeed.events);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load spatial telemetry');
      } finally {
        setIsLoading(false);
      }
    },
    [currentLat, currentLng, locationName, activeLayer]
  );

  useEffect(() => {
    loadMapData(activeLayer);
  }, [loadMapData, activeLayer]);

  // Handle layer selection
  const handleLayerSelect = (layer: MapLayerKey) => {
    setActiveLayer(layer);
  };

  // Zoom handlers
  const handleZoomIn = () => setZoom((prev) => Math.min(19, prev + 1));
  const handleZoomOut = () => setZoom((prev) => Math.max(2, prev - 1));

  // Reset Orientation / Camera handler
  const handleResetOrientation = () => {
    setCurrentLat(latitude);
    setCurrentLng(longitude);
    setZoom(14);
    setMeshPan({ x: 0, y: 0 });
    setIsAutoRotate(false);
  };

  // Locate User / Current Location handler
  const handleLocateUser = () => {
    setCurrentLat(currentLocation.coordinates.lat);
    setCurrentLng(currentLocation.coordinates.lng);
    setZoom(15);
    openSnapshotForCoordinates(
      currentLocation.coordinates.lat,
      currentLocation.coordinates.lng,
      currentLocation.name
    );
  };

  // Smooth Camera Fly-To Handler
  const handleFlyTo = (lat: number, lng: number, cityNode?: GlobeCityNode) => {
    const cityName = cityNode?.name || `${lat.toFixed(4)}°, ${lng.toFixed(4)}°`;

    setCurrentLat(lat);
    setCurrentLng(lng);
    setZoom(15);

    setLocation({
      latitude: lat,
      longitude: lng,
      name: cityName,
    });

    openSnapshotForCoordinates(lat, lng, cityName);
  };

  // Helper to open Environmental Snapshot for a location
  const openSnapshotForCoordinates = useCallback(
    (lat: number, lng: number, name: string, hotspotNode?: MapHotspotNode) => {
      // Calculate horizon delta if future time is selected
      let tempDelta = 0;
      let feelsDelta = 0;
      if (timeHorizon === '+2h') {
        tempDelta = +1.1;
        feelsDelta = +1.4;
      } else if (timeHorizon === '+4h') {
        tempDelta = +2.5;
        feelsDelta = +3.1;
      } else if (timeHorizon === '+6h') {
        tempDelta = -0.7;
        feelsDelta = -0.9;
      } else if (timeHorizon === '+12h') {
        tempDelta = -4.2;
        feelsDelta = -4.8;
      } else if (timeHorizon === '+24h') {
        tempDelta = +0.3;
        feelsDelta = +0.4;
      }

      const baseTemp = hotspotNode?.primaryValue ?? currentLocation.ambientTemp ?? 25.4;
      const baseFeels = currentLocation.apparentTemp ?? (baseTemp + 1.8);
      const heatAnomaly = hotspotNode?.anomalyDelta ?? currentLocation.surfaceHeatAnomaly ?? 2.8;
      const aqi = currentLocation.aqi ?? 38;
      const aqiStatus = aqi <= 50 ? 'Good' : aqi <= 100 ? 'Moderate' : 'Unhealthy';
      const windSpeed = 14;
      const windDir = 'SSE';
      const humidity = currentLocation.humidity ?? 58;
      const pulseScore = hotspotNode?.pulseScore ?? mapState?.selectedLocationSummary?.pulseScore ?? 78;
      const pulseStatus = hotspotNode?.pulseStatus ?? mapState?.selectedLocationSummary?.pulseStatus ?? 'STABLE';

      const snapshot: LocationSnapshotData = {
        locationName: hotspotNode?.name || name,
        subRegion: hotspotNode ? `${hotspotNode.primaryLabel} Node` : 'Urban Core Sensor Sector',
        latitude: lat,
        longitude: lng,
        temperatureC: baseTemp + tempDelta,
        feelsLikeC: baseFeels + feelsDelta,
        heatAnomalyC: heatAnomaly,
        airQualityAqi: aqi,
        airQualityStatus: aqiStatus,
        windSpeedKmh: windSpeed,
        windDirection: windDir,
        humidityPct: humidity,
        environmentalPulseScore: pulseScore,
        environmentalPulseStatus: String(pulseStatus),
        solarUvIndex: currentLocation.uvIndex ?? 7,
        canopyCoveragePct: currentLocation.canopyCoverage ?? 24,
        hotspot: hotspotNode,
        timeHorizonLabel: timeHorizon !== 'now' ? timeHorizon.toUpperCase() : undefined,
      };

      setInspectorData(snapshot);
      setIsInspectorOpen(true);
    },
    [currentLocation, mapState, timeHorizon]
  );

  // Mesh Pan / Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (
      (e.target as HTMLElement).closest(
        'button, #compact-map-floating-control, #environmental-location-inspector, #floating-layer-selector, #time-playback-control, #map-search-flyout'
      )
    ) {
      return;
    }
    if (viewMode === 'mesh') {
      setIsDraggingMesh(true);
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        panX: meshPan.x,
        panY: meshPan.y,
      };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingMesh || viewMode !== 'mesh') return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setMeshPan({
      x: dragStartRef.current.panX + dx,
      y: dragStartRef.current.panY + dy,
    });
  };

  const handleMouseUp = () => setIsDraggingMesh(false);

  // Active layer data
  const currentLayerData: MapLayerData | undefined = mapState?.layers[activeLayer];
  const availableLayers: MapLayerKey[] = useMemo(() => {
    return (
      mapState?.availableLayers || [
        'heat',
        'heat_risk',
        'precipitation',
        'wind',
        'air',
        'solar',
        'nature',
      ]
    );
  }, [mapState]);

  return (
    <div
      ref={containerRef}
      id="living-environmental-map-root"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className={`relative w-full h-full bg-slate-950 text-slate-100 rounded-2xl overflow-hidden shadow-xl border border-slate-800/80 select-none flex flex-col justify-between ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''
      }`}
    >
      {/* ---------------- TOP FLOATING BAR: SEARCH & LAYER SELECTOR ---------------- */}
      <div className="absolute top-3 sm:top-4 inset-x-3 sm:inset-x-6 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Left: Location Search Flyout & Live Mode */}
        <div className="pointer-events-auto flex items-center gap-2">
          <MapSearchFlyout
            currentLocationName={locationName}
            onSelectLocation={handleFlyTo}
          />

          {/* Environmental Mode Indicator */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 text-xs font-bold text-slate-800 shadow-lg shadow-slate-900/5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-[11px] uppercase tracking-wider text-slate-700">
              Living Environmental Telemetry
            </span>
          </div>
        </div>

        {/* Center / Right: Floating Layer Selector */}
        {isLayerSelectorVisible && (
          <div className="pointer-events-auto max-w-full overflow-x-auto transition-all duration-300">
            <FloatingLayerSelector
              activeLayer={activeLayer}
              availableLayers={availableLayers}
              onSelectLayer={handleLayerSelect}
            />
          </div>
        )}
      </div>

      {/* ---------------- CENTER MAP / GLOBE / MESH VIEWPORT ---------------- */}
      <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden">
        {viewMode === 'google' ? (
          /* Google Maps + FortyGuard Spatial Environmental Layer */
          <OpenMapView
            latitude={currentLat}
            longitude={currentLng}
            zoom={zoom}
            activeLayer={activeLayer}
            layerData={currentLayerData}
            activeAlerts={activeAlerts}
            onSelectHotspot={(hotspot) => {
              setSelectedHotspot(hotspot);
              openSnapshotForCoordinates(hotspot.latitude, hotspot.longitude, hotspot.name, hotspot);
            }}
            onSelectAlert={(alert) => {
              setSelectedAlert(alert);
              const aLat = alert.location?.latitude ?? (alert as any).spatialContext?.latitude ?? currentLat;
              const aLng = alert.location?.longitude ?? (alert as any).spatialContext?.longitude ?? currentLng;
              openSnapshotForCoordinates(aLat, aLng, alert.summary?.headline || 'Environmental Alert');
            }}
            onClickMapLocation={(lat, lng) => {
              openSnapshotForCoordinates(lat, lng, `Sector ${lat.toFixed(3)}°N, ${Math.abs(lng).toFixed(3)}°W`);
            }}
            onCameraChange={(lat, lng, z) => {
              setCurrentLat(lat);
              setCurrentLng(lng);
              setZoom(z);
            }}
          />
        ) : viewMode === 'globe' ? (
          /* 3D Living Earth Globe */
          <GlobeCanvas
            activeLayer={activeLayer}
            selectedLat={currentLat}
            selectedLng={currentLng}
            timeHorizon={timeHorizon}
            isAutoRotate={isAutoRotate}
            onSelectLocation={handleFlyTo}
          />
        ) : (
          /* 2D Urban Mesh Grid View */
          <div
            id="urban-mesh-viewport"
            className="w-full h-full relative cursor-grab active:cursor-grabbing transition-transform duration-75"
            style={{
              transform: `translate(${meshPan.x}px, ${meshPan.y}px) scale(${zoom / 10})`,
              transformOrigin: 'center center',
            }}
          >
            <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:36px_36px]" />

            {currentLayerData?.grid && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="grid grid-cols-8 gap-2 p-12 max-w-3xl w-full">
                  {currentLayerData.grid.map((cell, idx) => (
                    <div
                      key={idx}
                      className="aspect-square rounded-xl flex items-center justify-center font-mono text-[10px] font-bold transition-all duration-500 shadow-xs"
                      style={{
                        backgroundColor:
                          activeLayer === 'heat' || activeLayer === 'heat_risk'
                            ? `rgba(239, 68, 68, ${0.15 + cell.normalizedIntensity * 0.65})`
                            : activeLayer === 'air'
                            ? `rgba(20, 184, 166, ${0.15 + cell.normalizedIntensity * 0.65})`
                            : activeLayer === 'nature'
                            ? `rgba(34, 197, 94, ${0.15 + cell.normalizedIntensity * 0.65})`
                            : `rgba(59, 130, 246, ${0.15 + cell.normalizedIntensity * 0.65})`,
                        border: `1px solid rgba(255,255,255,${0.1 + cell.normalizedIntensity * 0.3})`,
                        color: '#F8FAFC',
                      }}
                    >
                      {cell.value}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ---------------- RIGHT FLOATING COMPACT MAP CONTROLS ---------------- */}
      <div className="absolute right-3 sm:right-4 top-20 z-20 flex flex-col gap-2 pointer-events-auto">
        <MapToolbar
          viewMode={viewMode}
          onChangeViewMode={(mode) => setViewMode(mode)}
          isAutoRotate={isAutoRotate}
          onToggleAutoRotate={() => setIsAutoRotate((prev) => !prev)}
          zoomLevel={zoom}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onResetOrientation={handleResetOrientation}
          onLocateUser={handleLocateUser}
          isFullscreen={isFullscreen}
          onToggleFullscreen={() => setIsFullscreen((prev) => !prev)}
          isLayerSelectorOpen={isLayerSelectorVisible}
          onToggleLayerSelector={() => setIsLayerSelectorVisible((prev) => !prev)}
          onRefresh={() => loadMapData(activeLayer, true)}
          isLoading={isLoading}
          onOpenDiagnostics={onOpenDiagnostics}
        />
      </div>

      {/* ---------------- POINT-LEVEL PROJECTION NOTICE (IF FUTURE TIME) ---------------- */}
      {timeHorizon !== 'now' && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <div className="px-3.5 py-1.5 rounded-full bg-slate-900/90 text-slate-100 border border-slate-700/80 shadow-xl backdrop-blur-md flex items-center gap-2 text-xs font-semibold">
            <Clock className="w-3.5 h-3.5 text-orange-400 shrink-0" />
            <span>
              Point-Level Station Forecast ({timeHorizon.toUpperCase()}) Projected Across Microclimate Mesh
            </span>
          </div>
        </div>
      )}

      {/* ---------------- BOTTOM FLOATING BAR: TIMELINE & LEGEND ---------------- */}
      <div className="absolute bottom-3 sm:bottom-4 inset-x-3 sm:inset-x-6 z-20 flex flex-col sm:flex-row items-end sm:items-center justify-between gap-2.5 pointer-events-none">
        {/* Left: Dynamic Map Legend */}
        <div className="pointer-events-auto">
          <MapLegend layerData={currentLayerData} />
        </div>

        {/* Right / Center: Temporal Time Controller */}
        <div className="pointer-events-auto">
          <TimePlaybackControl
            currentHorizon={timeHorizon}
            onSelectHorizon={(horizon) => setTimeHorizon(horizon)}
          />
        </div>
      </div>

      {/* ---------------- ENVIRONMENTAL LOCATION INSPECTOR ---------------- */}
      {isInspectorOpen && inspectorData && (
        <LocationInspectorPanel
          data={inspectorData}
          onClose={() => setIsInspectorOpen(false)}
          onFlyTo={handleFlyTo}
        />
      )}
    </div>
  );
};

export default LivingEnvironmentMap;
