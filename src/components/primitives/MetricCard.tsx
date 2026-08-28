import React from 'react';
import {
  Flame,
  Wind,
  Droplets,
  Trees,
  Sun,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Gauge,
  Thermometer,
  Activity,
  Compass,
  Database,
} from 'lucide-react';
import { EnvironmentalCategory, StatusSeverity } from '../../types';
import StatusPill from '../ui/StatusPill';
import { useExplanation } from '../../context/ExplanationContext';

export interface MetricCardProps {
  id?: string;
  metricKey?: string;
  label: string;
  value: string | number;
  unit?: string;
  subValue?: string;
  category?: EnvironmentalCategory | 'heat' | 'air' | 'water' | 'nature' | 'solar' | 'fire' | 'wind' | 'pressure' | 'general' | 'bio';
  status?: StatusSeverity | 'normal' | 'moderate' | 'high' | 'critical' | 'optimal' | 'good' | 'fair' | 'poor';
  statusLabel?: string;
  delta?: string;
  deltaType?: 'up' | 'down' | 'neutral';
  deltaLabel?: string;
  sparkline?: number[];
  description?: string;
  icon?: React.ReactNode;
  source?: string;
  onSourceClick?: () => void;
  onClick?: () => void;
  badge?: string;
  variant?: 'standard' | 'compact' | 'minimal';
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  id,
  metricKey,
  label,
  value,
  unit = '',
  subValue,
  category = 'general',
  status,
  statusLabel,
  delta,
  deltaType = 'neutral',
  deltaLabel,
  sparkline,
  description,
  icon,
  source,
  onSourceClick,
  onClick,
  badge,
  variant = 'standard',
  className = '',
}) => {
  const explanation = useExplanation();

  // Automatic handler if metricKey or source is provided
  const handleDefaultExplain = () => {
    if (onClick) {
      onClick();
    } else if (metricKey) {
      explanation.explainMetric(metricKey, `${value} ${unit}`.trim(), {
        label,
        source,
      });
    }
  };

  const handleDefaultSourceExplain = () => {
    if (onSourceClick) {
      onSourceClick();
    } else if (metricKey) {
      explanation.explainMetric(metricKey, `${value} ${unit}`.trim(), {
        label,
        source,
      });
    } else {
      explanation.explainMetric('ambientTemp', `${value} ${unit}`.trim(), {
        label,
        source,
      });
    }
  };

  const isClickable = !!onClick || !!metricKey;
  // Category icon resolver
  const renderCategoryIcon = () => {
    if (icon) return icon;

    switch (category) {
      case 'heat':
        return <Flame className="w-3.5 h-3.5 text-orange-600" />;
      case 'air':
        return <Wind className="w-3.5 h-3.5 text-blue-600" />;
      case 'water':
        return <Droplets className="w-3.5 h-3.5 text-cyan-600" />;
      case 'nature':
      case 'bio':
        return <Trees className="w-3.5 h-3.5 text-emerald-600" />;
      case 'solar':
        return <Sun className="w-3.5 h-3.5 text-amber-600" />;
      case 'fire':
        return <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />;
      case 'wind':
        return <Wind className="w-3.5 h-3.5 text-teal-600" />;
      case 'pressure':
        return <Gauge className="w-3.5 h-3.5 text-slate-600" />;
      default:
        return <Activity className="w-3.5 h-3.5 text-blue-600" />;
    }
  };

  const getDeltaIcon = () => {
    if (deltaType === 'up') return <ArrowUpRight className="w-3 h-3" />;
    if (deltaType === 'down') return <ArrowDownRight className="w-3 h-3" />;
    return <Minus className="w-3 h-3" />;
  };

  const getDeltaColor = () => {
    if (deltaType === 'up') {
      return category === 'heat' || category === 'fire' ? 'text-amber-700 font-semibold' : 'text-emerald-700 font-semibold';
    }
    if (deltaType === 'down') {
      return category === 'heat' ? 'text-emerald-700 font-semibold' : 'text-slate-600';
    }
    return 'text-slate-500';
  };

  // Sparkline SVG renderer
  const renderSparkline = () => {
    if (!sparkline || sparkline.length < 2) return null;
    const min = Math.min(...sparkline);
    const max = Math.max(...sparkline);
    const range = max - min || 1;
    const width = 56;
    const height = 18;

    const points = sparkline
      .map((val, idx) => {
        const x = (idx / (sparkline.length - 1)) * width;
        const y = height - ((val - min) / range) * (height - 4) - 2;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');

    const strokeColor =
      category === 'heat'
        ? '#EA580C'
        : category === 'air'
        ? '#2563EB'
        : category === 'water'
        ? '#0284C7'
        : category === 'nature' || category === 'bio'
        ? '#059669'
        : category === 'solar'
        ? '#D97706'
        : category === 'wind'
        ? '#0D9488'
        : '#2563EB';

    return (
      <svg
        className="w-14 h-4.5 overflow-visible flex-shrink-0"
        viewBox={`0 0 ${width} ${height}`}
        aria-hidden="true"
      >
        <polyline
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    );
  };

  // COMPACT VARIANT (for high density 6-column telemetry grids)
  if (variant === 'compact') {
    return (
      <div
        id={id}
        onClick={handleDefaultExplain}
        role={isClickable ? 'button' : undefined}
        tabIndex={isClickable ? 0 : undefined}
        onKeyDown={(e) => {
          if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            handleDefaultExplain();
          }
        }}
        className={`group relative rounded-2xl bg-white border border-slate-200/90 p-3 sm:p-3.5 shadow-2xs transition-all duration-150 select-none min-w-0 ${
          isClickable
            ? 'cursor-pointer hover:border-blue-300 hover:shadow-xs active:scale-[0.99]'
            : ''
        } ${className}`}
      >
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-[11px] font-bold tracking-tight truncate max-w-[85%]">{label}</span>
          <div className="flex-shrink-0">{renderCategoryIcon()}</div>
        </div>

        <div className="flex items-baseline gap-1 my-1">
          <span className="text-lg sm:text-xl font-black font-mono tracking-tight text-slate-900 leading-none">
            {value}
          </span>
          {unit && <span className="text-[11px] font-bold font-mono text-slate-400">{unit}</span>}
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1 pt-1 border-t border-slate-100/80">
          <span className="truncate max-w-[70%] font-medium text-slate-600">{subValue || description || delta || 'Telemetry Synced'}</span>
          {source && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleDefaultSourceExplain();
              }}
              className="text-[9px] font-mono text-slate-400 group-hover:text-blue-600 font-semibold transition-colors truncate hover:underline"
              title={`Data source: ${source} (Click to inspect provenance)`}
            >
              {source}
            </button>
          )}
        </div>
      </div>
    );
  }

  // MINIMAL VARIANT (subdued card)
  if (variant === 'minimal') {
    return (
      <div
        id={id}
        onClick={handleDefaultExplain}
        className={`p-3 rounded-2xl bg-slate-50/70 border border-slate-200/80 transition-all min-w-0 ${
          isClickable ? 'cursor-pointer hover:bg-slate-100/70 hover:border-slate-300' : ''
        } ${className}`}
      >
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-[11px] font-bold truncate">{label}</span>
          {renderCategoryIcon()}
        </div>
        <div className="text-base font-black font-mono text-slate-900">
          {value} {unit && <span className="text-xs font-normal text-slate-500">{unit}</span>}
        </div>
      </div>
    );
  }

  // STANDARD VARIANT
  return (
    <div
      id={id}
      onClick={handleDefaultExplain}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={(e) => {
        if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleDefaultExplain();
        }
      }}
      className={`group relative rounded-2xl bg-white border border-slate-200/90 p-4 sm:p-4.5 shadow-2xs transition-all duration-150 min-w-0 ${
        isClickable
          ? 'cursor-pointer hover:border-blue-300 hover:shadow-xs active:scale-[0.99]'
          : ''
      } ${className}`}
    >
      {/* Top row: Icon, Label & Status Badge */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-center flex-shrink-0 text-slate-700 shadow-2xs">
            {renderCategoryIcon()}
          </div>
          <span className="text-xs font-bold text-slate-700 tracking-tight truncate">{label}</span>
        </div>

        {status && statusLabel ? (
          <StatusPill status={status as any} label={statusLabel} size="sm" />
        ) : badge ? (
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
            {badge}
          </span>
        ) : null}
      </div>

      {/* Main Metric Value & Unit */}
      <div className="flex items-baseline justify-between gap-2 my-2">
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-slate-900 leading-none">
            {value}
          </span>
          {unit && <span className="text-xs font-bold font-mono text-slate-400">{unit}</span>}
          {subValue && (
            <span className="text-xs font-medium text-slate-500 ml-1">
              ({subValue})
            </span>
          )}
        </div>

        {renderSparkline()}
      </div>

      {/* Bottom row: Delta & Description & Source */}
      <div className="flex items-center justify-between gap-2 pt-2.5 mt-2 border-t border-slate-100 text-xs">
        {delta ? (
          <div className={`flex items-center gap-1 font-medium truncate ${getDeltaColor()}`}>
            {getDeltaIcon()}
            <span>{delta}</span>
            {deltaLabel && <span className="text-slate-400 font-normal ml-0.5">{deltaLabel}</span>}
          </div>
        ) : description ? (
          <span className="text-slate-500 truncate text-[11px] font-medium">{description}</span>
        ) : (
          <span className="text-slate-400 text-[11px] font-mono">Live Ingestion</span>
        )}

        {source ? (
          <button
            type="button"
            onClick={(e) => {
              if (onSourceClick) {
                e.stopPropagation();
                onSourceClick();
              }
            }}
            className="text-[10px] font-mono font-semibold text-slate-400 group-hover:text-blue-600 transition-colors uppercase tracking-wider flex-shrink-0 truncate hover:underline"
            title={`Inspect data provenance: ${source}`}
          >
            {source}
          </button>
        ) : (
          <span className="text-[10px] font-mono font-medium text-slate-400 uppercase tracking-wider flex-shrink-0">
            {category}
          </span>
        )}
      </div>
    </div>
  );
};

export default MetricCard;
