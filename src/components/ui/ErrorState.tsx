import React from 'react';
import {
  AlertOctagon,
  RefreshCw,
  MapPinOff,
  CloudOff,
  Compass,
  Sparkles,
  WifiOff,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import PrimaryButton from './PrimaryButton';
import SecondaryButton from './SecondaryButton';

export type ErrorDomain = 'api' | 'location' | 'forecast' | 'map' | 'ai' | 'generic';

interface ErrorStateProps {
  domain?: ErrorDomain;
  title?: string;
  message?: string;
  whatHappened?: string;
  whatRemainsAvailable?: string;
  onRetry?: () => void;
  onAlternativeAction?: () => void;
  alternativeActionLabel?: string;
  id?: string;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  domain = 'generic',
  title,
  message,
  whatHappened,
  whatRemainsAvailable,
  onRetry,
  onAlternativeAction,
  alternativeActionLabel,
  id,
  className = '',
}) => {
  // Domain configurations
  const config = {
    api: {
      icon: WifiOff,
      defaultTitle: 'Live Environmental API Unavailable',
      defaultHappened: 'Real-time telemetry streaming from the environmental sensor network was temporarily interrupted.',
      defaultAvailable: 'Showing the last successful verified observation. Calculations and offline analytics remain operational.',
      iconColor: 'text-amber-600 bg-amber-50 border-amber-200',
    },
    location: {
      icon: MapPinOff,
      defaultTitle: 'Location Telemetry Unavailable',
      defaultHappened: 'Spatial coordinates could not be resolved from your browser or selected geographic region.',
      defaultAvailable: 'HeatOS has defaulted to Abu Dhabi downtown core telemetry mesh so you can continue testing.',
      iconColor: 'text-rose-600 bg-rose-50 border-rose-200',
    },
    forecast: {
      icon: CloudOff,
      defaultTitle: 'Forecast Engine Temporarily Offline',
      defaultHappened: 'Synoptic weather forecast computation timed out while building the multi-day model.',
      defaultAvailable: 'Diurnal microclimate diurnal curve and live current observations remain active.',
      iconColor: 'text-orange-600 bg-orange-50 border-orange-200',
    },
    map: {
      icon: Compass,
      defaultTitle: 'Living Map WebGL Shaders Unavailable',
      defaultHappened: 'Hardware accelerated 3D canvas could not initialize on this graphics context.',
      defaultAvailable: 'Switching automatically to 2D Planar Mesh mode with full data layers and hotspot inspector.',
      iconColor: 'text-blue-600 bg-blue-50 border-blue-200',
    },
    ai: {
      icon: Sparkles,
      defaultTitle: 'AI Analyst Service Busy',
      defaultHappened: 'The generative contextual synthesis model is experiencing temporary network latency.',
      defaultAvailable: 'Deterministic provenance and FortyGuard calculation formulas are directly viewable.',
      iconColor: 'text-purple-600 bg-purple-50 border-purple-200',
    },
    generic: {
      icon: AlertOctagon,
      defaultTitle: 'Environmental Stream Interrupted',
      defaultHappened: message || 'An unexpected telemetry interruption occurred.',
      defaultAvailable: 'Cached readings and core interface navigation remain accessible.',
      iconColor: 'text-rose-600 bg-rose-50 border-rose-200',
    },
  }[domain];

  const Icon = config.icon;
  const displayTitle = title || config.defaultTitle;
  const displayHappened = whatHappened || message || config.defaultHappened;
  const displayAvailable = whatRemainsAvailable || config.defaultAvailable;

  return (
    <div
      id={id}
      className={`rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 text-center flex flex-col items-center justify-center shadow-2xs ${className}`}
    >
      <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center mb-3.5 shadow-2xs ${config.iconColor}`}>
        <Icon className="w-6 h-6" />
      </div>

      <h3 className="text-base sm:text-lg font-black text-slate-900 mb-1.5 tracking-tight">
        {displayTitle}
      </h3>

      <div className="max-w-md space-y-2.5 text-left bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 mb-5 text-xs text-slate-600">
        <div>
          <strong className="text-slate-900 font-bold block mb-0.5">What happened:</strong>
          <span>{displayHappened}</span>
        </div>
        <div className="pt-2 border-t border-slate-200/60">
          <strong className="text-emerald-700 font-bold flex items-center gap-1 mb-0.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>What remains available:</span>
          </strong>
          <span>{displayAvailable}</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        {onRetry && (
          <PrimaryButton
            id={`${id || 'error'}-retry-btn`}
            size="sm"
            onClick={onRetry}
            icon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Retry Connection
          </PrimaryButton>
        )}

        {onAlternativeAction && (
          <SecondaryButton
            id={`${id || 'error'}-alt-btn`}
            size="sm"
            onClick={onAlternativeAction}
          >
            {alternativeActionLabel || 'Use Offline Fallback'}
          </SecondaryButton>
        )}
      </div>
    </div>
  );
};

export default ErrorState;

