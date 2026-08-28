import React from 'react';
import { RefreshCw } from 'lucide-react';
import { ConnectionHealthStatus } from '../../types/normalizedEnvironmentalState';

export type LiveStatusType =
  | ConnectionHealthStatus
  | 'live'
  | 'cached'
  | 'syncing'
  | 'updating'
  | 'degraded'
  | 'offline'
  | 'stale';

interface LiveStatusPillProps {
  id?: string;
  status?: LiveStatusType;
  statusLabel?: string;
  lastUpdated?: string;
  onClick?: () => void;
  className?: string;
}

export const LiveStatusPill: React.FC<LiveStatusPillProps> = ({
  id = 'live-status-pill',
  status = 'LIVE',
  statusLabel,
  lastUpdated,
  onClick,
  className = '',
}) => {
  const normalizedStatus = status.toUpperCase();

  const getStatusConfig = () => {
    switch (normalizedStatus) {
      case 'SYNCING':
      case 'UPDATING':
        return {
          bg: 'bg-blue-50/95 text-blue-700 border-blue-200/90 shadow-2xs',
          dot: null,
          icon: <RefreshCw className="w-3 h-3 text-blue-600 animate-spin" />,
          defaultLabel: 'SYNCING',
        };
      case 'CACHED':
        return {
          bg: 'bg-sky-50/95 text-sky-800 border-sky-200/90 shadow-2xs',
          dot: <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />,
          icon: null,
          defaultLabel: lastUpdated ? `CACHED · ${lastUpdated}` : 'CACHED',
        };
      case 'DEGRADED':
      case 'STALE':
        return {
          bg: 'bg-amber-50/95 text-amber-800 border-amber-200/90 shadow-2xs',
          dot: <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />,
          icon: null,
          defaultLabel: 'DEGRADED',
        };
      case 'OFFLINE':
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-300 shadow-2xs',
          dot: <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />,
          icon: null,
          defaultLabel: 'OFFLINE',
        };
      case 'LIVE':
      default:
        return {
          bg: 'bg-emerald-50/95 text-emerald-800 border-emerald-200/90 shadow-2xs',
          dot: (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
          ),
          icon: null,
          defaultLabel: 'LIVE',
        };
    }
  };

  const config = getStatusConfig();
  const displayLabel = statusLabel || config.defaultLabel;

  return (
    <button
      id={id}
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold tracking-wide border transition-all ${config.bg} ${
        onClick ? 'cursor-pointer hover:opacity-90 active:scale-95' : 'cursor-default'
      } ${className}`}
      title={lastUpdated ? `Telemetry sync: ${lastUpdated}` : `Status: ${displayLabel}`}
    >
      {config.dot}
      {config.icon}
      <span className="whitespace-nowrap">{displayLabel}</span>
      {lastUpdated && normalizedStatus === 'LIVE' && !statusLabel && (
        <span className="hidden sm:inline font-normal text-[10px] text-emerald-700/80">
          • {lastUpdated}
        </span>
      )}
    </button>
  );
};

export default LiveStatusPill;
