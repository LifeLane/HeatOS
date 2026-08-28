import React from 'react';
import { StatusSeverity, EnvironmentalCategory } from '../../types';

interface StatusPillProps {
  status?: StatusSeverity;
  category?: EnvironmentalCategory;
  label: string;
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  id?: string;
  className?: string;
}

export const StatusPill: React.FC<StatusPillProps> = ({
  status,
  category,
  label,
  size = 'md',
  icon,
  id,
  className = '',
}) => {
  // Determine color styling based on status or category
  const getStyleClasses = () => {
    if (status) {
      switch (status) {
        case 'optimal':
        case 'normal':
          return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        case 'moderate':
          return 'bg-amber-50 text-amber-800 border-amber-200';
        case 'elevated':
        case 'warning':
          return 'bg-orange-50 text-orange-800 border-orange-200';
        case 'critical':
          return 'bg-rose-50 text-rose-700 border-rose-200';
        case 'info':
          return 'bg-blue-50 text-blue-700 border-blue-200';
        default:
          return 'bg-slate-100 text-slate-700 border-slate-200';
      }
    }

    if (category) {
      switch (category) {
        case 'heat':
          return 'bg-orange-50 text-orange-700 border-orange-200';
        case 'air':
          return 'bg-teal-50 text-teal-700 border-teal-200';
        case 'water':
          return 'bg-sky-50 text-sky-700 border-sky-200';
        case 'nature':
          return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        case 'solar':
          return 'bg-amber-50 text-amber-700 border-amber-200';
        case 'fire':
          return 'bg-rose-50 text-rose-700 border-rose-200';
      }
    }

    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 font-medium gap-1',
    md: 'text-xs px-2.5 py-1 font-semibold gap-1.5',
    lg: 'text-sm px-3 py-1.5 font-semibold gap-2',
  };

  return (
    <span
      id={id}
      className={`inline-flex items-center rounded-full border whitespace-nowrap select-none transition-colors ${getStyleClasses()} ${sizeClasses[size]} ${className}`}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{label}</span>
    </span>
  );
};

export default StatusPill;
