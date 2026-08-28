/**
 * HeatOS Phase 6: Map Legend Component
 * Transparent, multi-attribute legend showing metric scale, thresholds, icons, and freshness.
 */

import React, { useState } from 'react';
import {
  Layers,
  ChevronDown,
  ChevronUp,
  Flame,
  Activity,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Droplets,
  Trees,
  Sun,
  Radio,
} from 'lucide-react';
import { MapLayerData } from '../../server/map/types';

interface MapLegendProps {
  layerData?: MapLayerData;
}

export const MapLegend: React.FC<MapLegendProps> = ({ layerData }) => {
  // Collapsed by default until user clicks to expand
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  if (!layerData || !layerData.legend) return null;

  const renderIcon = (iconName?: string) => {
    switch (iconName) {
      case 'flame':
        return <Flame className="w-3.5 h-3.5" />;
      case 'shield-check':
        return <ShieldCheck className="w-3.5 h-3.5" />;
      case 'shield-alert':
        return <ShieldAlert className="w-3.5 h-3.5" />;
      case 'droplets':
        return <Droplets className="w-3.5 h-3.5" />;
      case 'trees':
        return <Trees className="w-3.5 h-3.5" />;
      case 'sun':
        return <Sun className="w-3.5 h-3.5" />;
      case 'alert-triangle':
        return <AlertTriangle className="w-3.5 h-3.5" />;
      default:
        return <Activity className="w-3.5 h-3.5" />;
    }
  };

  const freshness = layerData.freshness || 'LIVE';
  const freshnessColor =
    freshness === 'LIVE'
      ? 'bg-emerald-500 text-emerald-950 ring-emerald-300'
      : freshness === 'RECENT'
      ? 'bg-amber-500 text-amber-950 ring-amber-300'
      : 'bg-slate-400 text-slate-900 ring-slate-200';

  return (
    <div
      id="map-legend-card"
      className="bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800/80 shadow-2xl text-slate-100 transition-all duration-200 select-none overflow-hidden max-w-[280px] sm:max-w-xs"
    >
      {/* Legend Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-3.5 py-2.5 flex items-center justify-between gap-2 cursor-pointer hover:bg-slate-800/60 transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1 rounded-lg bg-blue-950/80 text-blue-400">
            <Layers className="w-3.5 h-3.5 shrink-0" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-100 truncate">
              {layerData.legend.title}
            </div>
            <div className="text-[10px] text-slate-400 font-medium truncate">
              {layerData.sourceName}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Freshness Badge */}
          <span
            id="map-freshness-pill"
            className={`inline-flex items-center gap-1 text-[9px] font-extrabold px-2 py-0.5 rounded-full ring-1 ${freshnessColor}`}
          >
            <Radio className="w-2.5 h-2.5 animate-pulse" />
            {freshness}
          </span>
          <button
            type="button"
            className="text-slate-400 hover:text-slate-200 p-0.5 rounded-md"
            aria-label={isExpanded ? 'Collapse legend' : 'Expand legend'}
          >
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Legend Ticks Body */}
      {isExpanded && (
        <div className="px-3.5 pb-3 pt-1 border-t border-slate-800/80 space-y-1.5">
          {layerData.legend.ticks.map((tick, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between gap-2 text-[11px] text-slate-200 hover:bg-slate-800/40 p-1 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                {/* Color Swatch Pill with Glyph */}
                <div
                  className="w-4 h-4 rounded-md flex items-center justify-center text-white shrink-0 shadow-2xs"
                  style={{ backgroundColor: tick.color }}
                >
                  <span className="scale-75">{renderIcon(tick.icon)}</span>
                </div>
                <span className="font-medium truncate text-slate-200">{tick.label}</span>
              </div>
              <span className="font-mono font-bold text-slate-100 text-[10px] shrink-0 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700/50">
                {tick.value}
              </span>
            </div>
          ))}

          {/* Microclimate summary info */}
          {layerData.statistics && (
            <div className="pt-2 mt-1 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>Range: {layerData.statistics.min}{layerData.statistics.unit} – {layerData.statistics.max}{layerData.statistics.unit}</span>
              <span>Avg: {layerData.statistics.mean}{layerData.statistics.unit}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
