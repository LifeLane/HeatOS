import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export interface MarkerData {
  id: string | number;
  latitude: number;
  longitude: number;
  popupContent?: string;
  type?: 'hotspot' | 'alert' | 'user';
  severity?: string;
  rawItem?: any;
}

interface UseOpenStreetMapProps {
  initialCenter: [number, number];
  initialZoom: number;
  onMarkerClick?: (marker: MarkerData) => void;
  onCameraChange?: (lat: number, lng: number, zoom: number) => void;
  onClickMapLocation?: (lat: number, lng: number) => void;
}

export function useOpenStreetMap({
  initialCenter,
  initialZoom,
  onMarkerClick,
  onCameraChange,
  onClickMapLocation
}: UseOpenStreetMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const callbacksRef = useRef({ onCameraChange, onClickMapLocation, onMarkerClick });
  useEffect(() => { callbacksRef.current = { onCameraChange, onClickMapLocation, onMarkerClick }; }, [onCameraChange, onClickMapLocation, onMarkerClick]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Initialize map
    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: true
    }).setView(initialCenter, initialZoom);

    // Add dark OSM tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      className: 'map-tiles-dark'
    }).addTo(map);

    map.on('moveend', () => {
      const center = map.getCenter();
      const zoom = map.getZoom();
      const cb = callbacksRef.current.onCameraChange;
      if (cb) cb(center.lat, center.lng, zoom);
    });

    map.on('click', (e) => {
      const cb = callbacksRef.current.onClickMapLocation;
      if (cb) cb(e.latlng.lat, e.latlng.lng);
    });

    mapRef.current = map;
    setIsReady(true);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  const panTo = (lat: number, lng: number, zoom?: number) => {
    if (mapRef.current) {
      mapRef.current.flyTo([lat, lng], zoom || mapRef.current.getZoom(), { duration: 1.5 });
    }
  };

  const createCustomIcon = (type: string = 'hotspot', severity: string = 'moderate') => {
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

  const updateMarkers = (markers: MarkerData[]) => {
    if (!mapRef.current) return;

    (Object.values(markersRef.current) as L.Marker[]).forEach(marker => {
      marker.remove();
    });
    markersRef.current = {};

    markers.forEach(markerData => {
      const icon = createCustomIcon(markerData.type, markerData.severity);
      const marker = L.marker([markerData.latitude, markerData.longitude], { icon })
        .addTo(mapRef.current!);
      
      if (markerData.popupContent) {
        marker.bindPopup(`<div class="custom-popup">${markerData.popupContent}</div>`);
      }

      marker.on('click', () => {
        callbacksRef.current.onMarkerClick?.(markerData);
      });

      markersRef.current[markerData.id] = marker;
    });
  };

  return {
    mapContainerRef,
    isReady,
    panTo,
    updateMarkers
  };
}
