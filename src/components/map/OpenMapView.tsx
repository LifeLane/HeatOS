import React, { useEffect } from 'react';
import { useOpenStreetMap, MarkerData } from '../../hooks/useOpenStreetMap';
import { FortyGuardLayerData, ThermalHotspot } from '../../server/fortyguard/types';
import 'leaflet/dist/leaflet.css';

interface OpenMapViewProps {
  latitude: number;
  longitude: number;
  zoom: number;
  activeLayer: string;
  layerData: FortyGuardLayerData | null;
  activeAlerts: any[];
  selectedRoute?: any | null;
  onSelectHotspot: (hotspot: ThermalHotspot) => void;
  onSelectAlert: (alert: any) => void;
  onClickMapLocation?: (lat: number, lng: number) => void;
  onCameraChange?: (lat: number, lng: number, zoom: number) => void;
}

export const OpenMapView: React.FC<OpenMapViewProps> = ({
  latitude,
  longitude,
  zoom,
  activeLayer,
  layerData,
  activeAlerts,
  onSelectHotspot,
  onSelectAlert,
  onClickMapLocation,
  onCameraChange,
}) => {
  const { mapContainerRef, isReady, panTo, updateMarkers } = useOpenStreetMap({
    initialCenter: [latitude, longitude],
    initialZoom: zoom,
    onCameraChange,
    onMarkerClick: (marker) => {
      if (marker.type === 'hotspot' && marker.rawItem) {
        onSelectHotspot(marker.rawItem as ThermalHotspot);
      } else if (marker.type === 'alert' && marker.rawItem) {
        onSelectAlert(marker.rawItem);
      }
    }
  });

  // Pan when props change
  useEffect(() => {
    if (isReady) {
      panTo(latitude, longitude, zoom);
    }
  }, [latitude, longitude, zoom, isReady]);

  // Update markers when layerData or alerts change
  useEffect(() => {
    if (!isReady) return;

    const markers: MarkerData[] = [];
    
    // Add current location marker
    markers.push({
      id: 'current_location',
      latitude,
      longitude,
      popupContent: '<strong>Current Location</strong>',
      type: 'user'
    });

    if (layerData?.hotspots) {
      layerData.hotspots.forEach(hotspot => {
        markers.push({
          id: hotspot.id,
          latitude: hotspot.latitude,
          longitude: hotspot.longitude,
          type: 'hotspot',
          severity: hotspot.severity,
          popupContent: `<strong>${hotspot.name}</strong><br/>${hotspot.primaryValue}${hotspot.primaryUnit}`,
          rawItem: hotspot
        });
      });
    }

    if (activeAlerts) {
      activeAlerts.forEach(alert => {
        const alertLat = alert.location?.latitude ?? alert.spatialContext?.latitude ?? latitude;
        const alertLng = alert.location?.longitude ?? alert.spatialContext?.longitude ?? longitude;
        markers.push({
          id: alert.id,
          latitude: alertLat,
          longitude: alertLng,
          type: 'alert',
          severity: alert.severity,
          popupContent: `<strong>${alert.summary?.headline || 'Alert'}</strong>`,
          rawItem: alert
        });
      });
    }

    updateMarkers(markers);
  }, [layerData, activeAlerts, latitude, longitude, isReady]);

  return (
    <div className="w-full h-full relative overflow-hidden select-none z-0">
      <div ref={mapContainerRef} className="w-full h-full" />
      
      {/* Real-time Environmental Animated Overlay */}
      {layerData?.grid && layerData.grid.length > 0 && (
        <div className="absolute inset-0 pointer-events-none opacity-40 mix-blend-screen flex items-center justify-center z-[400]">
          <div className="grid grid-cols-6 gap-2 sm:gap-4 p-4 sm:p-8 w-full max-w-2xl h-full max-h-[500px]">
            {layerData.grid.slice(0, 36).map((cell, idx) => (
              <div
                key={idx}
                className="rounded-3xl transition-all duration-1000 blur-2xl sm:blur-3xl"
                style={{
                  backgroundColor:
                    activeLayer === 'heat' || activeLayer === 'heat_risk'
                      ? `rgba(239, 68, 68, ${0.2 + cell.normalizedIntensity * 0.8})`
                      : activeLayer === 'nature'
                      ? `rgba(16, 185, 129, ${0.2 + cell.normalizedIntensity * 0.8})`
                      : activeLayer === 'air'
                      ? `rgba(20, 184, 166, ${0.2 + cell.normalizedIntensity * 0.8})`
                      : `rgba(59, 130, 246, ${0.2 + cell.normalizedIntensity * 0.8})`,
                  transform: `scale(${0.8 + cell.normalizedIntensity * 0.4})`,
                  animation: `pulse-opacity ${3 + (idx % 3)}s infinite alternate`
                }}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* CSS overrides for dark mode map and custom popups */}
      <style dangerouslySetInnerHTML={{__html: `
        .leaflet-container {
          background: #090d16;
          font-family: inherit;
        }
        @keyframes pulse-opacity {
          0% { opacity: 0.6; }
          100% { opacity: 1; }
        }
        .map-tiles-dark {
          filter: brightness(0.6) invert(1) contrast(3) hue-rotate(200deg) saturate(0.3) brightness(0.7);
        }
        .custom-leaflet-marker {
          background: transparent;
          border: none;
        }
        .leaflet-popup-content-wrapper, .leaflet-popup-tip {
          background: #0f172a;
          color: #f1f5f9;
          border: 1px solid #334155;
          box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
        }
        .leaflet-container a.leaflet-popup-close-button {
          color: #94a3b8;
        }
      `}} />
    </div>
  );
};
