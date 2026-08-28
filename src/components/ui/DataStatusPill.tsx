import React from 'react';
import { RefreshCw } from 'lucide-react';
import { ConnectionHealthStatus } from '../../types/normalizedEnvironmentalState';

export type TelemetryStatus =
  | ConnectionHealthStatus
  | 'live'
  | 'syncing'
  | 'updating'
  | 'cached'
  | 'degraded'
  | 'offline'
  | 'stale';

interface DataStatusPillProps {
  id?: string;
  status: TelemetryStatus;
  statusLabel?: string;
  lastUpdated?: string;
  onClick?: () => void;
  className?: string;
  compact?: boolean;
}

export const DataStatusPill: React.FC<DataStatusPillProps> = ({
  id = 'data-status-pill',
  status,
  statusLabel,
  lastUpdated,
  onClick,
  className = '',
  compact = false,
}) => {
  const normalized = status.toUpperCase();

  const getStatusConfig = () => {
    switch (normalized) {
      case 'SYNCING':
      case 'UPDATING':
        return {
          bg: 'bg-blue-50 hover:bg-blue-100/80 border-blue-200/80 text-blue-700',
          dot: 'bg-blue-500',
          ping: false,
          spinning: true,
          label: 'SYNCING',
        };
      case 'CACHED':
        return {
          bg: 'bg-sky-50 hover:bg-sky-100/80 border-sky-200/80 text-sky-800',
          dot: 'bg-sky-500',
          ping: false,
          spinning: false,
          label: lastUpdated ? `CACHED · ${lastUpdated}` : 'CACHED',
        };
      case 'DEGRADED':
      case 'STALE':
        return {
          bg: 'bg-amber-50 hover:bg-amber-100/80 border-amber-200/80 text-amber-800',
          dot: 'bg-amber-500',
          ping: false,
          spinning: false,
          label: 'DEGRADED',
        };
      case 'OFFLINE':
        return {
          bg: 'bg-slate-100 hover:bg-slate-200/80 border-slate-200/80 text-slate-700',
          dot: 'bg-slate-400',
          ping: false,
          spinning: false,
          label: 'OFFLINE',
        };
      case 'LIVE':
      default:
        return {
          bg: 'bg-emerald-50 hover:bg-emerald-100/80 border-emerald-200/80 text-emerald-800',
          dot: 'bg-emerald-500',
          ping: true,
          spinning: false,
          label: 'LIVE',
        };
    }
  };

  const config = getStatusConfig();
  const displayLabel = statusLabel || config.label;

  return (
    <button
      id={id}
      type="button"
      onClick={onClick}
      disabled={!onClick}
      aria-label={`Environmental Data Status: ${displayLabel}`}
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[11px] font-bold tracking-wider transition-all select-none ${
        config.bg
      } ${onClick ? 'cursor-pointer' : 'cursor-default'} ${className}`}
      title={lastUpdated ? `Last updated: ${lastUpdated}` : undefined}
    >
      {config.spinning ? (
        <RefreshCw className="w-3 h-3 animate-spin text-blue-600" />
      ) : (
        <span className="relative flex h-2 w-2">
          {config.ping && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          )}
          <span className={`relative inline-flex rounded-full h-2 w-2 ${config.dot}`} />
        </span>
      )}
      <span className="font-mono uppercase">{displayLabel}</span>
      {!compact && lastUpdated && normalized === 'LIVE' && !statusLabel && (
        <span className="hidden sm:inline text-[10px] font-normal text-slate-500 font-mono pl-1 border-l border-slate-300/60">
          {lastUpdated}
        </span>
      )}
    </button>
  );
};

export default DataStatusPill;
