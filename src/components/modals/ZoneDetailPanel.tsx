import React from 'react';
import { Thermometer, Trees, Activity, ShieldAlert, CheckCircle, ArrowRight } from 'lucide-react';
import { useNavigation } from '../../context/NavigationContext';
import { useLocation } from '../../context/LocationContext';
import SidePanel from '../ui/SidePanel';
import BottomSheet from '../ui/BottomSheet';
import StatusPill from '../ui/StatusPill';
import PrimaryButton from '../ui/PrimaryButton';
import SecondaryButton from '../ui/SecondaryButton';

export const ZoneDetailPanel: React.FC = () => {
  const { selectedZone, setSelectedZone, isInspectorOpen, setIsInspectorOpen } = useNavigation();
  const { formatTemp } = useLocation();

  if (!selectedZone) return null;

  const handleClose = () => {
    setIsInspectorOpen(false);
    setSelectedZone(null);
  };

  const content = (
    <div className="space-y-6">
      {/* Zone Status Banner */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            {selectedZone.district}
          </div>
          <div className="text-base font-bold text-slate-900 mt-0.5">{selectedZone.name}</div>
        </div>
        <StatusPill
          status={
            selectedZone.heatSeverity === 'critical'
              ? 'critical'
              : selectedZone.heatSeverity === 'high'
              ? 'warning'
              : selectedZone.heatSeverity === 'moderate'
              ? 'moderate'
              : 'optimal'
          }
          label={`${selectedZone.riskLevel} Risk`}
          size="md"
        />
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <Thermometer className="w-3.5 h-3.5 text-orange-500" />
            Surface Temp
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1">
            {formatTemp(selectedZone.surfaceTemp)}
          </div>
          <div className="text-[11px] text-orange-600 font-medium mt-0.5">
            +{selectedZone.heatIslandFactor}°C UHI Anomaly
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <Trees className="w-3.5 h-3.5 text-emerald-500" />
            Canopy Cover
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1">
            {selectedZone.canopyCover}%
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-0.5">
            Vegetative Cooling Buffer
          </div>
        </div>
      </div>

      {/* FortyGuard Sensor Mesh Status */}
      <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-600" />
            FortyGuard Live Nodes
          </span>
          <span className="text-xs font-mono font-bold text-emerald-700">
            {selectedZone.activeSensors} active
          </span>
        </div>
        <p className="text-xs text-emerald-800/90 leading-relaxed">
          High-frequency thermal telemetry interpolated across {selectedZone.name} grid perimeter.
        </p>
      </div>

      {/* Recommended Environmental Action */}
      <div className="space-y-2">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Environmental Diagnostic
        </div>
        <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 text-xs text-amber-900 leading-relaxed space-y-2">
          <div className="font-semibold flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            Actionable Mitigation Guidance
          </div>
          <p>{selectedZone.recommendedAction}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="pt-2 flex flex-col gap-2">
        <PrimaryButton
          id="zone-detail-act-btn"
          fullWidth
          icon={<ArrowRight className="w-4 h-4" />}
          iconPosition="right"
          onClick={handleClose}
        >
          Acknowledge &amp; Monitor Zone
        </PrimaryButton>
        <SecondaryButton id="zone-detail-close-btn" fullWidth variant="ghost" onClick={handleClose}>
          Dismiss
        </SecondaryButton>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop SidePanel */}
      <div className="hidden sm:block">
        <SidePanel
          isOpen={isInspectorOpen}
          onClose={handleClose}
          title={selectedZone.name}
          subtitle={`Microclimate Spatial Inspector — ${selectedZone.district}`}
          width="md"
        >
          {content}
        </SidePanel>
      </div>

      {/* Mobile BottomSheet */}
      <div className="sm:hidden">
        <BottomSheet
          isOpen={isInspectorOpen}
          onClose={handleClose}
          title={selectedZone.name}
          subtitle={selectedZone.district}
        >
          {content}
        </BottomSheet>
      </div>
    </>
  );
};

export default ZoneDetailPanel;
