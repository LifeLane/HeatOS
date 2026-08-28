import React from 'react';
import { Compass, Sparkles, Flame, Loader2 } from 'lucide-react';

interface SkeletonProps {
  className?: string;
  id?: string;
  count?: number;
}

/**
 * MetricSkeleton: Visually mirrors MetricCard / Primary Telemetry Tile
 */
export const MetricSkeleton: React.FC<SkeletonProps> = ({ className = '', id, count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          id={id ? `${id}-${i}` : undefined}
          className={`rounded-2xl bg-white border border-slate-200/90 p-4 sm:p-5 shadow-2xs animate-pulse flex flex-col justify-between min-h-[140px] ${className}`}
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-slate-200" />
              <div className="h-4 w-24 bg-slate-200 rounded-md" />
            </div>
            <div className="h-5 w-14 bg-slate-150 rounded-full" />
          </div>
          <div className="space-y-2">
            <div className="h-7 w-28 bg-slate-200 rounded-lg" />
            <div className="h-3.5 w-36 bg-slate-100 rounded" />
          </div>
          <div className="pt-3 mt-2 border-t border-slate-100 flex justify-between items-center">
            <div className="h-3 w-20 bg-slate-100 rounded" />
            <div className="h-3 w-12 bg-slate-200 rounded" />
          </div>
        </div>
      ))}
    </>
  );
};

/**
 * CardSkeleton: Visually mirrors standard Card containers and insight modules
 */
export const CardSkeleton: React.FC<SkeletonProps> = ({ className = '', id, count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          id={id ? `${id}-${i}` : undefined}
          className={`rounded-3xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-2xs animate-pulse space-y-4 ${className}`}
        >
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <div className="h-3.5 w-24 bg-slate-200 rounded-md" />
              <div className="h-5 w-48 bg-slate-200 rounded-lg" />
            </div>
            <div className="w-8 h-8 rounded-xl bg-slate-150" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-full bg-slate-100 rounded" />
            <div className="h-4 w-5/6 bg-slate-100 rounded" />
            <div className="h-4 w-4/6 bg-slate-100 rounded" />
          </div>
          <div className="h-28 w-full bg-slate-50 border border-slate-150 rounded-2xl" />
        </div>
      ))}
    </>
  );
};

/**
 * MapLoading: Visually mirrors Living Environment Globe / 2D Mesh with pulsing grid
 */
export const MapLoading: React.FC<SkeletonProps & { message?: string }> = ({
  className = '',
  id,
  message = 'Loading FortyGuard Microclimate Mesh...',
}) => {
  return (
    <div
      id={id}
      className={`relative w-full h-[60vh] min-h-[420px] rounded-3xl bg-slate-950 border border-slate-800/80 overflow-hidden flex flex-col items-center justify-center text-slate-300 p-6 ${className}`}
    >
      {/* Background Mesh Grid Animation */}
      <div className="absolute inset-0 opacity-15 bg-[linear-gradient(to_right,#3b82f6_1px,transparent_1px),linear-gradient(to_bottom,#3b82f6_1px,transparent_1px)] bg-[size:32px_32px]" />

      <div className="relative z-10 flex flex-col items-center text-center space-y-4 max-w-sm">
        <div className="relative">
          <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 animate-pulse">
            <Compass className="w-7 h-7 animate-spin duration-3000" />
          </div>
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-orange-500 animate-ping" />
        </div>

        <div className="space-y-1">
          <h3 className="text-sm font-black tracking-tight text-white uppercase font-mono">
            {message}
          </h3>
          <p className="text-xs text-slate-400">
            Synthesizing satellite surface temperatures, canopy layers, and spatial nodes.
          </p>
        </div>

        {/* Shimmering Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-700/80 text-[11px] font-mono text-slate-300">
          <Loader2 className="w-3 h-3 text-blue-400 animate-spin" />
          <span>Synchronizing GIS Geometries</span>
        </div>
      </div>
    </div>
  );
};

/**
 * ForecastSkeleton: Visually mirrors 48-hour timeline and 7-day synoptic projections
 */
export const ForecastSkeleton: React.FC<SkeletonProps> = ({ className = '', id }) => {
  return (
    <div
      id={id}
      className={`rounded-3xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-2xs animate-pulse space-y-5 ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="space-y-1.5">
          <div className="h-3.5 w-32 bg-slate-200 rounded-md" />
          <div className="h-5 w-56 bg-slate-200 rounded-lg" />
        </div>
        <div className="h-8 w-36 bg-slate-100 rounded-xl" />
      </div>

      {/* Hourly Timeline Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="p-3 rounded-2xl bg-slate-50 border border-slate-150 space-y-2 flex flex-col items-center text-center"
          >
            <div className="h-3 w-12 bg-slate-200 rounded" />
            <div className="w-7 h-7 rounded-full bg-slate-200" />
            <div className="h-5 w-14 bg-slate-200 rounded" />
            <div className="h-2.5 w-16 bg-slate-150 rounded" />
          </div>
        ))}
      </div>

      <div className="h-44 w-full bg-slate-50 border border-slate-150 rounded-2xl" />
    </div>
  );
};

/**
 * ToolSkeleton: Visually mirrors Workbench Tool Cards in catalogue grid
 */
export const ToolSkeleton: React.FC<SkeletonProps> = ({ className = '', id, count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          id={id ? `${id}-${i}` : undefined}
          className={`rounded-2xl bg-white border border-slate-200/90 p-4 sm:p-5 shadow-2xs animate-pulse flex flex-col justify-between min-h-[190px] ${className}`}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-slate-200" />
              <div className="h-4 w-16 bg-slate-150 rounded-md" />
            </div>
            <div className="h-4.5 w-36 bg-slate-200 rounded" />
            <div className="space-y-1.5">
              <div className="h-3.5 w-full bg-slate-100 rounded" />
              <div className="h-3.5 w-4/5 bg-slate-100 rounded" />
            </div>
            <div className="flex gap-1.5 pt-1">
              <div className="h-4 w-12 bg-slate-100 rounded" />
              <div className="h-4 w-14 bg-slate-100 rounded" />
            </div>
          </div>
          <div className="pt-3 mt-3 border-t border-slate-100 flex justify-between items-center">
            <div className="h-3 w-24 bg-slate-100 rounded" />
            <div className="h-6 w-16 bg-slate-200 rounded-lg" />
          </div>
        </div>
      ))}
    </>
  );
};

/**
 * LoadingSkeleton: General wrapper
 */
export const LoadingSkeleton: React.FC<SkeletonProps & { type?: 'card' | 'metric' | 'text' | 'chart' | 'avatar' }> = ({
  type = 'card',
  count = 1,
  className = '',
  id,
}) => {
  if (type === 'metric') return <MetricSkeleton count={count} className={className} id={id} />;
  if (type === 'card') return <CardSkeleton count={count} className={className} id={id} />;
  return (
    <div id={id} className={`w-full space-y-3 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl bg-white border border-slate-200/80 p-5 animate-pulse space-y-3">
          <div className="h-4 w-1/3 bg-slate-200 rounded" />
          <div className="h-3 w-3/4 bg-slate-100 rounded" />
          <div className="h-20 w-full bg-slate-100 rounded-xl" />
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;

