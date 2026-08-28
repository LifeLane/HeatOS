/**
 * HeatOS Phase 7: Event Severity Badge Component
 */

import React from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  Flame,
  ShieldAlert,
  Info,
  ShieldCheck,
} from 'lucide-react';
import { EventSeverity } from '../../server/events/types';

interface EventSeverityBadgeProps {
  severity: EventSeverity;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const EventSeverityBadge: React.FC<EventSeverityBadgeProps> = ({
  severity,
  size = 'md',
  showIcon = true,
}) => {
  const getBadgeStyle = () => {
    switch (severity) {
      case 'CRITICAL':
        return {
          bg: 'bg-rose-50 border-rose-200 text-rose-800',
          dot: 'bg-rose-600 animate-ping',
          icon: <AlertOctagon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />,
          label: 'CRITICAL',
        };
      case 'HIGH':
        return {
          bg: 'bg-orange-50 border-orange-200 text-orange-800',
          dot: 'bg-orange-600',
          icon: <AlertTriangle className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />,
          label: 'HIGH',
        };
      case 'ELEVATED':
        return {
          bg: 'bg-amber-50 border-amber-200 text-amber-800',
          dot: 'bg-amber-500',
          icon: <Flame className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />,
          label: 'ELEVATED',
        };
      case 'WATCH':
        return {
          bg: 'bg-blue-50 border-blue-200 text-blue-800',
          dot: 'bg-blue-500',
          icon: <ShieldAlert className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />,
          label: 'WATCH',
        };
      case 'INFO':
      default:
        return {
          bg: 'bg-slate-50 border-slate-200 text-slate-700',
          dot: 'bg-slate-400',
          icon: <Info className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />,
          label: 'INFO',
        };
    }
  };

  const config = getBadgeStyle();
  const sizeClasses =
    size === 'sm'
      ? 'text-[10px] px-2 py-0.5 gap-1'
      : size === 'lg'
      ? 'text-xs px-3 py-1.5 gap-2'
      : 'text-[11px] px-2.5 py-1 gap-1.5';

  return (
    <span
      className={`inline-flex items-center font-mono font-extrabold rounded-full border shadow-2xs select-none ${config.bg} ${sizeClasses}`}
    >
      {showIcon && config.icon}
      <span>{config.label}</span>
    </span>
  );
};
