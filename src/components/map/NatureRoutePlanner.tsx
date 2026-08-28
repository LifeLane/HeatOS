/**
 * HeatOS: Nature-Friendly Route & Outdoor Activity Planner
 * Plan trips, running/cycling loops, and pedestrian walks optimized for shade,
 * tree canopy cooling, clean air corridors, and avoiding thermal heat spikes.
 */

import React, { useState } from 'react';
import {
  Navigation as NavIcon,
  Trees,
  Flame,
  Wind,
  ShieldCheck,
  Compass,
  ArrowRight,
  Footprints,
  Bike,
  Car,
  Sparkles,
  MapPin,
  Check,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Sun,
  Droplets,
} from 'lucide-react';
import { NatureRouteOption, generateNatureRoutes } from './natureRouting';

interface NatureRoutePlannerProps {
  currentLocationName: string;
  latitude: number;
  longitude: number;
  currentTempC?: number;
  selectedRoute: NatureRouteOption | null;
  onSelectRoute: (route: NatureRouteOption | null) => void;
  onFlyToDestination?: (lat: number, lng: number) => void;
}

export const NatureRoutePlanner: React.FC<NatureRoutePlannerProps> = ({
  currentLocationName,
  latitude,
  longitude,
  currentTempC = 28.5,
  selectedRoute,
  onSelectRoute,
  onFlyToDestination,
}) => {
  const [destinationQuery, setDestinationQuery] = useState('Central Botanical Garden');
  const [travelMode, setTravelMode] = useState<'walking' | 'bicycling' | 'running'>('walking');
  const [isCalculated, setIsCalculated] = useState(true);
  const [showPresets, setShowPresets] = useState<boolean>(false);
  const [expandedRouteId, setExpandedRouteId] = useState<string | null>(null);

  // Preset destination spots near current area
  const presetDestinations = [
    {
      name: 'Central Botanical Garden & Canopy Corridor',
      lat: latitude + 0.012,
      lng: longitude + 0.014,
      tag: 'Canopy Oasis • 88% Shaded',
    },
    {
      name: 'Riverfront Boardwalk & Breeze Way',
      lat: latitude - 0.011,
      lng: longitude + 0.016,
      tag: 'Cooling Breeze • AQI 24',
    },
    {
      name: 'North Urban Plaza & Civic Hub',
      lat: latitude + 0.015,
      lng: longitude - 0.01,
      tag: 'High Heat Risk • +3.2°C',
    },
  ];

  // Generated options
  const targetLat = latitude + 0.012;
  const targetLng = longitude + 0.014;
  const routes = generateNatureRoutes(
    { lat: latitude, lng: longitude, name: currentLocationName },
    { lat: targetLat, lng: targetLng, name: destinationQuery },
    currentTempC
  );

  const activeRoute = selectedRoute || routes[0];

  const handleApplyRoute = (r: NatureRouteOption) => {
    onSelectRoute(r);
    if (onFlyToDestination && r.path.length > 0) {
      const midPoint = r.path[Math.floor(r.path.length / 2)];
      onFlyToDestination(midPoint.lat, midPoint.lng);
    }
  };

  return (
    <div className="space-y-4 select-none">
      {/* Origin & Destination Inputs */}
      <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-2.5 shadow-xl">
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span className="w-0.5 h-6 bg-slate-700 rounded-full" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          </div>

          <div className="flex-1 space-y-2">
            {/* Origin */}
            <div className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
              <span className="text-slate-400">From:</span>
              <span className="font-bold text-slate-100 truncate ml-2">
                {currentLocationName || 'Current Telemetry Position'}
              </span>
            </div>

            {/* Destination */}
            <div className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded-xl bg-slate-800/80 border border-emerald-800/60">
              <span className="text-emerald-400 font-medium">To:</span>
              <input
                type="text"
                value={destinationQuery}
                onChange={(e) => setDestinationQuery(e.target.value)}
                placeholder="Destination or Green Park..."
                className="bg-transparent border-none outline-hidden text-xs font-bold text-slate-100 ml-2 w-full text-right"
              />
            </div>
          </div>
        </div>

        {/* Travel Mode Toggle */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
          <span className="text-[11px] font-bold text-slate-400">Activity Mode:</span>
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setTravelMode('walking')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors ${
                travelMode === 'walking'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Footprints className="w-3.5 h-3.5" />
              <span>Walk</span>
            </button>
            <button
              type="button"
              onClick={() => setTravelMode('running')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors ${
                travelMode === 'running'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Run</span>
            </button>
            <button
              type="button"
              onClick={() => setTravelMode('bicycling')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors ${
                travelMode === 'bicycling'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Bike className="w-3.5 h-3.5" />
              <span>Bike</span>
            </button>
          </div>
        </div>
      </div>

      {/* Preset Cool Green Destinations (Collapsible, collapsed by default) */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 overflow-hidden">
        <button
          type="button"
          onClick={() => setShowPresets(!showPresets)}
          className="w-full px-3.5 py-2.5 flex items-center justify-between text-left hover:bg-slate-800/50 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Trees className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
              Popular Nature & Shade Destinations
            </span>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
            <span>{showPresets ? 'Collapse' : `${presetDestinations.length} Options`}</span>
            {showPresets ? (
              <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            )}
          </div>
        </button>

        {showPresets && (
          <div className="p-2 pt-0 space-y-1.5 border-t border-slate-800/50">
            {presetDestinations.map((dest, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setDestinationQuery(dest.name);
                  if (onFlyToDestination) onFlyToDestination(dest.lat, dest.lng);
                }}
                className="w-full px-3 py-2 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/60 text-left flex items-center justify-between group transition-colors cursor-pointer"
              >
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-200 group-hover:text-emerald-400 transition-colors truncate">
                    {dest.name}
                  </div>
                  <div className="text-[10px] text-emerald-400 font-mono">
                    {dest.tag}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors shrink-0 ml-2" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Route Comparison Cards */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
          <span>HeatOS Calculated Paths</span>
          <span className="text-emerald-400 font-mono">Shade & Heat Guard</span>
        </div>

        {routes.map((route) => {
          const isSelected = activeRoute.id === route.id;
          const isDetailsExpanded = expandedRouteId === route.id;

          return (
            <div
              key={route.id}
              onClick={() => handleApplyRoute(route)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer shadow-lg ${
                isSelected
                  ? 'bg-slate-800/90 border-emerald-500 ring-1 ring-emerald-500/50'
                  : 'bg-slate-900/70 border-slate-800/80 hover:bg-slate-800/50'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: route.color }}
                    />
                    <span className="text-xs font-black text-slate-100">
                      {route.title}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {route.summary}
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                    route.isRecommended
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}
                >
                  {route.tag}
                </span>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-4 gap-1.5 text-center my-2 p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 font-mono">
                <div>
                  <div className="text-[9px] text-slate-400">Distance</div>
                  <div className="text-xs font-bold text-slate-200">
                    {route.distanceKm} km
                  </div>
                </div>
                <div>
                  <div className="text-[9px] text-slate-400">Duration</div>
                  <div className="text-xs font-bold text-slate-200">
                    {route.durationMinutes} min
                  </div>
                </div>
                <div>
                  <div className="text-[9px] text-emerald-400">Shade</div>
                  <div className="text-xs font-bold text-emerald-300">
                    {route.shadePct}%
                  </div>
                </div>
                <div>
                  <div className="text-[9px] text-orange-400">Avg Temp</div>
                  <div className="text-xs font-bold text-orange-300">
                    {route.avgTempC}°C
                  </div>
                </div>
              </div>

              {/* Route Highlights (Expandable toggle) */}
              <div className="mt-2 pt-1.5 border-t border-slate-800/60">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedRouteId(isDetailsExpanded ? null : route.id);
                  }}
                  className="w-full flex items-center justify-between text-[11px] font-bold text-slate-400 hover:text-slate-200 py-0.5"
                >
                  <span className="flex items-center gap-1">
                    <Compass className="w-3 h-3 text-emerald-400" />
                    <span>Turn-by-Turn Nature Waypoints</span>
                  </span>
                  {isDetailsExpanded ? (
                    <ChevronUp className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                </button>

                {isDetailsExpanded && (
                  <div className="space-y-1 mt-2 text-[11px] text-slate-300">
                    {route.highlights.map((h, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span className="truncate">{h}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Select Button */}
              <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono">
                  AQI: <span className="text-slate-200 font-bold">{route.aqi}</span> • Heat Stress: <span className="text-emerald-400 font-bold">{route.heatStressScore}/100</span>
                </span>
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  {isSelected ? 'Active on Map' : 'Select Path'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
