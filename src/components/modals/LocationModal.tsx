import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, MapPin, Check, Search, Globe, Wind, Thermometer, ShieldCheck } from 'lucide-react';
import { useLocation } from '../../context/LocationContext';
import { useNavigation } from '../../context/NavigationContext';
import IconButton from '../ui/IconButton';
import StatusPill from '../ui/StatusPill';

export const LocationModal: React.FC = () => {
  const { currentLocation, locations, setLocation, formatTemp } = useLocation();
  const { isLocationModalOpen, setIsLocationModalOpen } = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLocations = locations.filter(
    (loc) =>
      loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (id: string) => {
    setLocation(id);
    setIsLocationModalOpen(false);
  };

  if (!isLocationModalOpen) return null;

  return (
    <AnimatePresence>
      <div
        id="location-modal-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="location-modal-title"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs"
          onClick={() => setIsLocationModalOpen(false)}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.2 }}
          className="relative z-10 w-full max-w-xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-[#FBFBFA]/80">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-50 border border-blue-200/80 text-[#2563EB]">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <h3 id="location-modal-title" className="text-base font-bold text-slate-900">
                  Select Environmental Zone
                </h3>
                <p className="text-xs text-slate-500">
                  Live spatial mesh & FortyGuard sensor clusters across the U.S.
                </p>
              </div>
            </div>
            <IconButton
              id="close-location-modal"
              icon={<X className="w-4 h-4" />}
              aria-label="Close location selector"
              size="sm"
              variant="ghost"
              onClick={() => setIsLocationModalOpen(false)}
            />
          </div>

          {/* Search Input */}
          <div className="p-4 border-b border-slate-100 bg-white">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="location-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search U.S. cities or regions..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 text-sm placeholder:text-slate-400 focus:bg-white focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition-all"
              />
            </div>
          </div>

          {/* Locations List */}
          <div className="p-4 overflow-y-auto space-y-2 flex-1">
            {filteredLocations.map((loc) => {
              const isSelected = loc.id === currentLocation.id;

              return (
                <div
                  key={loc.id}
                  id={`loc-option-${loc.id}`}
                  onClick={() => handleSelect(loc.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSelect(loc.id);
                    }
                  }}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/80 border-[#2563EB] shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-xl flex items-center justify-center ${
                        isSelected
                          ? 'bg-[#2563EB] text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">{loc.name}</span>
                        <span className="text-xs text-slate-600 font-medium">({loc.state}, USA)</span>
                        {isSelected && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#2563EB] text-white">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1 font-mono">
                          <Thermometer className="w-3 h-3 text-orange-500" />
                          {formatTemp(loc.ambientTemp)}
                        </span>
                        <span className="flex items-center gap-1 font-mono">
                          <Wind className="w-3 h-3 text-teal-500" />
                          AQI {loc.aqi}
                        </span>
                        <span className="flex items-center gap-1 font-mono text-slate-400 hidden xs:inline-flex">
                          <ShieldCheck className="w-3 h-3 text-emerald-500" />
                          {loc.activeSensors} nodes
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <StatusPill status={loc.status} label={loc.statusText.split(' ')[0]} size="sm" />
                    {isSelected && <Check className="w-4 h-4 text-[#2563EB]" />}
                  </div>
                </div>
              );
            })}

            {filteredLocations.length === 0 && (
              <div className="p-8 text-center text-slate-500 text-sm">
                No active locations match &quot;{searchQuery}&quot;. Additional U.S. municipal clusters can be configured in Phase 2.
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-slate-100 bg-[#FBFBFA] flex items-center justify-between text-xs text-slate-500">
            <span>Spatial Engine: FortyGuard Mesh Active</span>
            <span className="font-mono">{locations.length} Connected Locations</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default LocationModal;
