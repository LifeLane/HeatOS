import React from 'react';
import {
  X,
  Flame,
  Trees,
  Wind,
  Droplets,
  ShieldCheck,
  AlertTriangle,
  Building2,
  TrendingDown,
  Layers,
  ArrowUpRight,
  ExternalLink,
} from 'lucide-react';
import { useNavigation } from '../../context/NavigationContext';
import { useLocation } from '../../context/LocationContext';
import StatusPill from '../ui/StatusPill';
import IconButton from '../ui/IconButton';
import PrimaryButton from '../ui/PrimaryButton';
import SecondaryButton from '../ui/SecondaryButton';

export const ZoneInspectorDrawer: React.FC = () => {
  const { isInspectorOpen, setIsInspectorOpen, selectedZone } = useNavigation();
  const { formatTemp } = useLocation();

  if (!isInspectorOpen || !selectedZone) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-40 transition-opacity"
        onClick={() => setIsInspectorOpen(false)}
      />

      {/* Slide-over Inspector Sheet */}
      <div
        id="zone-inspector-drawer"
        className="fixed inset-y-0 right-0 max-w-full flex pl-10 z-50 animate-in slide-in-from-right duration-300"
      >
        <div className="w-screen max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col justify-between">
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  {selectedZone.district}
                </span>
                <StatusPill
                  status={
                    selectedZone.heatSeverity === 'critical'
                      ? 'critical'
                      : selectedZone.heatSeverity === 'high'
                      ? 'warning'
                      : 'optimal'
                  }
                  label={selectedZone.riskLevel.split(' ')[0]}
                  size="sm"
                />
              </div>
              <h2 className="text-lg font-extrabold text-slate-900 leading-snug">
                {selectedZone.name}
              </h2>
            </div>

            <IconButton
              id="close-inspector-btn"
              icon={<X className="w-4 h-4 text-slate-500" />}
              aria-label="Close Zone Inspector"
              size="sm"
              variant="outline"
              onClick={() => setIsInspectorOpen(false)}
            />
          </div>

          {/* Body Content */}
          <div className="p-5 space-y-5 overflow-y-auto flex-1 text-slate-800">
            {/* Key Microclimate Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-orange-50/60 border border-orange-100">
                <div className="flex items-center gap-1.5 text-xs text-orange-800 font-semibold mb-1">
                  <Flame className="w-3.5 h-3.5 text-orange-600" />
                  Surface Temperature
                </div>
                <div className="text-2xl font-bold font-mono text-orange-900">
                  {formatTemp(selectedZone.surfaceTemp)}
                </div>
                <div className="text-[11px] text-orange-700 mt-0.5">
                  +{selectedZone.heatIslandFactor > 0 ? selectedZone.heatIslandFactor : 0}°C above ambient
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-semibold mb-1">
                  <Trees className="w-3.5 h-3.5 text-emerald-600" />
                  Canopy Coverage
                </div>
                <div className="text-2xl font-bold font-mono text-emerald-900">
                  {selectedZone.canopyCover}%
                </div>
                <div className="text-[11px] text-emerald-700 mt-0.5">
                  Target: 35% density
                </div>
              </div>
            </div>

            {/* Microclimate Diagnostics */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Microclimate Diagnostics
              </h3>
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Urban Heat Island Delta:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {selectedZone.heatIslandFactor > 0 ? `+${selectedZone.heatIslandFactor}°C` : `${selectedZone.heatIslandFactor}°C`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Reporting Sensor Nodes:</span>
                  <span className="font-mono font-bold text-[#2563EB]">
                    {selectedZone.activeSensors} active nodes
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Coordinates:</span>
                  <span className="font-mono text-slate-500 text-[11px]">
                    {selectedZone.coordinates[0].toFixed(4)}, {selectedZone.coordinates[1].toFixed(4)}
                  </span>
                </div>
              </div>
            </div>

            {/* Prescribed Mitigation */}
            <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#2563EB]">
                <ShieldCheck className="w-4 h-4" />
                Prescribed Urban Cooling Action
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {selectedZone.recommendedAction}
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-5 border-t border-slate-100 flex items-center gap-2.5 bg-slate-50/50">
            <SecondaryButton
              id="inspector-export-btn"
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => setIsInspectorOpen(false)}
            >
              Export Report
            </SecondaryButton>
            <PrimaryButton
              id="inspector-apply-plan-btn"
              size="sm"
              className="flex-1"
              onClick={() => setIsInspectorOpen(false)}
            >
              Initiate Mitigation
            </PrimaryButton>
          </div>
        </div>
      </div>
    </>
  );
};

export default ZoneInspectorDrawer;
