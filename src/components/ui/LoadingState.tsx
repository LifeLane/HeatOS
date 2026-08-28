import React from 'react';
import { RefreshCw } from 'lucide-react';

interface LoadingStateProps {
  id?: string;
  message?: string;
  submessage?: string;
  rows?: number;
  className?: string;
  type?: 'spinner' | 'skeleton' | 'compact';
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  id = 'loading-state',
  message = 'Loading Environmental Telemetry...',
  submessage = 'Connecting to FortyGuard mesh and calibrating sensor data',
  rows = 3,
  className = '',
  type = 'spinner',
}) => {
  if (type === 'compact') {
    return (
      <div id={id} className={`flex items-center gap-2 text-xs text-slate-500 py-3 px-4 ${className}`}>
        <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#2563EB]" />
        <span>{message}</span>
      </div>
    );
  }

  if (type === 'skeleton') {
    return (
      <div id={id} className={`w-full space-y-3 p-4 bg-white rounded-xl border border-slate-200/80 ${className}`}>
        <div className="h-4 bg-slate-200/70 rounded w-1/3 animate-pulse" />
        <div className="h-3 bg-slate-100 rounded w-1/2 animate-pulse" />
        <div className="space-y-2 pt-2">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="h-10 bg-slate-100/80 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      id={id}
      className={`rounded-xl border border-slate-200/80 bg-white/70 p-8 sm:p-12 text-center flex flex-col items-center justify-center ${className}`}
    >
      <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563EB] mb-3 shadow-2xs">
        <RefreshCw className="w-5 h-5 animate-spin" />
      </div>
      <h4 className="text-sm font-bold text-slate-800 mb-1">{message}</h4>
      {submessage && (
        <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
          {submessage}
        </p>
      )}
    </div>
  );
};

export default LoadingState;
