/**
 * HeatOS: Floating Layer Selector for Living Environmental Map
 * Elegant layer switcher supporting:
 * - Temperature
 * - Heat Risk
 * - Precipitation
 * - Wind
 * - Air Quality
 * - UV
 * - Environmental Pulse
 * Only shows layers for which data is actually available.
 */

import React from 'react';
import {
  Flame,
  ShieldAlert,
  CloudRain,
  Wind,
  Droplets,
  Activity,
  Sun,
  Trees,
} from 'lucide-react';
import { MapLayerKey } from '../../server/map/types';

interface FloatingLayerSelectorProps {
  activeLayer: MapLayerKey;
  availableLayers: MapLayerKey[];
  onSelectLayer: (layer: MapLayerKey) => void;
  isCompactMobile?: boolean;
}

export const FloatingLayerSelector: React.FC<FloatingLayerSelectorProps> = ({
  activeLayer,
  availableLayers,
  onSelectLayer,
  isCompactMobile = false,
}) => {
  // Defined in strict alignment with prompt requirements
  const layerConfigs: Array<{
    key: MapLayerKey;
    label: string;
    shortLabel: string;
    icon: React.ComponentType<{ className?: string }>;
    activeBg: string;
    activeText: string;
    activeRing: string;
  }> = [
    {
      key: 'heat',
      label: 'Temperature',
      shortLabel: 'Temp',
      icon: Flame,
      activeBg: 'bg-orange-600',
      activeText: 'text-white',
      activeRing: 'ring-orange-400/40',
    },
    {
      key: 'heat_risk',
      label: 'Heat Risk',
      shortLabel: 'Heat Risk',
      icon: ShieldAlert,
      activeBg: 'bg-rose-600',
      activeText: 'text-white',
      activeRing: 'ring-rose-400/40',
    },
    {
      key: 'precipitation',
      label: 'Precipitation',
      shortLabel: 'Precip',
      icon: CloudRain,
      activeBg: 'bg-sky-600',
      activeText: 'text-white',
      activeRing: 'ring-sky-400/40',
    },
    {
      key: 'wind',
      label: 'Wind',
      shortLabel: 'Wind',
      icon: Wind,
      activeBg: 'bg-blue-600',
      activeText: 'text-white',
      activeRing: 'ring-blue-400/40',
    },
    {
      key: 'air',
      label: 'Air Quality',
      shortLabel: 'Air Quality',
      icon: Activity,
      activeBg: 'bg-teal-600',
      activeText: 'text-white',
      activeRing: 'ring-teal-400/40',
    },
    {
      key: 'solar',
      label: 'UV',
      shortLabel: 'UV',
      icon: Sun,
      activeBg: 'bg-amber-500',
      activeText: 'text-white',
      activeRing: 'ring-amber-300/40',
    },
    {
      key: 'nature',
      label: 'Environmental Pulse',
      shortLabel: 'Pulse',
      icon: Trees,
      activeBg: 'bg-emerald-600',
      activeText: 'text-white',
      activeRing: 'ring-emerald-400/40',
    },
  ];

  // Strictly filter to layers for which empirical/modeled data is available
  const visibleLayers = layerConfigs.filter((c) =>
    availableLayers.includes(c.key)
  );

  return (
    <div
      id="floating-layer-selector"
      className="bg-white/95 backdrop-blur-md p-1 sm:p-1.5 rounded-2xl border border-slate-200/90 shadow-lg shadow-slate-900/5 flex items-center gap-1 overflow-x-auto max-w-full no-scrollbar transition-all"
      role="tablist"
      aria-label="Environmental Layers"
    >
      {visibleLayers.map((config) => {
        const Icon = config.icon;
        const isActive = activeLayer === config.key;

        return (
          <button
            key={config.key}
            id={`layer-btn-${config.key}`}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelectLayer(config.key)}
            title={`Switch to ${config.label} layer`}
            className={`relative flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl text-xs font-bold transition-all duration-200 select-none whitespace-nowrap cursor-pointer ${
              isActive
                ? `${config.activeBg} ${config.activeText} shadow-xs ring-2 ${config.activeRing} scale-[1.02]`
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/90 active:scale-95'
            }`}
          >
            <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
            <span className="truncate">{isCompactMobile ? config.shortLabel : config.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default FloatingLayerSelector;
