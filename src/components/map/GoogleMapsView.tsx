/**
 * HeatOS: Google Maps Environmental Cartography & FortyGuard Thermal Overlays
 * Powered by Google Maps Platform (@vis.gl/react-google-maps) & FortyGuard Environmental Data Fabric.
 * Features:
 * - Real-time FortyGuard thermal heatmap and isotherm raster/polygon overlay
 * - Markers for active environmental alerts, temperature spikes, and cooling nodes
 * - Nature-friendly route overlay with shade/canopy highlights
 * - Smooth camera fly-to animations
 * - Resilient high-performance dark vector fallback when Google Maps API key is unconfigured
 */

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
  APIProvider,
  Map,
  Marker,
  useMap,
} from '@vis.gl/react-google-maps';
import {
  Flame,
  AlertTriangle,
  Trees,
  Wind,
  Droplets,
  Sun,
  ShieldAlert,
  Zap,
  MapPin,
  Compass,
  Navigation as NavIcon,
  Sparkles,
  Info,
} from 'lucide-react';
import { DARK_MAP_STYLE } from './mapStyles';
import { MapLayerKey, MapLayerData, MapHotspotNode } from '../../server/map/types';
import { EnvironmentalEvent } from '../../server/events/types';
import { NatureRouteOption } from './natureRouting';

interface GoogleMapsViewProps {
  apiKey?: string;
  latitude: number;
  longitude: number;
  zoom: number;
  activeLayer: MapLayerKey;
  layerData?: MapLayerData;
  activeAlerts: EnvironmentalEvent[];
  selectedRoute?: NatureRouteOption | null;
  onSelectHotspot: (hotspot: MapHotspotNode) => void;
  onSelectAlert: (alert: EnvironmentalEvent) => void;
  onClickMapLocation?: (lat: number, lng: number) => void;
  onCameraChange?: (lat: number, lng: number, zoom: number) => void;
}

/**
 * Controller component inside APIProvider that handles smooth camera fly-to
 * and polyline route rendering.
 */
const MapCameraController: React.FC<{
  targetLat: number;
  targetLng: number;
  zoom: number;
  activeLayer: MapLayerKey;
  layerData?: MapLayerData;
  selectedRoute?: NatureRouteOption | null;
}> = ({ targetLat, targetLng, zoom, activeLayer, layerData, selectedRoute }) => {
  const map = useMap();
  const polylineRef = useRef<google.maps.Polyline | null>(null);
  const routeDecoratorsRef = useRef<google.maps.Polyline[]>([]);

  // Smooth fly-to camera pan
  useEffect(() => {
    if (!map) return;
    map.panTo({ lat: targetLat, lng: targetLng });
    if (typeof map.getZoom() === 'number' && Math.abs(map.getZoom()! - zoom) > 0.5) {
      map.setZoom(zoom);
    }
  }, [map, targetLat, targetLng, zoom]);

  // Render Nature-Friendly Route polyline on Google Map
  useEffect(() => {
    if (!map || !window.google?.maps) return;

    // Clear old polylines
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }
    routeDecoratorsRef.current.forEach((p) => p.setMap(null));
    routeDecoratorsRef.current = [];

    if (selectedRoute && selectedRoute.path.length > 1) {
      // Base glow line
      const baseLine = new google.maps.Polyline({
        path: selectedRoute.path,
        geodesic: true,
        strokeColor: selectedRoute.color,
        strokeOpacity: 0.85,
        strokeWeight: 6,
        map,
      });
      polylineRef.current = baseLine;

      // Inner highlight line
      const innerLine = new google.maps.Polyline({
        path: selectedRoute.path,
        geodesic: true,
        strokeColor: '#FFFFFF',
        strokeOpacity: 0.7,
        strokeWeight: 2,
        map,
      });
      routeDecoratorsRef.current.push(innerLine);
    }

    return () => {
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
      }
      routeDecoratorsRef.current.forEach((p) => p.setMap(null));
    };
  }, [map, selectedRoute]);

  return null;
};

/**
 * Resilient Vector Cartography View
 * Interactive Canvas & SVG map view when Google Maps API key is not yet set or in offline preview.
 */
const InteractiveVectorCartography: React.FC<GoogleMapsViewProps> = ({
  latitude,
  longitude,
  zoom,
  activeLayer,
  layerData,
  activeAlerts,
  selectedRoute,
  onSelectHotspot,
  onSelectAlert,
  onClickMapLocation,
  onCameraChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragDistanceRef = useRef<number>(0);
  const startDragRef = useRef<{ x: number; y: number; panX: number; panY: number }>({
    x: 0,
    y: 0,
    panX: 0,
    panY: 0,
  });

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, .interactive-pin')) return;
    setIsDragging(true);
    dragDistanceRef.current = 0;
    startDragRef.current = {
      x: e.clientX,
      y: e.clientY,
      panX: panOffset.x,
      panY: panOffset.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - startDragRef.current.x;
    const dy = e.clientY - startDragRef.current.y;
    dragDistanceRef.current = Math.sqrt(dx * dx + dy * dy);
    setPanOffset({
      x: startDragRef.current.panX + dx,
      y: startDragRef.current.panY + dy,
    });
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (isDragging && dragDistanceRef.current < 5 && onClickMapLocation && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left - rect.width / 2 - panOffset.x;
      const clickY = e.clientY - rect.top - rect.height / 2 - panOffset.y;
      
      const metersPerPx = (156543.03392 * Math.cos((latitude * Math.PI) / 180)) / Math.pow(2, zoom);
      const dLat = -(clickY * metersPerPx * 40) / 111320;
      const dLng = (clickX * metersPerPx * 40) / (111320 * Math.cos((latitude * Math.PI) / 180));
      
      onClickMapLocation(latitude + dLat, longitude + dLng);
    }
    setIsDragging(false);
  };

  // Convert GPS delta to screen pixels based on zoom level
  const metersPerPixel = 156543.03392 * Math.cos((latitude * Math.PI) / 180) / Math.pow(2, zoom);
  const latLngToScreen = useCallback(
    (lat: number, lng: number, width: number, height: number) => {
      const dLat = lat - latitude;
      const dLng = lng - longitude;
      // 1 deg lat ≈ 111,000m, 1 deg lng ≈ 111,000m * cos(lat)
      const dyMeters = dLat * 111320;
      const dxMeters = dLng * 111320 * Math.cos((latitude * Math.PI) / 180);

      const px = width / 2 + dxMeters / (metersPerPixel * 40) + panOffset.x;
      const py = height / 2 - dyMeters / (metersPerPixel * 40) + panOffset.y;
      return { x: px, y: py };
    },
    [latitude, longitude, zoom, metersPerPixel, panOffset]
  );

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className="w-full h-full relative overflow-hidden bg-[#070b14] cursor-grab active:cursor-grabbing select-none"
    >
      {/* High-Tech Vector Grid & Iso-Contours */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#1e293b_1px,transparent_1px)] bg-[size:32px_32px] opacity-40" />

      {/* Cartographic Coordinate Overlay */}
      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:96px_96px]" />

      {/* FortyGuard Heatmap Grid Visual Layer */}
      {layerData?.grid && layerData.grid.length > 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="grid grid-cols-6 gap-3 p-8 w-full max-w-2xl h-full max-h-[500px] transition-transform duration-75"
            style={{
              transform: `translate(${panOffset.x}px, ${panOffset.y}px)`,
            }}
          >
            {layerData.grid.slice(0, 36).map((cell, idx) => (
              <div
                key={idx}
                className="rounded-3xl transition-all duration-700 blur-2xl opacity-45"
                style={{
                  backgroundColor:
                    activeLayer === 'heat' || activeLayer === 'heat_risk'
                      ? `rgba(239, 68, 68, ${0.25 + cell.normalizedIntensity * 0.75})`
                      : activeLayer === 'nature'
                      ? `rgba(16, 185, 129, ${0.25 + cell.normalizedIntensity * 0.75})`
                      : activeLayer === 'air'
                      ? `rgba(20, 184, 166, ${0.25 + cell.normalizedIntensity * 0.75})`
                      : `rgba(59, 130, 246, ${0.25 + cell.normalizedIntensity * 0.75})`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* SVG Nature Routes and Corridors */}
      {selectedRoute && selectedRoute.path.length > 1 && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
          <polyline
            points={selectedRoute.path
              .map((p) => {
                const pos = latLngToScreen(p.lat, p.lng, 800, 600);
                return `${pos.x},${pos.y}`;
              })
              .join(' ')}
            fill="none"
            stroke={selectedRoute.color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-90"
          />
          <polyline
            points={selectedRoute.path
              .map((p) => {
                const pos = latLngToScreen(p.lat, p.lng, 800, 600);
                return `${pos.x},${pos.y}`;
              })
              .join(' ')}
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="2"
            strokeDasharray="4 4"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-80"
          />
        </svg>
      )}

      {/* Center Target Marker */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
        <div
          className="relative flex items-center justify-center"
          style={{ transform: `translate(${panOffset.x}px, ${panOffset.y}px)` }}
        >
          <span className="absolute w-12 h-12 rounded-full bg-blue-500/20 animate-ping" />
          <div className="w-5 h-5 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center shadow-lg shadow-blue-500/50">
            <div className="w-2 h-2 rounded-full bg-white" />
          </div>
        </div>
      </div>

      {/* Hotspot Pins */}
      <div className="absolute inset-0 pointer-events-none z-20">
        {layerData?.hotspots?.map((hotspot, idx) => {
          const offsetX = ((idx % 4) - 1.5) * 140 + panOffset.x;
          const offsetY = (Math.floor(idx / 4) - 1) * 120 + panOffset.y;

          return (
            <div
              key={hotspot.id}
              className="absolute left-1/2 top-1/2 pointer-events-auto interactive-pin"
              style={{
                transform: `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))`,
              }}
            >
              <button
                type="button"
                onClick={() => onSelectHotspot(hotspot)}
                className="group flex flex-col items-center cursor-pointer transition-transform hover:scale-110 active:scale-95"
              >
                <div
                  className={`px-2.5 py-1 rounded-xl flex items-center gap-1.5 shadow-xl border backdrop-blur-md ${
                    hotspot.severity === 'critical'
                      ? 'bg-rose-950/90 text-rose-200 border-rose-500 shadow-rose-900/50'
                      : hotspot.severity === 'high'
                      ? 'bg-orange-950/90 text-orange-200 border-orange-500 shadow-orange-900/50'
                      : 'bg-emerald-950/90 text-emerald-200 border-emerald-500 shadow-emerald-900/50'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                  <span className="font-mono font-bold text-xs">
                    {hotspot.primaryValue}{hotspot.primaryUnit}
                  </span>
                </div>
                <div className="mt-1 px-2 py-0.5 rounded-md bg-slate-900/90 text-[10px] font-bold text-slate-200 border border-slate-700 whitespace-nowrap shadow-md">
                  {hotspot.name}
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {/* Active Environmental Alert Pins */}
      <div className="absolute inset-0 pointer-events-none z-25">
        {activeAlerts.map((alert, idx) => {
          const offsetX = ((idx % 3) - 1) * 170 + 60 + panOffset.x;
          const offsetY = ((idx % 2) - 0.5) * 160 - 40 + panOffset.y;
          const headline = alert.summary?.headline || (alert as any).title || 'Environmental Alert';
          const isCritical = alert.severity?.toLowerCase() === 'critical' || alert.severity === 'HIGH';

          return (
            <div
              key={alert.id}
              className="absolute left-1/2 top-1/2 pointer-events-auto interactive-pin"
              style={{
                transform: `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))`,
              }}
            >
              <button
                type="button"
                onClick={() => onSelectAlert(alert)}
                className="group flex flex-col items-center cursor-pointer transition-transform hover:scale-115 active:scale-95"
              >
                <span className="absolute -top-1.5 w-9 h-9 rounded-full bg-rose-500/30 animate-ping" />
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shadow-2xl border-2 ${
                    isCritical
                      ? 'bg-rose-600 text-white border-rose-300 shadow-rose-500/60'
                      : 'bg-amber-500 text-white border-amber-300 shadow-amber-500/60'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4 text-white" />
                </div>
                <div className="mt-1 px-2 py-0.5 rounded-full bg-slate-950/90 border border-slate-800 text-[10px] font-bold text-rose-300 whitespace-nowrap shadow-lg flex items-center gap-1">
                  <span>{headline.slice(0, 16)}</span>
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const GoogleMapsView: React.FC<GoogleMapsViewProps> = ({
  apiKey = ((import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY as string) || '',
  latitude,
  longitude,
  zoom,
  activeLayer,
  layerData,
  activeAlerts,
  selectedRoute,
  onSelectHotspot,
  onSelectAlert,
  onClickMapLocation,
  onCameraChange,
}) => {
  const [mapsError, setMapsError] = useState<boolean>(false);
  const isValidApiKey = Boolean(
    apiKey &&
      apiKey.trim().length > 8 &&
      !apiKey.includes('YOUR_') &&
      apiKey !== 'MY_GOOGLE_MAPS_API_KEY'
  );

  // If no API key configured or if Google Maps fails, render the high-resolution vector cartography
  if (!isValidApiKey || mapsError) {
    return (
      <InteractiveVectorCartography
        latitude={latitude}
        longitude={longitude}
        zoom={zoom}
        activeLayer={activeLayer}
        layerData={layerData}
        activeAlerts={activeAlerts}
        selectedRoute={selectedRoute}
        onSelectHotspot={onSelectHotspot}
        onSelectAlert={onSelectAlert}
        onClickMapLocation={onClickMapLocation}
        onCameraChange={onCameraChange}
      />
    );
  }

  return (
    <div className="w-full h-full relative overflow-hidden select-none">
      <APIProvider
        apiKey={apiKey}
        onError={() => setMapsError(true)}
      >
        <Map
          id="heat-os-google-map"
          defaultCenter={{ lat: latitude, lng: longitude }}
          center={{ lat: latitude, lng: longitude }}
          defaultZoom={zoom}
          zoom={zoom}
          gestureHandling="greedy"
          disableDefaultUI={true}
          style={{ width: '100%', height: '100%' }}
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          onClick={(e) => {
            if (onClickMapLocation && e.detail.latLng) {
              onClickMapLocation(e.detail.latLng.lat, e.detail.latLng.lng);
            }
          }}
          onCameraChanged={(e) => {
            if (onCameraChange && e.detail.center) {
              onCameraChange(e.detail.center.lat, e.detail.center.lng, e.detail.zoom);
            }
          }}
          options={{
            styles: DARK_MAP_STYLE,
            backgroundColor: '#090d16',
            maxZoom: 19,
            minZoom: 2,
            isFractionalZoomEnabled: true,
          }}
        >
          {/* Internal Camera & Route Manager */}
          <MapCameraController
            targetLat={latitude}
            targetLng={longitude}
            zoom={zoom}
            activeLayer={activeLayer}
            layerData={layerData}
            selectedRoute={selectedRoute}
          />

          {/* Current Location Central Pin */}
          <Marker
            position={{ lat: latitude, lng: longitude }}
            title="Active Telemetry Location"
          />

          {/* FortyGuard Hotspots */}
          {layerData?.hotspots?.map((hotspot) => (
            <Marker
              key={hotspot.id}
              position={{ lat: hotspot.latitude, lng: hotspot.longitude }}
              onClick={() => onSelectHotspot(hotspot)}
              title={`${hotspot.name} (${hotspot.primaryValue}${hotspot.primaryUnit})`}
            />
          ))}

          {/* Active Environmental Alert Pins */}
          {activeAlerts.map((alert) => {
            const alertLat = alert.location?.latitude ?? (alert as any).spatialContext?.latitude ?? latitude;
            const alertLng = alert.location?.longitude ?? (alert as any).spatialContext?.longitude ?? longitude;
            const headline = alert.summary?.headline || (alert as any).title || 'Environmental Alert';

            return (
              <Marker
                key={alert.id}
                position={{ lat: alertLat, lng: alertLng }}
                onClick={() => onSelectAlert(alert)}
                title={`${headline} - ${alert.severity}`}
              />
            );
          })}
        </Map>
      </APIProvider>

      {/* FortyGuard Heatmap Grid Overlay */}
      {layerData?.grid && layerData.grid.length > 0 && (
        <div className="absolute inset-0 pointer-events-none opacity-30 mix-blend-screen flex items-center justify-center">
          <div className="grid grid-cols-6 gap-3 p-8 w-full max-w-2xl h-full max-h-[500px]">
            {layerData.grid.slice(0, 36).map((cell, idx) => (
              <div
                key={idx}
                className="rounded-2xl transition-all duration-700 blur-xl"
                style={{
                  backgroundColor:
                    activeLayer === 'heat' || activeLayer === 'heat_risk'
                      ? `rgba(239, 68, 68, ${0.2 + cell.normalizedIntensity * 0.7})`
                      : activeLayer === 'nature'
                      ? `rgba(16, 185, 129, ${0.2 + cell.normalizedIntensity * 0.7})`
                      : activeLayer === 'air'
                      ? `rgba(20, 184, 166, ${0.2 + cell.normalizedIntensity * 0.7})`
                      : `rgba(59, 130, 246, ${0.2 + cell.normalizedIntensity * 0.7})`,
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

