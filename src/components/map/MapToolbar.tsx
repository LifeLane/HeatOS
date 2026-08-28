/**
 * HeatOS: Compact Floating Map Control for Living Environmental Map
 * Maintains:
 * - Zoom (In / Out)
 * - Location (Fly to current / user location)
 * - Reset orientation (North-up & default pitch)
 * - Fullscreen toggle
 * - Layer selection
 */

import React from 'react';
import {
  ZoomIn,
  ZoomOut,
  Navigation,
  Compass,
  Maximize2,
  Minimize2,
  Layers,
  RotateCcw,
  RefreshCw,
  CheckCircle2,
  MapPin,
  ChevronDown,
  ChevronUp,
  Settings2
} from 'lucide-react';
import { useState, useEffect } from 'react';
export type MapViewMode = 'google' | 'globe' | 'mesh';

interface MapToolbarProps {
  viewMode: MapViewMode;
  onChangeViewMode: (mode: MapViewMode) => void;
  isAutoRotate?: boolean;
  onToggleAutoRotate?: () => void;
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetOrientation: () => void;
  onLocateUser: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  isLayerSelectorOpen?: boolean;
  onToggleLayerSelector?: () => void;
  onRefresh: () => void;
  isLoading?: boolean;
  onOpenDiagnostics?: () => void;
}

export const MapToolbar: React.FC<MapToolbarProps> = ({
  viewMode,
  onChangeViewMode,
  isAutoRotate = false,
  onToggleAutoRotate,
  zoomLevel,
  onZoomIn,
  onZoomOut,
  onResetOrientation,
  onLocateUser,
  isFullscreen,
  onToggleFullscreen,
  isLayerSelectorOpen = false,
  onToggleLayerSelector,
  onRefresh,
  isLoading = false,
  onOpenDiagnostics,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsCollapsed(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div
      id="compact-map-floating-control"
      className="flex flex-col gap-1 bg-white/95 backdrop-blur-md p-1 sm:p-1.5 rounded-2xl border border-slate-200/90 shadow-xl shadow-slate-900/10 select-none transition-all"
    >
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="md:hidden w-8 h-8 rounded-xl flex items-center justify-center text-slate-700 hover:bg-slate-100 hover:text-slate-900 active:scale-95 transition-all cursor-pointer"
        title="Toggle Map Tools"
      >
        <Settings2 className="w-4 h-4" />
      </button>
      
      <div className={`flex flex-col gap-1 overflow-hidden transition-all duration-300 ${isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[500px] opacity-100'}`}>

      {/* Zoom In */}
      <button
        id="map-zoom-in-btn"
        type="button"
        onClick={onZoomIn}
        title="Zoom In"
        className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-700 hover:bg-slate-100 hover:text-slate-900 active:scale-95 transition-all cursor-pointer"
        aria-label="Zoom In"
      >
        <ZoomIn className="w-4 h-4" />
      </button>

      {/* Zoom Out */}
      <button
        id="map-zoom-out-btn"
        type="button"
        onClick={onZoomOut}
        title="Zoom Out"
        className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-700 hover:bg-slate-100 hover:text-slate-900 active:scale-95 transition-all cursor-pointer"
        aria-label="Zoom Out"
      >
        <ZoomOut className="w-4 h-4" />
      </button>

      <div className="w-full h-px bg-slate-200 my-0.5" />

      {/* Location (Center on Location) */}
      <button
        id="map-locate-btn"
        type="button"
        onClick={onLocateUser}
        title="Center on Active Location"
        className="w-8 h-8 rounded-xl flex items-center justify-center text-blue-600 hover:bg-blue-50 active:scale-95 transition-all cursor-pointer"
        aria-label="Center Location"
      >
        <MapPin className="w-4 h-4" />
      </button>

      {/* Reset Orientation */}
      <button
        id="map-reset-orientation-btn"
        type="button"
        onClick={onResetOrientation}
        title="Reset Orientation (North Up)"
        className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-700 hover:bg-slate-100 hover:text-slate-900 active:scale-95 transition-all cursor-pointer"
        aria-label="Reset Orientation"
      >
        <Compass className="w-4 h-4" />
      </button>

      {/* Fullscreen Toggle */}
      <button
        id="map-fullscreen-btn"
        type="button"
        onClick={onToggleFullscreen}
        title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Workspace'}
        className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-700 hover:bg-slate-100 hover:text-slate-900 active:scale-95 transition-all cursor-pointer"
        aria-label="Toggle Fullscreen"
      >
        {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
      </button>

      {/* Layer Selection Quick Toggle */}
      {onToggleLayerSelector && (
        <button
          id="map-layers-toggle-btn"
          type="button"
          onClick={onToggleLayerSelector}
          title="Toggle Environmental Layers"
          className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
            isLayerSelectorOpen
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
          }`}
          aria-label="Toggle Layers"
        >
          <Layers className="w-4 h-4" />
        </button>
      )}

      <div className="w-full h-px bg-slate-200 my-0.5" />

      {/* Refresh Data */}
      <button
        id="map-refresh-btn"
        type="button"
        onClick={onRefresh}
        disabled={isLoading}
        title="Refresh Environmental Data"
        className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-700 hover:bg-slate-100 hover:text-slate-900 active:scale-95 transition-all cursor-pointer disabled:opacity-40"
        aria-label="Refresh Data"
      >
        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
      </button>

      {/* Diagnostics Verification */}
      {onOpenDiagnostics && (
        <button
          id="map-diagnostics-btn"
          type="button"
          onClick={onOpenDiagnostics}
          title="Run Map Diagnostics"
          className="w-8 h-8 rounded-xl flex items-center justify-center text-purple-600 hover:bg-purple-50 active:scale-95 transition-all cursor-pointer"
          aria-label="Map Diagnostics"
        >
          <CheckCircle2 className="w-4 h-4" />
        </button>
      )}
      </div>
    </div>
  );
};

export type { MapToolbarProps };
export default MapToolbar;
