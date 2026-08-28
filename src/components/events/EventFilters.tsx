/**
 * HeatOS Phase 7: Event Filter & Category Selector Component
 */

import React from 'react';
import {
  Search,
  Flame,
  Wind,
  Droplets,
  Layers,
  ShieldAlert,
  SlidersHorizontal,
  RefreshCw,
} from 'lucide-react';
import { EventSeverity } from '../../server/events/types';

export type EventCategoryFilter = 'ALL' | 'THERMAL' | 'ATMOSPHERIC' | 'ECOLOGICAL' | 'COMPOUND' | 'QUALITY';

interface EventFiltersProps {
  activeCategory: EventCategoryFilter;
  onSelectCategory: (cat: EventCategoryFilter) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedSeverities: EventSeverity[];
  onToggleSeverity: (sev: EventSeverity) => void;
  minConfidence: number;
  onConfidenceChange?: (conf: number) => void;
  onChangeMinConfidence?: (conf: number) => void;
  totalEvents?: number;
  totalCount?: number;
  filteredCount?: number;
  severityCounts?: Partial<Record<EventSeverity, number>>;
  isRefreshing?: boolean;
  onRefresh?: () => void;
}

const DEFAULT_SEVERITY_COUNTS: Record<EventSeverity, number> = {
  CRITICAL: 0,
  HIGH: 0,
  ELEVATED: 0,
  WATCH: 0,
  INFO: 0,
};

export const EventFilters: React.FC<EventFiltersProps> = ({
  activeCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  selectedSeverities,
  onToggleSeverity,
  minConfidence,
  onConfidenceChange,
  onChangeMinConfidence,
  severityCounts = DEFAULT_SEVERITY_COUNTS,
  isRefreshing,
  onRefresh,
}) => {
  const handleConfidenceChange = (val: number) => {
    if (onConfidenceChange) onConfidenceChange(val);
    else if (onChangeMinConfidence) onChangeMinConfidence(val);
  };
  const counts = { ...DEFAULT_SEVERITY_COUNTS, ...(severityCounts || {}) };
  const categories: Array<{ id: EventCategoryFilter; label: string; icon: React.ReactNode }> = [
    { id: 'ALL', label: 'All Events', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'THERMAL', label: 'Thermal', icon: <Flame className="w-3.5 h-3.5" /> },
    { id: 'ATMOSPHERIC', label: 'Air & Fire', icon: <Wind className="w-3.5 h-3.5" /> },
    { id: 'ECOLOGICAL', label: 'Water & Canopy', icon: <Droplets className="w-3.5 h-3.5" /> },
    { id: 'COMPOUND', label: 'Multi-Factor', icon: <Layers className="w-3.5 h-3.5 text-purple-600" /> },
    { id: 'QUALITY', label: 'Quality', icon: <ShieldAlert className="w-3.5 h-3.5" /> },
  ];

  const severities: EventSeverity[] = ['CRITICAL', 'HIGH', 'ELEVATED', 'WATCH', 'INFO'];

  return (
    <div className="space-y-2.5 bg-white p-3 sm:p-4 rounded-xl border border-slate-200/80 shadow-2xs w-full">
      {/* Search and Refresh */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search alerts by headline, location..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all placeholder:text-slate-400"
          />
        </div>

        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all disabled:opacity-50 cursor-pointer shrink-0 min-h-[32px]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Checking...' : 'Re-Evaluate'}</span>
          </button>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none w-full">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
              }`}
            >
              {cat.icon}
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Severity Filter Chips & Confidence */}
      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Severity Filter Chips */}
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-[10px] font-bold text-slate-500 mr-0.5">Severity:</span>
          {severities.map((sev) => {
            const isSelected = selectedSeverities.includes(sev);
            const count = counts[sev] || 0;

            const sevColors: Record<EventSeverity, { active: string; inactive: string }> = {
              CRITICAL: {
                active: 'bg-rose-600 text-white border-rose-600',
                inactive: 'bg-rose-50 text-rose-800 border-rose-200',
              },
              HIGH: {
                active: 'bg-orange-600 text-white border-orange-600',
                inactive: 'bg-orange-50 text-orange-800 border-orange-200',
              },
              ELEVATED: {
                active: 'bg-amber-600 text-white border-amber-600',
                inactive: 'bg-amber-50 text-amber-800 border-amber-200',
              },
              WATCH: {
                active: 'bg-blue-600 text-white border-blue-600',
                inactive: 'bg-blue-50 text-blue-800 border-blue-200',
              },
              INFO: {
                active: 'bg-slate-700 text-white border-slate-700',
                inactive: 'bg-slate-50 text-slate-700 border-slate-200',
              },
            };

            return (
              <button
                key={sev}
                type="button"
                onClick={() => onToggleSeverity(sev)}
                className={`px-1.5 py-0.5 rounded border text-[10px] font-mono font-bold transition-all flex items-center gap-0.5 cursor-pointer ${
                  isSelected ? sevColors[sev].active : sevColors[sev].inactive
                }`}
              >
                <span>{sev}</span>
                <span className="opacity-75">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Confidence Filter Slider */}
        <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-600">
          <SlidersHorizontal className="w-3 h-3 text-slate-400" />
          <span>Min Conf:</span>
          <input
            type="range"
            min={50}
            max={95}
            step={5}
            value={minConfidence}
            onChange={(e) => handleConfidenceChange(parseInt(e.target.value, 10))}
            className="w-16 accent-[#2563EB] cursor-pointer"
          />
          <span className="font-bold text-slate-900 min-w-[28px]">{minConfidence}%</span>
        </div>
      </div>
    </div>
  );
};

export default EventFilters;
