import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ShieldAlert, Flame, MapPin } from 'lucide-react';
import { FortyGuardLayerData, ThermalHotspot } from '../../server/fortyguard/types';

// Fix leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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

// Component to handle camera changes
const CameraController: React.FC<{
  latitude: number;
  longitude: number;
  zoom: number;
  onCameraChange?: (lat: number, lng: number, zoom: number) => void;
}> = ({ latitude, longitude, zoom, onCameraChange }) => {
  const map = useMap();
  const isProgrammaticMove = useRef(false);
  
  useEffect(() => {
    const currentCenter = map.getCenter();
    const currentZoom = map.getZoom();
    
    // Only fly if we're actually changing coordinates to avoid feedback loops
    const dist = currentCenter.distanceTo([latitude, longitude]);
    if (dist > 50 || currentZoom !== zoom) {
      isProgrammaticMove.current = true;
      map.flyTo([latitude, longitude], zoom, { duration: 1.5 });
    }
  }, [latitude, longitude, zoom, map]);

  useEffect(() => {
    if (!onCameraChange) return;
    
    const handleMoveEnd = () => {
      if (isProgrammaticMove.current) {
        isProgrammaticMove.current = false;
        return; // Skip notifying parent if this move was initiated by props
      }
      const currentCenter = map.getCenter();
      const currentZoom = map.getZoom();
      onCameraChange(currentCenter.lat, currentCenter.lng, currentZoom);
    };
    
    map.on('moveend', handleMoveEnd);
    return () => {
      map.off('moveend', handleMoveEnd);
    };
  }, [map, onCameraChange]);

  return null;
};

// Custom DivIcons for our markers
const createCustomIcon = (type: 'hotspot' | 'alert', severity: string, name: string) => {
  let bgColor, borderColor, iconHtml;
  
  if (type === 'hotspot') {
    if (severity === 'critical') {
       bgColor = 'bg-rose-600'; borderColor = 'border-rose-400';
    } else if (severity === 'high') {
       bgColor = 'bg-orange-600'; borderColor = 'border-orange-400';
    } else {
       bgColor = 'bg-emerald-600'; borderColor = 'border-emerald-400';
    }
    iconHtml = `<div class="w-6 h-6 rounded-full ${bgColor} border-2 ${borderColor} flex items-center justify-center shadow-lg text-white font-bold text-xs"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c-1.57 0-2.5-1.5-2.5-3A4.5 4.5 0 0 1 13 4.5c.34-.14 1.34-1 1-2.5C18 3.5 20 7.5 20 11a8 8 0 1 1-16 0c0-2.3 1-4 2-5 .2 1.3 1 2.5 2.5 3z"/></svg></div>`;
  } else {
    const isCritical = severity.toLowerCase() === 'critical' || severity === 'HIGH';
    bgColor = isCritical ? 'bg-rose-600' : 'bg-amber-500';
    borderColor = isCritical ? 'border-rose-300' : 'border-amber-300';
    iconHtml = `<div class="w-8 h-8 rounded-full ${bgColor} border-2 ${borderColor} flex items-center justify-center shadow-lg text-white font-bold"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg></div>`;
  }

  return L.divIcon({
    html: iconHtml,
    className: 'custom-leaflet-marker',
    iconSize: type === 'hotspot' ? [24, 24] : [32, 32],
    iconAnchor: type === 'hotspot' ? [12, 12] : [16, 16]
  });
};

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
  const center: [number, number] = [latitude, longitude];

  return (
    <div className="w-full h-full relative overflow-hidden select-none z-0">
      <MapContainer 
        center={center} 
        zoom={zoom} 
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
        attributionControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="map-tiles-dark"
        />
        
        <CameraController latitude={latitude} longitude={longitude} zoom={zoom} onCameraChange={onCameraChange} />

        <Marker position={center}>
          <Popup>Current Location</Popup>
        </Marker>

        {layerData?.hotspots?.map((hotspot) => (
          <Marker
            key={hotspot.id}
            position={[hotspot.latitude, hotspot.longitude]}
            icon={createCustomIcon('hotspot', hotspot.severity, hotspot.name)}
            eventHandlers={{
              click: () => onSelectHotspot(hotspot),
            }}
          >
            <Popup className="custom-popup">
              <strong>{hotspot.name}</strong><br/>
              {hotspot.primaryValue}{hotspot.primaryUnit}
            </Popup>
          </Marker>
        ))}

        {activeAlerts.map((alert) => {
          const alertLat = alert.location?.latitude ?? alert.spatialContext?.latitude ?? latitude;
          const alertLng = alert.location?.longitude ?? alert.spatialContext?.longitude ?? longitude;
          
          return (
            <Marker
              key={alert.id}
              position={[alertLat, alertLng]}
              icon={createCustomIcon('alert', alert.severity, alert.summary?.headline || 'Alert')}
              eventHandlers={{
                click: () => onSelectAlert(alert),
              }}
            />
          );
        })}
      </MapContainer>
      
      {/* CSS overrides for dark mode map and custom popups */}
      <style dangerouslySetInnerHTML={{__html: `
        .leaflet-container {
          background: #090d16;
          font-family: inherit;
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
