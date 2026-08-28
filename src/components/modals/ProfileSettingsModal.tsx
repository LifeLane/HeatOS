import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sliders, Eye, Zap, Shield, Sparkles, Moon, Sun, Monitor, BellRing } from 'lucide-react';
import { useLocation } from '../../context/LocationContext';
import { useNavigation } from '../../context/NavigationContext';
import IconButton from '../ui/IconButton';
import StatusPill from '../ui/StatusPill';

export const ProfileSettingsModal: React.FC = () => {
  const { currentLocation, tempUnit, toggleTempUnit } = useLocation();
  const {
    isSettingsModalOpen,
    setIsSettingsModalOpen,
    accessibilitySettings,
    toggleReducedMotion,
    toggleHighContrast,
    toggleLargeText,
  } = useNavigation();

  if (!isSettingsModalOpen) return null;

  return (
    <AnimatePresence>
      <div
        id="settings-modal-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-modal-title"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs"
          onClick={() => setIsSettingsModalOpen(false)}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          className="relative z-10 w-full max-w-xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-[#FBFBFA]/80">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h3 id="settings-modal-title" className="text-base font-bold text-slate-900">
                  HeatOS System &amp; Preferences
                </h3>
                <p className="text-xs text-slate-500">
                  Living Environment OS Configuration &amp; Accessibility
                </p>
              </div>
            </div>
            <IconButton
              id="close-settings-modal"
              icon={<X className="w-4 h-4" />}
              aria-label="Close settings modal"
              size="sm"
              variant="ghost"
              onClick={() => setIsSettingsModalOpen(false)}
            />
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto space-y-6">
            {/* Visual & Units */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Display &amp; Units
              </h4>
              
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div>
                  <div className="text-sm font-bold text-slate-800">Temperature Units</div>
                  <div className="text-xs text-slate-500">Display ambient, surface, and thermal metrics</div>
                </div>
                <button
                  id="settings-temp-unit-toggle"
                  onClick={toggleTempUnit}
                  className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-xs cursor-pointer"
                >
                  <span
                    className={`px-3 py-1 text-xs font-mono font-bold rounded-lg transition-all ${
                      tempUnit === 'C' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    °C
                  </span>
                  <span
                    className={`px-3 py-1 text-xs font-mono font-bold rounded-lg transition-all ${
                      tempUnit === 'F' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    °F
                  </span>
                </button>
              </div>

              {/* Light Mode Badge */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div>
                  <div className="text-sm font-bold text-slate-800">Visual Theme</div>
                  <div className="text-xs text-slate-500">Calm, high-legibility light-first workspace</div>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-xs">
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>Light Mode (Default)</span>
                </div>
              </div>
            </div>

            {/* Accessibility Settings */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Accessibility &amp; Ergonomics
              </h4>

              {/* Reduced Motion */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div>
                  <div className="text-sm font-bold text-slate-800">Reduced Motion</div>
                  <div className="text-xs text-slate-500">Disable non-essential micro-animations</div>
                </div>
                <button
                  id="settings-reduced-motion-toggle"
                  onClick={toggleReducedMotion}
                  role="switch"
                  aria-checked={accessibilitySettings.reducedMotion}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    accessibilitySettings.reducedMotion ? 'bg-[#2563EB]' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                      accessibilitySettings.reducedMotion ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* High Contrast */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div>
                  <div className="text-sm font-bold text-slate-800">Enhanced Border Contrast</div>
                  <div className="text-xs text-slate-500">Deepen stroke boundaries for high-visibility environments</div>
                </div>
                <button
                  id="settings-high-contrast-toggle"
                  onClick={toggleHighContrast}
                  role="switch"
                  aria-checked={accessibilitySettings.highContrast}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    accessibilitySettings.highContrast ? 'bg-[#2563EB]' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                      accessibilitySettings.highContrast ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Core Principle Banner */}
            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 text-xs text-blue-900 space-y-2">
              <div className="font-bold flex items-center gap-1.5 text-blue-950">
                <Sparkles className="w-4 h-4 text-[#2563EB]" />
                HeatOS Operating Principle
              </div>
              <div className="font-mono font-bold text-xs tracking-wider text-[#1D4ED8]">
                SEE → UNDERSTAND → DETECT → EXPLAIN → PREDICT → ACT
              </div>
              <p className="text-blue-800/80 leading-relaxed">
                HeatOS transforms raw microclimate streams into actionable environmental decisions without overwhelming operators with dense dashboards.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 bg-[#FBFBFA] flex items-center justify-between text-xs text-slate-500">
            <span>HeatOS Phase 1 Foundation</span>
            <span className="font-mono">Zone: {currentLocation.name}</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ProfileSettingsModal;
