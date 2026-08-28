import React from 'react';
import { ShieldCheck, ExternalLink, Database, Activity } from 'lucide-react';
import { ProviderAttribution, DataQualityMetrics } from '../../types/environmental';

interface SourceAttributionBadgeProps {
  id?: string;
  source: string;
  attribution?: ProviderAttribution;
  quality?: DataQualityMetrics;
  showDetails?: boolean;
  className?: string;
}

export const SourceAttributionBadge: React.FC<SourceAttributionBadgeProps> = ({
  id,
  source,
  attribution,
  quality,
  showDetails = false,
  className = '',
}) => {
  const getProviderName = (src: string): string => {
    switch (src.toLowerCase()) {
      case 'fortyguard':
      case 'fortyguard_mock':
        return 'FortyGuard';
      case 'noaa_nws':
      case 'noaa':
        return 'NOAA / NWS';
      case 'epa_airnow':
      case 'epa':
        return 'EPA AirNow';
      case 'nasa_firms':
      case 'nasa':
        return 'NASA FIRMS';
      case 'satellite_vegetation':
      case 'sentinel':
      case 'landsat':
        return 'Sentinel-2 / Landsat';
      case 'usgs_water':
      case 'usgs':
        return 'USGS Water';
      default:
        return src;
    }
  };

  const getBadgeColors = (src: string) => {
    switch (src.toLowerCase()) {
      case 'fortyguard':
      case 'fortyguard_mock':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'noaa_nws':
      case 'noaa':
        return 'bg-sky-50 text-sky-800 border-sky-200';
      case 'epa_airnow':
      case 'epa':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'nasa_firms':
      case 'nasa':
        return 'bg-orange-50 text-orange-800 border-orange-200';
      case 'satellite_vegetation':
        return 'bg-lime-50 text-lime-800 border-lime-200';
      case 'usgs_water':
      case 'usgs':
        return 'bg-cyan-50 text-cyan-800 border-cyan-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const name = attribution?.name || getProviderName(source);
  const colorClass = getBadgeColors(source);

  return (
    <div
      id={id || `attr-badge-${source.toLowerCase()}`}
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono font-medium border ${colorClass} ${className}`}
      title={attribution ? `${name} • ${attribution.license}` : `Source: ${name}`}
    >
      <Database className="w-3 h-3 shrink-0 opacity-80" />
      <span className="truncate max-w-[140px]">Source: {name}</span>
      {quality && (
        <span
          className={`px-1 py-0.2 text-[10px] rounded uppercase font-semibold tracking-wider ${
            quality.freshness === 'live'
              ? 'bg-emerald-100 text-emerald-800'
              : quality.freshness === 'cached'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-amber-100 text-amber-800'
          }`}
        >
          {quality.freshness}
        </span>
      )}
    </div>
  );
};
