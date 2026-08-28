import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldCheck, RefreshCw, Server, Activity, Cpu, CheckCircle2 } from 'lucide-react';
import { useFortyGuard } from '../../context/FortyGuardContext';
import { useNavigation } from '../../context/NavigationContext';
import IconButton from '../ui/IconButton';
import PrimaryButton from '../ui/PrimaryButton';
import StatusPill from '../ui/StatusPill';

export const FortyGuardModal: React.FC = () => {
  const { connection, reconnect, isSyncing } = useFortyGuard();
  const { isFortyGuardModalOpen, setIsFortyGuardModalOpen } = useNavigation();

  if (!isFortyGuardModalOpen) return null;

  return (
    <AnimatePresence>
      <div
        id="fortyguard-modal-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="fortyguard-modal-title"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs"
          onClick={() => setIsFortyGuardModalOpen(false)}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          className="relative z-10 w-full max-w-xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-[#FBFBFA]/80">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 id="fortyguard-modal-title" className="text-base font-bold text-slate-900">
                  FortyGuard Connection Hub
                </h3>
                <p className="text-xs text-slate-500">
                  High-Density Spatial Thermal Sensing Engine
                </p>
              </div>
            </div>
            <IconButton
              id="close-fortyguard-modal"
              icon={<X className="w-4 h-4" />}
              aria-label="Close FortyGuard modal"
              size="sm"
              variant="ghost"
              onClick={() => setIsFortyGuardModalOpen(false)}
            />
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            {/* Status overview banner */}
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                </span>
                <div>
                  <div className="text-xs font-bold text-emerald-900 uppercase tracking-wide">
                    Mesh Network Active
                  </div>
                  <div className="text-xs text-emerald-700 font-mono mt-0.5">
                    {connection.activeNodes} of {connection.totalNodes} sensor nodes reporting
                  </div>
                </div>
              </div>
              <StatusPill status="optimal" label="Live Stream" size="sm" />
            </div>

            {/* Spec grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 uppercase">
                  <Activity className="w-3.5 h-3.5 text-slate-400" />
                  Latency
                </div>
                <div className="text-base font-bold font-mono text-slate-900 mt-1">
                  {connection.latencyMs} ms
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 uppercase">
                  <Cpu className="w-3.5 h-3.5 text-slate-400" />
                  Density
                </div>
                <div className="text-base font-bold font-mono text-slate-900 mt-1">
                  {connection.meshDensity}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 col-span-2 sm:col-span-1">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 uppercase">
                  <Server className="w-3.5 h-3.5 text-slate-400" />
                  Engine Build
                </div>
                <div className="text-sm font-bold font-mono text-slate-900 mt-1 truncate">
                  {connection.engineVersion}
                </div>
              </div>
            </div>

            {/* API Endpoint Details */}
            <div className="space-y-1.5">
              <div className="text-xs font-semibold text-slate-700">API Endpoint</div>
              <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-mono text-slate-700 break-all select-all">
                {connection.apiEndpoint}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-200 text-xs text-blue-800 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#2563EB]" />
                Preserved Connection Architecture
              </div>
              <p className="text-blue-700/90 leading-relaxed">
                HeatOS maintains the high-resolution thermal matrix connector. Telemetry streams continuously to power spatial interpolation and thermal comfort indexes.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 bg-[#FBFBFA] flex items-center justify-between">
            <span className="text-xs text-slate-500 font-mono">
              Last Ping: {connection.lastSyncTimestamp}
            </span>
            <PrimaryButton
              id="reconnect-fortyguard-btn"
              size="sm"
              onClick={reconnect}
              isLoading={isSyncing}
              icon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Sync Mesh Telemetry
            </PrimaryButton>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default FortyGuardModal;
